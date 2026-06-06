import { describe, expect, it } from "vitest";

import { getAiPromptBundle, buildAiPipelineJob } from "./pipeline";

describe("getAiPromptBundle", () => {
  it("returns prompt version and instructions for nickname", () => {
    const bundle = getAiPromptBundle("nickname");

    expect(bundle.kind).toBe("nickname");
    expect(bundle.promptVersion).toBe("nickname.v1");
    expect(bundle.instructions).toContain("JSON only");
  });
});

describe("buildAiPipelineJob", () => {
  it("builds a job summary for recommendation explanation", () => {
    const job = buildAiPipelineJob({
      kind: "recommendation-explanation",
      userId: "11111111-1111-1111-1111-111111111111",
      inputSummary: "shared module overlap",
      output: {
        explanationSummary: "Shared modules and complementary collaboration style.",
        sharedSignals: ["共同课程模块: CS1010"],
        complementarySignals: ["跨年级互补"],
        conversationStarter: "Want to discuss your next assignment?",
      },
    });

    expect(job.type).toBe("recommendation-explanation");
    expect(job.promptVersion).toBe("recommendation-explanation.v1");
    expect(job.outputSummary).toContain("Shared modules");
  });
});
