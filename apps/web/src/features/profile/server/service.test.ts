import { describe, expect, it } from "vitest";

import {
  type AcademicProfileUpsertInput,
  AcademicProfileUpsertError,
  buildAcademicProfileDto,
  buildProfileRouteState,
  parseAcademicProfileUpsertInput,
} from "@/features/profile/server/service";
import type { OnboardingGate } from "@/server/auth/onboarding-gate";

const userId = "11111111-1111-4111-8111-111111111111";

const validInput = {
  collaborationPreference: ["pair study"],
  helpNeeded: ["signals"],
  helpOffered: ["typescript"],
  interests: ["web apps"],
  major: "computer-science",
  modules: ["COMP1048"],
  nickname: "TypeScript Builder",
  skills: ["react"],
  visibility: "campus",
  year: "year-2",
} satisfies AcademicProfileUpsertInput;

describe("academic profile upsert service", () => {
  it("builds trusted profile input and forces the current user completion status", () => {
    expect(
      parseAcademicProfileUpsertInput(
        {
          ...validInput,
          completionStatus: "recommendation_ready",
          userId: "99999999-9999-4999-8999-999999999999",
        },
        userId,
      ),
    ).toEqual({
      ...validInput,
      completionStatus: "basic_complete",
      userId,
    });
  });

  it("rejects invalid profile form input", () => {
    expect(() =>
      parseAcademicProfileUpsertInput(
        {
          ...validInput,
          nickname: "x",
        },
        userId,
      ),
    ).toThrow(AcademicProfileUpsertError);
  });
});

describe("academic profile read service", () => {
  const profileRow = {
    ...validInput,
    completionStatus: "basic_complete",
    createdAt: new Date("2026-01-02T03:04:05.000Z"),
    updatedAt: new Date("2026-01-02T04:05:06.000Z"),
    userId,
  } as const;

  const gate = {
    canCreatePost: true,
    canViewOwnProfile: true,
    nextRoute: "/feed",
    profile: {
      completionStatus: "basic_complete",
      id: "22222222-2222-4222-8222-222222222222",
    },
    session: {
      authUserId: "33333333-3333-4333-8333-333333333333",
      email: "student@nottingham.edu.cn",
      emailDomain: "nottingham.edu.cn",
      emailVerified: true,
      role: "student",
      userId,
      verifiedAt: "2026-01-02T03:04:05.000Z",
    },
    state: "profile_ready",
  } satisfies OnboardingGate;

  const needsOnboardingGate = {
    canCreatePost: false,
    canViewOwnProfile: false,
    nextRoute: "/onboarding",
    profile: null,
    session: gate.session,
    state: "needs_onboarding",
  } satisfies OnboardingGate;

  it("builds academic profile DTOs from database rows", () => {
    expect(buildAcademicProfileDto(profileRow)).toEqual({
      ...validInput,
      completionStatus: "basic_complete",
      createdAt: "2026-01-02T03:04:05.000Z",
      updatedAt: "2026-01-02T04:05:06.000Z",
      userId,
    });
  });

  it("builds route state from profile and onboarding gate status", () => {
    const profile = buildAcademicProfileDto(profileRow);

    expect(buildProfileRouteState(profile, gate)).toMatchObject({
      completionStatus: "basic_complete",
      portrait: null,
      profile,
      visibility: "campus",
    });
    expect(buildProfileRouteState(null, needsOnboardingGate)).toMatchObject({
      completionStatus: "incomplete",
      portrait: null,
      profile: null,
      visibility: "campus",
    });
  });
});
