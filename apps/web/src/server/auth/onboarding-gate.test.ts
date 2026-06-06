import { describe, expect, it } from "vitest";

import {
  buildOnboardingGate,
  isAcademicProfileRequiredError,
  isAcademicProfileComplete,
  OnboardingGateError,
  type AcademicProfileGateSummary,
} from "@/server/auth/onboarding-gate";
import type { CurrentUserSession } from "@/server/auth/session";

const session = {
  authUserId: "00000000-0000-0000-0000-000000000001",
  email: "student@nottingham.edu.cn",
  emailDomain: "nottingham.edu.cn",
  emailVerified: true,
  role: "student",
  userId: "00000000-0000-0000-0000-000000000002",
  verifiedAt: "2026-01-02T03:04:05.000Z",
} satisfies CurrentUserSession;

function profile(completionStatus: AcademicProfileGateSummary["completionStatus"]) {
  return {
    completionStatus,
    id: "00000000-0000-0000-0000-000000000003",
  } satisfies AcademicProfileGateSummary;
}

describe("onboarding gate", () => {
  it("treats missing or incomplete profiles as onboarding-required", () => {
    expect(buildOnboardingGate(session, null)).toMatchObject({
      canCreatePost: false,
      canViewOwnProfile: false,
      nextRoute: "/onboarding",
      profile: null,
      state: "needs_onboarding",
    });

    expect(buildOnboardingGate(session, profile("incomplete"))).toMatchObject({
      canCreatePost: false,
      canViewOwnProfile: false,
      nextRoute: "/onboarding",
      state: "needs_onboarding",
    });
  });

  it("treats basic-complete and recommendation-ready profiles as profile-ready", () => {
    expect(isAcademicProfileComplete("basic_complete")).toBe(true);
    expect(isAcademicProfileComplete("recommendation_ready")).toBe(true);

    expect(buildOnboardingGate(session, profile("basic_complete"))).toMatchObject({
      canCreatePost: true,
      canViewOwnProfile: true,
      nextRoute: "/feed",
      state: "profile_ready",
    });
  });

  it("identifies academic-profile-required gate errors", () => {
    expect(
      isAcademicProfileRequiredError(
        new OnboardingGateError("A completed profile is required.", "ACADEMIC_PROFILE_REQUIRED"),
      ),
    ).toBe(true);
    expect(isAcademicProfileRequiredError(new Error("Different error"))).toBe(false);
  });
});
