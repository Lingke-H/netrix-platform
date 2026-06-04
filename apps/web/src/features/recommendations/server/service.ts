import type { RecommendationFeedData } from "@/features/recommendations/types";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";

export function buildEmptyRecommendationFeedData(): RecommendationFeedData {
  return {
    hasEnoughSignals: false,
    items: [],
  };
}

export async function getCurrentUserRecommendationFeed(): Promise<RecommendationFeedData> {
  await requireCompletedAcademicProfile();

  return buildEmptyRecommendationFeedData();
}
