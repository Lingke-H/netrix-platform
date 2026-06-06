import {
  nicknamePromptInstructions,
  profilePortraitPromptInstructions,
  recommendationExplanationPromptInstructions,
} from "./prompts";
import { aiPromptVersions } from "./contracts";

export type AiPromptKind = keyof typeof aiPromptVersions;

export type BuiltAiPrompt = {
  kind: AiPromptKind;
  version: string;
  instructions: string;
  systemPrompt: string;
};

function buildSystemPrompt(title: string, instructions: string) {
  return [title, instructions].join("\n\n");
}

export function buildAiPrompt(kind: AiPromptKind): BuiltAiPrompt {
  if (kind === "nickname") {
    return {
      kind,
      version: aiPromptVersions[kind],
      instructions: nicknamePromptInstructions,
      systemPrompt: buildSystemPrompt("Nickname suggestion assistant", nicknamePromptInstructions),
    };
  }

  if (kind === "profile-portrait") {
    return {
      kind,
      version: aiPromptVersions[kind],
      instructions: profilePortraitPromptInstructions,
      systemPrompt: buildSystemPrompt("Academic portrait assistant", profilePortraitPromptInstructions),
    };
  }

  return {
    kind,
    version: aiPromptVersions[kind],
    instructions: recommendationExplanationPromptInstructions,
    systemPrompt: buildSystemPrompt(
      "Recommendation explanation assistant",
      recommendationExplanationPromptInstructions,
    ),
  };
}
