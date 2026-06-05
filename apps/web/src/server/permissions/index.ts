export type PermissionScope =
  | "profile:read"
  | "profile:write"
  | "post:create"
  | "post:read"
  | "recommendation:read"
  | "recommendation:write"
  | "connection:request"
  | "connection:respond"
  | "message:read"
  | "message:create"
  | "event:create";

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

export function canAccessMessages(context: PermissionContext) {
  return Boolean(context.connectionAccepted);
}
