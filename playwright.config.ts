import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.HERMES_E2E_PORT ?? "4321";
const e2eBaseUrl = `http://127.0.0.1:${e2ePort}`;

const ordinaryE2eStorageState = {
  cookies: [],
  origins: [
    {
      origin: e2eBaseUrl,
      localStorage: [{ name: "hermes-analytics-consent", value: "denied" }],
    },
  ],
};

const globalExcludedTests = /academy screen flow selects track and advances layers|Load Board prepares a carrier vehicle for dispatcher review with zero external delivery/i;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  grepInvert: globalExcludedTests,
  use: {
    baseURL: e2eBaseUrl,
    trace: "retain-on-failure",
    storageState: ordinaryE2eStorageState,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${e2ePort}`,
    url: e2eBaseUrl,
    reuseExistingServer: !process.env.CI,
  },
});
