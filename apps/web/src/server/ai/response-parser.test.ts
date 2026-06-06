import { describe, expect, it } from "vitest";

import { parseAiResponse } from "./response-parser";

describe("parseAiResponse", () => {
  it("parses nickname output", () => {
    const result = parseAiResponse(
      "nickname",
      JSON.stringify({
        suggestions: [{ nickname: "Nova", rationale: "Short and academic." }],
      }),
    );

    expect(result.suggestions[0]?.nickname).toBe("Nova");
  });
});
