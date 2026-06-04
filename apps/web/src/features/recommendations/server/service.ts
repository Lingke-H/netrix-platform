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
  type RecommendationCandidateProfile,
  recommendationCandidateProfileSchema,
} from "@/features/recommendations/schemas";
import type { RecommendationFeedData } from "@/features/recommendations/types";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles } from "@/server/db/schema";

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
