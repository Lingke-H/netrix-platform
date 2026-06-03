import { z } from "zod";

export const connectionRequestStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]);

export const connectionStatusSchema = z.enum(["active", "archived"]);

export const connectionRequestSchema = z.object({
  id: z.string().uuid(),
  requesterUserId: z.string().uuid(),
  recipientUserId: z.string().uuid(),
  recommendationId: z.string().uuid().nullable(),
  messagePreview: z.string().trim().min(1).max(240).nullable(),
  status: connectionRequestStatusSchema,
  createdAt: z.string().datetime(),
  respondedAt: z.string().datetime().nullable(),
});

export const connectionSchema = z.object({
  id: z.string().uuid(),
  userAId: z.string().uuid(),
  userBId: z.string().uuid(),
  requestId: z.string().uuid(),
  status: connectionStatusSchema,
  connectedAt: z.string().datetime(),
});

export const connectionRequestActionSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["accept", "reject", "cancel"]),
});

export type ConnectionRequestStatus = z.infer<typeof connectionRequestStatusSchema>;
export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;
export type ConnectionRequest = z.infer<typeof connectionRequestSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type ConnectionRequestAction = z.infer<typeof connectionRequestActionSchema>;
