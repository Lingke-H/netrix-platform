import { z } from "zod";

export const eventNameSchema = z.enum([
  "profile_completed",
  "post_created",
  "ai_portrait_generated",
  "recommendation_generated",
  "recommendation_clicked",
  "connection_requested",
  "connection_accepted",
  "message_sent",
]);

export const appEventSchema = z.object({
  eventType: eventNameSchema,
  objectType: z.string().trim().min(1).max(80),
  objectId: z.string().trim().min(1).max(80),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
});

export type EventName = z.infer<typeof eventNameSchema>;
export type AppEventDto = z.infer<typeof appEventSchema>;
