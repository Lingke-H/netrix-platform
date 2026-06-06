import { describe, expect, it } from "vitest";

import { buildAiExecutionError, createAiExecutionRequest } from "./executor";

describe("createAiExecutionRequest", () => {
  it("builds a prompt-bound execution request", () => {
    const request = createAiExecutionRequest({
      kind: "nickname",
      userId: "11111111-1111-1111-1111-111111111111",
      inputSummary: "A CS student looking for a concise academic nickname.",
      userPrompt: "Suggest academic nicknames.",
    });

    expect(request.kind).toBe("nickname");
    expect(request.promptVersion).toBe("nickname.v1");
    expect(request.systemPrompt).toContain("Nickname suggestion assistant");
  });
});

describe("buildAiExecutionError", () => {
  it("includes model assignment metadata in errors", () => {
    const error = buildAiExecutionError("profile-portrait", "boom");

    expect(error.message).toBe("boom");
    expect(error.model).toContain("DeepSeek");
  });
});
