import { getAiClient } from "./client";
import { aiPromptVersions } from "./contracts";
import { createAiJobRecord, type CreateAiJobInput } from "./jobs";
import {
  nicknamePromptInstructions,
  profilePortraitPromptInstructions,
  recommendationExplanationPromptInstructions,
} from "./prompts";
import { buildNicknameSuggestions } from "./nickname";
import { buildProfilePortrait } from "./profile-portrait";
import { buildRecommendation } from "./recommendation";
import type { NicknameSuggestionOutput } from "./schemas/nickname";
import type { ProfilePortraitOutput } from "./schemas/profile-portrait";
import type { RecommendationExplanationOutput } from "./schemas/recommendation-explanation";

export type AiPipelineKind = "nickname" | "profile-portrait" | "recommendation-explanation";

export type AiPipelineInput =
  | {
      kind: "nickname";
      userId: string;
      inputSummary: string;
      output: NicknameSuggestionOutput | unknown;
    }
  | {
      kind: "profile-portrait";
      userId: string;
      inputSummary: string;
      output: ProfilePortraitOutput | unknown;
    }
  | {
      kind: "recommendation-explanation";
      userId: string;
      inputSummary: string;
      output: RecommendationExplanationOutput | unknown;
    };

export type AiPromptBundle = {
  kind: AiPipelineKind;
  promptVersion: string;
  instructions: string;
};

export function getAiPromptBundle(kind: AiPipelineKind): AiPromptBundle {
  if (kind === "nickname") {
    return { kind, promptVersion: aiPromptVersions[kind], instructions: nicknamePromptInstructions };
  }

  if (kind === "profile-portrait") {
    return { kind, promptVersion: aiPromptVersions[kind], instructions: profilePortraitPromptInstructions };
  }

  return {
    kind,
    promptVersion: aiPromptVersions[kind],
    instructions: recommendationExplanationPromptInstructions,
  };
}

export function buildAiPipelineJob(input: AiPipelineInput): CreateAiJobInput {
  return {
    userId: input.userId,
    type: input.kind,
    status: "succeeded",
    promptVersion: aiPromptVersions[input.kind],
    inputSummary: input.inputSummary,
    outputSummary: JSON.stringify(input.output),
  };
}

export function runAiPipeline(input: AiPipelineInput) {
  const aiClient = getAiClient();
  void aiClient;

  const job = createAiJobRecord(buildAiPipelineJob(input));
  const promptBundle = getAiPromptBundle(input.kind);

  if (input.kind === "nickname") {
    return { job, promptBundle, result: buildNicknameSuggestions({ explanationOutput: input.output }) };
  }

  if (input.kind === "profile-portrait") {
    return {
      job,
      promptBundle,
      result: buildProfilePortrait({
        userId: input.userId,
        promptVersion: aiPromptVersions["profile-portrait"],
        explanationOutput: input.output,
      }),
    };
  }

  return {
    job,
    promptBundle,
    result: buildRecommendation({
      recommendationId: "00000000-0000-0000-0000-000000000000",
      recommendedUserId: input.userId,
      nickname: "Temp",
      major: "other",
      year: "foundation",
      profileSummary: input.inputSummary,
      explanationOutput: input.output,
    }),
  };
}
