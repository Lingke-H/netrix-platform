"use server";

import { revalidatePath } from "next/cache";

import {
  confirmCurrentUserPortrait,
  dismissCurrentUserPortrait,
} from "@/server/ai/portrait-service";
import { redirectProtectedRouteError } from "@/server/auth/redirects";

export async function confirmPortraitAction() {
  try {
    await confirmCurrentUserPortrait();
  } catch (error) {
    redirectProtectedRouteError(error, "/me");
    throw error;
  }

  revalidatePath("/me");
}

export async function dismissPortraitAction() {
  try {
    await dismissCurrentUserPortrait();
  } catch (error) {
    redirectProtectedRouteError(error, "/me");
    throw error;
  }

  revalidatePath("/me");
}
