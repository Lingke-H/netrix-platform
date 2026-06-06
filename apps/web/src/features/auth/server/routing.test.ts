import { describe, expect, it } from "vitest";

import { sanitizeAuthNextRoute } from "@/features/auth/server/routing";

describe("auth routing helpers", () => {
  it("keeps safe app-local next routes", () => {
    expect(sanitizeAuthNextRoute("/feed")).toBe("/feed");
    expect(sanitizeAuthNextRoute("/recommendations?from=auth")).toBe("/recommendations?from=auth");
  });

  it("falls back for empty, external, protocol-relative, or auth-looping next routes", () => {
    expect(sanitizeAuthNextRoute(null)).toBe("/me");
    expect(sanitizeAuthNextRoute("https://example.com")).toBe("/me");
    expect(sanitizeAuthNextRoute("//example.com")).toBe("/me");
    expect(sanitizeAuthNextRoute("/auth")).toBe("/me");
    expect(sanitizeAuthNextRoute("/auth?next=/feed")).toBe("/me");
  });
});
