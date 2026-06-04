"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { upsertCurrentUserAcademicProfile } from "@/features/profile/server/service";

export async function upsertAcademicProfileAction(input: unknown) {
  const result = await upsertCurrentUserAcademicProfile(input);

  revalidatePath("/onboarding");
  revalidatePath("/me");
  revalidatePath("/feed");

  redirect(result.nextRoute);
}
