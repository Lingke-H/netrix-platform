"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCurrentUserPost } from "@/features/posts/server/service";
import { isAcademicProfileRequiredError } from "@/server/auth/onboarding-gate";

export async function createPostAction(input: unknown) {
  let result: Awaited<ReturnType<typeof createCurrentUserPost>>;

  try {
    result = await createCurrentUserPost(input);
  } catch (error) {
    if (isAcademicProfileRequiredError(error)) {
      redirect("/onboarding?reason=profile-required");
    }

    throw error;
  }

  revalidatePath("/feed");
  revalidatePath("/posts/new");

  redirect(result.nextRoute);
}
