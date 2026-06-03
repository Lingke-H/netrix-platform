import type {
  Recommendation,
  RecommendationActionInput,
  RecommendationStatus,
} from "./schemas";

export type RecommendationFeedData = {
  items: Recommendation[];
  hasEnoughSignals: boolean;
};

export type RecommendationCardState = {
  status: RecommendationStatus;
  canRequestConnect: boolean;
};

export type RecommendationActionPayload = RecommendationActionInput;
