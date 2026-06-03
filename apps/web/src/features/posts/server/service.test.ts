import { describe, expect, it } from "vitest";

import { CreatePostError, parseCreatePostInput } from "@/features/posts/server/service";

const validInput = {
  body: "This is a concrete academic question about COMP1048 debugging patterns.",
  modules: ["COMP1048"],
  status: "published",
  tags: ["typescript"],
  title: "How should I debug this TypeScript issue?",
  type: "question",
  visibility: "campus",
};

describe("post create service", () => {
  it("accepts valid question, resource, and experience post types", () => {
    expect(parseCreatePostInput(validInput)).toEqual(validInput);
    expect(parseCreatePostInput({ ...validInput, type: "resource" })).toMatchObject({
      type: "resource",
    });
    expect(parseCreatePostInput({ ...validInput, type: "experience" })).toMatchObject({
      type: "experience",
    });
  });

  it("rejects invalid post input", () => {
    expect(() =>
      parseCreatePostInput({
        ...validInput,
        body: "too short",
      }),
    ).toThrow(CreatePostError);

    expect(() =>
      parseCreatePostInput({
        ...validInput,
        type: "announcement",
      }),
    ).toThrow(CreatePostError);
  });
});
