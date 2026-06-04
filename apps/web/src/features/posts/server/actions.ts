"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCurrentUserPost } from "@/features/posts/server/service";

export async function createPostAction(input: unknown) {
  const result = await createCurrentUserPost(input);

  revalidatePath("/feed");
  revalidatePath("/posts/new");

  redirect(result.nextRoute);
}
