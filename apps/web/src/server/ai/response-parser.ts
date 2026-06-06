import { parseNicknameSuggestionOutput } from "./contracts";
import { parseProfilePortraitOutput } from "./contracts";
import { parseRecommendationExplanationOutput } from "./contracts";
import type { AiPromptKind } from "./prompt-builder";

export function parseAiResponse(kind: AiPromptKind, rawOutput: string) {
  const parsed = JSON.parse(rawOutput || "{}") as unknown;

  if (kind === "nickname") {
    return parseNicknameSuggestionOutput(parsed);
  }

  if (kind === "profile-portrait") {
    return parseProfilePortraitOutput(parsed);
  }

  return parseRecommendationExplanationOutput(parsed);
}
