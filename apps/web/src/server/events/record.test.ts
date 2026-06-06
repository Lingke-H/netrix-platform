import { describe, expect, it, vi } from "vitest";

import { recordEvent } from "./record";
import * as logEventModule from "./log-event";

describe("recordEvent", () => {
  it("normalizes missing metadata to an empty object and calls logEvent", async () => {
    const logSpy = vi.spyOn(logEventModule, "logEvent").mockResolvedValue({ id: "event-1" });
    const db = {} as ReturnType<typeof import("@/server/db/client").createDb>;

    await recordEvent(db, {
      eventType: "profile_completed",
      objectType: "profile",
      objectId: "profile-1",
    });

    expect(logSpy).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ metadata: {} }),
      undefined,
    );
    logSpy.mockRestore();
  });
});
