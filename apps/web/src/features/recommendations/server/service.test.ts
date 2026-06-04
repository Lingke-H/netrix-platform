import { beforeEach, describe, expect, it, vi } from "vitest";

import { recommendationSchema } from "@/features/recommendations/schemas";
import { recommendationFeedFixture } from "@/features/recommendations/test-fixtures";
import type { DbClient } from "@/server/db/client";

const requireCompletedAcademicProfileMock = vi.hoisted(() => vi.fn());
const createDbMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth/onboarding-gate", () => ({
  requireCompletedAcademicProfile: requireCompletedAcademicProfileMock,
}));

vi.mock("@/server/db/client", () => ({
  createDb: createDbMock,
}));

import {
  buildEmptyRecommendationFeedData,
  buildRecommendationCandidateProfile,
  getCurrentUserRecommendationCandidates,
  getCurrentUserRecommendationFeed,
  getRecommendationCandidateLimit,
  listCampusVisibleRecommendationCandidates,
  scoreRecommendationCandidate,
  scoreRecommendationCandidates,
  type RecommendationCandidateProfileRow,
  type RecommendationScoringProfile,
} from "@/features/recommendations/server/service";

const currentUserId = "33333333-3333-4333-8333-333333333333";

const candidateRow: RecommendationCandidateProfileRow = {
  collaborationPreference: ["pair study"],
  completionStatus: "basic_complete",
  helpNeeded: ["signals"],
  helpOffered: ["typescript debugging"],
  interests: ["web apps"],
  major: "computer-science",
  modules: ["COMP1048"],
  nickname: "TypeScript Builder",
  skills: ["react"],
  updatedAt: new Date("2026-01-02T04:05:06.000Z"),
  userId: "44444444-4444-4444-8444-444444444444",
  visibility: "campus",
  year: "year-2",
};

const viewerScoringProfile: RecommendationScoringProfile = {
  collaborationPreference: ["pair study", "project teammate"],
  helpNeeded: ["typescript debugging", "signals"],
  helpOffered: ["react"],
  interests: ["web apps", "coursework systems"],
  modules: ["COMP1048", "ELEC2043"],
  skills: ["react", "typescript"],
};

function createCandidateDbMock(rows: unknown[]) {
  const query = {
    from: vi.fn(() => query),
    limit: vi.fn(async () => rows),
    orderBy: vi.fn(() => query),
    where: vi.fn(() => query),
  };
  const db = {
    select: vi.fn(() => query),
  };

  return { db, query };
}

describe("recommendation read service", () => {
  beforeEach(() => {
    requireCompletedAcademicProfileMock.mockReset();
    createDbMock.mockReset();
  });

  it("builds the initial empty recommendation feed DTO", () => {
    expect(buildEmptyRecommendationFeedData()).toEqual({
      hasEnoughSignals: false,
      items: [],
    });
  });

  it("keeps the future service feed fixture compatible with visible and private recommendation DTOs", () => {
    expect(recommendationFeedFixture.hasEnoughSignals).toBe(true);
    expect(recommendationFeedFixture.items.map((item) => recommendationSchema.parse(item))).toEqual(
      recommendationFeedFixture.items,
    );
    expect(recommendationFeedFixture.items).toEqual([
      expect.objectContaining({
        canRequestConnect: true,
        profileVisibility: "campus",
        recommendedUserId: expect.any(String),
      }),
      expect.objectContaining({
        canRequestConnect: false,
        profileSummary: null,
        profileVisibility: "private",
        recommendedUserId: null,
      }),
    ]);
  });

  it("clamps recommendation candidate limits", () => {
    expect(getRecommendationCandidateLimit()).toBe(50);
    expect(getRecommendationCandidateLimit(0)).toBe(1);
    expect(getRecommendationCandidateLimit(12.8)).toBe(12);
    expect(getRecommendationCandidateLimit(250)).toBe(100);
  });

  it("builds recommendation candidate DTOs from campus-visible profile rows", () => {
    expect(buildRecommendationCandidateProfile(candidateRow)).toEqual({
      collaborationPreference: ["pair study"],
      completionStatus: "basic_complete",
      helpNeeded: ["signals"],
      helpOffered: ["typescript debugging"],
      interests: ["web apps"],
      major: "computer-science",
      modules: ["COMP1048"],
      nickname: "TypeScript Builder",
      skills: ["react"],
      updatedAt: "2026-01-02T04:05:06.000Z",
      userId: "44444444-4444-4444-8444-444444444444",
      visibility: "campus",
      year: "year-2",
    });
  });

  it("rejects private candidate rows before they can enter recommendation scoring", () => {
    expect(() =>
      buildRecommendationCandidateProfile({
        ...candidateRow,
        visibility: "private",
      } as unknown as RecommendationCandidateProfileRow),
    ).toThrow();
  });

  it("reads campus-visible candidate profiles through the Drizzle query scaffold", async () => {
    const { db, query } = createCandidateDbMock([candidateRow]);

    await expect(
      listCampusVisibleRecommendationCandidates(db as unknown as DbClient, currentUserId, { limit: 5 }),
    ).resolves.toEqual([buildRecommendationCandidateProfile(candidateRow)]);
    expect(db.select).toHaveBeenCalledOnce();
    expect(query.from).toHaveBeenCalledOnce();
    expect(query.where).toHaveBeenCalledOnce();
    expect(query.orderBy).toHaveBeenCalledOnce();
    expect(query.limit).toHaveBeenCalledWith(5);
  });

  it("scores recommendation candidates from transparent profile signal overlap", () => {
    const candidate = buildRecommendationCandidateProfile(candidateRow);

    expect(scoreRecommendationCandidate(viewerScoringProfile, candidate)).toEqual({
      candidate,
      complementarySignals: ["Candidate can help with: typescript debugging"],
      score: 12,
      scoreSummary: {
        collaborationPreferenceOverlap: 1,
        helpComplementarity: 4,
        interestOverlap: 2,
        moduleOverlap: 3,
        skillOverlap: 2,
        total: 12,
      },
      sharedSignals: [
        "Shared module: COMP1048",
        "Shared interest: web apps",
        "Shared skill: react",
        "Shared collaboration preference: pair study",
      ],
    });
  });

  it("sorts scored candidates by score and filters candidates without usable signals", () => {
    const strongerCandidate = buildRecommendationCandidateProfile({
      ...candidateRow,
      helpOffered: ["typescript debugging", "signals"],
      modules: ["COMP1048", "ELEC2043"],
      updatedAt: new Date("2026-01-02T01:00:00.000Z"),
      userId: "55555555-5555-4555-8555-555555555555",
    });
    const weakerCandidate = buildRecommendationCandidateProfile(candidateRow);
    const noSignalCandidate = buildRecommendationCandidateProfile({
      ...candidateRow,
      collaborationPreference: ["solo study"],
      helpNeeded: ["calculus"],
      helpOffered: ["presentation"],
      interests: ["finance"],
      modules: ["MATH1001"],
      skills: ["excel"],
      userId: "66666666-6666-4666-8666-666666666666",
    });

    expect(scoreRecommendationCandidates(viewerScoringProfile, [weakerCandidate, noSignalCandidate, strongerCandidate])).toEqual([
      expect.objectContaining({
        candidate: strongerCandidate,
        score: 19,
      }),
      expect.objectContaining({
        candidate: weakerCandidate,
        score: 12,
      }),
    ]);
  });

  it("requires a completed academic profile before reading recommendations", async () => {
    requireCompletedAcademicProfileMock.mockResolvedValue({
      canCreatePost: true,
      canViewOwnProfile: true,
      nextRoute: "/feed",
      profile: {
        completionStatus: "basic_complete",
        id: "11111111-1111-4111-8111-111111111111",
      },
      session: {
        authUserId: "22222222-2222-4222-8222-222222222222",
        email: "student@nottingham.edu.cn",
        emailDomain: "nottingham.edu.cn",
        emailVerified: true,
        role: "student",
        userId: currentUserId,
        verifiedAt: "2026-01-02T03:04:05.000Z",
      },
      state: "profile_ready",
    });

    await expect(getCurrentUserRecommendationFeed()).resolves.toEqual({
      hasEnoughSignals: false,
      items: [],
    });
    expect(requireCompletedAcademicProfileMock).toHaveBeenCalledOnce();
  });

  it("requires a completed academic profile before reading recommendation candidates", async () => {
    const { db, query } = createCandidateDbMock([candidateRow]);

    createDbMock.mockReturnValue(db);
    requireCompletedAcademicProfileMock.mockResolvedValue({
      canCreatePost: true,
      canViewOwnProfile: true,
      nextRoute: "/feed",
      profile: {
        completionStatus: "basic_complete",
        id: "11111111-1111-4111-8111-111111111111",
      },
      session: {
        authUserId: "22222222-2222-4222-8222-222222222222",
        email: "student@nottingham.edu.cn",
        emailDomain: "nottingham.edu.cn",
        emailVerified: true,
        role: "student",
        userId: currentUserId,
        verifiedAt: "2026-01-02T03:04:05.000Z",
      },
      state: "profile_ready",
    });

    await expect(getCurrentUserRecommendationCandidates({ limit: 1 })).resolves.toEqual([
      buildRecommendationCandidateProfile(candidateRow),
    ]);
    expect(requireCompletedAcademicProfileMock).toHaveBeenCalledOnce();
    expect(createDbMock).toHaveBeenCalledOnce();
    expect(query.limit).toHaveBeenCalledWith(1);
  });
});
