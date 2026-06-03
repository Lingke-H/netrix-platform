"use server";

import { revalidatePath } from "next/cache";

import { upsertCurrentUserAcademicProfile } from "@/features/profile/server/service";

export async function upsertAcademicProfileAction(input: unknown) {
  const result = await upsertCurrentUserAcademicProfile(input);

  revalidatePath("/onboarding");
  revalidatePath("/me");
  revalidatePath("/feed");

  return result;
}
