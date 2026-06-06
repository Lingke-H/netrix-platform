"use server";

import { revalidatePath } from "next/cache";

import {
  runAiPipeline,
  upsertPortrait,
  confirmNickname,
} from "@/server/ai";
import { buildNicknameSuggestions } from "@/server/ai/nickname";
import { buildProfilePortrait } from "@/server/ai/profile-portrait";
import { createDb } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { redirectProtectedRouteError } from "@/server/auth/redirects";

function getFormText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export async function onboardWithAiAction(formData: FormData) {
  const input = {
    collaborationPreference: getFormText(formData, "collaborationPreference"),
    helpNeeded: getFormText(formData, "helpNeeded"),
    helpOffered: getFormText(formData, "helpOffered"),
    interests: getFormText(formData, "interests"),
    major: getFormText(formData, "major"),
    modules: getFormText(formData, "modules"),
    nickname: getFormText(formData, "nickname"),
    skills: getFormText(formData, "skills"),
    visibility: getFormText(formData, "visibility"),
    year: getFormText(formData, "year"),
  };
  const nextRoute = getFormText(formData, "next");

  const session = await requireCurrentUser();
  const db = createDb();

  try {
    const profileSummary = [
      input.modules ? `Modules: ${input.modules}` : null,
      input.interests ? `Interests: ${input.interests}` : null,
      input.skills ? `Skills: ${input.skills}` : null,
    ]
      .filter(Boolean)
      .join(". ");

    await Promise.allSettled([
      runAiPipeline(
        {
          kind: "nickname",
          userId: session.userId,
          inputSummary: `Generate academic nicknames for a ${input.major} year ${input.year} student. ${profileSummary}`,
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
          inputSummary: `Build an academic portrait for a ${input.major} year ${input.year} student. ${profileSummary}`,
          output: profileSummary,
        },
        { db },
      ).then(async (portraitPipeline) => {
        const portrait = buildProfilePortrait({
          userId: session.userId,
          promptVersion: "profile-portrait.v1",
          explanationOutput: portraitPipeline.result,
        });
        await upsertPortrait(db, {
          collaborationDraft: portrait.collaborationDraft,
          generatedAt: new Date().toISOString(),
          promptVersion: "profile-portrait.v1",
          sourceSnapshot: {},
          status: "draft",
          strengthsDraft: portrait.strengthsDraft,
          suggestedTags: portrait.suggestedTags,
          summary: portrait.summary,
          userId: session.userId,
        });
        return portraitPipeline;
      }),
    ]);

    revalidatePath("/me");
    revalidatePath("/onboarding");
    revalidatePath("/feed");
  } catch (error) {
    redirectProtectedRouteError(error, nextRoute || "/onboarding");
    throw error;
  }
}
