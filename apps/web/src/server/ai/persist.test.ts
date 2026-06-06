import { describe, expect, it } from "vitest";

import { createAiJobRecord } from "./jobs";
import { persistAiNicknameDraft, persistAiPortrait, persistAiRecommendation } from "./persist";

function buildJob() {
  return createAiJobRecord({
    userId: "11111111-1111-1111-1111-111111111111",
    type: "profile-portrait",
    status: "succeeded",
    promptVersion: "profile-portrait.v1",
    inputSummary: "summary",
  });
}

describe("persistAiPortrait", () => {
  it("returns portrait event payload", () => {
    const result = persistAiPortrait(buildJob(), {
      id: "22222222-2222-2222-2222-222222222222",
      userId: "11111111-1111-1111-1111-111111111111",
      summary: "A concise academic portrait.",
      currentFocus: ["ML"],
      collaborationStyle: "Direct and structured",
      strengths: ["analysis"],
      suggestedTopics: ["projects"],
      status: "generated",
      promptVersion: "profile-portrait.v1",
      generatedAt: "2026-06-05T00:00:00.000Z",
    });

    expect(result.event.eventType).toBe("ai_portrait_generated");
  });
});

describe("persistAiRecommendation", () => {
  it("returns recommendation event payload", () => {
    const result = persistAiRecommendation(buildJob(), {
      recommendationId: "33333333-3333-3333-3333-333333333333",
      recommendedUserId: "44444444-4444-4444-4444-444444444444",
      nickname: "Nova",
      major: "computer-science",
      year: "year-2",
      profileSummary: "summary",
      sharedSignals: [],
      complementarySignals: [],
      explanationSummary: "summary",
      conversationStarter: "hello",
      status: "generated",
    });

    expect(result.event.eventType).toBe("recommendation_generated");
  });
});

describe("persistAiNicknameDraft", () => {
  it("returns nickname draft event payload", () => {
    const result = persistAiNicknameDraft(buildJob());

    expect(result.event.objectType).toBe("nickname_draft");
  });
});
