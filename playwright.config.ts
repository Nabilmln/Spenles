import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { parseE2eEnvironment } from "./e2e/support/environment";

loadEnv({ path: ".env.e2e.local", override: true, quiet: true });
loadEnv({ path: ".env.local", override: false, quiet: true });

const environment = parseE2eEnvironment(process.env);

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/*.test.ts"],
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: environment.baseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: environment.baseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: environment.testDatabaseUrl,
      NEON_AUTH_BASE_URL: environment.authBaseUrl,
      NEXT_PUBLIC_APP_URL: environment.baseUrl,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
