"use server";

import { revalidatePath } from "next/cache";

import {
  createCurrentUserMessage,
  getCurrentUserAcceptedMessageThreads,
} from "@/features/messages/server/service";

export async function listAcceptedMessageThreadsAction() {
  return getCurrentUserAcceptedMessageThreads();
}

export async function createMessageAction(input: unknown) {
  const result = await createCurrentUserMessage(input);

  revalidatePath(`/messages/${result.threadId}`);

  return result;
}
