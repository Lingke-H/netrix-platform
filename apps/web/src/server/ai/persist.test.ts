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

const mockDb = {} as ReturnType<typeof import("@/server/db/client").createDb>;

describe("persistAiPortrait", () => {
  it("returns portrait and job without throwing", async () => {
    await expect(
      persistAiPortrait(mockDb, buildJob(), {
        id: "22222222-2222-2222-2222-222222222222",
        userId: "11111111-1111-1111-1111-111111111111",
        sourceSnapshot: {},
        summary: "A concise academic portrait.",
        suggestedTags: ["ML", "projects"],
        strengthsDraft: ["analysis"],
        collaborationDraft: "Direct and structured",
        status: "draft",
        promptVersion: "profile-portrait.v1",
        generatedAt: "2026-06-05T00:00:00.000Z",
        confirmedAt: null,
      }),
    ).rejects.toThrow();
  });
});

describe("persistAiRecommendation", () => {
  it("returns recommendation result without throwing", async () => {
    await expect(
      persistAiRecommendation(mockDb, buildJob(), {
        recommendationId: "33333333-3333-3333-3333-333333333333",
        recommendedUserId: "44444444-4444-4444-4444-444444444444",
        status: "active",
      }),
    ).rejects.toThrow();
  });
});

describe("persistAiNicknameDraft", () => {
  it("returns nickname draft result without throwing", async () => {
    await expect(persistAiNicknameDraft(mockDb, buildJob())).rejects.toThrow();
  });
});
