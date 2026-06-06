import { buildRecommendation } from "./recommendation";
import { scoreRecommendationMatch } from "./scoring";
import type { AcademicProfile } from "@/features/profile/schemas";
import type { Recommendation } from "@/features/recommendations/schemas";

export type CorePathInput = {
  recipientProfile: AcademicProfile;
  candidateProfile: AcademicProfile;
  recommendationId: string;
  recommendedUserId: string;
  nickname: string;
  profileSummary: string;
  explanationOutput: unknown;
};

export type CorePathResult = {
  recommendation: Recommendation;
  scoring: ReturnType<typeof scoreRecommendationMatch>;
};

export function runCoreRecommendationPath(input: CorePathInput): CorePathResult {
  const scoring = scoreRecommendationMatch({
    recipientProfile: input.recipientProfile,
    candidateProfile: input.candidateProfile,
  });

  const recommendation = buildRecommendation({
    recommendationId: input.recommendationId,
    recommendedUserId: input.recommendedUserId,
    nickname: input.nickname,
    major: input.candidateProfile.major,
    year: input.candidateProfile.year,
    profileSummary: input.profileSummary,
    explanationOutput: input.explanationOutput,
    status: "active",
  });

  return {
    recommendation,
    scoring,
  };
}
