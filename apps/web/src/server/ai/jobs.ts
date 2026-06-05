export type AiJobType = "nickname" | "profile-portrait" | "recommendation-explanation";
export type AiJobStatus = "queued" | "running" | "succeeded" | "failed";

export type AiJobRecord = {
  id: string;
  userId: string;
  type: AiJobType;
  status: AiJobStatus;
  promptVersion: string;
  inputSummary: string;
  outputSummary: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type CreateAiJobInput = Omit<AiJobRecord, "id" | "createdAt" | "completedAt" | "outputSummary" | "errorMessage"> & {
  outputSummary?: string | null;
  errorMessage?: string | null;
  completedAt?: string | null;
};

export function createAiJobRecord(job: CreateAiJobInput): AiJobRecord {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    completedAt: job.completedAt ?? null,
    outputSummary: job.outputSummary ?? null,
    errorMessage: job.errorMessage ?? null,
    ...job,
  };
}
