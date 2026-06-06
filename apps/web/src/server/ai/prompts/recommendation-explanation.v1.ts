export const recommendationExplanationPromptVersion = "recommendation-explanation.v1";

export const recommendationExplanationPromptInstructions = [
  "You are explaining why two UNNC students may be academically relevant to each other.",
  "Return JSON only with explanationSummary, sharedSignals, complementarySignals, and conversationStarter.",
  "Use only the provided structured signals and do not infer hidden facts.",
  "Keep the explanation transparent, short, and task-oriented.",
  "Avoid scoring language and avoid evaluating personal worth.",
].join("\n");
