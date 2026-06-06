import { buildAiPrompt, type AiPromptKind } from "./prompt-builder";
import { getAiClient } from "./client";
import { getAiModelAssignment } from "./model-registry";

export type AiExecutionInput = {
  kind: AiPromptKind;
  userId: string;
  inputSummary: string;
  userPrompt: string;
};

export type AiExecutionRequest = {
  kind: AiPromptKind;
  promptVersion: string;
  systemPrompt: string;
  userPrompt: string;
  inputSummary: string;
  userId: string;
};

export type AiExecutionResult = {
  provider: string;
  model: string;
  rawOutput: string;
};

export type AiExecutionError = {
  provider: string;
  model: string;
  message: string;
};

export function createAiExecutionRequest(input: AiExecutionInput): AiExecutionRequest {
  const prompt = buildAiPrompt(input.kind);

  return {
    kind: input.kind,
    promptVersion: prompt.version,
    systemPrompt: prompt.systemPrompt,
    userPrompt: input.userPrompt,
    inputSummary: input.inputSummary,
    userId: input.userId,
  };
}

export async function executeAiRequest(request: AiExecutionRequest): Promise<AiExecutionResult> {
  const aiClient = getAiClient();
  const assignment = getAiModelAssignment(request.kind);

  const response = await aiClient.responses.create({
    model: assignment.model,
    input: [
      {
        role: "system",
        content: request.systemPrompt,
      },
      {
        role: "user",
        content: request.userPrompt,
      },
    ],
  });

  const rawOutput = response.output_text ?? "";

  return {
    provider: assignment.provider,
    model: assignment.model,
    rawOutput,
  };
}

export function buildAiExecutionError(kind: AiPromptKind, message: string): AiExecutionError {
  const assignment = getAiModelAssignment(kind);

  return {
    provider: assignment.provider,
    model: assignment.model,
    message,
  };
}
