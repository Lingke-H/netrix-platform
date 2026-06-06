import { describe, expect, it } from "vitest";

import { AcademicPortraitError } from "@/server/ai/portrait-service";
import { academicPortraitSchema } from "@/features/profile/schemas";

describe("AcademicPortraitError", () => {
  it("has the correct name and code", () => {
    const error = new AcademicPortraitError("portrait not found", "PORTRAIT_NOT_FOUND");

    expect(error.name).toBe("AcademicPortraitError");
    expect(error.code).toBe("PORTRAIT_NOT_FOUND");
  });
});

describe("academic portrait schema", () => {
  const validPortrait = {
    collaborationDraft: "Likes pair programming and whiteboard sessions.",
    confirmedAt: null,
    generatedAt: "2026-02-01T08:00:00.000Z",
    id: "11111111-1111-4111-8111-111111111111",
    promptVersion: "profile-portrait.v1",
    sourceSnapshot: {},
    status: "draft",
    strengthsDraft: ["React", "TypeScript"],
    suggestedTags: ["frontend", "debugging"],
    summary: "A CS student focused on React and TypeScript.",
    userId: "22222222-2222-4222-8222-222222222222",
  };

  it("accepts a valid draft portrait", () => {
    expect(academicPortraitSchema.parse(validPortrait)).toEqual(validPortrait);
  });

  it("accepts a confirmed portrait", () => {
    expect(
      academicPortraitSchema.parse({
        ...validPortrait,
        confirmedAt: "2026-02-02T08:00:00.000Z",
        status: "confirmed",
      }),
    ).toMatchObject({ status: "confirmed" });
  });

  it("rejects a portrait with empty strengths", () => {
    expect(() =>
      academicPortraitSchema.parse({
        ...validPortrait,
        strengthsDraft: ["", "React"],
      }),
    ).toThrow();
  });

  it("rejects too many suggested tags", () => {
    expect(() =>
      academicPortraitSchema.parse({
        ...validPortrait,
        suggestedTags: ["t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      }),
    ).toThrow();
  });
});
