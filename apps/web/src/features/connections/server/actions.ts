"use server";

import { revalidatePath } from "next/cache";

import {
  createCurrentUserConnectionRequest,
  respondToCurrentUserConnectionRequest,
} from "@/features/connections/server/service";

export async function createConnectionRequestAction(input: unknown) {
  const result = await createCurrentUserConnectionRequest(input);

  revalidatePath("/recommendations");
  revalidatePath("/connections");

  return result;
}

export async function respondToConnectionRequestAction(input: unknown) {
  const result = await respondToCurrentUserConnectionRequest(input);

  revalidatePath("/connections");
  revalidatePath("/messages/[threadId]", "page");

  return result;
}
