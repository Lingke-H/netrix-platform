import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

export type DeploymentCheckStatus = "pass" | "warn" | "fail" | "skip";
export type DeploymentHealthStatus = "ok" | "degraded" | "error";

export type DeploymentCheck = {
  name: string;
  status: DeploymentCheckStatus;
  message: string;
};

export type RuntimeProbe = DeploymentCheck & {
  latencyMs: number | null;
};

export type DeploymentHealthReport = {
  app: "netrix-web";
  status: DeploymentHealthStatus;
  stage: "deployment-readiness";
  timestamp: string;
  expectedAuthCallbackUrl: string | null;
  checks: DeploymentCheck[];
  probes: RuntimeProbe[];
};

type DeploymentEnv = {
  APP_BASE_URL?: string;
  DATABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type HealthReportOptions = {
  env?: DeploymentEnv;
  runRuntimeProbes?: boolean;
};

function present(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseUrl(value: string | undefined) {
  if (!present(value)) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function buildCheck(name: string, status: DeploymentCheckStatus, message: string): DeploymentCheck {
  return {
    message,
    name,
    status,
  };
}

function buildProbe(
  name: string,
  status: DeploymentCheckStatus,
  message: string,
  startedAt: number | null,
): RuntimeProbe {
  return {
    ...buildCheck(name, status, message),
    latencyMs: startedAt === null ? null : Date.now() - startedAt,
  };
}

export function getExpectedAuthCallbackUrl(env: DeploymentEnv) {
  const appBaseUrl = parseUrl(env.APP_BASE_URL);

  if (!appBaseUrl) {
    return null;
  }

  return new URL("/auth/callback", appBaseUrl).toString();
}

export function buildDeploymentConfigChecks(env: DeploymentEnv): DeploymentCheck[] {
  const appBaseUrl = parseUrl(env.APP_BASE_URL);
  const supabaseUrl = parseUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey = present(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRoleKey = present(env.SUPABASE_SERVICE_ROLE_KEY);
  const hasDatabaseUrl = present(env.DATABASE_URL);

  return [
    appBaseUrl
      ? buildCheck("APP_BASE_URL", appBaseUrl.protocol === "https:" ? "pass" : "warn", "Application base URL is set.")
      : buildCheck("APP_BASE_URL", "fail", "Required for Supabase email link redirects."),
    supabaseUrl
      ? buildCheck(
          "NEXT_PUBLIC_SUPABASE_URL",
          supabaseUrl.protocol === "https:" ? "pass" : "warn",
          "Supabase project URL is configured.",
        )
      : buildCheck("NEXT_PUBLIC_SUPABASE_URL", "fail", "Required before Supabase Auth can run."),
    hasAnonKey
      ? buildCheck("NEXT_PUBLIC_SUPABASE_ANON_KEY", "pass", "Supabase anon key is present.")
      : buildCheck("NEXT_PUBLIC_SUPABASE_ANON_KEY", "fail", "Required for browser and server session clients."),
    hasServiceRoleKey
      ? buildCheck("SUPABASE_SERVICE_ROLE_KEY", "pass", "Supabase service role key is present server-side.")
      : buildCheck("SUPABASE_SERVICE_ROLE_KEY", "fail", "Required for deployment diagnostics and privileged backend work."),
    hasAnonKey && hasServiceRoleKey && env.NEXT_PUBLIC_SUPABASE_ANON_KEY === env.SUPABASE_SERVICE_ROLE_KEY
      ? buildCheck("SUPABASE_KEY_SEPARATION", "fail", "Anon key and service role key must not be identical.")
      : buildCheck("SUPABASE_KEY_SEPARATION", hasAnonKey && hasServiceRoleKey ? "pass" : "skip", "Key separation checked."),
    hasDatabaseUrl
      ? buildCheck("DATABASE_URL", "pass", "Database connection string is present.")
      : buildCheck("DATABASE_URL", "fail", "Required for Drizzle and Supabase Postgres access."),
    getExpectedAuthCallbackUrl(env)
      ? buildCheck("AUTH_CALLBACK_URL", "warn", "Verify this URL is allowed in Supabase Auth redirect settings.")
      : buildCheck("AUTH_CALLBACK_URL", "fail", "Cannot derive /auth/callback until APP_BASE_URL is configured."),
  ];
}

function getHealthStatus(checks: DeploymentCheck[], probes: RuntimeProbe[]): DeploymentHealthStatus {
  const allItems = [...checks, ...probes];

  if (allItems.some((item) => item.status === "fail")) {
    return "error";
  }

  if (allItems.some((item) => item.status === "warn" || item.status === "skip")) {
    return "degraded";
  }

  return "ok";
}

async function probeDatabase(databaseUrl: string | undefined): Promise<RuntimeProbe> {
  if (!present(databaseUrl)) {
    return buildProbe("database_connectivity", "skip", "DATABASE_URL is not configured.", null);
  }

  const startedAt = Date.now();
  const sql = postgres(databaseUrl, {
    connect_timeout: 5,
    idle_timeout: 1,
    max: 1,
    prepare: false,
  });

  try {
    await sql`select 1 as ok`;

    return buildProbe("database_connectivity", "pass", "Database accepted a simple query.", startedAt);
  } catch {
    return buildProbe("database_connectivity", "fail", "Database query failed.", startedAt);
  } finally {
    await sql.end({ timeout: 1 }).catch(() => undefined);
  }
}

async function probeSupabaseServiceRole(env: DeploymentEnv): Promise<RuntimeProbe> {
  if (!present(env.NEXT_PUBLIC_SUPABASE_URL) || !present(env.SUPABASE_SERVICE_ROLE_KEY)) {
    return buildProbe("supabase_service_role", "skip", "Supabase URL or service role key is missing.", null);
  }

  const startedAt = Date.now();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      return buildProbe("supabase_service_role", "fail", "Supabase admin API rejected the service role key.", startedAt);
    }

    return buildProbe("supabase_service_role", "pass", "Supabase admin API accepted the service role key.", startedAt);
  } catch {
    return buildProbe("supabase_service_role", "fail", "Supabase admin API probe failed.", startedAt);
  }
}

function getDeploymentEnv(env: DeploymentEnv | undefined): DeploymentEnv {
  if (env) {
    return env;
  }

  return {
    APP_BASE_URL: process.env.APP_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export async function getDeploymentHealthReport(
  options: HealthReportOptions = {},
): Promise<DeploymentHealthReport> {
  const env = getDeploymentEnv(options.env);
  const checks = buildDeploymentConfigChecks(env);
  const probes =
    options.runRuntimeProbes === false
      ? [
          buildProbe("database_connectivity", "skip", "Runtime probes disabled for this request.", null),
          buildProbe("supabase_service_role", "skip", "Runtime probes disabled for this request.", null),
        ]
      : await Promise.all([probeDatabase(env.DATABASE_URL), probeSupabaseServiceRole(env)]);

  return {
    app: "netrix-web",
    checks,
    expectedAuthCallbackUrl: getExpectedAuthCallbackUrl(env),
    probes,
    stage: "deployment-readiness",
    status: getHealthStatus(checks, probes),
    timestamp: new Date().toISOString(),
  };
}
