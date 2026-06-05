import { nicknamePromptVersion } from "./prompts/nickname.v1";
import { profilePortraitPromptVersion } from "./prompts/profile-portrait.v1";
import { recommendationExplanationPromptVersion } from "./prompts/recommendation-explanation.v1";
import { nicknameSuggestionOutputSchema, type NicknameSuggestionOutput } from "./schemas/nickname";
import {
  profilePortraitOutputSchema,
  type ProfilePortraitOutput,
} from "./schemas/profile-portrait";
import {
  recommendationExplanationOutputSchema,
  type RecommendationExplanationOutput,
} from "./schemas/recommendation-explanation";

export type AiPromptKey = "nickname" | "profile-portrait" | "recommendation-explanation";

export const aiPromptVersions: Record<AiPromptKey, string> = {
  nickname: nicknamePromptVersion,
  "profile-portrait": profilePortraitPromptVersion,
  "recommendation-explanation": recommendationExplanationPromptVersion,
};

export function parseNicknameSuggestionOutput(input: unknown): NicknameSuggestionOutput {
  return nicknameSuggestionOutputSchema.parse(input);
}

export function parseProfilePortraitOutput(input: unknown): ProfilePortraitOutput {
  return profilePortraitOutputSchema.parse(input);
}

export function parseRecommendationExplanationOutput(
  input: unknown,
): RecommendationExplanationOutput {
  return recommendationExplanationOutputSchema.parse(input);
}
