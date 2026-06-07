import { describe, expect, it } from "vitest";

import { buildAiPipelineJob, getAiPromptBundle } from "./pipeline";

describe("getAiPromptBundle", () => {
  it("returns prompt instructions for recommendation explanation", () => {
    const bundle = getAiPromptBundle("recommendation-explanation");

    expect(bundle.promptVersion).toBe("recommendation-explanation.v1");
    expect(bundle.instructions).toContain("UNNC");
  });
});

describe("buildAiPipelineJob", () => {
  it("creates a running job skeleton", () => {
    const job = buildAiPipelineJob({
      kind: "nickname",
      userId: "11111111-1111-1111-1111-111111111111",
      inputSummary: "Need a nickname",
      output: { suggestions: [{ nickname: "Nova", rationale: "Short" }] },
    });

    expect(job.type).toBe("nickname");
    expect(job.promptVersion).toBe("nickname.v1");
    expect(job.status).toBe("running");
  });
});
