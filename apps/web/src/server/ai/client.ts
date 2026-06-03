import OpenAI from "openai";

import { getServerEnv } from "@/lib/env";

export function getAiClient() {
  const { OPENAI_API_KEY } = getServerEnv();

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required before invoking the AI client.");
  }

  return new OpenAI({ apiKey: OPENAI_API_KEY });
}
