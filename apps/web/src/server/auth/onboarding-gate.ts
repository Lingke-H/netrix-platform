import { eq } from "drizzle-orm";

import type { ProfileCompletionStatus } from "@/features/profile/schemas";
import { requireVerifiedCampusUser, type CurrentUserSession } from "@/server/auth/session";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles } from "@/server/db/schema";

export type OnboardingGateState = "needs_onboarding" | "profile_ready";

export type AcademicProfileGateSummary = {
  id: string;
  completionStatus: ProfileCompletionStatus;
};

export type NeedsOnboardingGate = {
  session: CurrentUserSession;
  state: "needs_onboarding";
  profile: AcademicProfileGateSummary | null;
  nextRoute: "/onboarding";
  canCreatePost: false;
  canViewOwnProfile: false;
};

export type CompletedOnboardingGate = {
  session: CurrentUserSession;
  state: "profile_ready";
  profile: AcademicProfileGateSummary;
  nextRoute: "/feed";
  canCreatePost: true;
  canViewOwnProfile: true;
};

export type OnboardingGate = NeedsOnboardingGate | CompletedOnboardingGate;

export class OnboardingGateError extends Error {
  constructor(
    message: string,
    public readonly code: "ACADEMIC_PROFILE_REQUIRED",
  ) {
    super(message);
    this.name = "OnboardingGateError";
  }
}

export function isAcademicProfileRequiredError(error: unknown) {
  return error instanceof OnboardingGateError && error.code === "ACADEMIC_PROFILE_REQUIRED";
}

export function isAcademicProfileComplete(completionStatus: ProfileCompletionStatus) {
  return completionStatus === "basic_complete" || completionStatus === "recommendation_ready";
}

export function buildOnboardingGate(
  session: CurrentUserSession,
  profile: AcademicProfileGateSummary | null,
): OnboardingGate {
  if (!profile || !isAcademicProfileComplete(profile.completionStatus)) {
    return {
      canCreatePost: false,
      canViewOwnProfile: false,
      nextRoute: "/onboarding",
      profile,
      session,
      state: "needs_onboarding",
    };
  }

  return {
    canCreatePost: true,
    canViewOwnProfile: true,
    nextRoute: "/feed",
    profile,
    session,
    state: "profile_ready",
  };
}

async function getAcademicProfileGateSummary(db: DbClient, userId: string) {
  const [profile] = await db
    .select({
      completionStatus: academicProfiles.completionStatus,
      id: academicProfiles.id,
    })
    .from(academicProfiles)
    .where(eq(academicProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function getOnboardingGate(): Promise<OnboardingGate> {
  const session = await requireVerifiedCampusUser();
  const db = createDb();
  const profile = await getAcademicProfileGateSummary(db, session.userId);

  return buildOnboardingGate(session, profile);
}

export async function requireCompletedAcademicProfile(): Promise<CompletedOnboardingGate> {
  const gate = await getOnboardingGate();

  if (gate.state !== "profile_ready") {
    throw new OnboardingGateError(
      "A completed academic profile is required before accessing this action.",
      "ACADEMIC_PROFILE_REQUIRED",
    );
  }

  return gate;
}
