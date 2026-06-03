import { describe, expect, it } from "vitest";

import {
  buildCampusFeedData,
  buildCampusFeedItem,
  CreatePostError,
  getCampusFeedPageSize,
  parseCreatePostInput,
} from "@/features/posts/server/service";

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

describe("campus feed service", () => {
  const feedRow = {
    author: {
      major: "computer-science",
      nickname: "TypeScript Builder",
      userId: "11111111-1111-4111-8111-111111111111",
      year: "year-2",
    },
    body: validInput.body,
    createdAt: new Date("2026-01-02T03:04:05.000Z"),
    id: "22222222-2222-4222-8222-222222222222",
    modules: validInput.modules,
    status: "published",
    tags: validInput.tags,
    title: validInput.title,
    type: "question",
    updatedAt: new Date("2026-01-02T04:05:06.000Z"),
    visibility: "campus",
  } as const;

  it("builds feed DTOs with author academic profile summaries", () => {
    expect(buildCampusFeedItem(feedRow)).toEqual({
      author: feedRow.author,
      body: feedRow.body,
      createdAt: "2026-01-02T03:04:05.000Z",
      id: feedRow.id,
      modules: feedRow.modules,
      replyCount: 0,
      savedCount: 0,
      status: "published",
      tags: feedRow.tags,
      title: feedRow.title,
      type: "question",
      updatedAt: "2026-01-02T04:05:06.000Z",
      visibility: "campus",
    });
  });

  it("clamps feed page size and reports whether another page exists", () => {
    expect(getCampusFeedPageSize(0)).toBe(1);
    expect(getCampusFeedPageSize(100)).toBe(50);

    expect(buildCampusFeedData([feedRow, feedRow], 1)).toMatchObject({
      hasNextPage: true,
      items: [expect.objectContaining({ id: feedRow.id })],
    });
  });
});
