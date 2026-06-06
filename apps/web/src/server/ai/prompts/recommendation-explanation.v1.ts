import {
  recommendationExplanationInputSchema,
  type RecommendationExplanationInput,
} from "@/server/ai/schemas/recommendation-explanation";

export const recommendationExplanationPromptVersion = "recommendation-explanation.v1";

export const recommendationExplanationPromptInstructions = [
  "You are explaining why two UNNC students may be academically relevant to each other.",
  "Return JSON only with explanationSummary, sharedSignals, complementarySignals, and conversationStarter.",
  "Use only the provided structured signals and do not infer hidden facts.",
  "Keep the explanation transparent, short, and task-oriented.",
  "Avoid scoring language and avoid evaluating personal worth.",
].join("\n");

export type RecommendationExplanationPromptMessage = {
  role: "system" | "user";
  content: string;
};

function stableRecommendationExplanationPayload(input: RecommendationExplanationInput) {
  return {
    candidateProfile: {
      collaborationPreference: input.candidateProfile.collaborationPreference,
      helpNeeded: input.candidateProfile.helpNeeded,
      helpOffered: input.candidateProfile.helpOffered,
      interests: input.candidateProfile.interests,
      major: input.candidateProfile.major,
      modules: input.candidateProfile.modules,
      nickname: input.candidateProfile.nickname,
      skills: input.candidateProfile.skills,
      userId: input.candidateProfile.userId,
      visibility: input.candidateProfile.visibility,
      year: input.candidateProfile.year,
    },
    ruleScore: {
      complementarySignals: input.ruleScore.complementarySignals,
      score: input.ruleScore.score,
      scoreSummary: {
        collaborationPreferenceOverlap: input.ruleScore.scoreSummary.collaborationPreferenceOverlap,
        helpComplementarity: input.ruleScore.scoreSummary.helpComplementarity,
        interestOverlap: input.ruleScore.scoreSummary.interestOverlap,
        moduleOverlap: input.ruleScore.scoreSummary.moduleOverlap,
        skillOverlap: input.ruleScore.scoreSummary.skillOverlap,
        total: input.ruleScore.scoreSummary.total,
      },
      sharedSignals: input.ruleScore.sharedSignals,
    },
    viewerProfile: {
      collaborationPreference: input.viewerProfile.collaborationPreference,
      helpNeeded: input.viewerProfile.helpNeeded,
      helpOffered: input.viewerProfile.helpOffered,
      interests: input.viewerProfile.interests,
      modules: input.viewerProfile.modules,
      skills: input.viewerProfile.skills,
    },
  };
}

export function buildRecommendationExplanationPromptMessages(
  input: RecommendationExplanationInput,
): RecommendationExplanationPromptMessage[] {
  const parsedInput = recommendationExplanationInputSchema.parse(input);

  return [
    {
      role: "system",
      content:
        "You write concise, explainable academic connection recommendations for verified UNNC students. Use only the provided structured signals. Do not invent modules, skills, identities, messages, or private details. Return content that can be validated against the recommendation explanation output schema.",
    },
    {
      role: "user",
      content: [
        `Prompt version: ${recommendationExplanationPromptVersion}`,
        "Task: Draft a short recommendation explanation, the strongest shared signals, complementary signals, and one academic conversation starter.",
        "Input JSON:",
        JSON.stringify(stableRecommendationExplanationPayload(parsedInput), null, 2),
      ].join("\n"),
    },
  ];
}
