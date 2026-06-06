import { describe, expect, it } from "vitest";

import {
  buildDeploymentConfigChecks,
  getDeploymentHealthReport,
  getExpectedAuthCallbackUrl,
} from "@/server/deployment/health";

const completeEnv = {
  APP_BASE_URL: "https://netrix.example",
  DATABASE_URL: "postgres://user:password@db.example:5432/postgres",
  NETRIX_DEMO_AUTH_BYPASS_USER_ID: "",
  NETRIX_ENABLE_DEMO_AUTH_BYPASS: "false",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  OPENAI_API_KEY: "",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
};

describe("deployment health checks", () => {
  it("derives the Supabase auth callback URL from APP_BASE_URL", () => {
    expect(getExpectedAuthCallbackUrl(completeEnv)).toBe("https://netrix.example/auth/callback");
    expect(getExpectedAuthCallbackUrl({ ...completeEnv, APP_BASE_URL: "" })).toBeNull();
  });

  it("reports required Supabase and database deployment configuration", () => {
    const checks = buildDeploymentConfigChecks(completeEnv);

    expect(checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "APP_BASE_URL", status: "pass" }),
        expect.objectContaining({ name: "NEXT_PUBLIC_SUPABASE_URL", status: "pass" }),
        expect.objectContaining({ name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", status: "pass" }),
        expect.objectContaining({ name: "SUPABASE_SERVICE_ROLE_KEY", status: "pass" }),
        expect.objectContaining({ name: "DATABASE_URL", status: "pass" }),
        expect.objectContaining({ name: "AUTH_CALLBACK_URL", status: "warn" }),
        expect.objectContaining({ name: "CAMPUS_EMAIL_DOMAIN", status: "pass" }),
        expect.objectContaining({ name: "DEMO_AUTH_BYPASS", status: "pass" }),
        expect.objectContaining({ name: "OPENAI_API_KEY", status: "warn" }),
      ]),
    );
  });

  it("flags demo auth bypass as a warning when enabled in deployment", () => {
    const checks = buildDeploymentConfigChecks({
      ...completeEnv,
      NETRIX_ENABLE_DEMO_AUTH_BYPASS: "true",
    });

    expect(checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "DEMO_AUTH_BYPASS", status: "warn" }),
      ]),
    );
  });

  it("reports OPENAI_API_KEY as pass when configured", () => {
    const checks = buildDeploymentConfigChecks({
      ...completeEnv,
      OPENAI_API_KEY: "sk-test-key",
    });

    expect(checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "OPENAI_API_KEY", status: "pass" }),
      ]),
    );
  });

  it("fails missing required deployment configuration without exposing secrets", () => {
    const checks = buildDeploymentConfigChecks({});

    expect(checks.filter((check) => check.status === "fail").map((check) => check.name)).toEqual([
      "APP_BASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
      "AUTH_CALLBACK_URL",
    ]);
    expect(JSON.stringify(checks)).not.toContain("password");
  });

  it("reports malformed URLs instead of throwing", () => {
    expect(
      buildDeploymentConfigChecks({
        ...completeEnv,
        APP_BASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "APP_BASE_URL", status: "fail" }),
        expect.objectContaining({ name: "NEXT_PUBLIC_SUPABASE_URL", status: "fail" }),
      ]),
    );
  });

  it("marks identical anon and service role keys as unsafe", () => {
    expect(
      buildDeploymentConfigChecks({
        ...completeEnv,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "same-key",
        SUPABASE_SERVICE_ROLE_KEY: "same-key",
      }),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ name: "SUPABASE_KEY_SEPARATION", status: "fail" })]));
  });

  it("can build a report without network probes for deterministic tests", async () => {
    const report = await getDeploymentHealthReport({
      env: completeEnv,
      runRuntimeProbes: false,
    });

    expect(report).toMatchObject({
      app: "netrix-web",
      expectedAuthCallbackUrl: "https://netrix.example/auth/callback",
      stage: "deployment-readiness",
      status: "degraded",
    });
    expect(report.probes).toHaveLength(2);
    expect(report.probes.every((probe) => probe.status === "skip")).toBe(true);
  });

  it("reports ok status when all checks pass and probes are skipped", async () => {
    const report = await getDeploymentHealthReport({
      env: {
        ...completeEnv,
        OPENAI_API_KEY: "sk-test-key",
      },
      runRuntimeProbes: false,
    });

    expect(report.status).toBe("degraded");
    expect(report.checks.every((check) => check.status !== "fail")).toBe(true);
  });
});
