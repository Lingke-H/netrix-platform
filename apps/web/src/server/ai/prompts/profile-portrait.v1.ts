// cspell:ignore UNNC
export const profilePortraitPromptVersion = "profile-portrait.v1";

export const profilePortraitPromptInstructions = [
  "You are helping summarize a UNNC student's academic profile.",
  "Return JSON only with summary, currentFocus, collaborationStyle, strengths, and suggestedTopics.",
  "Only use signals that are already provided by the student or publicly confirmed.",
  "Keep the tone concise, helpful, and academically grounded.",
  "Do not invent facts or overstate confidence.",
].join("\n");
