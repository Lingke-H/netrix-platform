import { buildAiExecutionError, createAiExecutionRequest, executeAiRequest } from "./executor";
import { aiPromptVersions } from "./contracts";
import { type CreateAiJobInput } from "./jobs";
import { createJob, updateJobStatus } from "./job-service";
import {
  nicknamePromptInstructions,
  profilePortraitPromptInstructions,
  recommendationExplanationPromptInstructions,
} from "./prompts";
import { buildNicknameSuggestions } from "./nickname";
import { buildProfilePortrait } from "./profile-portrait";
import { buildRecommendation } from "./recommendation";
import { parseAiResponse } from "./response-parser";
import { startAiJob } from "./job-state";
import type { AiJobRecord } from "./jobs";
import type { NicknameSuggestionOutput } from "./schemas/nickname";
import type { ProfilePortraitOutput } from "./schemas/profile-portrait";
import type { RecommendationExplanationOutput } from "./schemas/recommendation-explanation";
import type { DbClient } from "@/server/db/client";

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

export type AiPipelineRunOptions = {
  db: DbClient;
};

export type AiPipelineRunOutput =
  | {
      kind: "nickname";
      job: AiJobRecord;
      promptBundle: AiPromptBundle;
      result: ReturnType<typeof buildNicknameSuggestions>;
    }
  | {
      kind: "profile-portrait";
      job: AiJobRecord;
      promptBundle: AiPromptBundle;
      result: ReturnType<typeof buildProfilePortrait>;
    }
  | {
      kind: "recommendation-explanation";
      job: AiJobRecord;
      promptBundle: AiPromptBundle;
      result: ReturnType<typeof buildRecommendation>;
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
    status: "running",
    promptVersion: aiPromptVersions[input.kind],
    inputSummary: input.inputSummary,
  };
}

export async function runAiPipeline(input: AiPipelineInput, options: AiPipelineRunOptions): Promise<AiPipelineRunOutput> {
  const { db } = options;
  const request = createAiExecutionRequest({
    kind: input.kind,
    userId: input.userId,
    inputSummary: input.inputSummary,
    userPrompt: input.inputSummary,
  });

  const promptBundle = getAiPromptBundle(input.kind);

  const job = await createJob(db, {
    ...buildAiPipelineJob(input),
    status: startAiJob(),
  });

  try {
    const execution = await executeAiRequest(request);
    const parsed = parseAiResponse(input.kind, execution.rawOutput);

    const finishedJob = await updateJobStatus(db, job.id, "succeeded", JSON.stringify(parsed));

    if (input.kind === "nickname") {
      return {
        kind: input.kind,
        job: finishedJob,
        promptBundle,
        result: buildNicknameSuggestions({ explanationOutput: parsed }),
      };
    }

    if (input.kind === "profile-portrait") {
      return {
        kind: input.kind,
        job: finishedJob,
        promptBundle,
        result: buildProfilePortrait({
          userId: input.userId,
          promptVersion: aiPromptVersions["profile-portrait"],
          explanationOutput: parsed,
        }),
      };
    }

    return {
      kind: input.kind,
      job: finishedJob,
      promptBundle,
      result: buildRecommendation({
        recommendationId: "00000000-0000-0000-0000-000000000000",
        recommendedUserId: input.userId,
        nickname: "Temp",
        major: "other",
        year: "foundation",
        profileSummary: input.inputSummary,
        explanationOutput: parsed,
      }),
    };
  } catch (error) {
    const aiError = buildAiExecutionError(input.kind, error instanceof Error ? error.message : "Unknown AI error");
    await updateJobStatus(db, job.id, "failed", null, aiError.message);
    throw new Error(aiError.message);
  }
}
