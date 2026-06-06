import { parseRecommendationExplanationOutput } from "./contracts";
import type { RecommendationExplanationOutput } from "./schemas/recommendation-explanation";
import type { Recommendation } from "@/features/recommendations/schemas";
import type { Major, StudyYear } from "@/features/profile/schemas";

export type RecommendationCandidateInput = {
  recommendationId: string;
  recommendedUserId: string;
  nickname: string;
  major: Major;
  year: StudyYear;
  profileSummary: string;
  explanationOutput: RecommendationExplanationOutput | unknown;
  status?: Recommendation["status"];
};

export function buildRecommendation(candidate: RecommendationCandidateInput): Recommendation {
  const explanation = parseRecommendationExplanationOutput(candidate.explanationOutput);

  return {
    recommendationId: candidate.recommendationId,
    canRequestConnect: true,
    generatedByJobId: null,
    recommendedUserId: candidate.recommendedUserId,
    nickname: candidate.nickname,
    major: candidate.major,
    year: candidate.year,
    profileSummary: candidate.profileSummary,
    profileVisibility: "campus",
    sharedSignals: explanation.sharedSignals,
    complementarySignals: explanation.complementarySignals,
    explanationSummary: explanation.explanationSummary,
    conversationStarter: explanation.conversationStarter,
    status: candidate.status ?? "active",
  };
}
