import { and, desc, eq, inArray, ne } from "drizzle-orm";

import {
  recommendationCandidateProfileSchema,
  type RecommendationCandidateProfile,
} from "@/features/recommendations/schemas";
import type { RecommendationFeedData } from "@/features/recommendations/types";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles } from "@/server/db/schema";

export type RecommendationCandidateProfileRow = {
  collaborationPreference: string[];
  completionStatus: "basic_complete" | "recommendation_ready";
  helpNeeded: string[];
  helpOffered: string[];
  interests: string[];
  major: "math" | "computer-science" | "eee" | "fam" | "ibe" | "other";
  modules: string[];
  nickname: string;
  skills: string[];
  updatedAt: Date;
  userId: string;
  visibility: "campus";
  year: "foundation" | "year-1" | "year-2" | "year-3" | "year-4" | "postgraduate";
};

export type RecommendationCandidateOptions = {
  limit?: number;
};

export function buildEmptyRecommendationFeedData(): RecommendationFeedData {
  return {
    hasEnoughSignals: false,
    items: [],
  };
}

export function getRecommendationCandidateLimit(limit = 50) {
  return Math.min(Math.max(Math.trunc(limit), 1), 100);
}

export function buildRecommendationCandidateProfile(
  row: RecommendationCandidateProfileRow,
): RecommendationCandidateProfile {
  return recommendationCandidateProfileSchema.parse({
    collaborationPreference: row.collaborationPreference,
    completionStatus: row.completionStatus,
    helpNeeded: row.helpNeeded,
    helpOffered: row.helpOffered,
    interests: row.interests,
    major: row.major,
    modules: row.modules,
    nickname: row.nickname,
    skills: row.skills,
    updatedAt: row.updatedAt.toISOString(),
    userId: row.userId,
    visibility: row.visibility,
    year: row.year,
  });
}

export async function listCampusVisibleRecommendationCandidates(
  db: DbClient,
  viewerUserId: string,
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationCandidateProfile[]> {
  const limit = getRecommendationCandidateLimit(options.limit);
  const rows = await db
    .select({
      collaborationPreference: academicProfiles.collaborationPreference,
      completionStatus: academicProfiles.completionStatus,
      helpNeeded: academicProfiles.helpNeeded,
      helpOffered: academicProfiles.helpOffered,
      interests: academicProfiles.interests,
      major: academicProfiles.major,
      modules: academicProfiles.modules,
      nickname: academicProfiles.nickname,
      skills: academicProfiles.skills,
      updatedAt: academicProfiles.updatedAt,
      userId: academicProfiles.userId,
      visibility: academicProfiles.visibility,
      year: academicProfiles.year,
    })
    .from(academicProfiles)
    .where(
      and(
        eq(academicProfiles.visibility, "campus"),
        ne(academicProfiles.userId, viewerUserId),
        inArray(academicProfiles.completionStatus, ["basic_complete", "recommendation_ready"]),
      ),
    )
    .orderBy(desc(academicProfiles.updatedAt))
    .limit(limit);

  return rows.map((row) =>
    buildRecommendationCandidateProfile({
      ...row,
      completionStatus: row.completionStatus as "basic_complete" | "recommendation_ready",
      visibility: "campus",
    }),
  );
}

export async function getCurrentUserRecommendationFeed(): Promise<RecommendationFeedData> {
  await requireCompletedAcademicProfile();

  return buildEmptyRecommendationFeedData();
}

export async function getCurrentUserRecommendationCandidates(
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationCandidateProfile[]> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return listCampusVisibleRecommendationCandidates(db, gate.session.userId, options);
}
