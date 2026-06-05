import { describe, expect, it } from "vitest";

import { buildNicknameSuggestions } from "./nickname";

describe("buildNicknameSuggestions", () => {
  it("validates and returns nickname suggestions", () => {
    const result = buildNicknameSuggestions({
      explanationOutput: {
        suggestions: [
          {
            nickname: "Nova",
            rationale: "短、清晰，适合学术场景。",
          },
        ],
      },
    });

    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]?.nickname).toBe("Nova");
  });
});
