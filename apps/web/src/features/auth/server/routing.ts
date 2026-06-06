export function sanitizeAuthNextRoute(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/me";
  }

  if (value.startsWith("/auth")) {
    return "/me";
  }

  return value;
}
