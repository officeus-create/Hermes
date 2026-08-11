import { defineConfig, devices } from "@playwright/test";

const ordinaryE2eStorageState = {
  cookies: [],
  origins: [
    {
      origin: "http://127.0.0.1:4321",
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
    baseURL: "http://127.0.0.1:4321",
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
    command: "npm run preview -- --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
});
