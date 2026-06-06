import { describe, expect, it } from "vitest";

import { recommendations } from "@/server/db/schema";

type RecommendationInsert = typeof recommendations.$inferInsert;

const persistedRecommendationCardColumns = [
  "id",
  "generatedByJobId",
  "recommendedUserId",
  "explanationSummary",
  "sharedSignals",
  "complementarySignals",
  "conversationStarter",
  "status",
] as const;

const recommendationGenerationMetadataColumns = [
  "promptVersion",
  "llmProvider",
  "llmModel",
  "llmRawResponseId",
  "llmUsage",
  "scoreSummary",
  "signalSnapshot",
] as const;

describe("Drizzle recommendation persistence schema", () => {
  it("keeps table columns for persisted recommendation card fields", () => {
    persistedRecommendationCardColumns.forEach((column) => {
      expect(recommendations).toHaveProperty(column);
    });
  });

  it("keeps table columns for prompt and generation metadata", () => {
    recommendationGenerationMetadataColumns.forEach((column) => {
      expect(recommendations).toHaveProperty(column);
    });
  });

  it("accepts an insert draft shaped like the current generated recommendation card", () => {
    const insertDraft = {
      complementarySignals: ["Candidate can help with: typescript debugging"],
      conversationStarter: "Ask TypeScript Builder about Shared module: COMP1048.",
      explanationSummary:
        "TypeScript Builder is recommended because of Shared module: COMP1048 and Candidate can help with: typescript debugging.",
      generatedByJobId: "11111111-1111-4111-8111-111111111111",
      llmModel: "mock-recommendation-explainer",
      llmProvider: "mock",
      llmRawResponseId: "mock-recommendation-response-1",
      llmUsage: {
        inputTokens: 64,
        outputTokens: 48,
      },
      promptVersion: "recommendation-explanation.v1",
      recommendedUserId: "22222222-2222-4222-8222-222222222222",
      recipientUserId: "33333333-3333-4333-8333-333333333333",
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
      signalSnapshot: {
        candidateUserId: "22222222-2222-4222-8222-222222222222",
        profileVisibility: "campus",
        promptVersion: "recommendation-explanation.v1",
      },
      status: "active",
    } satisfies RecommendationInsert;

    expect(insertDraft).toMatchObject({
      llmModel: "mock-recommendation-explainer",
      llmProvider: "mock",
      promptVersion: "recommendation-explanation.v1",
      status: "active",
    });
  });
});
