import type { AcademicProfile, Major, StudyYear } from "@/features/profile/schemas";

export type RecommendationScoringInput = {
  recipientProfile: AcademicProfile;
  candidateProfile: AcademicProfile;
};

export type RecommendationScoreSummary = Record<string, number | string | boolean | null>;

export type RecommendationSignalBundle = {
  sharedSignals: string[];
  complementarySignals: string[];
  scoreSummary: RecommendationScoreSummary;
};

const majorLabelMap: Record<Major, string> = {
  math: "Shared major",
  "computer-science": "Shared major",
  eee: "Shared major",
  fam: "Shared major",
  ibe: "Shared major",
  other: "Shared academic background",
};

const yearRank: Record<StudyYear, number> = {
  foundation: 0,
  "year-1": 1,
  "year-2": 2,
  "year-3": 3,
  "year-4": 4,
  postgraduate: 5,
};

function uniqueShared(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function overlap(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.trim().toLowerCase()));

  return uniqueShared(left)
    .filter((item) => rightSet.has(item.trim().toLowerCase()))
    .slice(0, 6);
}

function shareByExactLabel(left: string[], right: string[], label: string) {
  return overlap(left, right).map((item) => `${label}: ${item}`);
}

export function scoreRecommendationMatch(input: RecommendationScoringInput): RecommendationSignalBundle {
  const { recipientProfile, candidateProfile } = input;

  const sharedModules = shareByExactLabel(recipientProfile.modules, candidateProfile.modules, "Shared module");
  const sharedInterests = shareByExactLabel(recipientProfile.interests, candidateProfile.interests, "Shared interest");
  const sharedSkills = shareByExactLabel(recipientProfile.skills, candidateProfile.skills, "Shared skill");
  const candidateCanHelp = shareByExactLabel(
    recipientProfile.helpNeeded,
    candidateProfile.helpOffered,
    "Candidate can help with",
  );
  const recipientCanHelp = shareByExactLabel(
    recipientProfile.helpOffered,
    candidateProfile.helpNeeded,
    "Recipient can help with",
  );
  const sharedCollaboration = overlap(
    recipientProfile.collaborationPreference,
    candidateProfile.collaborationPreference,
  ).map((item) => `Shared collaboration preference: ${item}`);

  const sharedSignals = uniqueShared(
    [
      recipientProfile.major === candidateProfile.major ? majorLabelMap[recipientProfile.major] : null,
      ...sharedModules,
      ...sharedInterests,
      ...sharedSkills,
      ...sharedCollaboration,
    ].filter((item): item is string => Boolean(item)),
  );

  const yearGap = Math.abs(yearRank[recipientProfile.year] - yearRank[candidateProfile.year]);
  const crossYearPotential = yearGap >= 1 && yearGap <= 2;

  const complementarySignals = uniqueShared(
    [
      recipientProfile.major !== candidateProfile.major ? `Cross-major complement: ${candidateProfile.major}` : null,
      crossYearPotential ? "Cross-year complementarity" : null,
      ...candidateCanHelp,
      ...recipientCanHelp,
      candidateProfile.modules.length > recipientProfile.modules.length ? "Candidate has broader module coverage" : null,
      candidateProfile.helpOffered.length > recipientProfile.helpOffered.length
        ? "Candidate offers more help areas"
        : null,
    ].filter((item): item is string => Boolean(item)),
  );

  const scoreSummary: RecommendationScoreSummary = {
    sameMajor: recipientProfile.major === candidateProfile.major,
    sharedModules: sharedModules.length,
    sharedInterests: sharedInterests.length,
    sharedSkills: sharedSkills.length,
    helpMatch: candidateCanHelp.length + recipientCanHelp.length,
    sharedCollaboration: sharedCollaboration.length,
    crossYearPotential,
    totalScore:
      (recipientProfile.major === candidateProfile.major ? 3 : 0) +
      Math.min(sharedModules.length * 2, 6) +
      Math.min(sharedInterests.length, 4) +
      Math.min(sharedSkills.length, 2) +
      Math.min((candidateCanHelp.length + recipientCanHelp.length) * 2, 4) +
      Math.min(sharedCollaboration.length, 2) +
      (crossYearPotential ? 2 : 0),
  };

  return {
    sharedSignals,
    complementarySignals,
    scoreSummary,
  };
}
