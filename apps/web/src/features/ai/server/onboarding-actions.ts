"use server";

import { revalidatePath } from "next/cache";

import {
  runAiPipeline,
  persistAiPortrait,
  confirmNickname,
} from "@/server/ai";
import { buildNicknameSuggestions } from "@/server/ai/nickname";
import { buildProfilePortrait } from "@/server/ai/profile-portrait";
import { createAiJobRecord } from "@/server/ai/jobs";
import { startAiJob } from "@/server/ai/job-state";
import {
  normalizeAcademicProfileFormData,
  upsertAcademicProfile,
} from "@/features/profile/server/service";
import { createDb } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { redirectProtectedRouteError } from "@/server/auth/redirects";

export async function onboardWithAiAction(formData: FormData) {
  const session = await requireCurrentUser();
  const db = createDb();

  try {
    await upsertAcademicProfile(db, session.userId, formData);

    const normalized = normalizeAcademicProfileFormData(formData);
    const profileSummary = [
      normalized.modules.length > 0 ? `Modules: ${normalized.modules.join(", ")}` : null,
      normalized.interests.length > 0 ? `Interests: ${normalized.interests.join(", ")}` : null,
      normalized.skills.length > 0 ? `Skills: ${normalized.skills.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(". ");

    await Promise.allSettled([
      runAiPipeline(
        {
          kind: "nickname",
          userId: session.userId,
          inputSummary: `Generate academic nicknames for a ${normalized.major} year ${normalized.year} student. ${profileSummary}`,
          output: profileSummary,
        },
        { db },
      ).then(async (nicknamePipeline) => {
        const suggestions = buildNicknameSuggestions({
          explanationOutput: nicknamePipeline.result,
        });
        if (suggestions.suggestions.length > 0) {
          await confirmNickname(db, session.userId, suggestions.suggestions[0].nickname);
        }
        return nicknamePipeline;
      }),
      runAiPipeline(
        {
          kind: "profile-portrait",
          userId: session.userId,
          inputSummary: `Build an academic portrait for a ${normalized.major} year ${normalized.year} student. ${profileSummary}`,
          output: profileSummary,
        },
        { db },
      ).then(async (portraitPipeline) => {
        const portrait = buildProfilePortrait({
          userId: session.userId,
          promptVersion: "profile-portrait.v1",
          explanationOutput: portraitPipeline.result,
        });
        const job = createAiJobRecord({
          userId: session.userId,
          type: "profile-portrait",
          status: startAiJob(),
          promptVersion: "profile-portrait.v1",
          inputSummary: profileSummary,
          outputSummary: portrait.summary,
        });
        await persistAiPortrait(db, job, portrait);
        return portraitPipeline;
      }),
    ]);

    revalidatePath("/me");
    revalidatePath("/onboarding");
    revalidatePath("/feed");
  } catch (error) {
    redirectProtectedRouteError(error, "/onboarding");
    throw error;
  }
}
