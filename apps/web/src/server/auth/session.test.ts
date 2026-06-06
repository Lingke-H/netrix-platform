import { describe, expect, it } from "vitest";

import {
  buildCurrentUserSession,
  getAuthEmailVerifiedAt,
  getCampusEmailIdentity,
  isDemoAuthBypassRuntimeAllowed,
  isAllowedCampusEmail,
} from "@/server/auth/session";

describe("auth session helpers", () => {
  it("normalizes allowed campus email identities", () => {
    expect(isAllowedCampusEmail(" Student@Nottingham.Edu.Cn ")).toBe(true);
    expect(getCampusEmailIdentity(" Student@Nottingham.Edu.Cn ")).toEqual({
      email: "student@nottingham.edu.cn",
      emailDomain: "nottingham.edu.cn",
    });
  });

  it("rejects email identities outside the configured campus domain", () => {
    expect(isAllowedCampusEmail("student@example.com")).toBe(false);
    expect(getCampusEmailIdentity("student@example.com")).toBeNull();
  });

  it("parses Supabase email verification timestamps", () => {
    const verifiedAt = getAuthEmailVerifiedAt({
      email_confirmed_at: "2026-01-02T03:04:05.000Z",
    });

    expect(verifiedAt?.toISOString()).toBe("2026-01-02T03:04:05.000Z");
    expect(getAuthEmailVerifiedAt({ email_confirmed_at: undefined })).toBeNull();
  });

  it("builds the current user session from the app user row", () => {
    expect(
      buildCurrentUserSession(
        { id: "00000000-0000-0000-0000-000000000001" },
        {
          email: "student@nottingham.edu.cn",
          emailDomain: "nottingham.edu.cn",
          id: "00000000-0000-0000-0000-000000000002",
          role: "student",
          verifiedAt: new Date("2026-01-02T03:04:05.000Z"),
        },
      ),
    ).toEqual({
      authUserId: "00000000-0000-0000-0000-000000000001",
      email: "student@nottingham.edu.cn",
      emailDomain: "nottingham.edu.cn",
      emailVerified: true,
      role: "student",
      userId: "00000000-0000-0000-0000-000000000002",
      verifiedAt: "2026-01-02T03:04:05.000Z",
    });
  });

  it("limits demo auth bypass to local development or explicit E2E runs", () => {
    expect(isDemoAuthBypassRuntimeAllowed({ NODE_ENV: "development" })).toBe(true);
    expect(isDemoAuthBypassRuntimeAllowed({ NETRIX_E2E: "true", NODE_ENV: "test" })).toBe(true);
    expect(isDemoAuthBypassRuntimeAllowed({ NODE_ENV: "production", NETRIX_E2E: "true" })).toBe(false);
    expect(isDemoAuthBypassRuntimeAllowed({ NODE_ENV: "test" })).toBe(false);
  });
});
