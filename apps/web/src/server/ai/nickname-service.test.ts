import { describe, expect, it } from "vitest";

import { NicknameUpdateError } from "@/server/ai/nickname-service";

describe("NicknameUpdateError", () => {
  it("has the correct name and code", () => {
    const error = new NicknameUpdateError("too short", "NICKNAME_INVALID");

    expect(error.name).toBe("NicknameUpdateError");
    expect(error.code).toBe("NICKNAME_INVALID");
    expect(error.message).toBe("too short");
  });
});
