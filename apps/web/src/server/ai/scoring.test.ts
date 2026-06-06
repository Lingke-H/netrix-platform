import { describe, expect, it } from "vitest";

import { scoreRecommendationMatch } from "./scoring";
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

describe("scoreRecommendationMatch", () => {
  it("returns shared and complementary recommendation signals", () => {
    const result = scoreRecommendationMatch({
      recipientProfile: buildProfile({
        modules: ["CS1010", "CS2040"],
        interests: ["machine learning", "data structures"],
        skills: ["python"],
        helpOffered: ["python"],
        helpNeeded: ["algorithms"],
      }),
      candidateProfile: buildProfile({
        userId: "22222222-2222-2222-2222-222222222222",
        modules: ["CS1010", "CS2103"],
        interests: ["machine learning", "distributed systems"],
        skills: ["algorithms"],
        helpOffered: ["algorithms"],
        helpNeeded: ["python"],
        year: "year-3",
      }),
    });

    expect(result.sharedSignals).toEqual(
      expect.arrayContaining(["Shared major", "Shared module: CS1010", "Shared interest: machine learning"]),
    );
    expect(result.complementarySignals).toEqual(expect.arrayContaining(["Cross-year complementarity"]));
    expect(result.scoreSummary).toMatchObject({
      crossYearPotential: true,
      sameMajor: true,
    });
  });
});
