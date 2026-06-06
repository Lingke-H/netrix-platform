import { desc, eq } from "drizzle-orm";

import { type AiJobRecord, type AiJobStatus, createAiJobRecord, type CreateAiJobInput } from "@/server/ai/jobs";
import { requireCurrentUser } from "@/server/auth/session";
import { createDb, type DbClient } from "@/server/db/client";
import { aiJobs } from "@/server/db/schema";

export class AiJobError extends Error {
  constructor(
    message: string,
    public readonly code: "JOB_CREATE_FAILED" | "JOB_UPDATE_FAILED" | "JOB_NOT_FOUND",
  ) {
    super(message);
    this.name = "AiJobError";
  }
}

function buildAiJobRecord(row: typeof aiJobs.$inferSelect): AiJobRecord {
  return {
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    errorMessage: row.errorMessage,
    id: row.id,
    inputSummary: row.inputSummary,
    outputSummary: row.output as string | null,
    promptVersion: row.promptVersion,
    status: row.status,
    type: row.type,
    userId: row.createdBy,
  };
}

export async function createJob(
  db: DbClient,
  input: CreateAiJobInput,
): Promise<AiJobRecord> {
  const record = createAiJobRecord(input);
  const [row] = await db
    .insert(aiJobs)
    .values({
      createdBy: record.userId,
      id: record.id,
      inputSummary: record.inputSummary,
      output: record.outputSummary ? { result: record.outputSummary } : null,
      promptVersion: record.promptVersion,
      status: record.status,
      type: record.type,
    })
    .returning();

  if (!row) {
    throw new AiJobError("Unable to create the AI job.", "JOB_CREATE_FAILED");
  }

  return buildAiJobRecord(row);
}

export async function updateJobStatus(
  db: DbClient,
  jobId: string,
  status: AiJobStatus,
  outputSummary?: string | null,
  errorMessage?: string | null,
): Promise<AiJobRecord> {
  const completedAt = status === "succeeded" || status === "failed" ? new Date() : null;
  const [row] = await db
    .update(aiJobs)
    .set({
      completedAt,
      errorMessage: errorMessage ?? null,
      output: outputSummary ? { result: outputSummary } : undefined,
      status,
    })
    .where(eq(aiJobs.id, jobId))
    .returning();

  if (!row) {
    throw new AiJobError("Unable to update the AI job status.", "JOB_UPDATE_FAILED");
  }

  return buildAiJobRecord(row);
}

export async function getJobById(db: DbClient, jobId: string): Promise<AiJobRecord | null> {
  const [row] = await db
    .select()
    .from(aiJobs)
    .where(eq(aiJobs.id, jobId))
    .limit(1);

  return row ? buildAiJobRecord(row) : null;
}

export async function listJobsForUser(
  db: DbClient,
  userId: string,
  limit = 10,
): Promise<AiJobRecord[]> {
  const rows = await db
    .select()
    .from(aiJobs)
    .where(eq(aiJobs.createdBy, userId))
    .orderBy(desc(aiJobs.createdAt))
    .limit(Math.min(Math.max(limit, 1), 50));

  return rows.map(buildAiJobRecord);
}

export async function getCurrentUserJob(jobId: string): Promise<AiJobRecord | null> {
  const session = await requireCurrentUser();
  const db = createDb();

  const job = await getJobById(db, jobId);

  if (!job || job.userId !== session.userId) {
    return null;
  }

  return job;
}

export async function listCurrentUserJobs(limit?: number): Promise<AiJobRecord[]> {
  const session = await requireCurrentUser();
  const db = createDb();

  return listJobsForUser(db, session.userId, limit);
}
