"use server";

import { redirect } from "next/navigation";

import { buildAuthRedirectUrl, parseAuthEmailRequestFormData } from "@/features/auth/server/request";
import { AuthSessionError, createSupabaseSessionClient } from "@/server/auth/session";

export async function requestEmailSignInAction(formData: FormData) {
  const parsedInput = parseAuthEmailRequestFormData(formData);

  if (!parsedInput.email.success) {
    redirect(`/auth?error=campus-email-required&next=${encodeURIComponent(parsedInput.nextRoute)}`);
  }

  let supabase;
  try {
    supabase = await createSupabaseSessionClient();
  } catch (error) {
    if (error instanceof AuthSessionError && error.code === "SUPABASE_ENV_MISSING") {
      redirect(`/auth?error=supabase-env-missing&next=${encodeURIComponent(parsedInput.nextRoute)}`);
    }

    throw error;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsedInput.email.data,
    options: {
      emailRedirectTo: buildAuthRedirectUrl(parsedInput.nextRoute),
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/auth?error=email-link-failed&next=${encodeURIComponent(parsedInput.nextRoute)}`);
  }

  redirect(`/auth?state=email-sent&email=${encodeURIComponent(parsedInput.email.data)}&next=${encodeURIComponent(parsedInput.nextRoute)}`);
}

export async function signOutAction() {
  let supabase;
  try {
    supabase = await createSupabaseSessionClient();
  } catch (error) {
    if (error instanceof AuthSessionError && error.code === "SUPABASE_ENV_MISSING") {
      redirect("/auth?error=supabase-env-missing");
    }

    throw error;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/auth?error=sign-out-failed");
  }

  redirect("/auth?signed_out=1");
}
