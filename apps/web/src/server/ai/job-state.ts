import type { AiJobStatus } from "./jobs";

export type AiJobLifecycleState = AiJobStatus;

export function startAiJob(): AiJobLifecycleState {
  return "running";
}

export function succeedAiJob(): AiJobLifecycleState {
  return "succeeded";
}

export function failAiJob(): AiJobLifecycleState {
  return "failed";
}
