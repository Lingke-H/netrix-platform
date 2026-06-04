import { describe, expect, it } from "vitest";

import { recommendationSchema } from "@/features/recommendations/schemas";
import {
  privateRecommendationFixture,
  recommendationFeedFixture,
  visibleRecommendationFixture,
} from "@/features/recommendations/test-fixtures";

describe("recommendation schema", () => {
  it("accepts visible recommendation profile fields for campus cards", () => {
    expect(recommendationSchema.parse(visibleRecommendationFixture)).toMatchObject({
      canRequestConnect: true,
      nickname: "TypeScript Builder",
      profileVisibility: "campus",
      recommendedUserId: "22222222-2222-4222-8222-222222222222",
    });
  });

  it("accepts only redacted and non-actionable private recommendation profiles", () => {
    expect(recommendationSchema.parse(privateRecommendationFixture)).toMatchObject({
      canRequestConnect: false,
      major: null,
      nickname: "Private profile",
      profileSummary: null,
      profileVisibility: "private",
      recommendedUserId: null,
      year: null,
    });
  });

  it("keeps the feed fixture aligned with recommendation card DTO fields", () => {
    const parsedItems = recommendationFeedFixture.items.map((recommendation) => recommendationSchema.parse(recommendation));

    expect(parsedItems).toHaveLength(2);
    expect(parsedItems[0]).toMatchObject({
      canRequestConnect: true,
      conversationStarter: expect.any(String),
      explanationSummary: expect.any(String),
      profileSummary: expect.any(String),
      profileVisibility: "campus",
      recommendedUserId: expect.any(String),
    });
    expect(parsedItems[1]).toMatchObject({
      canRequestConnect: false,
      conversationStarter: null,
      explanationSummary: "This recommendation is hidden because the profile is private.",
      profileSummary: null,
      profileVisibility: "private",
      recommendedUserId: null,
    });
  });

  it("keeps private recommendation fixtures unlinkable and signal-redacted", () => {
    const privateRecommendation = recommendationSchema.parse(privateRecommendationFixture);

    expect(privateRecommendation).toMatchObject({
      canRequestConnect: false,
      complementarySignals: [],
      major: null,
      profileSummary: null,
      recommendedUserId: null,
      sharedSignals: [],
      year: null,
    });
  });

  it("rejects private recommendation cards that leak profile identity fields", () => {
    expect(() =>
      recommendationSchema.parse({
        ...visibleRecommendationFixture,
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
