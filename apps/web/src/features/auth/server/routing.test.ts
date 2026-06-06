import { describe, expect, it } from "vitest";

import { sanitizeAuthNextRoute, sanitizeOnboardingNextRoute } from "@/features/auth/server/routing";

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

describe("onboarding routing helpers", () => {
  it("keeps safe post-profile next routes", () => {
    expect(sanitizeOnboardingNextRoute("/posts/new")).toBe("/posts/new");
    expect(sanitizeOnboardingNextRoute("/recommendations?from=onboarding")).toBe("/recommendations?from=onboarding");
  });

  it("falls back for empty, external, auth-looping, or onboarding-looping next routes", () => {
    expect(sanitizeOnboardingNextRoute(null)).toBe("/feed");
    expect(sanitizeOnboardingNextRoute("https://example.com")).toBe("/feed");
    expect(sanitizeOnboardingNextRoute("//example.com")).toBe("/feed");
    expect(sanitizeOnboardingNextRoute("/auth?next=/feed")).toBe("/feed");
    expect(sanitizeOnboardingNextRoute("/onboarding?next=/feed")).toBe("/feed");
    expect(sanitizeOnboardingNextRoute(null, "/me")).toBe("/me");
  });
});
