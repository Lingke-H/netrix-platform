import { describe, expect, it } from "vitest";

import { createAiJobRecord } from "@/server/ai/jobs";
import { AiJobError } from "@/server/ai/job-service";

describe("createAiJobRecord", () => {
  it("assigns an id and createdAt and defaults nullable fields", () => {
    const record = createAiJobRecord({
      inputSummary: "test input",
      promptVersion: "nickname.v1",
      status: "queued",
      type: "nickname",
      userId: "11111111-1111-4111-8111-111111111111",
    });

    expect(record.id).toBeTruthy();
    expect(record.createdAt).toBeTruthy();
    expect(record.completedAt).toBeNull();
    expect(record.outputSummary).toBeNull();
    expect(record.errorMessage).toBeNull();
    expect(record.userId).toBe("11111111-1111-4111-8111-111111111111");
    expect(record.type).toBe("nickname");
    expect(record.status).toBe("queued");
  });

  it("preserves provided outputSummary and errorMessage", () => {
    const record = createAiJobRecord({
      errorMessage: "something went wrong",
      inputSummary: "test input",
      outputSummary: "result text",
      promptVersion: "profile-portrait.v1",
      status: "succeeded",
      type: "profile-portrait",
      userId: "22222222-2222-4222-8222-222222222222",
    });

    expect(record.outputSummary).toBe("result text");
    expect(record.errorMessage).toBe("something went wrong");
    expect(record.status).toBe("succeeded");
  });
});

describe("AiJobError", () => {
  it("has the correct name and code", () => {
    const error = new AiJobError("test message", "JOB_CREATE_FAILED");

    expect(error.name).toBe("AiJobError");
    expect(error.code).toBe("JOB_CREATE_FAILED");
    expect(error.message).toBe("test message");
  });
});
