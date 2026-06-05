import { beforeEach, describe, expect, it, vi } from "vitest";

import { recommendationSchema } from "@/features/recommendations/schemas";
import { recommendationFeedFixture } from "@/features/recommendations/test-fixtures";
import type { AcademicProfile } from "@/features/profile/schemas";
import type { DbClient } from "@/server/db/client";
import { recommendationExplanationInputSchema } from "@/server/ai/schemas/recommendation-explanation";

const requireCompletedAcademicProfileMock = vi.hoisted(() => vi.fn());
const createDbMock = vi.hoisted(() => vi.fn());
const getAcademicProfileForUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth/onboarding-gate", () => ({
  requireCompletedAcademicProfile: requireCompletedAcademicProfileMock,
}));

vi.mock("@/features/profile/server/service", () => ({
  getAcademicProfileForUser: getAcademicProfileForUserMock,
}));

vi.mock("@/server/db/client", () => ({
  createDb: createDbMock,
}));

import {
  buildEmptyRecommendationFeedData,
  buildRecommendationCandidateProfile,
  buildRecommendationCardFromScoredCandidate,
  buildRecommendationExplanationInput,
  buildRecommendationExplanationPromptPayload,
  buildRecommendationInsertDraft,
  generateRecommendationExplanationWithMockProvider,
  getCurrentUserRecommendationCards,
  getCurrentUserRecommendationCandidates,
  getCurrentUserRecommendationFeed,
  getCurrentUserScoredRecommendationCandidates,
  getRecommendationCandidateLimit,
  listCampusVisibleRecommendationCandidates,
  parseRecommendationExplanationOutput,
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

const currentProfile = {
  ...viewerScoringProfile,
  completionStatus: "basic_complete",
  createdAt: "2026-01-01T00:00:00.000Z",
  major: "computer-science",
  nickname: "Current Builder",
  updatedAt: "2026-01-02T03:04:05.000Z",
  userId: currentUserId,
  visibility: "campus",
  year: "year-2",
} satisfies AcademicProfile;

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
    getAcademicProfileForUserMock.mockReset();
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

  it("builds recommendation explanation prompt input from scored candidates without calling an LLM", () => {
    const scoredCandidate = scoreRecommendationCandidate(
      viewerScoringProfile,
      buildRecommendationCandidateProfile(candidateRow),
    );

    expect(buildRecommendationExplanationInput(viewerScoringProfile, scoredCandidate)).toEqual({
      candidateProfile: {
        collaborationPreference: ["pair study"],
        helpNeeded: ["signals"],
        helpOffered: ["typescript debugging"],
        interests: ["web apps"],
        major: "computer-science",
        modules: ["COMP1048"],
        nickname: "TypeScript Builder",
        skills: ["react"],
        userId: "44444444-4444-4444-8444-444444444444",
        visibility: "campus",
        year: "year-2",
      },
      ruleScore: {
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
      },
      viewerProfile: viewerScoringProfile,
    });
    expect(recommendationExplanationInputSchema.parse(buildRecommendationExplanationInput(viewerScoringProfile, scoredCandidate))).toEqual(
      buildRecommendationExplanationInput(viewerScoringProfile, scoredCandidate),
    );
  });

  it("rejects non-campus prompt input candidates before LLM explanation generation", () => {
    const scoredCandidate = scoreRecommendationCandidate(
      viewerScoringProfile,
      buildRecommendationCandidateProfile(candidateRow),
    );
    const input = buildRecommendationExplanationInput(viewerScoringProfile, scoredCandidate);

    expect(() =>
      recommendationExplanationInputSchema.parse({
        ...input,
        candidateProfile: {
          ...input.candidateProfile,
          visibility: "private",
        },
      }),
    ).toThrow();
  });

  it("builds recommendation explanation prompt payloads without calling OpenAI", () => {
    const scoredCandidate = scoreRecommendationCandidate(
      viewerScoringProfile,
      buildRecommendationCandidateProfile(candidateRow),
    );

    expect(buildRecommendationExplanationPromptPayload(viewerScoringProfile, scoredCandidate)).toEqual({
      messages: [
        expect.objectContaining({
          content: expect.stringContaining("You write concise, explainable academic connection recommendations"),
          role: "system",
        }),
        expect.objectContaining({
          content: expect.stringContaining("Prompt version: recommendation-explanation.v1"),
          role: "user",
        }),
      ],
      promptVersion: "recommendation-explanation.v1",
    });
  });

  it("parses valid recommendation explanation output without calling OpenAI", () => {
    expect(
      parseRecommendationExplanationOutput({
        complementarySignals: ["Candidate can help with TypeScript debugging"],
        conversationStarter: "Ask whether they have a debugging workflow for COMP1048 projects.",
        explanationSummary: "  You share COMP1048 and web app interests, with complementary TypeScript support.  ",
        sharedSignals: ["COMP1048", "web apps"],
      }),
    ).toEqual({
      ok: true,
      output: {
        complementarySignals: ["Candidate can help with TypeScript debugging"],
        conversationStarter: "Ask whether they have a debugging workflow for COMP1048 projects.",
        explanationSummary: "You share COMP1048 and web app interests, with complementary TypeScript support.",
        sharedSignals: ["COMP1048", "web apps"],
      },
    });
  });

  it("returns a stable parser error for invalid recommendation explanation output", () => {
    expect(
      parseRecommendationExplanationOutput({
        complementarySignals: ["Candidate can help with TypeScript debugging"],
        conversationStarter: "",
        explanationSummary: "",
        sharedSignals: Array.from({ length: 7 }, (_, index) => `signal-${index}`),
      }),
    ).toEqual({
      code: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT",
      issues: expect.arrayContaining([
        expect.stringContaining("conversationStarter:"),
        expect.stringContaining("explanationSummary:"),
        expect.stringContaining("sharedSignals:"),
      ]),
      ok: false,
    });
  });

  it("generates parsed recommendation explanations through the mock provider only", async () => {
    const scoredCandidate = scoreRecommendationCandidate(
      viewerScoringProfile,
      buildRecommendationCandidateProfile(candidateRow),
    );
    const mockOutput = vi.fn(() => ({
      complementarySignals: ["Candidate can help with TypeScript debugging"],
      conversationStarter: "Ask how they usually debug COMP1048 React issues.",
      explanationSummary: "You share COMP1048 and web app interests, with complementary TypeScript support.",
      sharedSignals: ["COMP1048", "web apps"],
    }));

    await expect(
      generateRecommendationExplanationWithMockProvider(viewerScoringProfile, scoredCandidate, {
        mockOutput,
        rawResponseId: "mock-recommendation-response-1",
        usage: {
          inputTokens: 64,
          outputTokens: 48,
        },
      }),
    ).resolves.toEqual({
      explanation: {
        complementarySignals: ["Candidate can help with TypeScript debugging"],
        conversationStarter: "Ask how they usually debug COMP1048 React issues.",
        explanationSummary: "You share COMP1048 and web app interests, with complementary TypeScript support.",
        sharedSignals: ["COMP1048", "web apps"],
      },
      model: "mock-recommendation-explainer",
      ok: true,
      promptVersion: "recommendation-explanation.v1",
      provider: "mock",
      rawResponseId: "mock-recommendation-response-1",
      usage: {
        inputTokens: 64,
        outputTokens: 48,
      },
    });
    expect(mockOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user" }),
        ],
        model: "mock-recommendation-explainer",
        promptVersion: "recommendation-explanation.v1",
        temperature: 0.2,
      }),
    );
  });

  it("returns stable errors when mock recommendation explanation output is invalid", async () => {
    const scoredCandidate = scoreRecommendationCandidate(
      viewerScoringProfile,
      buildRecommendationCandidateProfile(candidateRow),
    );

    await expect(
      generateRecommendationExplanationWithMockProvider(viewerScoringProfile, scoredCandidate, {
        mockOutput: {
          complementarySignals: [],
          conversationStarter: "",
          explanationSummary: "",
          sharedSignals: [],
        },
      }),
    ).resolves.toEqual({
      code: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT",
      issues: expect.arrayContaining([
        expect.stringContaining("conversationStarter:"),
        expect.stringContaining("explanationSummary:"),
      ]),
      model: "mock-recommendation-explainer",
      ok: false,
      promptVersion: "recommendation-explanation.v1",
      provider: "mock",
      rawResponseId: null,
      usage: {
        inputTokens: null,
        outputTokens: null,
      },
    });
  });

  it("builds recommendation card DTOs with mock explanation fields", async () => {
    const scoredCandidate = scoreRecommendationCandidate(
      viewerScoringProfile,
      buildRecommendationCandidateProfile(candidateRow),
    );

    await expect(buildRecommendationCardFromScoredCandidate(viewerScoringProfile, scoredCandidate)).resolves.toEqual({
      error: null,
      item: expect.objectContaining({
        canRequestConnect: true,
        complementarySignals: ["Candidate can help with: typescript debugging"],
        conversationStarter: "Ask TypeScript Builder about Shared module: COMP1048.",
        explanationSummary:
          "TypeScript Builder is recommended because of Shared module: COMP1048 and Candidate can help with: typescript debugging.",
        generatedByJobId: null,
        major: "computer-science",
        nickname: "TypeScript Builder",
        profileSummary: "Modules: COMP1048. Interests: web apps. Skills: react",
        profileVisibility: "campus",
        recommendationId: "44444444-4444-4444-8444-444444444444",
        recommendedUserId: "44444444-4444-4444-8444-444444444444",
        sharedSignals: [
          "Shared module: COMP1048",
          "Shared interest: web apps",
          "Shared skill: react",
          "Shared collaboration preference: pair study",
        ],
        status: "active",
        year: "year-2",
      }),
      ok: true,
    });
    const result = await buildRecommendationCardFromScoredCandidate(viewerScoringProfile, scoredCandidate);

    expect(result.ok ? recommendationSchema.parse(result.item) : null).toEqual(result.ok ? result.item : null);
  });

  it("builds recommendation insert drafts without calling db.insert", async () => {
    const scoredCandidate = scoreRecommendationCandidate(
      viewerScoringProfile,
      buildRecommendationCandidateProfile(candidateRow),
    );
    const cardResult = await buildRecommendationCardFromScoredCandidate(viewerScoringProfile, scoredCandidate);
    const generationResult = await generateRecommendationExplanationWithMockProvider(
      viewerScoringProfile,
      scoredCandidate,
      {
        mockOutput: {
          complementarySignals: ["Candidate can help with: typescript debugging"],
          conversationStarter: "Ask TypeScript Builder about Shared module: COMP1048.",
          explanationSummary:
            "TypeScript Builder is recommended because of Shared module: COMP1048 and Candidate can help with: typescript debugging.",
          sharedSignals: [
            "Shared module: COMP1048",
            "Shared interest: web apps",
            "Shared skill: react",
            "Shared collaboration preference: pair study",
          ],
        },
        rawResponseId: "mock-recommendation-response-1",
        usage: {
          inputTokens: 64,
          outputTokens: 48,
        },
      },
    );
    const db = {
      insert: vi.fn(),
    };

    if (!cardResult.ok || cardResult.item.profileVisibility !== "campus" || !generationResult.ok) {
      throw new Error("Expected a persistable recommendation card and successful generation result.");
    }

    expect(
      buildRecommendationInsertDraft({
        card: cardResult.item,
        generation: generationResult,
        recipientUserId: currentUserId,
        scoredCandidate,
      }),
    ).toEqual({
      complementarySignals: ["Candidate can help with: typescript debugging"],
      conversationStarter: "Ask TypeScript Builder about Shared module: COMP1048.",
      explanationSummary:
        "TypeScript Builder is recommended because of Shared module: COMP1048 and Candidate can help with: typescript debugging.",
      generatedByJobId: null,
      llmModel: "mock-recommendation-explainer",
      llmProvider: "mock",
      llmRawResponseId: "mock-recommendation-response-1",
      llmUsage: {
        inputTokens: 64,
        outputTokens: 48,
      },
      promptVersion: "recommendation-explanation.v1",
      recommendedUserId: "44444444-4444-4444-8444-444444444444",
      recipientUserId: currentUserId,
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
      signalSnapshot: {
        candidateUserId: "44444444-4444-4444-8444-444444444444",
        candidateVisibility: "campus",
        completionStatus: "basic_complete",
        helpNeeded: ["signals"],
        helpOffered: ["typescript debugging"],
        interests: ["web apps"],
        modules: ["COMP1048"],
        profileVisibility: "campus",
        promptVersion: "recommendation-explanation.v1",
        skills: ["react"],
      },
      status: "active",
    });
    expect(cardResult.item.recommendationId).toBe("44444444-4444-4444-8444-444444444444");
    expect(db.insert).not.toHaveBeenCalled();
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

  it("composes the current profile, candidate read, and scoring without writing recommendation rows", async () => {
    const { db, query } = createCandidateDbMock([candidateRow]);

    createDbMock.mockReturnValue(db);
    getAcademicProfileForUserMock.mockResolvedValue(currentProfile);
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

    await expect(getCurrentUserScoredRecommendationCandidates({ limit: 10 })).resolves.toEqual([
      expect.objectContaining({
        candidate: buildRecommendationCandidateProfile(candidateRow),
        complementarySignals: ["Candidate can help with: typescript debugging"],
        score: 12,
      }),
    ]);
    expect(requireCompletedAcademicProfileMock).toHaveBeenCalledOnce();
    expect(createDbMock).toHaveBeenCalledOnce();
    expect(getAcademicProfileForUserMock).toHaveBeenCalledWith(db, currentUserId);
    expect(db.select).toHaveBeenCalledOnce();
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(db).not.toHaveProperty("insert");
  });

  it("composes current user recommendation cards with mock explanations without writing recommendation rows", async () => {
    const { db, query } = createCandidateDbMock([candidateRow]);

    createDbMock.mockReturnValue(db);
    getAcademicProfileForUserMock.mockResolvedValue(currentProfile);
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

    await expect(getCurrentUserRecommendationCards({ limit: 10 })).resolves.toEqual({
      hasEnoughSignals: true,
      items: [
        expect.objectContaining({
          conversationStarter: "Ask TypeScript Builder about Shared module: COMP1048.",
          explanationSummary:
            "TypeScript Builder is recommended because of Shared module: COMP1048 and Candidate can help with: typescript debugging.",
          profileVisibility: "campus",
          recommendedUserId: "44444444-4444-4444-8444-444444444444",
        }),
      ],
    });
    expect(requireCompletedAcademicProfileMock).toHaveBeenCalledOnce();
    expect(createDbMock).toHaveBeenCalledOnce();
    expect(getAcademicProfileForUserMock).toHaveBeenCalledWith(db, currentUserId);
    expect(db.select).toHaveBeenCalledOnce();
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(db).not.toHaveProperty("insert");
  });

  it("returns no scored candidates if the current profile cannot be loaded after the gate", async () => {
    const { db } = createCandidateDbMock([candidateRow]);

    createDbMock.mockReturnValue(db);
    getAcademicProfileForUserMock.mockResolvedValue(null);
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

    await expect(getCurrentUserScoredRecommendationCandidates()).resolves.toEqual([]);
    expect(getAcademicProfileForUserMock).toHaveBeenCalledWith(db, currentUserId);
    expect(db.select).not.toHaveBeenCalled();
  });
});
