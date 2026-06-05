import { describe, expect, it } from "vitest";

import { scoreRecommendationMatch } from "./scoring";
import type { PublicAcademicProfile } from "@/features/profile/schemas";

function buildProfile(overrides: Partial<PublicAcademicProfile>): PublicAcademicProfile {
  return {
    userId: "11111111-1111-1111-1111-111111111111",
    nickname: "Nova",
    major: "computer-science",
    year: "year-2",
    modules: ["CS1010", "CS1231"],
    interests: ["machine learning", "algorithms"],
    collaborationPreferences: ["pair programming", "weekly check-ins"],
    visibility: "campus",
    completionStatus: "completed",
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
        helpNeeded: ["algorithms"],
        skillsOffered: ["python"],
      }),
      candidateProfile: buildProfile({
        userId: "22222222-2222-2222-2222-222222222222",
        modules: ["CS1010", "CS2103"],
        interests: ["machine learning", "distributed systems"],
        helpNeeded: ["python"],
        skillsOffered: ["algorithms"],
        year: "year-3",
      }),
    });

    expect(result.sharedSignals).toEqual(
      expect.arrayContaining(["同专业", "共同课程模块: CS1010", "共同兴趣: machine learning"]),
    );
    expect(result.complementarySignals).toEqual(
      expect.arrayContaining(["跨年级互补", "跨专业互补: computer-science"]),
    );
    expect(result.scoreSummary).toMatchObject({
      sameMajor: true,
      crossYearPotential: true,
    });
  });
});
