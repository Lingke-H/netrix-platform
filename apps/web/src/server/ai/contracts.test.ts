import { describe, expect, it } from "vitest";

import { parseRecommendationExplanationOutput } from "./contracts";

describe("parseRecommendationExplanationOutput", () => {
  it("validates structured recommendation explanation output", () => {
    const output = parseRecommendationExplanationOutput({
      explanationSummary: "You share module overlap and complementary collaboration needs.",
      sharedSignals: ["共同课程模块: CS1010"],
      complementarySignals: ["跨年级互补"],
      conversationStarter: "You both seem to be working on similar problem sets.",
    });

    expect(output.explanationSummary).toContain("module overlap");
  });
});
