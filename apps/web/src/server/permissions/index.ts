export type PermissionScope =
  | "profile:read"
  | "profile:write"
  | "portrait:read"
  | "portrait:write"
  | "post:create"
  | "post:read"
  | "recommendation:read"
  | "recommendation:write"
  | "connection:read"
  | "connection:request"
  | "connection:respond"
  | "message:read"
  | "message:create"
  | "job:read"
  | "job:write"
  | "event:create"
  | "event:read";

export type PermissionContext = {
  actorUserId: string;
  targetUserId?: string;
  connectionAccepted?: boolean;
};

export function assertPermissionScope(scope: PermissionScope) {
  if (!scope) {
    throw new Error("Permission scope is required.");
  }
}

export function canReadOwnJobs(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canWriteOwnJobs(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canReadOwnPortrait(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canWriteOwnPortrait(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canReadOwnRecommendations(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canWriteOwnRecommendations(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canAccessMessages(context: PermissionContext) {
  return Boolean(context.connectionAccepted);
}

export function canCreateEvent(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canReadOwnProfile(context: PermissionContext) {
  return Boolean(context.actorUserId);
}

export function canWriteOwnProfile(context: PermissionContext) {
  return Boolean(context.actorUserId);
}
