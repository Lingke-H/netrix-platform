import { and, asc, desc, eq, or } from "drizzle-orm";

import {
  createMessageInputSchema,
  messageSchema,
  messageThreadSchema,
  type CreateMessageInput,
  type Message,
  type MessageThread,
} from "@/features/messages/schemas";
import type { MessageThreadData } from "@/features/messages/types";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";
import { createDb, type DbClient } from "@/server/db/client";
import { connections, messages, messageThreads } from "@/server/db/schema";
import { assertPermissionScope, canAccessMessages } from "@/server/permissions";

export type MessageThreadReadRow = {
  connectionId: string;
  connectionStatus: "active" | "archived";
  id: string;
  lastMessageAt: Date | null;
  permissionStatus: "locked" | "available";
  userAId: string;
  userBId: string;
};

export type MessageReadRow = {
  body: string;
  createdAt: Date;
  id: string;
  readAt: Date | null;
  senderId: string;
  threadId: string;
};

export type MessageThreadReadGuardIssueCode =
  | "MESSAGE_THREAD_NOT_FOUND"
  | "MESSAGE_THREAD_NOT_AVAILABLE"
  | "ACTOR_NOT_CONNECTION_PARTICIPANT"
  | "CONNECTION_NOT_ACCEPTED";

export type MessageThreadReadGuardIssue = {
  code: MessageThreadReadGuardIssueCode;
  message: string;
};

export type MessageCreateResult = Message;

export type MessageCreateGuardIssueCode =
  | "MESSAGE_THREAD_NOT_FOUND"
  | "MESSAGE_THREAD_NOT_AVAILABLE"
  | "ACTOR_NOT_CONNECTION_PARTICIPANT"
  | "CONNECTION_NOT_ACCEPTED";

export type MessageCreateGuardIssue = {
  code: MessageCreateGuardIssueCode;
  message: string;
};

export type MessageThreadReadGuardInput = {
  actorUserId: string;
  thread: MessageThreadReadRow | null;
};

export type MessageThreadReadGuardResult =
  | {
      ok: true;
      thread: MessageThreadReadRow;
    }
  | {
      issues: MessageThreadReadGuardIssue[];
      ok: false;
      thread: MessageThreadReadRow | null;
    };

export type MessageCreateGuardInput = {
  actorUserId: string;
  input: CreateMessageInput;
  thread: MessageThreadReadRow | null;
};

export type MessageCreateGuardResult =
  | {
      input: CreateMessageInput;
      ok: true;
      thread: MessageThreadReadRow;
    }
  | {
      input: CreateMessageInput;
      issues: MessageCreateGuardIssue[];
      ok: false;
      thread: MessageThreadReadRow | null;
    };

export class CreateMessageError extends Error {
  constructor(
    message: string,
    public readonly code: "MESSAGE_INPUT_INVALID" | "MESSAGE_CREATE_NOT_ALLOWED" | "MESSAGE_CREATE_FAILED",
    public readonly issues: MessageCreateGuardIssue[] = [],
  ) {
    super(message);
    this.name = "CreateMessageError";
  }
}

export function buildMessageDto(row: MessageReadRow): Message {
  return messageSchema.parse({
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    readAt: row.readAt?.toISOString() ?? null,
    senderId: row.senderId,
    threadId: row.threadId,
  });
}

export function buildMessageThreadDto(thread: MessageThreadReadRow): MessageThread {
  return messageThreadSchema.parse({
    connectionId: thread.connectionId,
    id: thread.id,
    lastMessageAt: thread.lastMessageAt?.toISOString() ?? null,
    participantUserIds: [thread.userAId, thread.userBId],
    permissionStatus: thread.permissionStatus,
  });
}

export function buildMessageThreadData(thread: MessageThreadReadRow, messageRows: MessageReadRow[]): MessageThreadData {
  return {
    messages: messageRows.map(buildMessageDto),
    thread: buildMessageThreadDto(thread),
  };
}

export function parseCreateMessageInput(input: unknown): CreateMessageInput {
  const parsedInput = createMessageInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new CreateMessageError("Message input is invalid.", "MESSAGE_INPUT_INVALID");
  }

  return parsedInput.data;
}

export function guardMessageThreadRead({
  actorUserId,
  thread,
}: MessageThreadReadGuardInput): MessageThreadReadGuardResult {
  assertPermissionScope("message:read");

  if (!thread) {
    return {
      issues: [
        {
          code: "MESSAGE_THREAD_NOT_FOUND",
          message: "Message thread does not exist.",
        },
      ],
      ok: false,
      thread,
    };
  }

  const issues: MessageThreadReadGuardIssue[] = [];
  const actorIsParticipant = thread.userAId === actorUserId || thread.userBId === actorUserId;
  const connectionAccepted = actorIsParticipant && thread.connectionStatus === "active";

  if (thread.permissionStatus !== "available") {
    issues.push({
      code: "MESSAGE_THREAD_NOT_AVAILABLE",
      message: "Message thread is not available for reading.",
    });
  }

  if (!actorIsParticipant) {
    issues.push({
      code: "ACTOR_NOT_CONNECTION_PARTICIPANT",
      message: "Only accepted connection participants can read this message thread.",
    });
  }

  if (
    !canAccessMessages({
      actorUserId,
      connectionAccepted,
      targetUserId: actorUserId === thread.userAId ? thread.userBId : thread.userAId,
    })
  ) {
    issues.push({
      code: "CONNECTION_NOT_ACCEPTED",
      message: "Messages are readable only after the connection has been accepted.",
    });
  }

  if (issues.length > 0) {
    return {
      issues,
      ok: false,
      thread,
    };
  }

  return {
    ok: true,
    thread,
  };
}

export function guardMessageCreate({
  actorUserId,
  input,
  thread,
}: MessageCreateGuardInput): MessageCreateGuardResult {
  assertPermissionScope("message:create");

  if (!thread) {
    return {
      input,
      issues: [
        {
          code: "MESSAGE_THREAD_NOT_FOUND",
          message: "Message thread does not exist.",
        },
      ],
      ok: false,
      thread,
    };
  }

  const issues: MessageCreateGuardIssue[] = [];
  const actorIsParticipant = thread.userAId === actorUserId || thread.userBId === actorUserId;
  const connectionAccepted = actorIsParticipant && thread.connectionStatus === "active";

  if (thread.id !== input.threadId) {
    issues.push({
      code: "MESSAGE_THREAD_NOT_FOUND",
      message: "Message thread does not match the create request.",
    });
  }

  if (thread.permissionStatus !== "available") {
    issues.push({
      code: "MESSAGE_THREAD_NOT_AVAILABLE",
      message: "Message thread is not available for sending.",
    });
  }

  if (!actorIsParticipant) {
    issues.push({
      code: "ACTOR_NOT_CONNECTION_PARTICIPANT",
      message: "Only accepted connection participants can send messages in this thread.",
    });
  }

  if (
    !canAccessMessages({
      actorUserId,
      connectionAccepted,
      targetUserId: actorUserId === thread.userAId ? thread.userBId : thread.userAId,
    })
  ) {
    issues.push({
      code: "CONNECTION_NOT_ACCEPTED",
      message: "Messages can be sent only after the connection has been accepted.",
    });
  }

  if (issues.length > 0) {
    return {
      input,
      issues,
      ok: false,
      thread,
    };
  }

  return {
    input,
    ok: true,
    thread,
  };
}

function isMessageThreadId(value: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value,
  );
}

export async function getMessageThreadForRead(
  db: DbClient,
  threadId: string,
): Promise<MessageThreadReadRow | null> {
  if (!isMessageThreadId(threadId)) {
    return null;
  }

  const [thread] = await db
    .select({
      connectionId: messageThreads.connectionId,
      connectionStatus: connections.status,
      id: messageThreads.id,
      lastMessageAt: messageThreads.lastMessageAt,
      permissionStatus: messageThreads.permissionStatus,
      userAId: connections.userAId,
      userBId: connections.userBId,
    })
    .from(messageThreads)
    .innerJoin(connections, eq(messageThreads.connectionId, connections.id))
    .where(eq(messageThreads.id, threadId))
    .limit(1);

  return thread ?? null;
}

export async function listMessagesForThread(db: DbClient, threadId: string): Promise<MessageReadRow[]> {
  return db
    .select({
      body: messages.body,
      createdAt: messages.createdAt,
      id: messages.id,
      readAt: messages.readAt,
      senderId: messages.senderId,
      threadId: messages.threadId,
    })
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt));
}

export async function listAcceptedMessageThreadsForUser(
  db: DbClient,
  actorUserId: string,
): Promise<MessageThread[]> {
  assertPermissionScope("message:read");

  const rows = await db
    .select({
      connectionId: messageThreads.connectionId,
      connectionStatus: connections.status,
      id: messageThreads.id,
      lastMessageAt: messageThreads.lastMessageAt,
      permissionStatus: messageThreads.permissionStatus,
      userAId: connections.userAId,
      userBId: connections.userBId,
    })
    .from(messageThreads)
    .innerJoin(connections, eq(messageThreads.connectionId, connections.id))
    .where(
      and(
        eq(messageThreads.permissionStatus, "available"),
        eq(connections.status, "active"),
        or(eq(connections.userAId, actorUserId), eq(connections.userBId, actorUserId)),
      ),
    )
    .orderBy(desc(messageThreads.lastMessageAt), desc(messageThreads.createdAt));

  return rows.map((row) =>
    buildMessageThreadDto({
      ...row,
      connectionStatus: "active",
      permissionStatus: "available",
    }),
  );
}

export async function getAcceptedMessageThreadDataForUser(
  db: DbClient,
  actorUserId: string,
  threadId: string,
): Promise<MessageThreadData | null> {
  const thread = await getMessageThreadForRead(db, threadId);
  const guard = guardMessageThreadRead({
    actorUserId,
    thread,
  });

  if (!guard.ok) {
    return null;
  }

  const messageRows = await listMessagesForThread(db, guard.thread.id);

  return buildMessageThreadData(guard.thread, messageRows);
}

export async function createMessageForUser(
  db: DbClient,
  actorUserId: string,
  input: unknown,
): Promise<MessageCreateResult> {
  const parsedInput = parseCreateMessageInput(input);
  const thread = await getMessageThreadForRead(db, parsedInput.threadId);
  const guard = guardMessageCreate({
    actorUserId,
    input: parsedInput,
    thread,
  });

  if (!guard.ok) {
    throw new CreateMessageError("Message create is not allowed.", "MESSAGE_CREATE_NOT_ALLOWED", guard.issues);
  }

  return db.transaction(async (tx) => {
    const [createdMessage] = await tx
      .insert(messages)
      .values({
        body: parsedInput.body,
        senderId: actorUserId,
        threadId: guard.thread.id,
      })
      .returning({
        body: messages.body,
        createdAt: messages.createdAt,
        id: messages.id,
        readAt: messages.readAt,
        senderId: messages.senderId,
        threadId: messages.threadId,
      });

    if (!createdMessage) {
      throw new CreateMessageError("Unable to create the message.", "MESSAGE_CREATE_FAILED");
    }

    const [updatedThread] = await tx
      .update(messageThreads)
      .set({
        lastMessageAt: createdMessage.createdAt,
      })
      .where(eq(messageThreads.id, guard.thread.id))
      .returning({
        id: messageThreads.id,
      });

    if (!updatedThread) {
      throw new CreateMessageError("Unable to update the message thread.", "MESSAGE_CREATE_FAILED");
    }

    return buildMessageDto(createdMessage);
  });
}

export async function getCurrentUserAcceptedMessageThreadData(threadId: string): Promise<MessageThreadData | null> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return getAcceptedMessageThreadDataForUser(db, gate.session.userId, threadId);
}

export async function getCurrentUserAcceptedMessageThreads(): Promise<MessageThread[]> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return listAcceptedMessageThreadsForUser(db, gate.session.userId);
}

export async function createCurrentUserMessage(input: unknown): Promise<MessageCreateResult> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return createMessageForUser(db, gate.session.userId, input);
}
