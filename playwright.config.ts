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

// These legacy site.spec scenarios described the retired multi-layer homepage (intro, hero,
// PathPillars, product showroom, and homepage contact form). Recovery-specific tests now cover
// the four-room entrance, while direction-specific contact tests preserve the business workflows.
const globalExcludedTests = /academy screen flow selects track and advances layers|Load Board prepares a carrier vehicle for dispatcher review with zero external delivery|direction card opens the matching page and preselects the form|business pillars reveal one direction at a time and support keyboard navigation|desktop business portals expand on hover and keep click navigation|premium opening explains four directions, supports choice, and runs once per session|premium opening honors the visitor's reduced-motion preference|homepage hero combines office and handwritten typography with a restrained living i-dot|premium opening plays a direction cue after consented interaction and keeps sound optional|homepage proves the website product and routes to IT Development|homepage presents four Hermes products with honest maturity labels|preview contact workflow validates and sends no request|copy request places sanitized plain text on the clipboard|clipboard failure shows recoverable manual-copy guidance|changing direction clears a stale preview handoff/i;

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
