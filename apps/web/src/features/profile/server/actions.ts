"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { upsertCurrentUserAcademicProfile } from "@/features/profile/server/service";
import { getActionNextRoute, redirectProtectedRouteError } from "@/server/auth/redirects";

export async function upsertAcademicProfileAction(input: unknown) {
  const nextRoute = getActionNextRoute(input, "/feed");
  let result: Awaited<ReturnType<typeof upsertCurrentUserAcademicProfile>>;

  try {
    result = await upsertCurrentUserAcademicProfile(input);
  } catch (error) {
    redirectProtectedRouteError(error, "/onboarding");
    throw error;
  }

  revalidatePath("/onboarding");
  revalidatePath("/me");
  revalidatePath("/feed");

  redirect(nextRoute || result.nextRoute);
}
