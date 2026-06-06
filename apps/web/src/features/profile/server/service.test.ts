import { describe, expect, it } from "vitest";

import {
  type AcademicProfileUpsertInput,
  AcademicProfileUpsertError,
  buildAcademicProfileDto,
  buildProfileRouteState,
  buildPublicAcademicProfileDto,
  canViewPublicAcademicProfile,
  normalizeAcademicProfileFormData,
  parseAcademicProfileUpsertInput,
  splitAcademicProfileFormList,
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
  it("normalizes comma-separated profile form lists", () => {
    expect(splitAcademicProfileFormList(" ELEC2043, COMP1048,, signals ")).toEqual([
      "ELEC2043",
      "COMP1048",
      "signals",
    ]);
  });

  it("normalizes profile FormData into upsert input", () => {
    const formData = new FormData();

    formData.set("collaborationPreference", "pair study, project teammate");
    formData.set("helpNeeded", "signals");
    formData.set("helpOffered", "typescript");
    formData.set("interests", "web apps");
    formData.set("major", "computer-science");
    formData.set("modules", "COMP1048, ELEC2043");
    formData.set("nickname", "TypeScript Builder");
    formData.set("skills", "react");
    formData.set("visibility", "campus");
    formData.set("year", "year-2");

    expect(normalizeAcademicProfileFormData(formData)).toEqual({
      ...validInput,
      collaborationPreference: ["pair study", "project teammate"],
      modules: ["COMP1048", "ELEC2043"],
    });
  });

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

  it("accepts FormData and forces the current user completion status", () => {
    const formData = new FormData();

    Object.entries(validInput).forEach(([key, value]) => {
      formData.set(key, Array.isArray(value) ? value.join(", ") : value);
    });

    expect(parseAcademicProfileUpsertInput(formData, userId)).toEqual({
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

    expect(buildProfileRouteState(profile, null, gate)).toMatchObject({
      completionStatus: "basic_complete",
      portrait: null,
      profile,
      visibility: "campus",
    });
    expect(buildProfileRouteState(null, null, needsOnboardingGate)).toMatchObject({
      completionStatus: "incomplete",
      portrait: null,
      profile: null,
      visibility: "campus",
    });
  });

  it("builds public academic profile DTOs and gates private profiles by viewer", () => {
    const campusProfile = buildPublicAcademicProfileDto(profileRow);
    const privateProfile = buildPublicAcademicProfileDto({
      ...profileRow,
      visibility: "private",
    });

    expect(campusProfile).toEqual({
      collaborationPreference: validInput.collaborationPreference,
      completionStatus: "basic_complete",
      interests: validInput.interests,
      major: validInput.major,
      modules: validInput.modules,
      nickname: validInput.nickname,
      updatedAt: "2026-01-02T04:05:06.000Z",
      userId,
      visibility: "campus",
      year: validInput.year,
    });
    expect(canViewPublicAcademicProfile(campusProfile, "44444444-4444-4444-8444-444444444444")).toBe(true);
    expect(canViewPublicAcademicProfile(privateProfile, "44444444-4444-4444-8444-444444444444")).toBe(false);
    expect(canViewPublicAcademicProfile(privateProfile, userId)).toBe(true);
  });
});
