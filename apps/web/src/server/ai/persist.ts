import { recordEvent } from "@/server/events/record";
import { updateJobStatus } from "./job-service";
import { upsertPortrait } from "./portrait-service";
import type { AiJobRecord } from "./jobs";
import type { AcademicPortrait } from "@/features/profile/schemas";
import type { DbClient } from "@/server/db/client";

export type PersistedAiPortrait = {
  job: AiJobRecord;
  portrait: AcademicPortrait;
};

export type PersistedAiRecommendation = {
  job: AiJobRecord;
};

export type PersistedAiNicknameDraft = {
  job: AiJobRecord;
};

export async function persistAiPortrait(
  db: DbClient,
  job: AiJobRecord,
  portrait: AcademicPortrait,
): Promise<PersistedAiPortrait> {
  const upsertedPortrait = await upsertPortrait(db, {
    collaborationDraft: portrait.collaborationDraft,
    generatedAt: portrait.generatedAt,
    promptVersion: portrait.promptVersion,
    sourceSnapshot: portrait.sourceSnapshot,
    status: portrait.status,
    strengthsDraft: portrait.strengthsDraft,
    suggestedTags: portrait.suggestedTags,
    summary: portrait.summary,
    userId: portrait.userId,
  });

  const updatedJob = await updateJobStatus(db, job.id, "succeeded", portrait.summary);

  await recordEvent(db, {
    eventType: "ai_portrait_generated",
    objectType: "academic_portrait",
    objectId: upsertedPortrait.id,
    metadata: {
      userId: portrait.userId,
      promptVersion: portrait.promptVersion,
    },
  }, portrait.userId);

  return { job: updatedJob, portrait: upsertedPortrait };
}

export async function persistAiRecommendation(
  db: DbClient,
  job: AiJobRecord,
  recommendation: { recommendationId: string; recommendedUserId: string; status: string },
): Promise<PersistedAiRecommendation> {
  const updatedJob = await updateJobStatus(db, job.id, "succeeded", recommendation.recommendationId);

  await recordEvent(db, {
    eventType: "recommendation_generated",
    objectType: "recommendation",
    objectId: recommendation.recommendationId,
    metadata: {
      recommendedUserId: recommendation.recommendedUserId,
      status: recommendation.status,
    },
  }, job.userId);

  return { job: updatedJob };
}

export async function persistAiNicknameDraft(
  db: DbClient,
  job: AiJobRecord,
): Promise<PersistedAiNicknameDraft> {
  const updatedJob = await updateJobStatus(db, job.id, "succeeded");

  await recordEvent(db, {
    eventType: "ai_portrait_generated",
    objectType: "nickname_draft",
    objectId: job.id,
    metadata: {
      userId: job.userId,
      promptVersion: job.promptVersion,
    },
  }, job.userId);

  return { job: updatedJob };
}
