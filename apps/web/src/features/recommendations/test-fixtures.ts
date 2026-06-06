import type { Recommendation } from "@/features/recommendations/schemas";
import type { RecommendationFeedData } from "@/features/recommendations/types";

export const visibleRecommendationFixture = {
  canRequestConnect: true,
  complementarySignals: ["can help with TypeScript debugging", "has frontend project experience"],
  conversationStarter: "Ask about debugging patterns for COMP1048 coursework.",
  explanationSummary: "Both profiles show overlapping modules and complementary skills.",
  generatedByJobId: null,
  major: "computer-science",
  nickname: "TypeScript Builder",
  profileSummary: "Works on web apps, coursework debugging, and small team projects.",
  profileVisibility: "campus",
  recommendationId: "11111111-1111-4111-8111-111111111111",
  recommendedUserId: "22222222-2222-4222-8222-222222222222",
  sharedSignals: ["COMP1048", "React coursework"],
  status: "active",
  year: "year-2",
} satisfies Recommendation;

export const privateRecommendationFixture = {
  canRequestConnect: false,
  complementarySignals: [],
  conversationStarter: null,
  explanationSummary: "This recommendation is hidden because the profile is private.",
  generatedByJobId: null,
  major: null,
  nickname: "Private profile",
  profileSummary: null,
  profileVisibility: "private",
  recommendationId: "33333333-3333-4333-8333-333333333333",
  recommendedUserId: null,
  sharedSignals: [],
  status: "active",
  year: null,
} satisfies Recommendation;

export const recommendationFeedFixture = {
  hasEnoughSignals: true,
  items: [visibleRecommendationFixture, privateRecommendationFixture],
} satisfies RecommendationFeedData;
