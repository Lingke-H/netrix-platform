import { buildRecommendation } from "./recommendation";
import { scoreRecommendationMatch } from "./scoring";
import { recordEvent } from "@/server/events/record";
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
  event: ReturnType<typeof recordEvent>;
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

  const event = recordEvent({
    eventType: "recommendation_generated",
    objectType: "recommendation",
    objectId: input.recommendationId,
    metadata: {
      recipientUserId: input.recipientProfile.userId,
      recommendedUserId: input.recommendedUserId,
      totalScore: scoring.scoreSummary.totalScore as number,
    },
  });

  return {
    recommendation,
    scoring,
    event,
  };
}
