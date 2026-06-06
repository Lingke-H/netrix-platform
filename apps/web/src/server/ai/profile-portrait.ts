import { parseProfilePortraitOutput } from "./contracts";
import type { ProfilePortraitOutput } from "./schemas/profile-portrait";
import type { AcademicPortrait } from "@/features/profile/schemas";

export type ProfilePortraitCandidateInput = {
  userId: string;
  promptVersion: string;
  explanationOutput: ProfilePortraitOutput | unknown;
  status?: AcademicPortrait["status"];
};

export function buildProfilePortrait(candidate: ProfilePortraitCandidateInput): AcademicPortrait {
  const portrait = parseProfilePortraitOutput(candidate.explanationOutput);

  return {
    id: crypto.randomUUID(),
    userId: candidate.userId,
    sourceSnapshot: {},
    summary: portrait.summary,
    suggestedTags: [...portrait.currentFocus, ...portrait.suggestedTopics].slice(0, 6),
    strengthsDraft: portrait.strengths,
    collaborationDraft: portrait.collaborationStyle,
    status: candidate.status ?? "draft",
    promptVersion: candidate.promptVersion,
    generatedAt: new Date().toISOString(),
    confirmedAt: null,
  };
}
