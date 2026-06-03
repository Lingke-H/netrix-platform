import { z } from "zod";

export const messagePermissionStatusSchema = z.enum(["locked", "available"]);

export const messageSchema = z.object({
  id: z.string().uuid(),
  threadId: z.string().uuid(),
  senderUserId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
  createdAt: z.string().datetime(),
});

export const messageThreadSchema = z.object({
  id: z.string().uuid(),
  connectionId: z.string().uuid(),
  participantUserIds: z.array(z.string().uuid()).length(2),
  permissionStatus: messagePermissionStatusSchema,
  lastMessageAt: z.string().datetime().nullable(),
});

export const createMessageInputSchema = z.object({
  threadId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export type MessagePermissionStatus = z.infer<typeof messagePermissionStatusSchema>;
export type Message = z.infer<typeof messageSchema>;
export type MessageThread = z.infer<typeof messageThreadSchema>;
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
