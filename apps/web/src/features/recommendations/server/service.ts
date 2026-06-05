import { and, desc, eq, inArray, ne } from "drizzle-orm";

import { getAcademicProfileForUser } from "@/features/profile/server/service";
import {
  recommendationExplanationInputSchema,
  recommendationExplanationOutputSchema,
  type RecommendationExplanationInput,
  type RecommendationExplanationOutput,
} from "@/server/ai/schemas/recommendation-explanation";
import {
  buildRecommendationExplanationPromptMessages,
  type RecommendationExplanationPromptMessage,
  recommendationExplanationPromptVersion,
} from "@/server/ai/prompts/recommendation-explanation.v1";
import {
  createMockOpenAiJsonProvider,
  type OpenAiJsonRequest,
  type OpenAiJsonUsage,
} from "@/server/ai/provider";
import {
  type Recommendation,
  type RecommendationCandidateProfile,
  recommendationSchema,
  recommendationCandidateProfileSchema,
} from "@/features/recommendations/schemas";
import type { RecommendationFeedData } from "@/features/recommendations/types";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles, recommendations } from "@/server/db/schema";

export type RecommendationCandidateProfileRow = {
  collaborationPreference: string[];
  completionStatus: "basic_complete" | "recommendation_ready";
  helpNeeded: string[];
  helpOffered: string[];
  interests: string[];
  major: "math" | "computer-science" | "eee" | "fam" | "ibe" | "other";
  modules: string[];
  nickname: string;
  skills: string[];
  updatedAt: Date;
  userId: string;
  visibility: "campus";
  year: "foundation" | "year-1" | "year-2" | "year-3" | "year-4" | "postgraduate";
};

export type RecommendationCandidateOptions = {
  limit?: number;
};

export type RecommendationScoringProfile = Pick<
  RecommendationCandidateProfile,
  "collaborationPreference" | "helpNeeded" | "helpOffered" | "interests" | "modules" | "skills"
>;

export type RecommendationScoreSummary = {
  collaborationPreferenceOverlap: number;
  helpComplementarity: number;
  interestOverlap: number;
  moduleOverlap: number;
  skillOverlap: number;
  total: number;
};

export type ScoredRecommendationCandidate = {
  candidate: RecommendationCandidateProfile;
  complementarySignals: string[];
  score: number;
  scoreSummary: RecommendationScoreSummary;
  sharedSignals: string[];
};

export type RecommendationExplanationPromptPayload = {
  messages: RecommendationExplanationPromptMessage[];
  promptVersion: typeof recommendationExplanationPromptVersion;
};

export type RecommendationExplanationOutputParseResult =
  | {
      ok: true;
      output: RecommendationExplanationOutput;
    }
  | {
      code: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT";
      issues: string[];
      ok: false;
    };

export type RecommendationExplanationMockGenerationOptions = {
  mockOutput: unknown | ((request: OpenAiJsonRequest) => Promise<unknown> | unknown);
  model?: string;
  rawResponseId?: string | null;
  temperature?: number;
  usage?: Partial<OpenAiJsonUsage>;
};

export type RecommendationExplanationGenerationResult =
  | {
      explanation: RecommendationExplanationOutput;
      model: string;
      ok: true;
      promptVersion: typeof recommendationExplanationPromptVersion;
      provider: "mock";
      rawResponseId: string | null;
      usage: OpenAiJsonUsage;
    }
  | {
      code: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT";
      issues: string[];
      model: string;
      ok: false;
      promptVersion: typeof recommendationExplanationPromptVersion;
      provider: "mock";
      rawResponseId: string | null;
      usage: OpenAiJsonUsage;
    };

export type RecommendationCardBuildResult =
  | {
      error: null;
      item: Recommendation;
      ok: true;
    }
  | {
      error: RecommendationExplanationGenerationResult;
      item: null;
      ok: false;
    };

type VisibleRecommendationCard = Extract<Recommendation, { profileVisibility: "campus" | "public" }>;
type SuccessfulRecommendationExplanationGeneration = Extract<
  RecommendationExplanationGenerationResult,
  { ok: true }
>;

export type RecommendationInsertDraft = typeof recommendations.$inferInsert;

export type RecommendationInsertDraftInput = {
  card: VisibleRecommendationCard;
  generation: SuccessfulRecommendationExplanationGeneration;
  recipientUserId: string;
  scoredCandidate: ScoredRecommendationCandidate;
};

export type RecommendationPersistenceDryRunResult = RecommendationFeedData & {
  drafts: RecommendationInsertDraft[];
  dryRun: true;
};

type RecommendationPersistenceDryRunEntry = {
  card: VisibleRecommendationCard;
  draft: RecommendationInsertDraft;
};

const recommendationScoringWeights = {
  collaborationPreferenceOverlap: 1,
  helpComplementarity: 4,
  interestOverlap: 2,
  moduleOverlap: 3,
  skillOverlap: 2,
} as const;

export function buildEmptyRecommendationFeedData(): RecommendationFeedData {
  return {
    hasEnoughSignals: false,
    items: [],
  };
}

export function getRecommendationCandidateLimit(limit = 50) {
  return Math.min(Math.max(Math.trunc(limit), 1), 100);
}

export function buildRecommendationCandidateProfile(
  row: RecommendationCandidateProfileRow,
): RecommendationCandidateProfile {
  return recommendationCandidateProfileSchema.parse({
    collaborationPreference: row.collaborationPreference,
    completionStatus: row.completionStatus,
    helpNeeded: row.helpNeeded,
    helpOffered: row.helpOffered,
    interests: row.interests,
    major: row.major,
    modules: row.modules,
    nickname: row.nickname,
    skills: row.skills,
    updatedAt: row.updatedAt.toISOString(),
    userId: row.userId,
    visibility: row.visibility,
    year: row.year,
  });
}

function normalizeSignal(value: string) {
  return value.trim().toLowerCase();
}

function uniqueSignals(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = normalizeSignal(value);

    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(value.trim());
  });

  return result;
}

function findOverlappingSignals(left: string[], right: string[]) {
  const rightByNormalizedSignal = new Map(uniqueSignals(right).map((value) => [normalizeSignal(value), value]));

  return uniqueSignals(left)
    .map((value) => rightByNormalizedSignal.get(normalizeSignal(value)))
    .filter((value): value is string => Boolean(value));
}

function formatSignals(prefix: string, values: string[]) {
  return values.map((value) => `${prefix}: ${value}`);
}

export function scoreRecommendationCandidate(
  viewerProfile: RecommendationScoringProfile,
  candidate: RecommendationCandidateProfile,
): ScoredRecommendationCandidate {
  const moduleMatches = findOverlappingSignals(viewerProfile.modules, candidate.modules);
  const interestMatches = findOverlappingSignals(viewerProfile.interests, candidate.interests);
  const skillMatches = findOverlappingSignals(viewerProfile.skills, candidate.skills);
  const collaborationMatches = findOverlappingSignals(
    viewerProfile.collaborationPreference,
    candidate.collaborationPreference,
  );
  const candidateCanHelpViewer = findOverlappingSignals(viewerProfile.helpNeeded, candidate.helpOffered);
  const viewerCanHelpCandidate = findOverlappingSignals(viewerProfile.helpOffered, candidate.helpNeeded);

  const scoreSummary: RecommendationScoreSummary = {
    collaborationPreferenceOverlap:
      collaborationMatches.length * recommendationScoringWeights.collaborationPreferenceOverlap,
    helpComplementarity:
      (candidateCanHelpViewer.length + viewerCanHelpCandidate.length) *
      recommendationScoringWeights.helpComplementarity,
    interestOverlap: interestMatches.length * recommendationScoringWeights.interestOverlap,
    moduleOverlap: moduleMatches.length * recommendationScoringWeights.moduleOverlap,
    skillOverlap: skillMatches.length * recommendationScoringWeights.skillOverlap,
    total: 0,
  };
  scoreSummary.total =
    scoreSummary.collaborationPreferenceOverlap +
    scoreSummary.helpComplementarity +
    scoreSummary.interestOverlap +
    scoreSummary.moduleOverlap +
    scoreSummary.skillOverlap;

  return {
    candidate,
    complementarySignals: [
      ...formatSignals("Candidate can help with", candidateCanHelpViewer),
      ...formatSignals("Viewer can help with", viewerCanHelpCandidate),
    ],
    score: scoreSummary.total,
    scoreSummary,
    sharedSignals: [
      ...formatSignals("Shared module", moduleMatches),
      ...formatSignals("Shared interest", interestMatches),
      ...formatSignals("Shared skill", skillMatches),
      ...formatSignals("Shared collaboration preference", collaborationMatches),
    ],
  };
}

export function scoreRecommendationCandidates(
  viewerProfile: RecommendationScoringProfile,
  candidates: RecommendationCandidateProfile[],
): ScoredRecommendationCandidate[] {
  return candidates
    .map((candidate) => scoreRecommendationCandidate(viewerProfile, candidate))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.candidate.updatedAt.localeCompare(left.candidate.updatedAt);
    });
}

export function buildRecommendationExplanationInput(
  viewerProfile: RecommendationScoringProfile,
  scoredCandidate: ScoredRecommendationCandidate,
): RecommendationExplanationInput {
  const { candidate } = scoredCandidate;

  return recommendationExplanationInputSchema.parse({
    candidateProfile: {
      collaborationPreference: candidate.collaborationPreference,
      helpNeeded: candidate.helpNeeded,
      helpOffered: candidate.helpOffered,
      interests: candidate.interests,
      major: candidate.major,
      modules: candidate.modules,
      nickname: candidate.nickname,
      skills: candidate.skills,
      userId: candidate.userId,
      visibility: candidate.visibility,
      year: candidate.year,
    },
    ruleScore: {
      complementarySignals: scoredCandidate.complementarySignals,
      score: scoredCandidate.score,
      scoreSummary: scoredCandidate.scoreSummary,
      sharedSignals: scoredCandidate.sharedSignals,
    },
    viewerProfile: {
      collaborationPreference: viewerProfile.collaborationPreference,
      helpNeeded: viewerProfile.helpNeeded,
      helpOffered: viewerProfile.helpOffered,
      interests: viewerProfile.interests,
      modules: viewerProfile.modules,
      skills: viewerProfile.skills,
    },
  });
}

export function buildRecommendationExplanationPromptPayload(
  viewerProfile: RecommendationScoringProfile,
  scoredCandidate: ScoredRecommendationCandidate,
): RecommendationExplanationPromptPayload {
  const input = buildRecommendationExplanationInput(viewerProfile, scoredCandidate);

  return {
    messages: buildRecommendationExplanationPromptMessages(input),
    promptVersion: recommendationExplanationPromptVersion,
  };
}

export function parseRecommendationExplanationOutput(
  output: unknown,
): RecommendationExplanationOutputParseResult {
  const parsedOutput = recommendationExplanationOutputSchema.safeParse(output);

  if (!parsedOutput.success) {
    return {
      code: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT",
      issues: parsedOutput.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "root";

        return `${path}: ${issue.message}`;
      }),
      ok: false,
    };
  }

  return {
    ok: true,
    output: parsedOutput.data,
  };
}

export async function generateRecommendationExplanationWithMockProvider(
  viewerProfile: RecommendationScoringProfile,
  scoredCandidate: ScoredRecommendationCandidate,
  options: RecommendationExplanationMockGenerationOptions,
): Promise<RecommendationExplanationGenerationResult> {
  const promptPayload = buildRecommendationExplanationPromptPayload(viewerProfile, scoredCandidate);
  const model = options.model ?? "mock-recommendation-explainer";
  const provider = createMockOpenAiJsonProvider({
    model,
    output: options.mockOutput,
    rawResponseId: options.rawResponseId,
    usage: options.usage,
  });
  const response = await provider.generateJson({
    messages: promptPayload.messages,
    model,
    promptVersion: promptPayload.promptVersion,
    temperature: options.temperature ?? 0.2,
  });
  const parsedOutput = parseRecommendationExplanationOutput(response.output);
  const metadata = {
    model: response.model,
    promptVersion: promptPayload.promptVersion,
    provider: "mock" as const,
    rawResponseId: response.rawResponseId,
    usage: response.usage,
  };

  if (!parsedOutput.ok) {
    return {
      ...metadata,
      code: parsedOutput.code,
      issues: parsedOutput.issues,
      ok: false,
    };
  }

  return {
    ...metadata,
    explanation: parsedOutput.output,
    ok: true,
  };
}

function buildCandidateProfileSummary(candidate: RecommendationCandidateProfile) {
  const summaryParts = [
    candidate.modules.length > 0 ? `Modules: ${candidate.modules.slice(0, 3).join(", ")}` : null,
    candidate.interests.length > 0 ? `Interests: ${candidate.interests.slice(0, 3).join(", ")}` : null,
    candidate.skills.length > 0 ? `Skills: ${candidate.skills.slice(0, 3).join(", ")}` : null,
  ].filter((part): part is string => part !== null);

  return (summaryParts.join(". ") || "Campus-visible academic profile.").slice(0, 280);
}

function buildMockRecommendationExplanationOutput(scoredCandidate: ScoredRecommendationCandidate) {
  const sharedSignals = scoredCandidate.sharedSignals.slice(0, 6);
  const complementarySignals = scoredCandidate.complementarySignals.slice(0, 6);
  const strongestSharedSignal = sharedSignals[0] ?? "related academic interests";
  const strongestComplementarySignal = complementarySignals[0] ?? "compatible study goals";

  return {
    complementarySignals,
    conversationStarter: `Ask ${scoredCandidate.candidate.nickname} about ${strongestSharedSignal}.`,
    explanationSummary: `${scoredCandidate.candidate.nickname} is recommended because of ${strongestSharedSignal} and ${strongestComplementarySignal}.`,
    sharedSignals,
  };
}

function buildRecommendationCardFromSuccessfulGeneration(
  scoredCandidate: ScoredRecommendationCandidate,
  explanationResult: SuccessfulRecommendationExplanationGeneration,
): VisibleRecommendationCard {
  const { candidate } = scoredCandidate;

  return recommendationSchema.parse({
    canRequestConnect: true,
    complementarySignals: explanationResult.explanation.complementarySignals,
    conversationStarter: explanationResult.explanation.conversationStarter,
    explanationSummary: explanationResult.explanation.explanationSummary,
    generatedByJobId: null,
    major: candidate.major,
    nickname: candidate.nickname,
    profileSummary: buildCandidateProfileSummary(candidate),
    profileVisibility: candidate.visibility,
    recommendationId: candidate.userId,
    recommendedUserId: candidate.userId,
    sharedSignals: explanationResult.explanation.sharedSignals,
    status: "active",
    year: candidate.year,
  }) as VisibleRecommendationCard;
}

export async function buildRecommendationCardFromScoredCandidate(
  viewerProfile: RecommendationScoringProfile,
  scoredCandidate: ScoredRecommendationCandidate,
): Promise<RecommendationCardBuildResult> {
  const explanationResult = await generateRecommendationExplanationWithMockProvider(viewerProfile, scoredCandidate, {
    mockOutput: buildMockRecommendationExplanationOutput(scoredCandidate),
  });

  if (!explanationResult.ok) {
    return {
      error: explanationResult,
      item: null,
      ok: false,
    };
  }

  return {
    error: null,
    item: buildRecommendationCardFromSuccessfulGeneration(scoredCandidate, explanationResult),
    ok: true,
  };
}

export function buildRecommendationInsertDraft({
  card,
  generation,
  recipientUserId,
  scoredCandidate,
}: RecommendationInsertDraftInput): RecommendationInsertDraft {
  const { candidate } = scoredCandidate;

  return {
    complementarySignals: card.complementarySignals,
    conversationStarter: card.conversationStarter,
    explanationSummary: card.explanationSummary,
    generatedByJobId: card.generatedByJobId,
    llmModel: generation.model,
    llmProvider: generation.provider,
    llmRawResponseId: generation.rawResponseId,
    llmUsage: generation.usage,
    promptVersion: generation.promptVersion,
    recommendedUserId: card.recommendedUserId,
    recipientUserId,
    scoreSummary: {
      collaborationPreferenceOverlap: scoredCandidate.scoreSummary.collaborationPreferenceOverlap,
      helpComplementarity: scoredCandidate.scoreSummary.helpComplementarity,
      interestOverlap: scoredCandidate.scoreSummary.interestOverlap,
      moduleOverlap: scoredCandidate.scoreSummary.moduleOverlap,
      skillOverlap: scoredCandidate.scoreSummary.skillOverlap,
      total: scoredCandidate.scoreSummary.total,
    },
    sharedSignals: card.sharedSignals,
    signalSnapshot: {
      candidateUserId: candidate.userId,
      candidateVisibility: candidate.visibility,
      completionStatus: candidate.completionStatus,
      helpNeeded: candidate.helpNeeded,
      helpOffered: candidate.helpOffered,
      interests: candidate.interests,
      modules: candidate.modules,
      profileVisibility: card.profileVisibility,
      promptVersion: generation.promptVersion,
      skills: candidate.skills,
    },
    status: card.status,
  };
}

export async function listCampusVisibleRecommendationCandidates(
  db: DbClient,
  viewerUserId: string,
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationCandidateProfile[]> {
  const limit = getRecommendationCandidateLimit(options.limit);
  const rows = await db
    .select({
      collaborationPreference: academicProfiles.collaborationPreference,
      completionStatus: academicProfiles.completionStatus,
      helpNeeded: academicProfiles.helpNeeded,
      helpOffered: academicProfiles.helpOffered,
      interests: academicProfiles.interests,
      major: academicProfiles.major,
      modules: academicProfiles.modules,
      nickname: academicProfiles.nickname,
      skills: academicProfiles.skills,
      updatedAt: academicProfiles.updatedAt,
      userId: academicProfiles.userId,
      visibility: academicProfiles.visibility,
      year: academicProfiles.year,
    })
    .from(academicProfiles)
    .where(
      and(
        eq(academicProfiles.visibility, "campus"),
        ne(academicProfiles.userId, viewerUserId),
        inArray(academicProfiles.completionStatus, ["basic_complete", "recommendation_ready"]),
      ),
    )
    .orderBy(desc(academicProfiles.updatedAt))
    .limit(limit);

  return rows.map((row) =>
    buildRecommendationCandidateProfile({
      ...row,
      completionStatus: row.completionStatus as "basic_complete" | "recommendation_ready",
      visibility: "campus",
    }),
  );
}

export async function getCurrentUserRecommendationFeed(): Promise<RecommendationFeedData> {
  await requireCompletedAcademicProfile();

  return buildEmptyRecommendationFeedData();
}

export async function getCurrentUserRecommendationCandidates(
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationCandidateProfile[]> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return listCampusVisibleRecommendationCandidates(db, gate.session.userId, options);
}

export async function getCurrentUserScoredRecommendationCandidates(
  options: RecommendationCandidateOptions = {},
): Promise<ScoredRecommendationCandidate[]> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();
  const profile = await getAcademicProfileForUser(db, gate.session.userId);

  if (!profile) {
    return [];
  }

  const candidates = await listCampusVisibleRecommendationCandidates(db, gate.session.userId, options);

  return scoreRecommendationCandidates(profile, candidates);
}

export async function getCurrentUserRecommendationCards(
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationFeedData> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();
  const profile = await getAcademicProfileForUser(db, gate.session.userId);

  if (!profile) {
    return buildEmptyRecommendationFeedData();
  }

  const candidates = await listCampusVisibleRecommendationCandidates(db, gate.session.userId, options);
  const scoredCandidates = scoreRecommendationCandidates(profile, candidates);
  const buildResults = await Promise.all(
    scoredCandidates.map((scoredCandidate) => buildRecommendationCardFromScoredCandidate(profile, scoredCandidate)),
  );

  return {
    hasEnoughSignals: scoredCandidates.length > 0,
    items: buildResults.flatMap((result) => (result.ok ? [result.item] : [])),
  };
}

export async function getCurrentUserRecommendationPersistenceDryRun(
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationPersistenceDryRunResult> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();
  const profile = await getAcademicProfileForUser(db, gate.session.userId);

  if (!profile) {
    return {
      drafts: [],
      dryRun: true,
      hasEnoughSignals: false,
      items: [],
    };
  }

  const candidates = await listCampusVisibleRecommendationCandidates(db, gate.session.userId, options);
  const scoredCandidates = scoreRecommendationCandidates(profile, candidates);
  const buildResults = await Promise.all(
    scoredCandidates.map(async (scoredCandidate) => {
      const generation = await generateRecommendationExplanationWithMockProvider(profile, scoredCandidate, {
        mockOutput: buildMockRecommendationExplanationOutput(scoredCandidate),
      });

      if (!generation.ok) {
        return null;
      }

      const card = buildRecommendationCardFromSuccessfulGeneration(scoredCandidate, generation);
      const draft = buildRecommendationInsertDraft({
        card,
        generation,
        recipientUserId: gate.session.userId,
        scoredCandidate,
      });

      return {
        card,
        draft,
      };
    }),
  );
  const persistableResults = buildResults.filter(
    (result): result is RecommendationPersistenceDryRunEntry => result !== null,
  );

  return {
    drafts: persistableResults.map((result) => result.draft),
    dryRun: true,
    hasEnoughSignals: scoredCandidates.length > 0,
    items: persistableResults.map((result) => result.card),
  };
}
