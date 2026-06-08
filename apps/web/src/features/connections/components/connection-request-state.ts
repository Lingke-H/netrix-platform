import type { Recommendation } from "@/features/recommendations/schemas";

export type ConnectionRequestState = {
  disabled: boolean;
  helper: string;
  label: string;
};

export function getConnectionRequestState(
  recommendation: Recommendation,
  backendReady: boolean,
): ConnectionRequestState {
  if (!recommendation.canRequestConnect) {
    return {
      disabled: true,
      helper: "This profile cannot receive connection requests.",
      label: "Unavailable",
    };
  }

  if (recommendation.status === "requested") {
    return {
      disabled: true,
      helper: "A connection request is already pending.",
      label: "Requested",
    };
  }

  if (recommendation.status === "dismissed" || recommendation.status === "expired") {
    return {
      disabled: true,
      helper: "This recommendation is no longer active.",
      label: "Inactive",
    };
  }

  if (!backendReady) {
    return {
      disabled: true,
      helper: "Connection requests will unlock after B/C persistence is connected.",
      label: "Request connection",
    };
  }

  return {
    disabled: false,
    helper: "Send a concise academic reason for connecting.",
    label: "Request connection",
  };
}
