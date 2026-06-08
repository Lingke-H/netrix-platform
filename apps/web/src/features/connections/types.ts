import type {
  Connection,
  ConnectionPeerProfile,
  ConnectionRequest,
  ConnectionRequestAction,
  ConnectionRequestStatus,
} from "./schemas";

export type ConnectionRequestWithPeer = ConnectionRequest & {
  peerProfile?: ConnectionPeerProfile | null;
};

export type ConnectionWithPeer = Connection & {
  peerProfile?: ConnectionPeerProfile | null;
};

export type ConnectionsPageData = {
  pending: ConnectionRequestWithPeer[];
  accepted: ConnectionWithPeer[];
  rejected: ConnectionRequestWithPeer[];
};

export type ConnectionRequestButtonState = {
  status: ConnectionRequestStatus | "idle";
  disabled: boolean;
};

export type ConnectionRequestActionPayload = ConnectionRequestAction;
