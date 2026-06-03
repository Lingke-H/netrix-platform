import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { getServerEnv } from "@/lib/env";
import * as schema from "@/server/db/schema";

export function createDb() {
  const { DATABASE_URL } = getServerEnv();

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required before creating a database client.");
  }

  const queryClient = postgres(DATABASE_URL, {
    prepare: false,
  });

  return drizzle(queryClient, { schema });
}

export type DbClient = ReturnType<typeof createDb>;
