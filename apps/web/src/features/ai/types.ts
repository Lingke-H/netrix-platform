import type {
  NicknameSuggestionOutput,
  ProfilePortraitOutput,
  RecommendationExplanationOutput,
} from "./schemas";

export type AiNicknameSuggestionState = {
  loading: boolean;
  output: NicknameSuggestionOutput | null;
};

export type AiPortraitState = {
  loading: boolean;
  output: ProfilePortraitOutput | null;
};

export type AiRecommendationExplanationState = {
  loading: boolean;
  output: RecommendationExplanationOutput | null;
};
