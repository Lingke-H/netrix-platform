"use server";

import { revalidatePath } from "next/cache";

import { runAiPipeline, type AiPipelineKind } from "@/server/ai/pipeline";
import { createDb } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { redirectProtectedRouteError } from "@/server/auth/redirects";

export async function generateAiResultAction(input: {
  kind: AiPipelineKind;
  inputSummary: string;
  nextRoute?: string;
}) {
  const session = await requireCurrentUser();
  const db = createDb();

  try {
    const result = await runAiPipeline(
      {
        kind: input.kind,
        userId: session.userId,
        inputSummary: input.inputSummary,
        output: input.inputSummary,
      },
      { db },
    );

    revalidatePath("/me");
    revalidatePath("/recommendations");

    return {
      jobId: result.job.id,
      status: result.job.status,
    };
  } catch (error) {
    redirectProtectedRouteError(error, input.nextRoute ?? "/me");
    throw error;
  }
}
