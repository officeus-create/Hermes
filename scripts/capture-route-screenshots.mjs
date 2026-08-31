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

async function readLayout(page) {
  return page.evaluate(() => ({
    documentScrollWidth: document.documentElement.scrollWidth,
    documentClientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body?.scrollWidth ?? 0,
    viewportWidth: window.innerWidth,
    drawerOpen: Boolean(document.querySelector("[data-hermes-drawer].open")),
  }));
}

async function verifyMobileWorkspaceDrawer(page, route, viewport) {
  if (viewport.id !== "mobile" || route.id !== "hermes-connect-workspace") return null;

  const initial = await readLayout(page);
  if (initial.drawerOpen) {
    throw new Error(`${route.path} must load with the Hermes drawer closed on mobile`);
  }
  if (initial.documentScrollWidth > viewport.width + 1) {
    throw new Error(
      `${route.path} has mobile document overflow before interaction: ${initial.documentScrollWidth}px > ${viewport.width}px`,
    );
  }

  const opener = page.locator("[data-hermes-open]:visible").first();
  await opener.click();
  await page.waitForTimeout(80);

  const openState = await page.evaluate(() => {
    const drawer = document.querySelector("[data-hermes-drawer]");
    const rect = drawer?.getBoundingClientRect();
    return {
      drawerOpen: Boolean(drawer?.classList.contains("open")),
      drawerLeft: rect?.left ?? null,
      drawerRight: rect?.right ?? null,
      documentScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  if (!openState.drawerOpen) throw new Error(`${route.path} Hermes drawer did not open on mobile`);
  if (openState.drawerLeft == null || openState.drawerRight == null) {
    throw new Error(`${route.path} Hermes drawer has no measurable mobile bounds`);
  }
  if (openState.drawerLeft < -1 || openState.drawerRight > viewport.width + 1) {
    throw new Error(
      `${route.path} Hermes drawer escapes mobile viewport: left=${openState.drawerLeft}, right=${openState.drawerRight}, viewport=${viewport.width}`,
    );
  }
  if (openState.documentScrollWidth > viewport.width + 1) {
    throw new Error(
      `${route.path} overflows while Hermes drawer is open: ${openState.documentScrollWidth}px > ${viewport.width}px`,
    );
  }

  const closer = page.locator("[data-hermes-close]:visible").first();
  await closer.click();
  await page.waitForTimeout(80);

  const closedAgain = await readLayout(page);
  if (closedAgain.drawerOpen) throw new Error(`${route.path} Hermes drawer did not close on mobile`);
  if (closedAgain.documentScrollWidth > viewport.width + 1) {
    throw new Error(
      `${route.path} overflows after closing Hermes drawer: ${closedAgain.documentScrollWidth}px > ${viewport.width}px`,
    );
  }

  return { initial, openState, closedAgain };
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

        const drawerVerification = await verifyMobileWorkspaceDrawer(page, route, viewport);
        const layout = await readLayout(page);
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
          documentScrollWidth: layout.documentScrollWidth,
          documentClientWidth: layout.documentClientWidth,
          bodyScrollWidth: layout.bodyScrollWidth,
          drawerVerification,
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
