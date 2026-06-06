import { getServerEnv } from "@/lib/env";

export type AiModelName = string;

export const DEFAULT_AI_MODEL: AiModelName = "gpt-4.1-mini";

export function getAiModelName() {
  const { OPENAI_MODEL } = getServerEnv();
  return OPENAI_MODEL ?? DEFAULT_AI_MODEL;
}
