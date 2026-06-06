"use server";

import { revalidatePath } from "next/cache";

import {
  createCurrentUserConnectionRequest,
  respondToCurrentUserConnectionRequest,
} from "@/features/connections/server/service";
import { getActionNextRoute, redirectProtectedRouteError } from "@/server/auth/redirects";

export async function createConnectionRequestAction(input: unknown) {
  let result: Awaited<ReturnType<typeof createCurrentUserConnectionRequest>>;
  const nextRoute = getActionNextRoute(input, "/recommendations");

  try {
    result = await createCurrentUserConnectionRequest(input);
  } catch (error) {
    redirectProtectedRouteError(error, nextRoute);
    throw error;
  }

  revalidatePath("/recommendations");
  revalidatePath("/connections");

  return result;
}

export async function respondToConnectionRequestAction(input: unknown) {
  let result: Awaited<ReturnType<typeof respondToCurrentUserConnectionRequest>>;
  const nextRoute = getActionNextRoute(input, "/connections");

  try {
    result = await respondToCurrentUserConnectionRequest(input);
  } catch (error) {
    redirectProtectedRouteError(error, nextRoute);
    throw error;
  }

  revalidatePath("/connections");
  revalidatePath("/messages/[threadId]", "page");

  return result;
}
