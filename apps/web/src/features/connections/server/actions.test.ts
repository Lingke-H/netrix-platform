import { beforeEach, describe, expect, it, vi } from "vitest";

const createCurrentUserConnectionRequestMock = vi.hoisted(() => vi.fn());
const respondToCurrentUserConnectionRequestMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/connections/server/service", () => ({
  createCurrentUserConnectionRequest: createCurrentUserConnectionRequestMock,
  respondToCurrentUserConnectionRequest: respondToCurrentUserConnectionRequestMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import {
  createConnectionRequestAction,
  respondToConnectionRequestAction,
} from "@/features/connections/server/actions";

describe("connection server actions", () => {
  beforeEach(() => {
    createCurrentUserConnectionRequestMock.mockReset();
    respondToCurrentUserConnectionRequestMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("creates a connection request and revalidates recommendation and connection surfaces", async () => {
    const input = {
      message: "Could we compare COMP1048 debugging notes?",
      recommendationId: "33333333-3333-4333-8333-333333333333",
      recipientId: "22222222-2222-4222-8222-222222222222",
    };
    const result = {
      id: "55555555-5555-4555-8555-555555555555",
      recommendationId: input.recommendationId,
      recipientId: input.recipientId,
      requesterId: "11111111-1111-4111-8111-111111111111",
      status: "pending",
    };

    createCurrentUserConnectionRequestMock.mockResolvedValue(result);

    await expect(createConnectionRequestAction(input)).resolves.toBe(result);
    expect(createCurrentUserConnectionRequestMock).toHaveBeenCalledWith(input);
    expect(revalidatePathMock).toHaveBeenCalledWith("/recommendations");
    expect(revalidatePathMock).toHaveBeenCalledWith("/connections");
  });

  it("propagates connection request errors without revalidating stale surfaces", async () => {
    const input = {
      recommendationId: "33333333-3333-4333-8333-333333333333",
      recipientId: "22222222-2222-4222-8222-222222222222",
    };
    const error = new Error("Connection request is not allowed.");

    createCurrentUserConnectionRequestMock.mockRejectedValue(error);

    await expect(createConnectionRequestAction(input)).rejects.toBe(error);
    expect(createCurrentUserConnectionRequestMock).toHaveBeenCalledWith(input);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("responds to a connection request and revalidates connection and message surfaces", async () => {
    const input = {
      action: "accept",
      requestId: "55555555-5555-4555-8555-555555555555",
    };
    const result = {
      connection: {
        id: "44444444-4444-4444-8444-444444444444",
        recipientId: "22222222-2222-4222-8222-222222222222",
        requesterId: "11111111-1111-4111-8111-111111111111",
        status: "active",
      },
      messageThread: {
        connectionId: "44444444-4444-4444-8444-444444444444",
        id: "66666666-6666-4666-8666-666666666666",
        permissionStatus: "available",
      },
      request: {
        id: input.requestId,
        recipientId: "22222222-2222-4222-8222-222222222222",
        requesterId: "11111111-1111-4111-8111-111111111111",
        respondedAt: new Date("2026-06-06T10:00:00.000Z"),
        status: "accepted",
      },
    };

    respondToCurrentUserConnectionRequestMock.mockResolvedValue(result);

    await expect(respondToConnectionRequestAction(input)).resolves.toBe(result);
    expect(respondToCurrentUserConnectionRequestMock).toHaveBeenCalledWith(input);
    expect(revalidatePathMock).toHaveBeenCalledWith("/connections");
    expect(revalidatePathMock).toHaveBeenCalledWith("/messages/[threadId]", "page");
  });
});
