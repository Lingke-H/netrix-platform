export function sanitizeAuthNextRoute(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/me";
  }

  if (value.startsWith("/auth")) {
    return "/me";
  }

  return value;
}

export function sanitizeOnboardingNextRoute(value: string | null | undefined, fallback = "/feed") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (value.startsWith("/auth") || value.startsWith("/onboarding")) {
    return fallback;
  }

  return value;
}
