import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

const baseURL = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";
const hasDatabase = Boolean(process.env.DATABASE_URL);

export default defineConfig({
  globalSetup: "./tests/e2e/global-setup.cjs",
  testDir: "./tests/e2e",
  reporter: "list",
  webServer: hasDatabase
    ? {
        command: "pnpm dev",
        env: {
          ...process.env,
          NETRIX_DEMO_AUTH_BYPASS_USER_ID: "10000000-0000-4000-8000-000000000001",
          NETRIX_ENABLE_DEMO_AUTH_BYPASS: "true",
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: baseURL,
      }
    : undefined,
  use: {
    baseURL,
  },
});
