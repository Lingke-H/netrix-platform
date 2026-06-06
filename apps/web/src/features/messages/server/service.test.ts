import { describe, expect, it, vi } from "vitest";

import {
  buildMessageDto,
  buildMessageThreadDto,
  buildMessageThreadData,
  CreateMessageError,
  guardMessageCreate,
  guardMessageThreadRead,
  parseCreateMessageInput,
  type MessageReadRow,
  type MessageThreadReadRow,
} from "@/features/messages/server/service";

vi.mock("@/server/events/record", () => ({
  recordEvent: vi.fn(() => Promise.resolve({ id: "event-1" })),
}));

const actorUserId = "11111111-1111-4111-8111-111111111111";
const peerUserId = "22222222-2222-4222-8222-222222222222";
const outsiderUserId = "33333333-3333-4333-8333-333333333333";
const connectionId = "44444444-4444-4444-8444-444444444444";
const threadId = "55555555-5555-4555-8555-555555555555";
const messageId = "66666666-6666-4666-8666-666666666666";
const mismatchedThreadId = "77777777-7777-4777-8777-777777777777";

const availableAcceptedThread = {
  connectionId,
  connectionStatus: "active",
  id: threadId,
  lastMessageAt: new Date("2026-06-05T10:30:00.000Z"),
  permissionStatus: "available",
  userAId: actorUserId,
  userBId: peerUserId,
} satisfies MessageThreadReadRow;

const messageRow = {
  body: "Could we compare COMP1048 debugging notes?",
  createdAt: new Date("2026-06-05T10:00:00.000Z"),
  id: messageId,
  readAt: null,
  senderId: actorUserId,
  threadId,
} satisfies MessageReadRow;

describe("accepted message create service", () => {
  it("normalizes valid message input", () => {
    expect(
      parseCreateMessageInput({
        body: "  Could we compare COMP1048 debugging notes?  ",
        threadId,
      }),
    ).toEqual({
      body: "Could we compare COMP1048 debugging notes?",
      threadId,
    });
  });

  it("normalizes message form input", () => {
    const formData = new FormData();
    formData.set("body", "  Could we compare COMP1048 debugging notes?  ");
    formData.set("threadId", threadId);

    expect(parseCreateMessageInput(formData)).toEqual({
      body: "Could we compare COMP1048 debugging notes?",
      threadId,
    });
  });

  it("rejects invalid message input", () => {
    expect(() =>
      parseCreateMessageInput({
        body: "",
        threadId,
      }),
    ).toThrow(CreateMessageError);
  });

  it("allows a participant to send in an available active connection thread", () => {
    expect(
      guardMessageCreate({
        actorUserId,
        input: {
          body: "Could we compare COMP1048 debugging notes?",
          threadId,
        },
        thread: availableAcceptedThread,
      }),
    ).toEqual({
      input: {
        body: "Could we compare COMP1048 debugging notes?",
        threadId,
      },
      ok: true,
      thread: availableAcceptedThread,
    });
  });

  it("rejects missing, mismatched, locked, non-participant, and archived connection threads", () => {
    expect(
      guardMessageCreate({
        actorUserId,
        input: {
          body: "Could we compare COMP1048 debugging notes?",
          threadId,
        },
        thread: null,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "MESSAGE_THREAD_NOT_FOUND" })],
      ok: false,
    });

    expect(
      guardMessageCreate({
        actorUserId,
        input: {
          body: "Could we compare COMP1048 debugging notes?",
          threadId: mismatchedThreadId,
        },
        thread: availableAcceptedThread,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "MESSAGE_THREAD_NOT_FOUND" })],
      ok: false,
    });

    expect(
      guardMessageCreate({
        actorUserId,
        input: {
          body: "Could we compare COMP1048 debugging notes?",
          threadId,
        },
        thread: {
          ...availableAcceptedThread,
          permissionStatus: "locked",
        },
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "MESSAGE_THREAD_NOT_AVAILABLE" })],
      ok: false,
    });

    expect(
      guardMessageCreate({
        actorUserId: outsiderUserId,
        input: {
          body: "Could we compare COMP1048 debugging notes?",
          threadId,
        },
        thread: availableAcceptedThread,
      }),
    ).toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "ACTOR_NOT_CONNECTION_PARTICIPANT" }),
        expect.objectContaining({ code: "CONNECTION_NOT_ACCEPTED" }),
      ]),
      ok: false,
    });

    expect(
      guardMessageCreate({
        actorUserId,
        input: {
          body: "Could we compare COMP1048 debugging notes?",
          threadId,
        },
        thread: {
          ...availableAcceptedThread,
          connectionStatus: "archived",
        },
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "CONNECTION_NOT_ACCEPTED" })],
      ok: false,
    });
  });
});

describe("accepted message thread read service", () => {
  it("builds accepted thread DTOs with participants and nullable last message time", () => {
    expect(buildMessageThreadDto(availableAcceptedThread)).toEqual({
      connectionId,
      id: threadId,
      lastMessageAt: "2026-06-05T10:30:00.000Z",
      participantUserIds: [actorUserId, peerUserId],
      permissionStatus: "available",
    });

    expect(
      buildMessageThreadDto({
        ...availableAcceptedThread,
        lastMessageAt: null,
      }).lastMessageAt,
    ).toBeNull();
  });

  it("builds message DTOs with ISO timestamps", () => {
    expect(buildMessageDto(messageRow)).toEqual({
      body: "Could we compare COMP1048 debugging notes?",
      createdAt: "2026-06-05T10:00:00.000Z",
      id: messageId,
      readAt: null,
      senderId: actorUserId,
      threadId,
    });

    expect(
      buildMessageDto({
        ...messageRow,
        readAt: new Date("2026-06-05T11:00:00.000Z"),
      }).readAt,
    ).toBe("2026-06-05T11:00:00.000Z");
  });

  it("builds accepted thread data with participants and ordered message payloads", () => {
    expect(buildMessageThreadData(availableAcceptedThread, [messageRow])).toEqual({
      messages: [buildMessageDto(messageRow)],
      thread: {
        connectionId,
        id: threadId,
        lastMessageAt: "2026-06-05T10:30:00.000Z",
        participantUserIds: [actorUserId, peerUserId],
        permissionStatus: "available",
      },
    });
  });

  it("allows a participant to read an available active connection thread", () => {
    expect(
      guardMessageThreadRead({
        actorUserId,
        thread: availableAcceptedThread,
      }),
    ).toEqual({
      ok: true,
      thread: availableAcceptedThread,
    });
  });

  it("rejects missing, locked, non-participant, and archived connection threads", () => {
    expect(
      guardMessageThreadRead({
        actorUserId,
        thread: null,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "MESSAGE_THREAD_NOT_FOUND" })],
      ok: false,
    });

    expect(
      guardMessageThreadRead({
        actorUserId,
        thread: {
          ...availableAcceptedThread,
          permissionStatus: "locked",
        },
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "MESSAGE_THREAD_NOT_AVAILABLE" })],
      ok: false,
    });

    expect(
      guardMessageThreadRead({
        actorUserId: outsiderUserId,
        thread: availableAcceptedThread,
      }),
    ).toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "ACTOR_NOT_CONNECTION_PARTICIPANT" }),
        expect.objectContaining({ code: "CONNECTION_NOT_ACCEPTED" }),
      ]),
      ok: false,
    });

    expect(
      guardMessageThreadRead({
        actorUserId,
        thread: {
          ...availableAcceptedThread,
          connectionStatus: "archived",
        },
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "CONNECTION_NOT_ACCEPTED" })],
      ok: false,
    });
  });
});
