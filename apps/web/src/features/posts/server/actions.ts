"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCurrentUserPost } from "@/features/posts/server/service";
import { getActionNextRoute, redirectProtectedRouteError } from "@/server/auth/redirects";

export async function createPostAction(input: unknown) {
  let result: Awaited<ReturnType<typeof createCurrentUserPost>>;
  const nextRoute = getActionNextRoute(input, "/posts/new");

  try {
    result = await createCurrentUserPost(input);
  } catch (error) {
    redirectProtectedRouteError(error, nextRoute);
    throw error;
  }

  revalidatePath("/feed");
  revalidatePath("/posts/new");

  redirect(result.nextRoute);
}
