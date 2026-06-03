import type { AuthSessionSummary, AuthViewState } from "./schemas";

export type AuthRouteData = {
  session: AuthSessionSummary | null;
  state: AuthViewState;
};
