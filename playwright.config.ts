import { defineConfig, devices } from "@playwright/test";

const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 6_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4321",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: chromiumExecutable
      ? {
          executablePath: chromiumExecutable,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        }
      : undefined,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ASTRO_TELEMETRY_DISABLED: "1",
      XDG_CONFIG_HOME: "/tmp/hermes-playwright-config",
    },
  },
});
