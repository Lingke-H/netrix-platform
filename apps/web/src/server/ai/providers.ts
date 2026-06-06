import { getServerEnv } from "@/lib/env";

export type AiProviderName = "openai-compatible";

export function getAiProviderName(): AiProviderName {
  void getServerEnv();
  return "openai-compatible";
}
