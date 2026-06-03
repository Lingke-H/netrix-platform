export type AiJobType = "nickname" | "profile-portrait" | "recommendation-explanation";
export type AiJobStatus = "queued" | "running" | "succeeded" | "failed";

export type AiJobRecord = {
  id: string;
  userId: string;
  type: AiJobType;
  status: AiJobStatus;
  promptVersion: string;
  inputSummary: string;
  createdAt: string;
};

export function createAiJobRecord(job: AiJobRecord) {
  return job;
}
