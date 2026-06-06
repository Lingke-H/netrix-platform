import { getAiProviderName } from "./providers";

export type AiTaskKind = "nickname" | "profile-portrait" | "recommendation-explanation";

export type AiModelAssignment = {
  provider: string;
  model: string;
};

const aiModelRegistry: Record<AiTaskKind, AiModelAssignment> = {
  nickname: {
    provider: getAiProviderName(),
    model: "Qwen/Qwen2.5-7B-Instruct",
  },
  "profile-portrait": {
    provider: getAiProviderName(),
    model: "deepseek-ai/DeepSeek-V3",
  },
  "recommendation-explanation": {
    provider: getAiProviderName(),
    model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  },
};

export function getAiModelAssignment(task: AiTaskKind): AiModelAssignment {
  return aiModelRegistry[task];
}
