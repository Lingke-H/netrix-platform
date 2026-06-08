import { describe, expect, it } from "vitest";

import { getConnectionRequestState } from "@/features/connections/components/connection-request-state";
import {
  privateRecommendationFixture,
  visibleRecommendationFixture,
} from "@/features/recommendations/test-fixtures";

describe("getConnectionRequestState", () => {
  it("enables active visible recommendations only when backend persistence is ready", () => {
    expect(getConnectionRequestState(visibleRecommendationFixture, true)).toEqual({
      disabled: false,
      helper: "Send a concise academic reason for connecting.",
      label: "Request connection",
    });
  });

  it("keeps active visible recommendations disabled during dry-run persistence", () => {
    expect(getConnectionRequestState(visibleRecommendationFixture, false)).toEqual({
      disabled: true,
      helper: "Connection requests will unlock after B/C persistence is connected.",
      label: "Request connection",
    });
  });

  it("does not expose requests for private or otherwise non-actionable recommendations", () => {
    expect(getConnectionRequestState(privateRecommendationFixture, true)).toEqual({
      disabled: true,
      helper: "This profile cannot receive connection requests.",
      label: "Unavailable",
    });
  });

  it("locks recommendations that are already requested or inactive", () => {
    expect(
      getConnectionRequestState(
        {
          ...visibleRecommendationFixture,
          status: "requested",
        },
        true,
      ),
    ).toEqual({
      disabled: true,
      helper: "A connection request is already pending.",
      label: "Requested",
    });

    expect(
      getConnectionRequestState(
        {
          ...visibleRecommendationFixture,
          status: "dismissed",
        },
        true,
      ),
    ).toEqual({
      disabled: true,
      helper: "This recommendation is no longer active.",
      label: "Inactive",
    });
  });
});
