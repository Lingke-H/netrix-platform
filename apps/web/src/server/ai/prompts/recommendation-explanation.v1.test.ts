import { describe, expect, it } from "vitest";

import type { RecommendationExplanationInput } from "@/server/ai/schemas/recommendation-explanation";
import {
  buildRecommendationExplanationPromptMessages,
  recommendationExplanationPromptVersion,
} from "@/server/ai/prompts/recommendation-explanation.v1";

const promptInput = {
  candidateProfile: {
    collaborationPreference: ["pair study"],
    helpNeeded: ["signals"],
    helpOffered: ["typescript debugging"],
    interests: ["web apps"],
    major: "computer-science",
    modules: ["COMP1048"],
    nickname: "TypeScript Builder",
    skills: ["react"],
    userId: "44444444-4444-4444-8444-444444444444",
    visibility: "campus",
    year: "year-2",
  },
  ruleScore: {
    complementarySignals: ["Candidate can help with: typescript debugging"],
    score: 12,
    scoreSummary: {
      collaborationPreferenceOverlap: 1,
      helpComplementarity: 4,
      interestOverlap: 2,
      moduleOverlap: 3,
      skillOverlap: 2,
      total: 12,
    },
    sharedSignals: [
      "Shared module: COMP1048",
      "Shared interest: web apps",
      "Shared skill: react",
      "Shared collaboration preference: pair study",
    ],
  },
  viewerProfile: {
    collaborationPreference: ["pair study", "project teammate"],
    helpNeeded: ["typescript debugging", "signals"],
    helpOffered: ["react"],
    interests: ["web apps", "coursework systems"],
    modules: ["COMP1048", "ELEC2043"],
    skills: ["react", "typescript"],
  },
} satisfies RecommendationExplanationInput;

describe("recommendation explanation prompt builder", () => {
  it("renders stable prompt messages from recommendation explanation input", () => {
    expect(buildRecommendationExplanationPromptMessages(promptInput)).toEqual([
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
          JSON.stringify(promptInput, null, 2),
        ].join("\n"),
      },
    ]);
  });

  it("rejects prompt messages for non-campus candidate input", () => {
    expect(() =>
      buildRecommendationExplanationPromptMessages({
        ...promptInput,
        candidateProfile: {
          ...promptInput.candidateProfile,
          visibility: "private",
        },
      } as unknown as RecommendationExplanationInput),
    ).toThrow();
  });
});
