import { z } from "zod";

export const nicknameSuggestionOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        nickname: z.string().trim().min(2).max(40),
        rationale: z.string().trim().min(1).max(120),
      }),
    )
    .min(1)
    .max(5),
});

export type NicknameSuggestionOutput = z.infer<typeof nicknameSuggestionOutputSchema>;
