import { redirect } from "next/navigation";

import { sanitizeAuthNextRoute, sanitizeOnboardingNextRoute } from "@/features/auth/server/routing";
import {
  getOnboardingGate,
  isAcademicProfileRequiredError,
  requireCompletedAcademicProfile,
  type CompletedOnboardingGate,
  type OnboardingGate,
} from "@/server/auth/onboarding-gate";
import { AuthSessionError, requireVerifiedCampusUser, type CurrentUserSession } from "@/server/auth/session";

function withQuery(path: string, params: Record<string, string | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `${path}?${queryString}` : path;
}

function getAuthErrorCode(error: AuthSessionError) {
  if (error.code === "SESSION_MISSING") {
    return null;
  }

  if (error.code === "SUPABASE_ENV_MISSING") {
    return "supabase-env-missing";
  }

  if (error.code === "EMAIL_DOMAIN_NOT_ALLOWED") {
    return "campus-email-required";
  }

  if (error.code === "EMAIL_NOT_VERIFIED") {
    return "email-verification-required";
  }

  if (error.code === "EMAIL_MISSING") {
    return "auth-email-missing";
  }

  return "auth-session-unavailable";
}

export function buildAuthRequiredRedirect(nextRoute: string, errorCode: string | null = null) {
  return withQuery("/auth", {
    error: errorCode,
    next: sanitizeAuthNextRoute(nextRoute),
  });
}

export function buildOnboardingRequiredRedirect(nextRoute: string) {
  return withQuery("/onboarding", {
    next: sanitizeOnboardingNextRoute(nextRoute),
    reason: "profile-required",
  });
}

export function getProtectedRouteErrorRedirect(error: unknown, nextRoute: string) {
  if (error instanceof AuthSessionError) {
    return buildAuthRequiredRedirect(nextRoute, getAuthErrorCode(error));
  }

  if (isAcademicProfileRequiredError(error)) {
    return buildOnboardingRequiredRedirect(nextRoute);
  }

  return null;
}

export function redirectProtectedRouteError(error: unknown, nextRoute: string) {
  const redirectTo = getProtectedRouteErrorRedirect(error, nextRoute);

  if (redirectTo) {
    redirect(redirectTo);
  }
}

export async function resolveProtectedPageData<T>(nextRoute: string, resolver: () => Promise<T>) {
  try {
    return await resolver();
  } catch (error) {
    redirectProtectedRouteError(error, nextRoute);
    throw error;
  }
}

export function getActionNextRoute(input: unknown, fallback: string) {
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    const value = input.get("next");

    return sanitizeOnboardingNextRoute(typeof value === "string" ? value : null, fallback);
  }

  return sanitizeOnboardingNextRoute(fallback);
}

export async function requirePageVerifiedCampusUser(nextRoute: string): Promise<CurrentUserSession> {
  return resolveProtectedPageData(nextRoute, requireVerifiedCampusUser);
}

export async function requirePageOnboardingGate(nextRoute: string): Promise<OnboardingGate> {
  return resolveProtectedPageData(nextRoute, getOnboardingGate);
}

export async function requirePageCompletedAcademicProfile(nextRoute: string): Promise<CompletedOnboardingGate> {
  return resolveProtectedPageData(nextRoute, requireCompletedAcademicProfile);
}
