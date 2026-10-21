import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";

const allowedHosts = new Set(["hermeslogisticsus.com", "www.hermeslogisticsus.com"]);
const target = new URL(process.env.HOME_VIDEO_RUNTIME_URL || "https://hermeslogisticsus.com/");
const attempts = Number.parseInt(process.env.HOME_VIDEO_RUNTIME_ATTEMPTS || "4", 10);
const delayMs = Number.parseInt(process.env.HOME_VIDEO_RUNTIME_DELAY_MS || "5000", 10);

if (target.protocol !== "https:" || !allowedHosts.has(target.hostname)) {
  throw new Error(`Production Home video check rejected unapproved target: ${target.origin}`);
}
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 12) {
  throw new Error("HOME_VIDEO_RUNTIME_ATTEMPTS must be an integer from 1 through 12.");
}
if (!Number.isInteger(delayMs) || delayMs < 0 || delayMs > 30_000) {
  throw new Error("HOME_VIDEO_RUNTIME_DELAY_MS must be an integer from 0 through 30000.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await chromium.launch({ headless: true });
let lastError = null;

try {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const mediaResponses = new Map();

    page.on("response", async (response) => {
      const url = response.url();
      if (!url.includes("/media/home/") || !url.endsWith(".mp4")) return;
      const headers = await response.allHeaders().catch(() => ({}));
      mediaResponses.set(new URL(url).pathname, {
        status: response.status(),
        contentType: headers["content-type"] || "",
        acceptRanges: headers["accept-ranges"] || "",
      });
    });

    try {
      const url = new URL(target);
      url.searchParams.set("home-video-runtime", `${Date.now()}-${attempt}`);
      const response = await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 30_000 });
      const finalUrl = new URL(page.url());
      if (finalUrl.protocol !== "https:" || !allowedHosts.has(finalUrl.hostname)) {
        throw new Error(`Production Home video check followed unapproved redirect: ${finalUrl.origin}`);
      }
      if ((response?.status() ?? 0) !== 200) {
        throw new Error(`Production Home returned HTTP ${response?.status() ?? 0}`);
      }

      await page.waitForSelector("[data-home-route]", { timeout: 15_000 });
      const reports = [];

      for (const id of ["logistics", "technology", "academy", "marketing"]) {
        const route = page.locator(`[data-route-id="${id}"]`);
        await route.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);

        const video = id === "logistics"
          ? route.locator('[data-home-cinematic-video="logistics"]')
          : route.locator("[data-home-progressive-video]");
        const stage = id === "logistics"
          ? route.locator('[data-home-cinematic-slot="logistics"]')
          : route.locator("[data-home-progressive-cinematic]");

        if (id !== "logistics") await route.hover();

        await page.waitForFunction(
          ({ id }) => {
            const route = document.querySelector(`[data-route-id="${id}"]`);
            const video = route?.querySelector(id === "logistics"
              ? '[data-home-cinematic-video="logistics"]'
              : "[data-home-progressive-video]");
            const stage = route?.querySelector(id === "logistics"
              ? '[data-home-cinematic-slot="logistics"]'
              : "[data-home-progressive-cinematic]");
            if (!(video instanceof HTMLVideoElement) || !stage) return false;
            if (!video.currentSrc || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0 || video.videoHeight <= 0) return false;
            if (video.paused || video.error) return false;
            if (id !== "logistics" && stage.getAttribute("data-media-state") !== "ready") return false;
            const style = getComputedStyle(video);
            return style.display !== "none"
              && style.visibility !== "hidden"
              && Number.parseFloat(style.opacity || "1") > 0.5;
          },
          { id },
          { timeout: 20_000 },
        );

        const before = await video.evaluate((node) => ({
          currentTime: node.currentTime,
          duration: node.duration,
          readyState: node.readyState,
          networkState: node.networkState,
          paused: node.paused,
          currentSrc: node.currentSrc,
          videoWidth: node.videoWidth,
          videoHeight: node.videoHeight,
          error: node.error?.code ?? null,
          display: getComputedStyle(node).display,
          visibility: getComputedStyle(node).visibility,
          opacity: getComputedStyle(node).opacity,
        }));
        const frameBefore = createHash("sha256").update(await video.screenshot()).digest("hex");
        await page.waitForTimeout(1200);
        const frameAfter = createHash("sha256").update(await video.screenshot()).digest("hex");
        const after = await video.evaluate((node) => ({
          currentTime: node.currentTime,
          readyState: node.readyState,
          paused: node.paused,
          error: node.error?.code ?? null,
        }));

        const advancedBy = after.currentTime >= before.currentTime
          ? after.currentTime - before.currentTime
          : Number.isFinite(before.duration) && before.duration > 0
            ? (before.duration - before.currentTime) + after.currentTime
            : 0;
        if (advancedBy < 0.35) {
          throw new Error(`${id} video currentTime did not advance enough: ${advancedBy.toFixed(3)}s`);
        }
        if (frameBefore === frameAfter) {
          throw new Error(`${id} video rendered identical frames across a 1.2s playback sample`);
        }
        if (after.paused || after.readyState < 2 || after.error) {
          throw new Error(`${id} video stopped or lost decode readiness after playback sample`);
        }

        const box = await video.boundingBox();
        if (!box || box.width < 20 || box.height < 20) {
          throw new Error(`${id} video has no visible rendered box`);
        }

        const mediaPath = new URL(before.currentSrc).pathname;
        const delivery = mediaResponses.get(mediaPath);
        if (!delivery || ![200, 206].includes(delivery.status) || !delivery.contentType.includes("video/mp4")) {
          throw new Error(`${id} video delivery proof missing/invalid for ${mediaPath}: ${JSON.stringify(delivery || null)}`);
        }

        reports.push({
          id,
          src: mediaPath,
          delivery,
          readyState: after.readyState,
          dimensions: `${before.videoWidth}x${before.videoHeight}`,
          advancedBy: Number(advancedBy.toFixed(3)),
          opacity: before.opacity,
          visibleFrameChanged: true,
          stageState: await stage.getAttribute("data-media-state"),
        });
      }

      console.log("Production Home video runtime PASS:", JSON.stringify(reports));
      lastError = null;
      await context.close();
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`Production Home video runtime attempt ${attempt} failed: ${lastError}`);
      await context.close();
      if (attempt < attempts) await sleep(delayMs);
    }
  }
} finally {
  await browser.close();
}

if (lastError) {
  throw new Error(`Production Home video runtime was not verified: ${lastError}`);
}
