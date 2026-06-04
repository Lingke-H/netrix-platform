import { describe, expect, it } from "vitest";

import { recommendationSchema } from "@/features/recommendations/schemas";

const baseRecommendation = {
  generatedByJobId: null,
  recommendationId: "11111111-1111-4111-8111-111111111111",
  status: "active",
} as const;

const visibleSignals = {
  complementarySignals: ["can help with TypeScript debugging"],
  conversationStarter: "Ask about debugging patterns for COMP1048 coursework.",
  explanationSummary: "Both profiles show overlapping modules and complementary skills.",
  sharedSignals: ["COMP1048"],
} as const;

describe("recommendation schema", () => {
  it("accepts visible recommendation profile fields for campus cards", () => {
    expect(
      recommendationSchema.parse({
        ...baseRecommendation,
        ...visibleSignals,
        canRequestConnect: true,
        major: "computer-science",
        nickname: "TypeScript Builder",
        profileSummary: "Works on web apps and coursework debugging.",
        profileVisibility: "campus",
        recommendedUserId: "22222222-2222-4222-8222-222222222222",
        year: "year-2",
      }),
    ).toMatchObject({
      canRequestConnect: true,
      nickname: "TypeScript Builder",
      profileVisibility: "campus",
      recommendedUserId: "22222222-2222-4222-8222-222222222222",
    });
  });

  it("accepts only redacted and non-actionable private recommendation profiles", () => {
    expect(
      recommendationSchema.parse({
        ...baseRecommendation,
        complementarySignals: [],
        conversationStarter: null,
        explanationSummary: "This recommendation is hidden because the profile is private.",
        sharedSignals: [],
        canRequestConnect: false,
        major: null,
        nickname: "Private profile",
        profileSummary: null,
        profileVisibility: "private",
        recommendedUserId: null,
        year: null,
      }),
    ).toMatchObject({
      canRequestConnect: false,
      major: null,
      nickname: "Private profile",
      profileSummary: null,
      profileVisibility: "private",
      recommendedUserId: null,
      year: null,
    });
  });

  it("rejects private recommendation cards that leak profile identity fields", () => {
    expect(() =>
      recommendationSchema.parse({
        ...baseRecommendation,
        ...visibleSignals,
        canRequestConnect: true,
        major: "computer-science",
        nickname: "TypeScript Builder",
        profileSummary: "Works on private academic interests.",
        profileVisibility: "private",
        recommendedUserId: "22222222-2222-4222-8222-222222222222",
        year: "year-2",
      }),
    ).toThrow();
  });
});
