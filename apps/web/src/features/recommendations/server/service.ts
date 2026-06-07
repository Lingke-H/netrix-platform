import { and, desc, eq, inArray, ne, or } from "drizzle-orm";

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
  createConfiguredOpenAiJsonProvider,
  createMockOpenAiJsonProvider,
  getConfiguredOpenAiJsonModelName,
  type OpenAiJsonProvider,
  type OpenAiJsonRequest,
  type OpenAiJsonResponseFormat,
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
import { academicProfiles, connectionRequests, recommendations } from "@/server/db/schema";
import { assertPermissionScope } from "@/server/permissions";
import { recordEvent } from "@/server/events/record";

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

export type RecommendationExplanationGenerationOptions = {
  fallbackMockOutput?: unknown | ((request: OpenAiJsonRequest) => Promise<unknown> | unknown);
  model?: string;
  provider?: OpenAiJsonProvider | null;
  temperature?: number;
};

export type RecommendationExplanationGenerationResult =
  | {
      explanation: RecommendationExplanationOutput;
      model: string;
      ok: true;
      promptVersion: typeof recommendationExplanationPromptVersion;
      provider: "mock" | "openai";
      rawResponseId: string | null;
      usage: OpenAiJsonUsage;
    }
  | {
      code: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT";
      issues: string[];
      model: string;
      ok: false;
      promptVersion: typeof recommendationExplanationPromptVersion;
      provider: "mock" | "openai";
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

export type PersistedRecommendationFeedRow = {
  recommendation: {
    complementarySignals: string[];
    conversationStarter: string;
    explanationSummary: string;
    generatedByJobId: string | null;
    id: string;
    sharedSignals: string[];
    status: "active";
  };
  recommendedProfile: {
    interests: string[];
    major: "math" | "computer-science" | "eee" | "fam" | "ibe" | "other";
    modules: string[];
    nickname: string;
    skills: string[];
    userId: string;
    visibility: "private" | "campus" | "public";
    year: "foundation" | "year-1" | "year-2" | "year-3" | "year-4" | "postgraduate";
  };
};

export type RecommendationInsertDraft = typeof recommendations.$inferInsert;

export type RecommendationPersistenceExistingRecommendation = {
  recipientUserId: string;
  recommendedUserId: string;
  status: "active" | "dismissed" | "requested" | "expired";
};

export type RecommendationPersistenceExistingConnectionRequest = {
  requesterId: string;
  recipientId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
};

export type RecommendationPersistenceWriteGuardIssueCode =
  | "ACTOR_MUST_MATCH_RECIPIENT"
  | "SELF_RECOMMENDATION_NOT_ALLOWED"
  | "DRAFT_MUST_BE_ACTIVE"
  | "CANDIDATE_MUST_BE_CAMPUS_VISIBLE"
  | "CANDIDATE_PROFILE_MUST_BE_COMPLETE"
  | "DUPLICATE_RECOMMENDATION"
  | "DUPLICATE_RECOMMENDATION_IN_BATCH"
  | "CONNECTION_ALREADY_PENDING_OR_ACCEPTED";

export type RecommendationPersistenceWriteGuardIssue = {
  code: RecommendationPersistenceWriteGuardIssueCode;
  message: string;
};

export type RecommendationPersistenceWriteGuardInput = {
  actorUserId: string;
  draft: RecommendationInsertDraft;
  existingConnectionRequests?: RecommendationPersistenceExistingConnectionRequest[];
  existingRecommendations?: RecommendationPersistenceExistingRecommendation[];
  seenRecommendationPairs?: ReadonlySet<string>;
};

export type RecommendationPersistenceWriteGuardResult =
  | {
      draft: RecommendationInsertDraft;
      ok: true;
      pairKey: string;
    }
  | {
      draft: RecommendationInsertDraft;
      issues: RecommendationPersistenceWriteGuardIssue[];
      ok: false;
      pairKey: string;
    };

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

export type RecommendationPersistenceInsertedRecommendation = {
  id: string;
  recipientUserId: string;
  recommendedUserId: string;
  status: "active" | "dismissed" | "requested" | "expired";
};

export type RecommendationPersistenceInsertResult = {
  inserted: RecommendationPersistenceInsertedRecommendation[];
  rejected: Extract<RecommendationPersistenceWriteGuardResult, { ok: false }>[];
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

const recommendationExplanationResponseFormat = {
  description: "Explain an academic connection recommendation using only supplied structured signals.",
  name: "recommendation_explanation",
  schema: {
    additionalProperties: false,
    properties: {
      complementarySignals: {
        items: {
          type: "string",
        },
        type: "array",
      },
      conversationStarter: {
        type: "string",
      },
      explanationSummary: {
        type: "string",
      },
      sharedSignals: {
        items: {
          type: "string",
        },
        type: "array",
      },
    },
    required: ["explanationSummary", "sharedSignals", "complementarySignals", "conversationStarter"],
    type: "object",
  },
  strict: true,
} satisfies OpenAiJsonResponseFormat;

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

export function getRecommendationPairKey(draft: Pick<RecommendationInsertDraft, "recipientUserId" | "recommendedUserId">) {
  return `${draft.recipientUserId}:${draft.recommendedUserId}`;
}

function hasSameRecommendationPair(
  recommendation: RecommendationPersistenceExistingRecommendation,
  draft: RecommendationInsertDraft,
) {
  return (
    recommendation.recipientUserId === draft.recipientUserId &&
    recommendation.recommendedUserId === draft.recommendedUserId
  );
}

function hasSameConnectionPair(
  connectionRequest: RecommendationPersistenceExistingConnectionRequest,
  draft: RecommendationInsertDraft,
) {
  return (
    (connectionRequest.requesterId === draft.recipientUserId &&
      connectionRequest.recipientId === draft.recommendedUserId) ||
    (connectionRequest.requesterId === draft.recommendedUserId &&
      connectionRequest.recipientId === draft.recipientUserId)
  );
}

function getDraftSignalSnapshotValue(draft: RecommendationInsertDraft, key: string) {
  const { signalSnapshot } = draft;

  if (!signalSnapshot || typeof signalSnapshot !== "object" || Array.isArray(signalSnapshot)) {
    return null;
  }

  const value = (signalSnapshot as Record<string, unknown>)[key];

  return typeof value === "string" ? value : null;
}

export function guardRecommendationPersistenceWrite({
  actorUserId,
  draft,
  existingConnectionRequests = [],
  existingRecommendations = [],
  seenRecommendationPairs,
}: RecommendationPersistenceWriteGuardInput): RecommendationPersistenceWriteGuardResult {
  assertPermissionScope("recommendation:write");

  const pairKey = getRecommendationPairKey(draft);
  const issues: RecommendationPersistenceWriteGuardIssue[] = [];
  const candidateVisibility = getDraftSignalSnapshotValue(draft, "candidateVisibility");
  const profileVisibility = getDraftSignalSnapshotValue(draft, "profileVisibility");
  const completionStatus = getDraftSignalSnapshotValue(draft, "completionStatus");

  if (actorUserId !== draft.recipientUserId) {
    issues.push({
      code: "ACTOR_MUST_MATCH_RECIPIENT",
      message: "Only the recommendation recipient may persist a recommendation draft.",
    });
  }

  if (draft.recipientUserId === draft.recommendedUserId) {
    issues.push({
      code: "SELF_RECOMMENDATION_NOT_ALLOWED",
      message: "A recommendation may not target the same user as its recipient.",
    });
  }

  if (draft.status !== "active") {
    issues.push({
      code: "DRAFT_MUST_BE_ACTIVE",
      message: "Only active recommendation drafts are eligible for persistence.",
    });
  }

  if (candidateVisibility !== "campus" || profileVisibility !== "campus") {
    issues.push({
      code: "CANDIDATE_MUST_BE_CAMPUS_VISIBLE",
      message: "Only campus-visible candidate profiles are eligible for recommendation persistence.",
    });
  }

  if (completionStatus !== "basic_complete" && completionStatus !== "recommendation_ready") {
    issues.push({
      code: "CANDIDATE_PROFILE_MUST_BE_COMPLETE",
      message: "Only completed candidate profiles are eligible for recommendation persistence.",
    });
  }

  if (
    existingRecommendations.some(
      (recommendation) =>
        hasSameRecommendationPair(recommendation, draft) &&
        (recommendation.status === "active" || recommendation.status === "requested"),
    )
  ) {
    issues.push({
      code: "DUPLICATE_RECOMMENDATION",
      message: "An active or requested recommendation already exists for this recipient and candidate.",
    });
  }

  if (seenRecommendationPairs?.has(pairKey)) {
    issues.push({
      code: "DUPLICATE_RECOMMENDATION_IN_BATCH",
      message: "This recommendation pair has already been accepted in the current persistence batch.",
    });
  }

  if (
    existingConnectionRequests.some(
      (connectionRequest) =>
        hasSameConnectionPair(connectionRequest, draft) &&
        (connectionRequest.status === "pending" || connectionRequest.status === "accepted"),
    )
  ) {
    issues.push({
      code: "CONNECTION_ALREADY_PENDING_OR_ACCEPTED",
      message: "A pending or accepted connection already exists for this recommendation pair.",
    });
  }

  if (issues.length > 0) {
    return {
      draft,
      issues,
      ok: false,
      pairKey,
    };
  }

  return {
    draft,
    ok: true,
    pairKey,
  };
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

export async function generateRecommendationExplanation(
  viewerProfile: RecommendationScoringProfile,
  scoredCandidate: ScoredRecommendationCandidate,
  options: RecommendationExplanationGenerationOptions = {},
): Promise<RecommendationExplanationGenerationResult> {
  const promptPayload = buildRecommendationExplanationPromptPayload(viewerProfile, scoredCandidate);
  const provider = options.provider === undefined ? createConfiguredOpenAiJsonProvider() : options.provider;

  if (provider) {
    const model = options.model ?? getConfiguredOpenAiJsonModelName();
    const response = await provider.generateJson({
      messages: promptPayload.messages,
      model,
      promptVersion: promptPayload.promptVersion,
      responseFormat: recommendationExplanationResponseFormat,
      temperature: options.temperature ?? 0.2,
    });
    const parsedOutput = parseRecommendationExplanationOutput(response.output);
    const metadata = {
      model: response.model,
      promptVersion: promptPayload.promptVersion,
      provider: response.provider,
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

  return generateRecommendationExplanationWithMockProvider(viewerProfile, scoredCandidate, {
    mockOutput: options.fallbackMockOutput ?? buildMockRecommendationExplanationOutput(scoredCandidate),
    model: "mock-recommendation-explainer",
    temperature: options.temperature,
  });
}

function buildCandidateProfileSummary(candidate: Pick<RecommendationCandidateProfile, "interests" | "modules" | "skills">) {
  const summaryParts = [
    candidate.modules.length > 0 ? `Modules: ${candidate.modules.slice(0, 3).join(", ")}` : null,
    candidate.interests.length > 0 ? `Interests: ${candidate.interests.slice(0, 3).join(", ")}` : null,
    candidate.skills.length > 0 ? `Skills: ${candidate.skills.slice(0, 3).join(", ")}` : null,
  ].filter((part): part is string => part !== null);

  return (summaryParts.join(". ") || "Campus-visible academic profile.").slice(0, 280);
}

export function buildPersistedRecommendationCard(row: PersistedRecommendationFeedRow): Recommendation {
  if (row.recommendedProfile.visibility === "private") {
    return recommendationSchema.parse({
      canRequestConnect: false,
      complementarySignals: [],
      conversationStarter: null,
      explanationSummary: "This recommendation is hidden because the profile is private.",
      generatedByJobId: row.recommendation.generatedByJobId,
      major: null,
      nickname: "Private profile",
      profileSummary: null,
      profileVisibility: "private",
      recommendationId: row.recommendation.id,
      recommendedUserId: null,
      sharedSignals: [],
      status: row.recommendation.status,
      year: null,
    });
  }

  return recommendationSchema.parse({
    canRequestConnect: true,
    complementarySignals: row.recommendation.complementarySignals,
    conversationStarter: row.recommendation.conversationStarter,
    explanationSummary: row.recommendation.explanationSummary,
    generatedByJobId: row.recommendation.generatedByJobId,
    major: row.recommendedProfile.major,
    nickname: row.recommendedProfile.nickname,
    profileSummary: buildCandidateProfileSummary(row.recommendedProfile),
    profileVisibility: row.recommendedProfile.visibility,
    recommendationId: row.recommendation.id,
    recommendedUserId: row.recommendedProfile.userId,
    sharedSignals: row.recommendation.sharedSignals,
    status: row.recommendation.status,
    year: row.recommendedProfile.year,
  });
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
  const explanationResult = await generateRecommendationExplanation(viewerProfile, scoredCandidate);

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

export async function buildRecommendationCardFromScoredCandidateWithJob(
  db: DbClient,
  actorUserId: string,
  viewerProfile: RecommendationScoringProfile,
  scoredCandidate: ScoredRecommendationCandidate,
): Promise<RecommendationCardBuildResult> {
  const result = await buildRecommendationCardFromScoredCandidate(viewerProfile, scoredCandidate);

  if (!result.ok) {
    await recordEvent(db, {
      eventType: "recommendation_generated",
      objectType: "recommendation",
      objectId: scoredCandidate.candidate.userId,
      metadata: {
        recipientUserId: actorUserId,
        recommendedUserId: scoredCandidate.candidate.userId,
        error: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT",
      },
    }, actorUserId);

    return result;
  }

  await recordEvent(db, {
    eventType: "recommendation_generated",
    objectType: "recommendation",
    objectId: result.item.recommendationId,
    metadata: {
      recipientUserId: actorUserId,
      recommendedUserId: result.item.recommendedUserId,
      score: scoredCandidate.score,
    },
  }, actorUserId);

  return result;
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

export async function listExistingActiveOrRequestedRecommendationsForUser(
  db: DbClient,
  recipientUserId: string,
): Promise<RecommendationPersistenceExistingRecommendation[]> {
  return db
    .select({
      recipientUserId: recommendations.recipientUserId,
      recommendedUserId: recommendations.recommendedUserId,
      status: recommendations.status,
    })
    .from(recommendations)
    .where(
      and(
        eq(recommendations.recipientUserId, recipientUserId),
        inArray(recommendations.status, ["active", "requested"]),
      ),
    );
}

export async function listExistingPendingOrAcceptedConnectionRequestsForUser(
  db: DbClient,
  userId: string,
): Promise<RecommendationPersistenceExistingConnectionRequest[]> {
  return db
    .select({
      requesterId: connectionRequests.requesterId,
      recipientId: connectionRequests.recipientId,
      status: connectionRequests.status,
    })
    .from(connectionRequests)
    .where(
      and(
        inArray(connectionRequests.status, ["pending", "accepted"]),
        or(eq(connectionRequests.requesterId, userId), eq(connectionRequests.recipientId, userId)),
      ),
    );
}

export async function listPersistedRecommendationFeedCardsForUser(
  db: DbClient,
  recipientUserId: string,
): Promise<RecommendationFeedData> {
  assertPermissionScope("recommendation:read");

  const rows = await db
    .select({
      recommendation: {
        complementarySignals: recommendations.complementarySignals,
        conversationStarter: recommendations.conversationStarter,
        explanationSummary: recommendations.explanationSummary,
        generatedByJobId: recommendations.generatedByJobId,
        id: recommendations.id,
        sharedSignals: recommendations.sharedSignals,
        status: recommendations.status,
      },
      recommendedProfile: {
        interests: academicProfiles.interests,
        major: academicProfiles.major,
        modules: academicProfiles.modules,
        nickname: academicProfiles.nickname,
        skills: academicProfiles.skills,
        userId: academicProfiles.userId,
        visibility: academicProfiles.visibility,
        year: academicProfiles.year,
      },
    })
    .from(recommendations)
    .innerJoin(academicProfiles, eq(recommendations.recommendedUserId, academicProfiles.userId))
    .where(and(eq(recommendations.recipientUserId, recipientUserId), eq(recommendations.status, "active")))
    .orderBy(desc(recommendations.createdAt));

  return {
    hasEnoughSignals: rows.length > 0,
    items: rows.map((row) =>
      buildPersistedRecommendationCard({
        ...row,
        recommendation: {
          ...row.recommendation,
          status: "active",
        },
      }),
    ),
  };
}

export async function insertRecommendationDraftsForUser(
  db: DbClient,
  actorUserId: string,
  drafts: RecommendationInsertDraft[],
): Promise<RecommendationPersistenceInsertResult> {
  const existingRecommendations = await listExistingActiveOrRequestedRecommendationsForUser(db, actorUserId);
  const existingConnectionRequests = await listExistingPendingOrAcceptedConnectionRequestsForUser(db, actorUserId);
  const seenRecommendationPairs = new Set<string>();
  const acceptedDrafts: RecommendationInsertDraft[] = [];
  const rejected: Extract<RecommendationPersistenceWriteGuardResult, { ok: false }>[] = [];

  drafts.forEach((draft) => {
    const guard = guardRecommendationPersistenceWrite({
      actorUserId,
      draft,
      existingConnectionRequests,
      existingRecommendations,
      seenRecommendationPairs,
    });

    if (!guard.ok) {
      rejected.push(guard);
      return;
    }

    seenRecommendationPairs.add(guard.pairKey);
    acceptedDrafts.push(guard.draft);
  });

  if (acceptedDrafts.length === 0) {
    return {
      inserted: [],
      rejected,
    };
  }

  const inserted = await db
    .insert(recommendations)
    .values(acceptedDrafts)
    .returning({
      id: recommendations.id,
      recipientUserId: recommendations.recipientUserId,
      recommendedUserId: recommendations.recommendedUserId,
      status: recommendations.status,
    });

  await Promise.all(
    inserted.map((row) =>
      recordEvent(db, {
        eventType: "recommendation_generated",
        objectType: "recommendation",
        objectId: row.id,
        metadata: {
          recipientUserId: row.recipientUserId,
          recommendedUserId: row.recommendedUserId,
          status: row.status,
        },
      }, actorUserId),
    ),
  );

  return {
    inserted,
    rejected,
  };
}

export async function getCurrentUserRecommendationFeed(): Promise<RecommendationFeedData> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return listPersistedRecommendationFeedCardsForUser(db, gate.session.userId);
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

export async function buildRecommendationPersistenceDryRunForUser(
  db: DbClient,
  actorUserId: string,
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationPersistenceDryRunResult> {
  const profile = await getAcademicProfileForUser(db, actorUserId);

  if (!profile) {
    return {
      drafts: [],
      dryRun: true,
      hasEnoughSignals: false,
      items: [],
    };
  }

  const candidates = await listCampusVisibleRecommendationCandidates(db, actorUserId, options);
  const existingRecommendations = await listExistingActiveOrRequestedRecommendationsForUser(db, actorUserId);
  const existingConnectionRequests = await listExistingPendingOrAcceptedConnectionRequestsForUser(db, actorUserId);
  const scoredCandidates = scoreRecommendationCandidates(profile, candidates);
  const seenRecommendationPairs = new Set<string>();
  const buildResults = await Promise.all(
    scoredCandidates.map(async (scoredCandidate) => {
      const generation = await generateRecommendationExplanation(profile, scoredCandidate);

      if (!generation.ok) {
        await recordEvent(db, {
          eventType: "recommendation_generated",
          objectType: "recommendation",
          objectId: scoredCandidate.candidate.userId,
          metadata: {
            recipientUserId: actorUserId,
            recommendedUserId: scoredCandidate.candidate.userId,
            error: "INVALID_RECOMMENDATION_EXPLANATION_OUTPUT",
          },
        }, actorUserId);

        return null;
      }

      const card = buildRecommendationCardFromSuccessfulGeneration(scoredCandidate, generation);
      await recordEvent(db, {
        eventType: "recommendation_generated",
        objectType: "recommendation",
        objectId: card.recommendationId,
        metadata: {
          recipientUserId: actorUserId,
          recommendedUserId: card.recommendedUserId,
          score: scoredCandidate.score,
        },
      }, actorUserId);

      const draft = buildRecommendationInsertDraft({
        card,
        generation,
        recipientUserId: actorUserId,
        scoredCandidate,
      });
      const guard = guardRecommendationPersistenceWrite({
        actorUserId,
        draft,
        existingConnectionRequests,
        existingRecommendations,
        seenRecommendationPairs,
      });

      if (!guard.ok) {
        return null;
      }

      seenRecommendationPairs.add(guard.pairKey);

      return {
        card,
        draft: guard.draft,
      };
    }),
  );
  const persistableResults = buildResults.filter(
    (result): result is RecommendationPersistenceDryRunEntry => result !== null,
  );

  return {
    drafts: persistableResults.map((result) => result.draft),
    dryRun: true,
    hasEnoughSignals: persistableResults.length > 0,
    items: persistableResults.map((result) => result.card),
  };
}

export async function getCurrentUserRecommendationPersistenceDryRun(
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationPersistenceDryRunResult> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return buildRecommendationPersistenceDryRunForUser(db, gate.session.userId, options);
}

export async function persistCurrentUserRecommendationDryRunDrafts(
  options: RecommendationCandidateOptions = {},
): Promise<RecommendationPersistenceInsertResult> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();
  const dryRun = await buildRecommendationPersistenceDryRunForUser(db, gate.session.userId, options);

  return insertRecommendationDraftsForUser(db, gate.session.userId, dryRun.drafts);
}
