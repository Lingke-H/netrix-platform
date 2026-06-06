import { describe, expect, it } from "vitest";

import { failAiJob, startAiJob, succeedAiJob } from "./job-state";

describe("job state helpers", () => {
  it("exposes lifecycle state transitions", () => {
    expect(startAiJob()).toBe("running");
    expect(succeedAiJob()).toBe("succeeded");
    expect(failAiJob()).toBe("failed");
  });
});
