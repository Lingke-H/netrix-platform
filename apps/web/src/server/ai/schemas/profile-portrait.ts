import { z } from "zod";

export const profilePortraitOutputSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  currentFocus: z.array(z.string().trim().min(1).max(100)).max(6),
  collaborationStyle: z.string().trim().min(1).max(240),
  strengths: z.array(z.string().trim().min(1).max(100)).max(6),
  suggestedTopics: z.array(z.string().trim().min(1).max(100)).max(6),
});

export type ProfilePortraitOutput = z.infer<typeof profilePortraitOutputSchema>;
