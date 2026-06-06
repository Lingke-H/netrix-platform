import { recordEvent } from "@/server/events/record";
import type { AiJobRecord } from "./jobs";
import type { AcademicPortrait, Recommendation } from "@/features/profile/schemas";

export type PersistedAiPortrait = {
  job: AiJobRecord;
  portrait: AcademicPortrait;
  event: ReturnType<typeof recordEvent>;
};

export type PersistedAiRecommendation = {
  job: AiJobRecord;
  recommendation: Recommendation;
  event: ReturnType<typeof recordEvent>;
};

export type PersistedAiNicknameDraft = {
  job: AiJobRecord;
  event: ReturnType<typeof recordEvent>;
};

export function persistAiPortrait(job: AiJobRecord, portrait: AcademicPortrait): PersistedAiPortrait {
  const event = recordEvent({
    eventType: "ai_portrait_generated",
    objectType: "academic_portrait",
    objectId: portrait.id,
    metadata: {
      userId: portrait.userId,
      promptVersion: portrait.promptVersion,
    },
  });

  return {
    job,
    portrait,
    event,
  };
}

export function persistAiRecommendation(
  job: AiJobRecord,
  recommendation: Recommendation,
): PersistedAiRecommendation {
  const event = recordEvent({
    eventType: "recommendation_generated",
    objectType: "recommendation",
    objectId: recommendation.recommendationId,
    metadata: {
      recommendedUserId: recommendation.recommendedUserId,
      status: recommendation.status,
    },
  });

  return {
    job,
    recommendation,
    event,
  };
}

export function persistAiNicknameDraft(job: AiJobRecord): PersistedAiNicknameDraft {
  const event = recordEvent({
    eventType: "ai_portrait_generated",
    objectType: "nickname_draft",
    objectId: job.id,
    metadata: {
      userId: job.userId,
      promptVersion: job.promptVersion,
    },
  });

  return {
    job,
    event,
  };
}
