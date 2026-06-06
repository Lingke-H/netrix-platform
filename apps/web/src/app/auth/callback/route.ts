import { NextResponse, type NextRequest } from "next/server";

import { sanitizeAuthNextRoute } from "@/features/auth/server/routing";
import { AuthSessionError, createSupabaseSessionClient } from "@/server/auth/session";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextRoute = sanitizeAuthNextRoute(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(`/auth?error=missing-callback-code&next=${encodeURIComponent(nextRoute)}`, request.url));
  }

  let supabase;
  try {
    supabase = await createSupabaseSessionClient();
  } catch (error) {
    if (error instanceof AuthSessionError && error.code === "SUPABASE_ENV_MISSING") {
      return NextResponse.redirect(
        new URL(`/auth?error=supabase-env-missing&next=${encodeURIComponent(nextRoute)}`, request.url),
      );
    }

    throw error;
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/auth?error=callback-failed&next=${encodeURIComponent(nextRoute)}`, request.url));
  }

  return NextResponse.redirect(new URL(nextRoute, request.url));
}
