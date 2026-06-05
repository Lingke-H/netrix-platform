import type { Major, PublicAcademicProfile, StudyYear } from "@/features/profile/schemas";

export type RecommendationScoringInput = {
  recipientProfile: PublicAcademicProfile;
  candidateProfile: PublicAcademicProfile;
};

export type RecommendationScoreSummary = Record<string, number | string | boolean | null>;

export type RecommendationSignalBundle = {
  sharedSignals: string[];
  complementarySignals: string[];
  scoreSummary: RecommendationScoreSummary;
};

const majorLabelMap: Record<Major, string> = {
  math: "同专业",
  "computer-science": "同专业",
  eee: "同专业",
  fam: "同专业",
  ibe: "同专业",
  other: "同学术背景",
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

export function scoreRecommendationMatch(
  input: RecommendationScoringInput,
): RecommendationSignalBundle {
  const { recipientProfile, candidateProfile } = input;

  const sharedModules = shareByExactLabel(recipientProfile.modules, candidateProfile.modules, "共同课程模块");
  const sharedInterests = shareByExactLabel(recipientProfile.interests, candidateProfile.interests, "共同兴趣");
  const sharedHelpTopics = shareByExactLabel(
    recipientProfile.helpNeeded,
    candidateProfile.skillsOffered,
    "对方可提供帮助",
  );
  const sharedSupportTopics = shareByExactLabel(
    recipientProfile.skillsOffered,
    candidateProfile.helpNeeded,
    "你可提供帮助",
  );
  const sharedCollaboration = overlap(
    recipientProfile.collaborationPreferences,
    candidateProfile.collaborationPreferences,
  ).map((item) => `协作偏好: ${item}`);

  const sharedSignals = uniqueShared([
    recipientProfile.major === candidateProfile.major ? majorLabelMap[recipientProfile.major] : null,
    ...sharedModules,
    ...sharedInterests,
    ...sharedHelpTopics,
    ...sharedSupportTopics,
    ...sharedCollaboration,
  ].filter((item): item is string => Boolean(item)));

  const yearGap = Math.abs(yearRank[recipientProfile.year] - yearRank[candidateProfile.year]);
  const crossYearPotential = yearGap >= 1 && yearGap <= 2;

  const complementarySignals = uniqueShared([
    recipientProfile.major !== candidateProfile.major ? `跨专业互补: ${candidateProfile.major}` : null,
    crossYearPotential ? "跨年级互补" : null,
    candidateProfile.modules.length > recipientProfile.modules.length ? "对方模块覆盖更广" : null,
    candidateProfile.skillsOffered.length > recipientProfile.skillsOffered.length ? "对方可提供更多帮助" : null,
  ].filter((item): item is string => Boolean(item)));

  const scoreSummary: RecommendationScoreSummary = {
    sameMajor: recipientProfile.major === candidateProfile.major,
    sharedModules: sharedModules.length,
    sharedInterests: sharedInterests.length,
    helpMatch: sharedHelpTopics.length + sharedSupportTopics.length,
    sharedCollaboration: sharedCollaboration.length,
    crossYearPotential,
    totalScore:
      (recipientProfile.major === candidateProfile.major ? 3 : 0) +
      Math.min(sharedModules.length * 2, 6) +
      Math.min(sharedInterests.length, 4) +
      Math.min((sharedHelpTopics.length + sharedSupportTopics.length) * 2, 4) +
      Math.min(sharedCollaboration.length, 2) +
      (crossYearPotential ? 2 : 0),
  };

  return {
    sharedSignals,
    complementarySignals,
    scoreSummary,
  };
}
