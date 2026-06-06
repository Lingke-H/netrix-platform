"use server";

import { revalidatePath } from "next/cache";

import { persistCurrentUserRecommendationDryRunDrafts } from "@/features/recommendations/server/service";

export async function persistRecommendationDryRunDraftsAction() {
  const result = await persistCurrentUserRecommendationDryRunDrafts();

  revalidatePath("/recommendations");
  revalidatePath("/connections");

  return result;
}
