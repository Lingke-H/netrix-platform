import { z } from "zod";

import { majorSchema, studyYearSchema, type Visibility } from "@/features/profile/schemas";

export const recommendationStatusSchema = z.enum([
  "active",
  "dismissed",
  "requested",
  "expired",
]);

export const visibleRecommendationProfileSchema = z.object({
  canRequestConnect: z.literal(true),
  major: majorSchema,
  nickname: z.string().trim().min(2).max(40),
  profileSummary: z.string().trim().min(1).max(280),
  profileVisibility: z.enum(["campus", "public"]),
  recommendedUserId: z.string().uuid(),
  year: studyYearSchema,
});

export const privateRecommendationProfileSchema = z.object({
  canRequestConnect: z.literal(false),
  major: z.null(),
  nickname: z.literal("Private profile"),
  profileSummary: z.null(),
  profileVisibility: z.literal("private"),
  recommendedUserId: z.null(),
  year: z.null(),
});

export const recommendationBaseSchema = z.object({
  recommendationId: z.string().uuid(),
  generatedByJobId: z.string().uuid().nullable(),
  status: recommendationStatusSchema,
});

export const visibleRecommendationSchema = recommendationBaseSchema
  .extend({
    sharedSignals: z.array(z.string().trim().min(1).max(100)).max(6),
    complementarySignals: z.array(z.string().trim().min(1).max(100)).max(6),
    explanationSummary: z.string().trim().min(1).max(320),
    conversationStarter: z.string().trim().min(1).max(200),
  })
  .merge(visibleRecommendationProfileSchema);

export const privateRecommendationSchema = recommendationBaseSchema
  .extend({
    sharedSignals: z.array(z.never()).max(0),
    complementarySignals: z.array(z.never()).max(0),
    explanationSummary: z.literal("This recommendation is hidden because the profile is private."),
    conversationStarter: z.null(),
  })
  .merge(privateRecommendationProfileSchema);

export const recommendationProfileSchema = z.discriminatedUnion("profileVisibility", [
  visibleRecommendationProfileSchema,
  privateRecommendationProfileSchema,
]);

export const recommendationSchema = z.discriminatedUnion("profileVisibility", [
  visibleRecommendationSchema,
  privateRecommendationSchema,
]);

export const recommendationActionInputSchema = z.object({
  recommendationId: z.string().uuid(),
  action: z.enum(["dismiss", "request-connect"]),
});

export type RecommendationStatus = z.infer<typeof recommendationStatusSchema>;
export type RecommendationProfileVisibility = Visibility;
export type RecommendationProfile = z.infer<typeof recommendationProfileSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type RecommendationActionInput = z.infer<typeof recommendationActionInputSchema>;
