import { describe, expect, it, vi } from "vitest";

import {
  ConnectionRequestCreateError,
  ConnectionRequestResponseError,
  buildConnectionDto,
  buildConnectionRequestDto,
  buildConnectionsPageData,
  createConnectionRequestForUser,
  guardConnectionRequestCreate,
  guardConnectionRequestResponse,
  parseConnectionRequestAction,
  parseCreateConnectionRequestInput,
  type ConnectionReadRow,
  type ConnectionRequestCreateRecommendation,
  type ConnectionRequestReadRow,
} from "@/features/connections/server/service";
import type { DbClient } from "@/server/db/client";

const requesterId = "11111111-1111-4111-8111-111111111111";
const recipientId = "22222222-2222-4222-8222-222222222222";
const recommendationId = "33333333-3333-4333-8333-333333333333";
const connectionId = "44444444-4444-4444-8444-444444444444";
const connectionRequestId = "55555555-5555-4555-8555-555555555555";

const activeRecommendation = {
  id: recommendationId,
  recipientUserId: requesterId,
  recommendedUserId: recipientId,
  status: "active",
} satisfies ConnectionRequestCreateRecommendation;

function createSelectQueryMock(rows: unknown[]) {
  const query = {
    from: vi.fn(() => query),
    limit: vi.fn(async () => rows),
    then: vi.fn((resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(rows).then(resolve, reject),
    ),
    where: vi.fn(() => query),
  };

  return query;
}

function createConnectionRequestCreateDbMock() {
  const recommendationQuery = createSelectQueryMock([activeRecommendation]);
  const existingRequestsQuery = createSelectQueryMock([]);
  const selectResults = [recommendationQuery, existingRequestsQuery];
  let selectIndex = 0;
  const updatedRecommendationRows = [
    {
      id: recommendationId,
      status: "requested",
    },
  ];
  const createdRequestRows = [
    {
      id: connectionRequestId,
      recommendationId,
      recipientId,
      requesterId,
      status: "pending",
    },
  ];
  const updateQuery = {
    returning: vi.fn(async () => updatedRecommendationRows),
    set: vi.fn(() => updateQuery),
    where: vi.fn(() => updateQuery),
  };
  const insertQuery = {
    returning: vi.fn(async () => createdRequestRows),
    values: vi.fn(() => insertQuery),
  };
  const tx = {
    insert: vi.fn(() => insertQuery),
    update: vi.fn(() => updateQuery),
  };
  const db = {
    select: vi.fn(() => selectResults[selectIndex++] ?? createSelectQueryMock([])),
    transaction: vi.fn((callback: (transactionClient: typeof tx) => Promise<unknown>) => callback(tx)),
  };

  return { db, insertQuery, tx, updateQuery };
}

describe("connection request create service", () => {
  it("normalizes valid connection request input", () => {
    expect(
      parseCreateConnectionRequestInput({
        message: "  Could we compare COMP1048 debugging notes?  ",
        recommendationId,
        recipientId,
      }),
    ).toEqual({
      message: "Could we compare COMP1048 debugging notes?",
      recommendationId,
      recipientId,
    });

    expect(
      parseCreateConnectionRequestInput({
        recommendationId,
        recipientId,
      }),
    ).toEqual({
      message: null,
      recommendationId,
      recipientId,
    });
  });

  it("normalizes connection request form input", () => {
    const formData = new FormData();
    formData.set("message", "  Could we compare COMP1048 debugging notes?  ");
    formData.set("recommendationId", recommendationId);
    formData.set("recipientId", recipientId);

    expect(parseCreateConnectionRequestInput(formData)).toEqual({
      message: "Could we compare COMP1048 debugging notes?",
      recommendationId,
      recipientId,
    });
  });

  it("rejects invalid connection request input", () => {
    expect(() =>
      parseCreateConnectionRequestInput({
        message: "",
        recommendationId,
        recipientId,
      }),
    ).toThrow(ConnectionRequestCreateError);
  });

  it("allows the recommendation recipient to request the recommended user", () => {
    expect(
      guardConnectionRequestCreate({
        actorUserId: requesterId,
        input: {
          message: "Could we compare COMP1048 debugging notes?",
          recommendationId,
          recipientId,
        },
        recommendation: activeRecommendation,
      }),
    ).toEqual({
      input: {
        message: "Could we compare COMP1048 debugging notes?",
        recommendationId,
        recipientId,
      },
      ok: true,
      recommendation: activeRecommendation,
    });
  });

  it("creates the request and marks the source recommendation as requested in one transaction", async () => {
    const { db, insertQuery, tx, updateQuery } = createConnectionRequestCreateDbMock();

    await expect(
      createConnectionRequestForUser(db as unknown as DbClient, requesterId, {
        message: "Could we compare COMP1048 debugging notes?",
        recommendationId,
        recipientId,
      }),
    ).resolves.toEqual({
      id: connectionRequestId,
      recommendationId,
      recipientId,
      requesterId,
      status: "pending",
    });
    expect(db.select).toHaveBeenCalledTimes(2);
    expect(db.transaction).toHaveBeenCalledOnce();
    expect(tx.update).toHaveBeenCalledOnce();
    expect(updateQuery.set).toHaveBeenCalledWith({
      status: "requested",
      updatedAt: expect.any(Date),
    });
    expect(updateQuery.where).toHaveBeenCalledOnce();
    expect(updateQuery.returning).toHaveBeenCalledOnce();
    expect(tx.insert).toHaveBeenCalledOnce();
    expect(insertQuery.values).toHaveBeenCalledWith({
      message: "Could we compare COMP1048 debugging notes?",
      recommendationId,
      recipientId,
      requesterId,
      status: "pending",
    });
    expect(insertQuery.returning).toHaveBeenCalledOnce();
  });

  it("rejects missing, mismatched, self, and inactive recommendation requests", () => {
    expect(
      guardConnectionRequestCreate({
        actorUserId: requesterId,
        input: {
          recommendationId,
          recipientId,
        },
        recommendation: null,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "RECOMMENDATION_NOT_FOUND" })],
      ok: false,
    });

    expect(
      guardConnectionRequestCreate({
        actorUserId: requesterId,
        input: {
          recommendationId,
          recipientId: "44444444-4444-4444-8444-444444444444",
        },
        recommendation: activeRecommendation,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "RECIPIENT_MUST_MATCH_RECOMMENDED_USER" })],
      ok: false,
    });

    expect(
      guardConnectionRequestCreate({
        actorUserId: requesterId,
        input: {
          recommendationId,
          recipientId: requesterId,
        },
        recommendation: {
          ...activeRecommendation,
          recommendedUserId: requesterId,
          status: "requested",
        },
      }),
    ).toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "SELF_CONNECTION_REQUEST_NOT_ALLOWED" }),
        expect.objectContaining({ code: "RECOMMENDATION_MUST_BE_ACTIVE" }),
      ]),
      ok: false,
    });
  });

  it("rejects duplicate pending or accepted requests in either direction", () => {
    expect(
      guardConnectionRequestCreate({
        actorUserId: requesterId,
        existingConnectionRequests: [
          {
            recipientId,
            requesterId,
            status: "pending",
          },
        ],
        input: {
          recommendationId,
          recipientId,
        },
        recommendation: activeRecommendation,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "CONNECTION_ALREADY_PENDING_OR_ACCEPTED" })],
      ok: false,
    });

    expect(
      guardConnectionRequestCreate({
        actorUserId: requesterId,
        existingConnectionRequests: [
          {
            recipientId: requesterId,
            requesterId: recipientId,
            status: "accepted",
          },
        ],
        input: {
          recommendationId,
          recipientId,
        },
        recommendation: activeRecommendation,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "CONNECTION_ALREADY_PENDING_OR_ACCEPTED" })],
      ok: false,
    });
  });

  it("allows a new request when the previous request was rejected or cancelled", () => {
    expect(
      guardConnectionRequestCreate({
        actorUserId: requesterId,
        existingConnectionRequests: [
          {
            recipientId,
            requesterId,
            status: "rejected",
          },
          {
            recipientId: requesterId,
            requesterId: recipientId,
            status: "cancelled",
          },
        ],
        input: {
          recommendationId,
          recipientId,
        },
        recommendation: activeRecommendation,
      }),
    ).toMatchObject({
      ok: true,
    });
  });
});

describe("connection request response service", () => {
  it("parses valid connection request response actions", () => {
    expect(
      parseConnectionRequestAction({
        action: "accept",
        requestId: connectionRequestId,
      }),
    ).toEqual({
      action: "accept",
      requestId: connectionRequestId,
    });
  });

  it("normalizes connection request response form actions", () => {
    const formData = new FormData();
    formData.set("action", "reject");
    formData.set("requestId", connectionRequestId);

    expect(parseConnectionRequestAction(formData)).toEqual({
      action: "reject",
      requestId: connectionRequestId,
    });
  });

  it("rejects invalid connection request response actions", () => {
    expect(() =>
      parseConnectionRequestAction({
        action: "archive",
        requestId: connectionRequestId,
      }),
    ).toThrow(ConnectionRequestResponseError);
  });

  it("allows the recipient to accept or reject a pending request", () => {
    expect(
      guardConnectionRequestResponse({
        action: {
          action: "accept",
          requestId: connectionRequestId,
        },
        actorUserId: recipientId,
        request: {
          id: connectionRequestId,
          recipientId,
          requesterId,
          status: "pending",
        },
      }),
    ).toMatchObject({
      ok: true,
    });

    expect(
      guardConnectionRequestResponse({
        action: {
          action: "reject",
          requestId: connectionRequestId,
        },
        actorUserId: recipientId,
        request: {
          id: connectionRequestId,
          recipientId,
          requesterId,
          status: "pending",
        },
      }),
    ).toMatchObject({
      ok: true,
    });
  });

  it("allows the requester to cancel a pending request", () => {
    expect(
      guardConnectionRequestResponse({
        action: {
          action: "cancel",
          requestId: connectionRequestId,
        },
        actorUserId: requesterId,
        request: {
          id: connectionRequestId,
          recipientId,
          requesterId,
          status: "pending",
        },
      }),
    ).toMatchObject({
      ok: true,
    });
  });

  it("rejects missing, already responded, and wrong-actor responses", () => {
    expect(
      guardConnectionRequestResponse({
        action: {
          action: "accept",
          requestId: connectionRequestId,
        },
        actorUserId: recipientId,
        request: null,
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "CONNECTION_REQUEST_NOT_FOUND" })],
      ok: false,
    });

    expect(
      guardConnectionRequestResponse({
        action: {
          action: "accept",
          requestId: connectionRequestId,
        },
        actorUserId: recipientId,
        request: {
          id: connectionRequestId,
          recipientId,
          requesterId,
          status: "accepted",
        },
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "CONNECTION_REQUEST_MUST_BE_PENDING" })],
      ok: false,
    });

    expect(
      guardConnectionRequestResponse({
        action: {
          action: "accept",
          requestId: connectionRequestId,
        },
        actorUserId: requesterId,
        request: {
          id: connectionRequestId,
          recipientId,
          requesterId,
          status: "pending",
        },
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "ONLY_RECIPIENT_CAN_ACCEPT_OR_REJECT" })],
      ok: false,
    });

    expect(
      guardConnectionRequestResponse({
        action: {
          action: "cancel",
          requestId: connectionRequestId,
        },
        actorUserId: recipientId,
        request: {
          id: connectionRequestId,
          recipientId,
          requesterId,
          status: "pending",
        },
      }),
    ).toMatchObject({
      issues: [expect.objectContaining({ code: "ONLY_REQUESTER_CAN_CANCEL" })],
      ok: false,
    });
  });
});

describe("current user connections read service", () => {
  const pendingRequestRow = {
    createdAt: new Date("2026-06-05T10:00:00.000Z"),
    id: connectionRequestId,
    message: "Could we compare COMP1048 debugging notes?",
    recommendationId,
    recipientId,
    requesterId,
    respondedAt: null,
    status: "pending",
  } satisfies ConnectionRequestReadRow;

  const rejectedRequestRow = {
    ...pendingRequestRow,
    createdAt: new Date("2026-06-05T11:00:00.000Z"),
    id: "66666666-6666-4666-8666-666666666666",
    respondedAt: new Date("2026-06-05T12:00:00.000Z"),
    status: "rejected",
  } satisfies ConnectionRequestReadRow;

  const connectionRow = {
    createdAt: new Date("2026-06-05T13:00:00.000Z"),
    id: connectionId,
    messageThreadId: "99999999-9999-4999-8999-999999999999",
    requestId: "77777777-7777-4777-8777-777777777777",
    status: "active",
    userAId: requesterId,
    userBId: recipientId,
  } satisfies ConnectionReadRow;

  it("builds connection request DTOs with ISO timestamps", () => {
    expect(buildConnectionRequestDto(pendingRequestRow)).toEqual({
      createdAt: "2026-06-05T10:00:00.000Z",
      id: connectionRequestId,
      message: "Could we compare COMP1048 debugging notes?",
      recommendationId,
      recipientId,
      requesterId,
      respondedAt: null,
      status: "pending",
    });

    expect(buildConnectionRequestDto(rejectedRequestRow).respondedAt).toBe("2026-06-05T12:00:00.000Z");
  });

  it("builds accepted connection DTOs with ISO timestamps", () => {
    expect(buildConnectionDto(connectionRow)).toEqual({
      createdAt: "2026-06-05T13:00:00.000Z",
      id: connectionId,
      messageThreadId: "99999999-9999-4999-8999-999999999999",
      requestId: "77777777-7777-4777-8777-777777777777",
      status: "active",
      userAId: requesterId,
      userBId: recipientId,
    });
  });

  it("returns only pending, accepted, and rejected connection page data buckets", () => {
    expect(
      buildConnectionsPageData(
        [
          pendingRequestRow,
          {
            ...pendingRequestRow,
            id: "88888888-8888-4888-8888-888888888888",
            status: "cancelled",
          },
          rejectedRequestRow,
        ],
        [connectionRow],
      ),
    ).toEqual({
      accepted: [buildConnectionDto(connectionRow)],
      pending: [buildConnectionRequestDto(pendingRequestRow)],
      rejected: [buildConnectionRequestDto(rejectedRequestRow)],
    });
  });
});
