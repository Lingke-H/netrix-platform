"use server";

import { revalidatePath } from "next/cache";

import {
  createCurrentUserMessage,
  getCurrentUserAcceptedMessageThreads,
} from "@/features/messages/server/service";
import { getActionNextRoute, redirectProtectedRouteError } from "@/server/auth/redirects";

export async function listAcceptedMessageThreadsAction() {
  try {
    return await getCurrentUserAcceptedMessageThreads();
  } catch (error) {
    redirectProtectedRouteError(error, "/connections");
    throw error;
  }
}

export async function createMessageAction(input: unknown) {
  let result: Awaited<ReturnType<typeof createCurrentUserMessage>>;
  const nextRoute = getActionNextRoute(input, "/connections");

  try {
    result = await createCurrentUserMessage(input);
  } catch (error) {
    redirectProtectedRouteError(error, nextRoute);
    throw error;
  }

  revalidatePath(`/messages/${result.threadId}`);

  return result;
}
