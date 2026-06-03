import type {
  Connection,
  ConnectionRequest,
  ConnectionRequestAction,
  ConnectionRequestStatus,
} from "./schemas";

export type ConnectionsPageData = {
  pending: ConnectionRequest[];
  accepted: Connection[];
  rejected: ConnectionRequest[];
};

export type ConnectionRequestButtonState = {
  status: ConnectionRequestStatus | "idle";
  disabled: boolean;
};

export type ConnectionRequestActionPayload = ConnectionRequestAction;
