import { describe, expect, it } from "vitest";

import { parseAiResponse } from "./response-parser";

describe("parseAiResponse", () => {
  it("parses recommendation explanation output", () => {
    const result = parseAiResponse(
      "recommendation-explanation",
      JSON.stringify({
        explanationSummary: "You share a module and a collaboration style.",
        sharedSignals: ["共同课程模块: CS1010"],
        complementarySignals: ["跨年级互补"],
        conversationStarter: "You could discuss coursework together.",
      }),
    );

    expect(result.explanationSummary).toContain("module");
  });
});
