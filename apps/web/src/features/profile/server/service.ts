import { eq } from "drizzle-orm";

import {
  academicProfileFormInputSchema,
  academicProfileSchema,
  publicAcademicProfileSchema,
  type AcademicProfile,
  type AcademicProfileFormInput,
  type PublicAcademicProfile,
} from "@/features/profile/schemas";
import type { ProfileRouteState } from "@/features/profile/types";
import { getOnboardingGate, type OnboardingGate } from "@/server/auth/onboarding-gate";
import { requireVerifiedCampusUser } from "@/server/auth/session";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles } from "@/server/db/schema";

export type AcademicProfileUpsertInput = Omit<AcademicProfileFormInput, "completionStatus" | "userId">;

export type AcademicProfileUpsertResult = {
  profileId: string;
  userId: string;
  completionStatus: "basic_complete";
  nextRoute: "/feed";
};

export class AcademicProfileUpsertError extends Error {
  constructor(
    message: string,
    public readonly code: "PROFILE_INPUT_INVALID" | "PROFILE_UPSERT_FAILED",
  ) {
    super(message);
    this.name = "AcademicProfileUpsertError";
  }
}

type AcademicProfileDtoRow = {
  collaborationPreference: string[];
  completionStatus: "incomplete" | "basic_complete" | "recommendation_ready";
  createdAt: Date;
  helpNeeded: string[];
  helpOffered: string[];
  interests: string[];
  major: "math" | "computer-science" | "eee" | "fam" | "ibe" | "other";
  modules: string[];
  nickname: string;
  skills: string[];
  updatedAt: Date;
  userId: string;
  visibility: "private" | "campus" | "public";
  year: "foundation" | "year-1" | "year-2" | "year-3" | "year-4" | "postgraduate";
};

type PublicAcademicProfileDtoRow = Pick<
  AcademicProfileDtoRow,
  | "collaborationPreference"
  | "completionStatus"
  | "interests"
  | "major"
  | "modules"
  | "nickname"
  | "updatedAt"
  | "userId"
  | "visibility"
  | "year"
>;

export type CurrentUserProfileData = {
  gate: OnboardingGate;
  routeState: ProfileRouteState;
};

export const academicProfileUpsertInputSchema = academicProfileFormInputSchema.omit({
  completionStatus: true,
  userId: true,
});

export function parseAcademicProfileUpsertInput(input: unknown, userId: string): AcademicProfileFormInput {
  const parsedInput = academicProfileUpsertInputSchema.safeParse(
    isFormData(input) ? normalizeAcademicProfileFormData(input) : input,
  );

  if (!parsedInput.success) {
    throw new AcademicProfileUpsertError("Academic profile input is invalid.", "PROFILE_INPUT_INVALID");
  }

  const trustedInput = academicProfileFormInputSchema.safeParse({
    ...parsedInput.data,
    completionStatus: "basic_complete",
    userId,
  });

  if (!trustedInput.success) {
    throw new AcademicProfileUpsertError("Academic profile input is invalid.", "PROFILE_INPUT_INVALID");
  }

  return trustedInput.data;
}

function isFormData(input: unknown): input is FormData {
  return typeof FormData !== "undefined" && input instanceof FormData;
}

function getFormText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export function splitAcademicProfileFormList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeAcademicProfileFormData(formData: FormData) {
  return {
    collaborationPreference: splitAcademicProfileFormList(getFormText(formData, "collaborationPreference")),
    helpNeeded: splitAcademicProfileFormList(getFormText(formData, "helpNeeded")),
    helpOffered: splitAcademicProfileFormList(getFormText(formData, "helpOffered")),
    interests: splitAcademicProfileFormList(getFormText(formData, "interests")),
    major: getFormText(formData, "major") || "eee",
    modules: splitAcademicProfileFormList(getFormText(formData, "modules")),
    nickname: getFormText(formData, "nickname"),
    skills: splitAcademicProfileFormList(getFormText(formData, "skills")),
    visibility: getFormText(formData, "visibility") || "campus",
    year: getFormText(formData, "year") || "year-2",
  };
}

export function buildAcademicProfileDto(row: AcademicProfileDtoRow): AcademicProfile {
  return academicProfileSchema.parse({
    collaborationPreference: row.collaborationPreference,
    completionStatus: row.completionStatus,
    createdAt: row.createdAt.toISOString(),
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

export function buildPublicAcademicProfileDto(row: PublicAcademicProfileDtoRow): PublicAcademicProfile {
  return publicAcademicProfileSchema.parse({
    collaborationPreference: row.collaborationPreference,
    completionStatus: row.completionStatus,
    interests: row.interests,
    major: row.major,
    modules: row.modules,
    nickname: row.nickname,
    updatedAt: row.updatedAt.toISOString(),
    userId: row.userId,
    visibility: row.visibility,
    year: row.year,
  });
}

export function buildProfileRouteState(profile: AcademicProfile | null, gate: OnboardingGate): ProfileRouteState {
  return {
    completionStatus: profile?.completionStatus ?? gate.profile?.completionStatus ?? "incomplete",
    portrait: null,
    profile,
    visibility: profile?.visibility ?? "campus",
  };
}

export async function getAcademicProfileForUser(db: DbClient, userId: string): Promise<AcademicProfile | null> {
  const [profile] = await db
    .select({
      collaborationPreference: academicProfiles.collaborationPreference,
      completionStatus: academicProfiles.completionStatus,
      createdAt: academicProfiles.createdAt,
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
    .where(eq(academicProfiles.userId, userId))
    .limit(1);

  return profile ? buildAcademicProfileDto(profile) : null;
}

function isProfileUserId(value: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value,
  );
}

export function canViewPublicAcademicProfile(profile: PublicAcademicProfile, viewerUserId: string) {
  return profile.visibility !== "private" || profile.userId === viewerUserId;
}

export async function getVisibleAcademicProfileForUser(
  db: DbClient,
  targetUserId: string,
  viewerUserId: string,
): Promise<PublicAcademicProfile | null> {
  if (!isProfileUserId(targetUserId)) {
    return null;
  }

  const [profile] = await db
    .select({
      collaborationPreference: academicProfiles.collaborationPreference,
      completionStatus: academicProfiles.completionStatus,
      interests: academicProfiles.interests,
      major: academicProfiles.major,
      modules: academicProfiles.modules,
      nickname: academicProfiles.nickname,
      updatedAt: academicProfiles.updatedAt,
      userId: academicProfiles.userId,
      visibility: academicProfiles.visibility,
      year: academicProfiles.year,
    })
    .from(academicProfiles)
    .where(eq(academicProfiles.userId, targetUserId))
    .limit(1);

  if (!profile) {
    return null;
  }

  const publicProfile = buildPublicAcademicProfileDto(profile);

  return canViewPublicAcademicProfile(publicProfile, viewerUserId) ? publicProfile : null;
}

export async function upsertAcademicProfile(
  db: DbClient,
  userId: string,
  input: unknown,
): Promise<AcademicProfileUpsertResult> {
  const profileInput = parseAcademicProfileUpsertInput(input, userId);
  const now = new Date();
  const [profile] = await db
    .insert(academicProfiles)
    .values(profileInput)
    .onConflictDoUpdate({
      target: academicProfiles.userId,
      set: {
        collaborationPreference: profileInput.collaborationPreference,
        completionStatus: "basic_complete",
        helpNeeded: profileInput.helpNeeded,
        helpOffered: profileInput.helpOffered,
        interests: profileInput.interests,
        major: profileInput.major,
        modules: profileInput.modules,
        nickname: profileInput.nickname,
        skills: profileInput.skills,
        updatedAt: now,
        visibility: profileInput.visibility,
        year: profileInput.year,
      },
    })
    .returning({
      completionStatus: academicProfiles.completionStatus,
      id: academicProfiles.id,
      userId: academicProfiles.userId,
    });

  if (!profile || profile.completionStatus !== "basic_complete") {
    throw new AcademicProfileUpsertError("Unable to upsert the academic profile.", "PROFILE_UPSERT_FAILED");
  }

  return {
    completionStatus: "basic_complete",
    nextRoute: "/feed",
    profileId: profile.id,
    userId: profile.userId,
  };
}

export async function upsertCurrentUserAcademicProfile(input: unknown): Promise<AcademicProfileUpsertResult> {
  const session = await requireVerifiedCampusUser();
  const db = createDb();

  return upsertAcademicProfile(db, session.userId, input);
}

export async function getCurrentUserProfileData(): Promise<CurrentUserProfileData> {
  const gate = await getOnboardingGate();
  const db = createDb();
  const profile = await getAcademicProfileForUser(db, gate.session.userId);

  return {
    gate,
    routeState: buildProfileRouteState(profile, gate),
  };
}

export async function getCurrentUserVisibleAcademicProfile(targetUserId: string): Promise<PublicAcademicProfile | null> {
  const session = await requireVerifiedCampusUser();
  const db = createDb();

  return getVisibleAcademicProfileForUser(db, targetUserId, session.userId);
}
