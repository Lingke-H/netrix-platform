import { describe, expect, it } from "vitest";

import { buildProfilePortrait } from "./profile-portrait";

describe("buildProfilePortrait", () => {
  it("validates and returns profile portrait output", () => {
    const result = buildProfilePortrait({
      userId: "11111111-1111-1111-1111-111111111111",
      promptVersion: "profile-portrait.v1",
      explanationOutput: {
        summary: "A focused CS student with strong interest in ML.",
        currentFocus: ["machine learning", "algorithms"],
        collaborationStyle: "Prefers direct, practical collaboration.",
        strengths: ["problem solving", "pair programming"],
        suggestedTopics: ["project planning", "study groups"],
      },
    });

    expect(result.userId).toBe("11111111-1111-1111-1111-111111111111");
    expect(result.status).toBe("generated");
    expect(result.summary).toContain("CS student");
  });
});
