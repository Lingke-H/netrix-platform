import { describe, expect, it } from "vitest";

import { runCoreRecommendationPath } from "./core-path";
import type { AcademicProfile } from "@/features/profile/schemas";

function buildProfile(overrides: Partial<AcademicProfile>): AcademicProfile {
  return {
    userId: "11111111-1111-1111-1111-111111111111",
    nickname: "Nova",
    major: "computer-science",
    year: "year-2",
    modules: ["CS1010", "CS1231"],
    interests: ["machine learning", "algorithms"],
    skills: ["python"],
    helpOffered: ["python"],
    helpNeeded: ["data structures"],
    collaborationPreference: ["pair programming", "weekly check-ins"],
    visibility: "campus",
    completionStatus: "basic_complete",
    createdAt: "2026-06-05T00:00:00.000Z",
    updatedAt: "2026-06-05T00:00:00.000Z",
    ...overrides,
  };
}

describe("runCoreRecommendationPath", () => {
  it("builds recommendation, scoring, and event payload together", () => {
    const result = runCoreRecommendationPath({
      recipientProfile: buildProfile({}),
      candidateProfile: buildProfile({
        userId: "22222222-2222-2222-2222-222222222222",
        year: "year-3",
      }),
      recommendationId: "33333333-3333-3333-3333-333333333333",
      recommendedUserId: "22222222-2222-2222-2222-222222222222",
      nickname: "Astra",
      profileSummary: "A focused CS student exploring ML and algorithms.",
      explanationOutput: {
        explanationSummary: "You share module overlap and complementary collaboration style.",
        sharedSignals: ["共同课程模块: CS1010"],
        complementarySignals: ["跨年级互补"],
        conversationStarter: "You may enjoy discussing your current assignments.",
      },
    });

    expect(result.recommendation.recommendationId).toBe(
      "33333333-3333-3333-3333-333333333333",
    );
    expect(result.scoring.scoreSummary.totalScore).toBeGreaterThan(0);
  });
});
