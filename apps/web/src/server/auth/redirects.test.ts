import { describe, expect, it } from "vitest";

import {
  buildAuthRequiredRedirect,
  buildOnboardingRequiredRedirect,
  getActionNextRoute,
  getProtectedRouteErrorRedirect,
} from "@/server/auth/redirects";
import { OnboardingGateError } from "@/server/auth/onboarding-gate";
import { AuthSessionError } from "@/server/auth/session";

describe("protected route redirects", () => {
  it("builds auth redirects with sanitized next routes", () => {
    expect(buildAuthRequiredRedirect("/feed")).toBe("/auth?next=%2Ffeed");
    expect(buildAuthRequiredRedirect("/recommendations", "email-verification-required")).toBe(
      "/auth?error=email-verification-required&next=%2Frecommendations",
    );
    expect(buildAuthRequiredRedirect("https://example.com")).toBe("/auth?next=%2Fme");
  });

  it("builds onboarding redirects with sanitized next routes", () => {
    expect(buildOnboardingRequiredRedirect("/posts/new")).toBe(
      "/onboarding?next=%2Fposts%2Fnew&reason=profile-required",
    );
    expect(buildOnboardingRequiredRedirect("/onboarding?next=/posts/new")).toBe(
      "/onboarding?next=%2Ffeed&reason=profile-required",
    );
  });

  it("maps known auth and onboarding errors to route redirects", () => {
    expect(
      getProtectedRouteErrorRedirect(new AuthSessionError("Missing session.", "SESSION_MISSING"), "/connections"),
    ).toBe("/auth?next=%2Fconnections");
    expect(
      getProtectedRouteErrorRedirect(
        new AuthSessionError("Verification required.", "EMAIL_NOT_VERIFIED"),
        "/recommendations",
      ),
    ).toBe("/auth?error=email-verification-required&next=%2Frecommendations");
    expect(
      getProtectedRouteErrorRedirect(
        new OnboardingGateError("Profile required.", "ACADEMIC_PROFILE_REQUIRED"),
        "/messages/11111111-1111-4111-8111-111111111111",
      ),
    ).toBe(
      "/onboarding?next=%2Fmessages%2F11111111-1111-4111-8111-111111111111&reason=profile-required",
    );
    expect(getProtectedRouteErrorRedirect(new Error("Database failed."), "/feed")).toBeNull();
  });

  it("reads safe action next routes from form data", () => {
    const formData = new FormData();
    formData.set("next", "/recommendations");

    expect(getActionNextRoute(formData, "/feed")).toBe("/recommendations");

    formData.set("next", "/onboarding?next=/recommendations");
    expect(getActionNextRoute(formData, "/feed")).toBe("/feed");
  });
});
