import { parseNicknameSuggestionOutput } from "./contracts";
import { parseProfilePortraitOutput } from "./contracts";
import { parseRecommendationExplanationOutput } from "./contracts";
import type { AiPromptKind } from "./prompt-builder";
import type { NicknameSuggestionOutput } from "./schemas/nickname";
import type { ProfilePortraitOutput } from "./schemas/profile-portrait";
import type { RecommendationExplanationOutput } from "./schemas/recommendation-explanation";

export function parseAiResponse(kind: "nickname", rawOutput: string): NicknameSuggestionOutput;
export function parseAiResponse(kind: "profile-portrait", rawOutput: string): ProfilePortraitOutput;
export function parseAiResponse(
  kind: "recommendation-explanation",
  rawOutput: string,
): RecommendationExplanationOutput;
export function parseAiResponse(
  kind: AiPromptKind,
  rawOutput: string,
): NicknameSuggestionOutput | ProfilePortraitOutput | RecommendationExplanationOutput;
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
