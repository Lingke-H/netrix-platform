import { and, desc, eq, inArray, or } from "drizzle-orm";

import {
  connectionRequestActionSchema,
  connectionPeerProfileSchema,
  connectionRequestSchema,
  connectionSchema,
  createConnectionRequestInputSchema,
  type Connection,
  type ConnectionPeerProfile,
  type ConnectionRequestAction,
  type CreateConnectionRequestInput,
  type ConnectionRequest,
} from "@/features/connections/schemas";
import type { ConnectionsPageData } from "@/features/connections/types";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles, connectionRequests, connections, messageThreads, recommendations } from "@/server/db/schema";
import { assertPermissionScope } from "@/server/permissions";
import { recordEvent } from "@/server/events/record";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";

export type ConnectionRequestCreateResult = {
  id: string;
  requesterId: string;
  recipientId: string;
  recommendationId: string | null;
  status: "pending";
};

export type ConnectionRequestCreateRecommendation = {
  id: string;
  recipientUserId: string;
  recommendedUserId: string;
  status: "active" | "dismissed" | "requested" | "expired";
};

export type ConnectionRequestCreateExistingRequest = {
  requesterId: string;
  recipientId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
};

export type ConnectionRequestCreateGuardIssueCode =
  | "RECOMMENDATION_NOT_FOUND"
  | "ACTOR_MUST_MATCH_RECOMMENDATION_RECIPIENT"
  | "RECIPIENT_MUST_MATCH_RECOMMENDED_USER"
  | "SELF_CONNECTION_REQUEST_NOT_ALLOWED"
  | "RECOMMENDATION_MUST_BE_ACTIVE"
  | "CONNECTION_ALREADY_PENDING_OR_ACCEPTED";

export type ConnectionRequestCreateGuardIssue = {
  code: ConnectionRequestCreateGuardIssueCode;
  message: string;
};

export type ConnectionRequestResponseResult = {
  request: {
    id: string;
    requesterId: string;
    recipientId: string;
    status: "accepted" | "rejected" | "cancelled";
    respondedAt: Date | null;
  };
  connection: {
    id: string;
    requesterId: string;
    recipientId: string;
    status: "active";
  } | null;
  messageThread: {
    id: string;
    connectionId: string;
    permissionStatus: "available";
  } | null;
};

export type ConnectionRequestReadRow = {
  createdAt: Date;
  id: string;
  message: string | null;
  recommendationId: string | null;
  recipientId: string;
  requesterId: string;
  respondedAt: Date | null;
  status: "pending" | "accepted" | "rejected" | "cancelled";
};

export type ConnectionReadRow = {
  createdAt: Date;
  id: string;
  messageThreadId: string | null;
  requestId: string;
  status: "active" | "archived";
  userAId: string;
  userBId: string;
};

export type ConnectionPeerProfileReadRow = {
  interests: string[];
  major: "math" | "computer-science" | "eee" | "fam" | "ibe" | "other";
  modules: string[];
  nickname: string;
  skills: string[];
  userId: string;
  visibility: "private" | "campus" | "public";
  year: "foundation" | "year-1" | "year-2" | "year-3" | "year-4" | "postgraduate";
};

export type ConnectionRequestResponseExistingRequest = {
  id: string;
  requesterId: string;
  recipientId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
};

export type ConnectionRequestResponseGuardIssueCode =
  | "CONNECTION_REQUEST_NOT_FOUND"
  | "CONNECTION_REQUEST_MUST_BE_PENDING"
  | "ONLY_RECIPIENT_CAN_ACCEPT_OR_REJECT"
  | "ONLY_REQUESTER_CAN_CANCEL";

export type ConnectionRequestResponseGuardIssue = {
  code: ConnectionRequestResponseGuardIssueCode;
  message: string;
};

export type ConnectionRequestCreateGuardInput = {
  actorUserId: string;
  existingConnectionRequests?: ConnectionRequestCreateExistingRequest[];
  input: CreateConnectionRequestInput;
  recommendation: ConnectionRequestCreateRecommendation | null;
};

export type ConnectionRequestCreateGuardResult =
  | {
      input: CreateConnectionRequestInput;
      ok: true;
      recommendation: ConnectionRequestCreateRecommendation;
    }
  | {
      input: CreateConnectionRequestInput;
      issues: ConnectionRequestCreateGuardIssue[];
      ok: false;
      recommendation: ConnectionRequestCreateRecommendation | null;
    };

export type ConnectionRequestResponseGuardInput = {
  action: ConnectionRequestAction;
  actorUserId: string;
  request: ConnectionRequestResponseExistingRequest | null;
};

export type ConnectionRequestResponseGuardResult =
  | {
      action: ConnectionRequestAction;
      ok: true;
      request: ConnectionRequestResponseExistingRequest;
    }
  | {
      action: ConnectionRequestAction;
      issues: ConnectionRequestResponseGuardIssue[];
      ok: false;
      request: ConnectionRequestResponseExistingRequest | null;
    };

export class ConnectionRequestCreateError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "CONNECTION_REQUEST_INPUT_INVALID"
      | "CONNECTION_REQUEST_NOT_ALLOWED"
      | "CONNECTION_REQUEST_CREATE_FAILED",
    public readonly issues: ConnectionRequestCreateGuardIssue[] = [],
  ) {
    super(message);
    this.name = "ConnectionRequestCreateError";
  }
}

export class ConnectionRequestResponseError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "CONNECTION_REQUEST_RESPONSE_INPUT_INVALID"
      | "CONNECTION_REQUEST_RESPONSE_NOT_ALLOWED"
      | "CONNECTION_REQUEST_RESPONSE_FAILED",
    public readonly issues: ConnectionRequestResponseGuardIssue[] = [],
  ) {
    super(message);
    this.name = "ConnectionRequestResponseError";
  }
}

export function buildConnectionRequestDto(row: ConnectionRequestReadRow): ConnectionRequest {
  return connectionRequestSchema.parse({
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    message: row.message,
    recommendationId: row.recommendationId,
    recipientId: row.recipientId,
    requesterId: row.requesterId,
    respondedAt: row.respondedAt?.toISOString() ?? null,
    status: row.status,
  });
}

export function buildConnectionDto(row: ConnectionReadRow): Connection {
  return connectionSchema.parse({
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    messageThreadId: row.messageThreadId,
    requestId: row.requestId,
    status: row.status,
    userAId: row.userAId,
    userBId: row.userBId,
  });
}

function buildPeerProfileSummary(row: Pick<ConnectionPeerProfileReadRow, "interests" | "modules" | "skills">) {
  const summaryParts = [
    row.modules.length > 0 ? `Modules: ${row.modules.slice(0, 3).join(", ")}` : null,
    row.interests.length > 0 ? `Interests: ${row.interests.slice(0, 3).join(", ")}` : null,
    row.skills.length > 0 ? `Skills: ${row.skills.slice(0, 3).join(", ")}` : null,
  ].filter((part): part is string => part !== null);

  return summaryParts.length > 0 ? summaryParts.join(". ") : null;
}

export function buildConnectionPeerProfileDto(row: ConnectionPeerProfileReadRow): ConnectionPeerProfile {
  return connectionPeerProfileSchema.parse({
    major: row.major,
    nickname: row.nickname,
    profileSummary: buildPeerProfileSummary(row),
    userId: row.userId,
    visibility: row.visibility,
    year: row.year,
  });
}

export function buildConnectionsPageData(
  requestRows: ConnectionRequestReadRow[],
  connectionRows: ConnectionReadRow[],
  peerProfiles: Map<string, ConnectionPeerProfile> = new Map(),
  actorUserId?: string,
): ConnectionsPageData {
  if (!actorUserId) {
    return {
      accepted: connectionRows.map(buildConnectionDto),
      pending: requestRows
        .filter((request) => request.status === "pending")
        .map(buildConnectionRequestDto),
      rejected: requestRows
        .filter((request) => request.status === "rejected")
        .map(buildConnectionRequestDto),
    };
  }

  const getRequestPeerId = (request: ConnectionRequestReadRow) =>
    request.recipientId === actorUserId ? request.requesterId : request.recipientId;
  const getConnectionPeerId = (connection: ConnectionReadRow) =>
    connection.userAId === actorUserId ? connection.userBId : connection.userAId;

  return {
    accepted: connectionRows.map((connection) => ({
      ...buildConnectionDto(connection),
      peerProfile: peerProfiles.get(getConnectionPeerId(connection)) ?? null,
    })),
    pending: requestRows
      .filter((request) => request.status === "pending")
      .map((request) => ({
        ...buildConnectionRequestDto(request),
        peerProfile: peerProfiles.get(getRequestPeerId(request)) ?? null,
      })),
    rejected: requestRows
      .filter((request) => request.status === "rejected")
      .map((request) => ({
        ...buildConnectionRequestDto(request),
        peerProfile: peerProfiles.get(getRequestPeerId(request)) ?? null,
      })),
  } satisfies ConnectionsPageData;
}

export function parseCreateConnectionRequestInput(input: unknown): CreateConnectionRequestInput {
  const parsedInput = createConnectionRequestInputSchema.safeParse(
    isFormData(input) ? normalizeCreateConnectionRequestFormData(input) : input,
  );

  if (!parsedInput.success) {
    throw new ConnectionRequestCreateError(
      "Connection request input is invalid.",
      "CONNECTION_REQUEST_INPUT_INVALID",
    );
  }

  return {
    ...parsedInput.data,
    message: parsedInput.data.message ?? null,
  };
}

export function parseConnectionRequestAction(input: unknown): ConnectionRequestAction {
  const parsedInput = connectionRequestActionSchema.safeParse(
    isFormData(input) ? normalizeConnectionRequestActionFormData(input) : input,
  );

  if (!parsedInput.success) {
    throw new ConnectionRequestResponseError(
      "Connection request response input is invalid.",
      "CONNECTION_REQUEST_RESPONSE_INPUT_INVALID",
    );
  }

  return parsedInput.data;
}

function isFormData(input: unknown): input is FormData {
  return typeof FormData !== "undefined" && input instanceof FormData;
}

function getFormText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export function normalizeConnectionRequestActionFormData(formData: FormData) {
  return {
    action: getFormText(formData, "action"),
    requestId: getFormText(formData, "requestId"),
  };
}

export function normalizeCreateConnectionRequestFormData(formData: FormData) {
  const message = getFormText(formData, "message");

  return {
    message: message || null,
    recommendationId: getFormText(formData, "recommendationId"),
    recipientId: getFormText(formData, "recipientId"),
  };
}

function hasSameConnectionPair(
  connectionRequest: ConnectionRequestCreateExistingRequest,
  input: CreateConnectionRequestInput,
  actorUserId: string,
) {
  return (
    (connectionRequest.requesterId === actorUserId && connectionRequest.recipientId === input.recipientId) ||
    (connectionRequest.requesterId === input.recipientId && connectionRequest.recipientId === actorUserId)
  );
}

export function guardConnectionRequestCreate({
  actorUserId,
  existingConnectionRequests = [],
  input,
  recommendation,
}: ConnectionRequestCreateGuardInput): ConnectionRequestCreateGuardResult {
  assertPermissionScope("connection:request");

  const issues: ConnectionRequestCreateGuardIssue[] = [];

  if (!recommendation) {
    issues.push({
      code: "RECOMMENDATION_NOT_FOUND",
      message: "A connection request must reference an existing recommendation.",
    });
  } else {
    if (actorUserId !== recommendation.recipientUserId) {
      issues.push({
        code: "ACTOR_MUST_MATCH_RECOMMENDATION_RECIPIENT",
        message: "Only the recommendation recipient may request a connection from it.",
      });
    }

    if (input.recipientId !== recommendation.recommendedUserId) {
      issues.push({
        code: "RECIPIENT_MUST_MATCH_RECOMMENDED_USER",
        message: "Connection request recipient must match the recommended user.",
      });
    }

    if (recommendation.status !== "active") {
      issues.push({
        code: "RECOMMENDATION_MUST_BE_ACTIVE",
        message: "Only active recommendations can create new connection requests.",
      });
    }
  }

  if (actorUserId === input.recipientId) {
    issues.push({
      code: "SELF_CONNECTION_REQUEST_NOT_ALLOWED",
      message: "A user cannot create a connection request to themselves.",
    });
  }

  if (
    existingConnectionRequests.some(
      (connectionRequest) =>
        hasSameConnectionPair(connectionRequest, input, actorUserId) &&
        (connectionRequest.status === "pending" || connectionRequest.status === "accepted"),
    )
  ) {
    issues.push({
      code: "CONNECTION_ALREADY_PENDING_OR_ACCEPTED",
      message: "A pending or accepted connection already exists for these users.",
    });
  }

  if (issues.length > 0 || !recommendation) {
    return {
      input,
      issues,
      ok: false,
      recommendation,
    };
  }

  return {
    input,
    ok: true,
    recommendation,
  };
}

export function guardConnectionRequestResponse({
  action,
  actorUserId,
  request,
}: ConnectionRequestResponseGuardInput): ConnectionRequestResponseGuardResult {
  assertPermissionScope("connection:respond");

  const issues: ConnectionRequestResponseGuardIssue[] = [];

  if (!request) {
    return {
      action,
      issues: [
        {
          code: "CONNECTION_REQUEST_NOT_FOUND",
          message: "Connection request does not exist.",
        },
      ],
      ok: false,
      request,
    };
  }

  if (request.status !== "pending") {
    issues.push({
      code: "CONNECTION_REQUEST_MUST_BE_PENDING",
      message: "Only pending connection requests can be responded to.",
    });
  }

  if ((action.action === "accept" || action.action === "reject") && actorUserId !== request.recipientId) {
    issues.push({
      code: "ONLY_RECIPIENT_CAN_ACCEPT_OR_REJECT",
      message: "Only the connection request recipient can accept or reject it.",
    });
  }

  if (action.action === "cancel" && actorUserId !== request.requesterId) {
    issues.push({
      code: "ONLY_REQUESTER_CAN_CANCEL",
      message: "Only the connection request requester can cancel it.",
    });
  }

  if (issues.length > 0) {
    return {
      action,
      issues,
      ok: false,
      request,
    };
  }

  return {
    action,
    ok: true,
    request,
  };
}

export async function getRecommendationForConnectionRequest(
  db: DbClient,
  recommendationId: string,
): Promise<ConnectionRequestCreateRecommendation | null> {
  const [recommendation] = await db
    .select({
      id: recommendations.id,
      recipientUserId: recommendations.recipientUserId,
      recommendedUserId: recommendations.recommendedUserId,
      status: recommendations.status,
    })
    .from(recommendations)
    .where(eq(recommendations.id, recommendationId))
    .limit(1);

  return recommendation ?? null;
}

export async function listPendingOrAcceptedConnectionRequestsBetweenUsers(
  db: DbClient,
  actorUserId: string,
  recipientId: string,
): Promise<ConnectionRequestCreateExistingRequest[]> {
  return db
    .select({
      requesterId: connectionRequests.requesterId,
      recipientId: connectionRequests.recipientId,
      status: connectionRequests.status,
    })
    .from(connectionRequests)
    .where(
      and(
        inArray(connectionRequests.status, ["pending", "accepted"]),
        or(
          and(eq(connectionRequests.requesterId, actorUserId), eq(connectionRequests.recipientId, recipientId)),
          and(eq(connectionRequests.requesterId, recipientId), eq(connectionRequests.recipientId, actorUserId)),
        ),
      ),
    );
}

export async function getConnectionRequestForResponse(
  db: DbClient,
  requestId: string,
): Promise<ConnectionRequestResponseExistingRequest | null> {
  const [request] = await db
    .select({
      id: connectionRequests.id,
      recipientId: connectionRequests.recipientId,
      requesterId: connectionRequests.requesterId,
      status: connectionRequests.status,
    })
    .from(connectionRequests)
    .where(eq(connectionRequests.id, requestId))
    .limit(1);

  return request ?? null;
}

export async function listConnectionRequestsForConnectionsPage(
  db: DbClient,
  actorUserId: string,
): Promise<ConnectionRequestReadRow[]> {
  assertPermissionScope("connection:read");

  return db
    .select({
      createdAt: connectionRequests.createdAt,
      id: connectionRequests.id,
      message: connectionRequests.message,
      recommendationId: connectionRequests.recommendationId,
      recipientId: connectionRequests.recipientId,
      requesterId: connectionRequests.requesterId,
      respondedAt: connectionRequests.respondedAt,
      status: connectionRequests.status,
    })
    .from(connectionRequests)
    .where(
      and(
        inArray(connectionRequests.status, ["pending", "rejected"]),
        or(eq(connectionRequests.requesterId, actorUserId), eq(connectionRequests.recipientId, actorUserId)),
      ),
    )
    .orderBy(desc(connectionRequests.createdAt));
}

export async function listAcceptedConnectionsForConnectionsPage(
  db: DbClient,
  actorUserId: string,
): Promise<ConnectionReadRow[]> {
  assertPermissionScope("connection:read");

  return db
    .select({
      createdAt: connections.createdAt,
      id: connections.id,
      messageThreadId: messageThreads.id,
      requestId: connections.requestId,
      status: connections.status,
      userAId: connections.userAId,
      userBId: connections.userBId,
    })
    .from(connections)
    .leftJoin(messageThreads, eq(messageThreads.connectionId, connections.id))
    .where(or(eq(connections.userAId, actorUserId), eq(connections.userBId, actorUserId)))
    .orderBy(desc(connections.createdAt));
}

function getConnectionPagePeerIds(
  actorUserId: string,
  requestRows: ConnectionRequestReadRow[],
  connectionRows: ConnectionReadRow[],
) {
  const peerIds = new Set<string>();

  requestRows.forEach((request) => {
    peerIds.add(request.recipientId === actorUserId ? request.requesterId : request.recipientId);
  });
  connectionRows.forEach((connection) => {
    peerIds.add(connection.userAId === actorUserId ? connection.userBId : connection.userAId);
  });

  return [...peerIds];
}

export async function listConnectionPeerProfiles(
  db: DbClient,
  peerIds: string[],
): Promise<Map<string, ConnectionPeerProfile>> {
  if (peerIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      interests: academicProfiles.interests,
      major: academicProfiles.major,
      modules: academicProfiles.modules,
      nickname: academicProfiles.nickname,
      skills: academicProfiles.skills,
      userId: academicProfiles.userId,
      visibility: academicProfiles.visibility,
      year: academicProfiles.year,
    })
    .from(academicProfiles)
    .where(inArray(academicProfiles.userId, peerIds));

  return new Map(rows.map((row) => [row.userId, buildConnectionPeerProfileDto(row)]));
}

export async function getConnectionsPageDataForUser(
  db: DbClient,
  actorUserId: string,
): Promise<ConnectionsPageData> {
  const [requestRows, connectionRows] = await Promise.all([
    listConnectionRequestsForConnectionsPage(db, actorUserId),
    listAcceptedConnectionsForConnectionsPage(db, actorUserId),
  ]);
  const peerProfiles = await listConnectionPeerProfiles(
    db,
    getConnectionPagePeerIds(actorUserId, requestRows, connectionRows),
  );

  return buildConnectionsPageData(requestRows, connectionRows, peerProfiles, actorUserId);
}

export async function createConnectionRequestForUser(
  db: DbClient,
  actorUserId: string,
  input: unknown,
): Promise<ConnectionRequestCreateResult> {
  const parsedInput = parseCreateConnectionRequestInput(input);
  const recommendation = await getRecommendationForConnectionRequest(db, parsedInput.recommendationId);
  const existingConnectionRequests = await listPendingOrAcceptedConnectionRequestsBetweenUsers(
    db,
    actorUserId,
    parsedInput.recipientId,
  );
  const guard = guardConnectionRequestCreate({
    actorUserId,
    existingConnectionRequests,
    input: parsedInput,
    recommendation,
  });

  if (!guard.ok) {
    throw new ConnectionRequestCreateError(
      "Connection request is not allowed.",
      "CONNECTION_REQUEST_NOT_ALLOWED",
      guard.issues,
    );
  }

  return db.transaction(async (tx) => {
    const [updatedRecommendation] = await tx
      .update(recommendations)
      .set({
        status: "requested",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(recommendations.id, parsedInput.recommendationId),
          eq(recommendations.recipientUserId, actorUserId),
          eq(recommendations.recommendedUserId, parsedInput.recipientId),
          eq(recommendations.status, "active"),
        ),
      )
      .returning({
        id: recommendations.id,
        status: recommendations.status,
      });

    if (!updatedRecommendation || updatedRecommendation.status !== "requested") {
      throw new ConnectionRequestCreateError(
        "Unable to mark the source recommendation as requested.",
        "CONNECTION_REQUEST_CREATE_FAILED",
      );
    }

    const [createdRequest] = await tx
      .insert(connectionRequests)
      .values({
        message: parsedInput.message,
        recommendationId: parsedInput.recommendationId,
        recipientId: parsedInput.recipientId,
        requesterId: actorUserId,
        status: "pending",
      })
      .returning({
        id: connectionRequests.id,
        recommendationId: connectionRequests.recommendationId,
        recipientId: connectionRequests.recipientId,
        requesterId: connectionRequests.requesterId,
        status: connectionRequests.status,
      });

    if (!createdRequest || createdRequest.status !== "pending") {
      throw new ConnectionRequestCreateError(
        "Unable to create the connection request.",
        "CONNECTION_REQUEST_CREATE_FAILED",
      );
    }

    await recordEvent(db, {
      eventType: "connection_requested",
      objectType: "connection_request",
      objectId: createdRequest.id,
      metadata: {
        requesterId: createdRequest.requesterId,
        recipientId: createdRequest.recipientId,
        recommendationId: parsedInput.recommendationId,
      },
    }, actorUserId);

    return {
      id: createdRequest.id,
      recommendationId: createdRequest.recommendationId,
      recipientId: createdRequest.recipientId,
      requesterId: createdRequest.requesterId,
      status: "pending",
    };
  });
}

export async function respondToConnectionRequestForUser(
  db: DbClient,
  actorUserId: string,
  input: unknown,
): Promise<ConnectionRequestResponseResult> {
  const action = parseConnectionRequestAction(input);
  const request = await getConnectionRequestForResponse(db, action.requestId);
  const guard = guardConnectionRequestResponse({
    action,
    actorUserId,
    request,
  });

  if (!guard.ok) {
    throw new ConnectionRequestResponseError(
      "Connection request response is not allowed.",
      "CONNECTION_REQUEST_RESPONSE_NOT_ALLOWED",
      guard.issues,
    );
  }

  const respondedAt = new Date();

  if (action.action !== "accept") {
    const nextStatus = action.action === "reject" ? "rejected" : "cancelled";
    const [updatedRequest] = await db
      .update(connectionRequests)
      .set({
        respondedAt,
        status: nextStatus,
      })
      .where(and(eq(connectionRequests.id, action.requestId), eq(connectionRequests.status, "pending")))
      .returning({
        id: connectionRequests.id,
        recipientId: connectionRequests.recipientId,
        requesterId: connectionRequests.requesterId,
        respondedAt: connectionRequests.respondedAt,
        status: connectionRequests.status,
      });

    if (!updatedRequest || updatedRequest.status !== nextStatus) {
      throw new ConnectionRequestResponseError(
        "Unable to update the connection request response.",
        "CONNECTION_REQUEST_RESPONSE_FAILED",
      );
    }

    return {
      connection: null,
      messageThread: null,
      request: {
        id: updatedRequest.id,
        recipientId: updatedRequest.recipientId,
        requesterId: updatedRequest.requesterId,
        respondedAt: updatedRequest.respondedAt,
        status: updatedRequest.status,
      },
    };
  }

  return db.transaction(async (tx) => {
    const [updatedRequest] = await tx
      .update(connectionRequests)
      .set({
        respondedAt,
        status: "accepted",
      })
      .where(
        and(
          eq(connectionRequests.id, action.requestId),
          eq(connectionRequests.recipientId, actorUserId),
          eq(connectionRequests.status, "pending"),
        ),
      )
      .returning({
        id: connectionRequests.id,
        recipientId: connectionRequests.recipientId,
        requesterId: connectionRequests.requesterId,
        respondedAt: connectionRequests.respondedAt,
        status: connectionRequests.status,
      });

    if (!updatedRequest || updatedRequest.status !== "accepted") {
      throw new ConnectionRequestResponseError(
        "Unable to accept the connection request.",
        "CONNECTION_REQUEST_RESPONSE_FAILED",
      );
    }

    const [createdConnection] = await tx
      .insert(connections)
      .values({
        requestId: updatedRequest.id,
        status: "active",
        userAId: updatedRequest.requesterId,
        userBId: updatedRequest.recipientId,
      })
      .returning({
        id: connections.id,
        requestId: connections.requestId,
        status: connections.status,
        userAId: connections.userAId,
        userBId: connections.userBId,
      });

    if (!createdConnection || createdConnection.status !== "active") {
      throw new ConnectionRequestResponseError(
        "Unable to create the accepted connection.",
        "CONNECTION_REQUEST_RESPONSE_FAILED",
      );
    }

    const [createdThread] = await tx
      .insert(messageThreads)
      .values({
        connectionId: createdConnection.id,
        permissionStatus: "available",
      })
      .returning({
        connectionId: messageThreads.connectionId,
        id: messageThreads.id,
        permissionStatus: messageThreads.permissionStatus,
      });

    if (!createdThread || createdThread.permissionStatus !== "available") {
      throw new ConnectionRequestResponseError(
        "Unable to create the accepted connection message thread.",
        "CONNECTION_REQUEST_RESPONSE_FAILED",
      );
    }

    await recordEvent(db, {
      eventType: "connection_accepted",
      objectType: "connection",
      objectId: createdConnection.id,
      metadata: {
        requesterId: updatedRequest.requesterId,
        recipientId: updatedRequest.recipientId,
        requestId: updatedRequest.id,
      },
    }, actorUserId);

    return {
      connection: {
        id: createdConnection.id,
        requesterId: createdConnection.userAId,
        recipientId: createdConnection.userBId,
        status: "active",
      },
      messageThread: {
        connectionId: createdThread.connectionId,
        id: createdThread.id,
        permissionStatus: "available",
      },
      request: {
        id: updatedRequest.id,
        recipientId: updatedRequest.recipientId,
        requesterId: updatedRequest.requesterId,
        respondedAt: updatedRequest.respondedAt,
        status: updatedRequest.status,
      },
    };
  });
}

export async function createCurrentUserConnectionRequest(input: unknown): Promise<ConnectionRequestCreateResult> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return createConnectionRequestForUser(db, gate.session.userId, input);
}

export async function respondToCurrentUserConnectionRequest(input: unknown): Promise<ConnectionRequestResponseResult> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return respondToConnectionRequestForUser(db, gate.session.userId, input);
}

export async function getCurrentUserConnectionsPageData(): Promise<ConnectionsPageData> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return getConnectionsPageDataForUser(db, gate.session.userId);
}
