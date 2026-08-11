import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  timeout: 45_000,
  reporter: process.env.CI ? "github" : "list",
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.HERMES_PRODUCTION_URL ?? "https://hermeslogisticsus.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "production-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
