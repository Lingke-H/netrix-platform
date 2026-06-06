import { describe, expect, it } from "vitest";

import { resourceItemSchema } from "@/features/library/schemas";

const validResourceItem = {
  createdAt: "2026-02-01T08:00:00.000Z",
  curationStatus: "featured",
  description: "Interactive visualisations for COMP1048 React concepts.",
  id: "10000000-0000-4000-8000-000000000801",
  modules: ["COMP1048"],
  origin: "campus-resource",
  sourcePostId: null,
  tags: ["react", "visualisation"],
  title: "COMP1048 React Visualisation Toolkit",
  url: "https://react.dev/learn",
};

const promotedResourceItem = {
  ...validResourceItem,
  curationStatus: "seeded",
  id: "10000000-0000-4000-8000-000000000802",
  origin: "promoted-post",
  sourcePostId: "10000000-0000-4000-8000-000000000202",
  url: null,
};

describe("resource item schema", () => {
  it("accepts a valid campus resource item with a url", () => {
    expect(resourceItemSchema.parse(validResourceItem)).toEqual(validResourceItem);
  });

  it("accepts a valid promoted post resource item with a source post id", () => {
    expect(resourceItemSchema.parse(promotedResourceItem)).toEqual(promotedResourceItem);
  });

  it("accepts a seeded student resource item", () => {
    expect(
      resourceItemSchema.parse({
        ...validResourceItem,
        curationStatus: "seeded",
        id: "10000000-0000-4000-8000-000000000803",
        origin: "student-resource",
        url: null,
      }),
    ).toMatchObject({
      curationStatus: "seeded",
      origin: "student-resource",
      url: null,
    });
  });

  it("rejects a resource item with a title shorter than 4 characters", () => {
    expect(() =>
      resourceItemSchema.parse({
        ...validResourceItem,
        title: "ABC",
      }),
    ).toThrow();
  });

  it("rejects a resource item with a description shorter than 8 characters", () => {
    expect(() =>
      resourceItemSchema.parse({
        ...validResourceItem,
        description: "short",
      }),
    ).toThrow();
  });

  it("rejects a resource item with an invalid origin", () => {
    expect(() =>
      resourceItemSchema.parse({
        ...validResourceItem,
        origin: "external",
      }),
    ).toThrow();
  });

  it("rejects a resource item with an invalid curation status", () => {
    expect(() =>
      resourceItemSchema.parse({
        ...validResourceItem,
        curationStatus: "deleted",
      }),
    ).toThrow();
  });

  it("rejects a resource item with an invalid url format", () => {
    expect(() =>
      resourceItemSchema.parse({
        ...validResourceItem,
        url: "not-a-url",
      }),
    ).toThrow();
  });

  it("accepts a resource item with null url", () => {
    expect(resourceItemSchema.parse({ ...validResourceItem, url: null }).url).toBeNull();
  });

  it("rejects too many modules", () => {
    expect(() =>
      resourceItemSchema.parse({
        ...validResourceItem,
        modules: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9"],
      }),
    ).toThrow();
  });

  it("rejects too many tags", () => {
    expect(() =>
      resourceItemSchema.parse({
        ...validResourceItem,
        tags: ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"],
      }),
    ).toThrow();
  });
});
