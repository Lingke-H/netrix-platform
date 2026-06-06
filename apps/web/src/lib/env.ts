import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);
const optionalTrimmedNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional(),
);

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalNonEmptyString,
});

const serverEnvSchema = z.object({
  DATABASE_URL: optionalNonEmptyString,
  SUPABASE_SERVICE_ROLE_KEY: optionalNonEmptyString,
  OPENAI_API_KEY: optionalNonEmptyString,
  OPENAI_MODEL: optionalTrimmedNonEmptyString,
  APP_BASE_URL: optionalUrl,
  NETRIX_ENABLE_DEMO_AUTH_BYPASS: optionalTrimmedNonEmptyString,
  NETRIX_DEMO_AUTH_BYPASS_USER_ID: optionalTrimmedNonEmptyString,
});

export function getClientEnv() {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    APP_BASE_URL: process.env.APP_BASE_URL,
    NETRIX_ENABLE_DEMO_AUTH_BYPASS: process.env.NETRIX_ENABLE_DEMO_AUTH_BYPASS,
    NETRIX_DEMO_AUTH_BYPASS_USER_ID: process.env.NETRIX_DEMO_AUTH_BYPASS_USER_ID,
  });
}
