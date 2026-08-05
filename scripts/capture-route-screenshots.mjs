import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import {
  DEFAULT_SCREENSHOT_ROUTES,
  SCREENSHOT_VIEWPORTS,
  parseScreenshotBaseUrl,
  screenshotFileName,
  screenshotUrl,
  validateScreenshotRoutes,
} from "./route-screenshot-contract.mjs";

const baseUrl = parseScreenshotBaseUrl(
  process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:4321/",
  { allowRemote: process.env.ALLOW_REMOTE_SCREENSHOTS === "true" },
);
const outputDirectory = path.resolve(
  process.env.SCREENSHOT_OUTPUT_DIR || "artifacts/route-screenshots",
);
const routes = validateScreenshotRoutes();

async function sha256(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

async function capture() {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const observations = [];

  try {
    for (const viewport of SCREENSHOT_VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        colorScheme: "light",
        locale: "en-US",
      });

      await context.route("**/*", async (route) => {
        const requestUrl = new URL(route.request().url());
        if (
          requestUrl.origin === baseUrl.origin ||
          requestUrl.protocol === "data:" ||
          requestUrl.protocol === "blob:"
        ) {
          await route.continue();
          return;
        }
        await route.abort("blockedbyclient");
      });

      const page = await context.newPage();
      for (const route of routes) {
        const url = screenshotUrl(baseUrl, route.path);
        const response = await page.goto(url.href, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        await page.waitForTimeout(350);

        const status = response?.status() ?? 0;
        if (status === 0 || status >= 400) {
          throw new Error(`${route.path} returned screenshot status ${status}`);
        }

        const fileName = screenshotFileName(route.id, viewport.id);
        const filePath = path.join(outputDirectory, fileName);
        await page.screenshot({ path: filePath, fullPage: true, animations: "disabled" });

        observations.push({
          routeId: route.id,
          routePath: route.path,
          viewport: viewport.id,
          width: viewport.width,
          height: viewport.height,
          status,
          title: await page.title(),
          finalPath: new URL(page.url()).pathname,
          file: fileName,
          sha256: await sha256(filePath),
        });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: "local-reviewed-build",
    productionEvidence: false,
    baseOrigin: baseUrl.origin,
    gitSha: process.env.GITHUB_SHA || process.env.GIT_SHA || null,
    retentionDays: 14,
    externalRequestsBlocked: true,
    observations,
  };
  await writeFile(
    path.join(outputDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `Captured ${observations.length} route/viewport screenshots in ${outputDirectory}`,
  );
}

capture().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
