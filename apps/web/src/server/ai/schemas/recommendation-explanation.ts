import { z } from "zod";

export const recommendationExplanationOutputSchema = z.object({
  explanationSummary: z.string().trim().min(1).max(320),
  sharedSignals: z.array(z.string().trim().min(1).max(100)).max(6),
  complementarySignals: z.array(z.string().trim().min(1).max(100)).max(6),
  conversationStarter: z.string().trim().min(1).max(200),
});

export type RecommendationExplanationOutput = z.infer<typeof recommendationExplanationOutputSchema>;
