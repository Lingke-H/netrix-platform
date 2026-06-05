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
    summary: portrait.summary,
    currentFocus: portrait.currentFocus,
    collaborationStyle: portrait.collaborationStyle,
    strengths: portrait.strengths,
    suggestedTopics: portrait.suggestedTopics,
    status: candidate.status ?? "generated",
    promptVersion: candidate.promptVersion,
    generatedAt: new Date().toISOString(),
  };
}
