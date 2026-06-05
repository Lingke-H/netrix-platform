import { parseNicknameSuggestionOutput } from "./contracts";
import type { NicknameSuggestionOutput } from "./schemas/nickname";

export type NicknameCandidateInput = {
  explanationOutput: NicknameSuggestionOutput | unknown;
};

export function buildNicknameSuggestions(candidate: NicknameCandidateInput): NicknameSuggestionOutput {
  return parseNicknameSuggestionOutput(candidate.explanationOutput);
}
