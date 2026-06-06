/* eslint-disable @typescript-eslint/no-require-imports */

const { execFileSync } = require("node:child_process");
const path = require("node:path");

module.exports = async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    console.warn("Skipping NeTrix demo seed because DATABASE_URL is not configured.");
    return;
  }

  const webRoot = path.resolve(__dirname, "../..");
  const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

  execFileSync(pnpmCommand, ["db:seed"], {
    cwd: webRoot,
    env: process.env,
    stdio: "inherit",
  });
};
