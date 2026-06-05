import { describe, expect, it } from "vitest";

import { recordEvent } from "./record";

describe("recordEvent", () => {
  it("normalizes missing metadata to an empty object", () => {
    const event = recordEvent({
      eventType: "profile_completed",
      objectType: "profile",
      objectId: "profile-1",
    });

    expect(event.metadata).toEqual({});
  });
});
