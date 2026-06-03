import { z } from "zod";

export const campusEmailDomainSchema = z.literal("nottingham.edu.cn");

export const campusEmailSchema = z
  .string()
  .trim()
  .email()
  .refine((value) => value.toLowerCase().endsWith("@nottingham.edu.cn"), {
    message: "Only UNNC campus email addresses are allowed.",
  });

export const authViewStateSchema = z.enum([
  "signed_out",
  "email_verification_pending",
  "signed_in",
  "session_expired",
]);

export const authSessionSummarySchema = z.object({
  userId: z.string().uuid(),
  email: campusEmailSchema,
  authState: authViewStateSchema,
});

export type AuthViewState = z.infer<typeof authViewStateSchema>;
export type AuthSessionSummary = z.infer<typeof authSessionSummarySchema>;
