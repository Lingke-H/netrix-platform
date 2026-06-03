import { z } from "zod";

import { majorSchema, studyYearSchema } from "@/features/profile/schemas";

export const recommendationStatusSchema = z.enum([
  "generated",
  "viewed",
  "dismissed",
  "requested",
  "connected",
]);

export const recommendationSchema = z.object({
  recommendationId: z.string().uuid(),
  recommendedUserId: z.string().uuid(),
  nickname: z.string().trim().min(2).max(40),
  major: majorSchema,
  year: studyYearSchema,
  profileSummary: z.string().trim().min(1).max(280),
  sharedSignals: z.array(z.string().trim().min(1).max(100)).max(6),
  complementarySignals: z.array(z.string().trim().min(1).max(100)).max(6),
  explanationSummary: z.string().trim().min(1).max(320),
  conversationStarter: z.string().trim().min(1).max(200),
  status: recommendationStatusSchema,
});

export const recommendationActionInputSchema = z.object({
  recommendationId: z.string().uuid(),
  action: z.enum(["dismiss", "request-connect"]),
});

export type RecommendationStatus = z.infer<typeof recommendationStatusSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type RecommendationActionInput = z.infer<typeof recommendationActionInputSchema>;
