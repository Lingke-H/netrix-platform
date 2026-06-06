"use server";

import { revalidatePath } from "next/cache";

import { persistCurrentUserRecommendationDryRunDrafts } from "@/features/recommendations/server/service";
import { redirectProtectedRouteError } from "@/server/auth/redirects";

export async function persistRecommendationDryRunDraftsAction() {
  let result: Awaited<ReturnType<typeof persistCurrentUserRecommendationDryRunDrafts>>;

  try {
    result = await persistCurrentUserRecommendationDryRunDrafts();
  } catch (error) {
    redirectProtectedRouteError(error, "/recommendations");
    throw error;
  }

  revalidatePath("/recommendations");
  revalidatePath("/connections");

  return result;
}
