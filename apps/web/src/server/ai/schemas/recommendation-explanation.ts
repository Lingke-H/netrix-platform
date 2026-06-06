import { z } from "zod";

import { majorSchema, studyYearSchema } from "@/features/profile/schemas";

const recommendationSignalListSchema = z.array(z.string().trim().min(1).max(100)).max(12);

export const recommendationExplanationInputSchema = z.object({
  viewerProfile: z.object({
    collaborationPreference: recommendationSignalListSchema,
    helpNeeded: recommendationSignalListSchema,
    helpOffered: recommendationSignalListSchema,
    interests: recommendationSignalListSchema,
    modules: recommendationSignalListSchema,
    skills: recommendationSignalListSchema,
  }),
  candidateProfile: z.object({
    collaborationPreference: recommendationSignalListSchema,
    helpNeeded: recommendationSignalListSchema,
    helpOffered: recommendationSignalListSchema,
    interests: recommendationSignalListSchema,
    major: majorSchema,
    modules: recommendationSignalListSchema,
    nickname: z.string().trim().min(2).max(40),
    skills: recommendationSignalListSchema,
    userId: z.string().uuid(),
    visibility: z.literal("campus"),
    year: studyYearSchema,
  }),
  ruleScore: z.object({
    complementarySignals: z.array(z.string().trim().min(1).max(100)).max(12),
    score: z.number().int().nonnegative(),
    scoreSummary: z.object({
      collaborationPreferenceOverlap: z.number().int().nonnegative(),
      helpComplementarity: z.number().int().nonnegative(),
      interestOverlap: z.number().int().nonnegative(),
      moduleOverlap: z.number().int().nonnegative(),
      skillOverlap: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
    sharedSignals: z.array(z.string().trim().min(1).max(100)).max(12),
  }),
});

export const recommendationExplanationOutputSchema = z.object({
  explanationSummary: z.string().trim().min(1).max(320),
  sharedSignals: z.array(z.string().trim().min(1).max(100)).max(6),
  complementarySignals: z.array(z.string().trim().min(1).max(100)).max(6),
  conversationStarter: z.string().trim().min(1).max(200),
});

export type RecommendationExplanationInput = z.infer<typeof recommendationExplanationInputSchema>;
export type RecommendationExplanationOutput = z.infer<typeof recommendationExplanationOutputSchema>;
