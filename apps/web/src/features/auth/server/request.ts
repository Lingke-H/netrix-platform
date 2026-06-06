import { campusEmailSchema } from "@/features/auth/schemas";
import { sanitizeAuthNextRoute } from "@/features/auth/server/routing";
import { getServerEnv } from "@/lib/env";

function getFormText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export function buildAuthRedirectUrl(nextRoute: string) {
  const { APP_BASE_URL } = getServerEnv();
  const baseUrl = APP_BASE_URL ?? "http://127.0.0.1:3000";
  const callbackUrl = new URL("/auth/callback", baseUrl);

  callbackUrl.searchParams.set("next", sanitizeAuthNextRoute(nextRoute));

  return callbackUrl.toString();
}

export function parseAuthEmailRequestFormData(formData: FormData) {
  const email = getFormText(formData, "email").toLowerCase();
  const nextRoute = sanitizeAuthNextRoute(getFormText(formData, "next"));

  return {
    email: campusEmailSchema.safeParse(email),
    nextRoute,
  };
}
