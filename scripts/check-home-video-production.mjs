import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const BASE = (process.env.HERMES_PRODUCTION_URL ?? "https://hermeslogisticsus.com").replace(/\/$/, "");
const HOME = `${BASE}/?video-proof=${Date.now()}`;
const LANES = [
  {
    id: "logistics",
    stage: '[data-home-cinematic-slot="logistics"]',
    video: '[data-home-cinematic-video="logistics"]',
    source: '[data-cinematic-src]',
  },
  {
    id: "technology",
    stage: "[data-home-technology-cinematic]",
    video: "[data-home-progressive-video]",
    source: "[data-home-progressive-source]",
  },
  {
    id: "academy",
    stage: "[data-home-academy-cinematic]",
    video: "[data-home-progressive-video]",
    source: "[data-home-progressive-source]",
  },
  {
    id: "marketing",
    stage: "[data-home-marketing-cinematic]",
    video: "[data-home-progressive-video]",
    source: "[data-home-progressive-source]",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function rangeProbe(url) {
  const response = await fetch(url, {
    headers: {
      Range: "bytes=0-1023",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "User-Agent": "HermesHomeVideoProductionProof/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";
  const contentRange = response.headers.get("content-range") ?? "";
  const acceptRanges = response.headers.get("accept-ranges") ?? "";
  assert.equal(response.status, 206, `Range probe must return 206 for ${url}; got ${response.status}`);
  assert.match(contentType, /^video\/mp4\b/i, `Unexpected video content type for ${url}: ${contentType}`);
  assert.match(contentRange, /^bytes\s+0-\d+\/\d+$/i, `Missing/invalid Content-Range for ${url}: ${contentRange}`);
  assert.ok(bytes.byteLength > 0, `Range probe returned zero bytes for ${url}`);
  if (acceptRanges) assert.match(acceptRanges, /bytes/i, `Unexpected Accept-Ranges for ${url}: ${acceptRanges}`);
  return { status: response.status, contentType, contentRange, acceptRanges, bytes: bytes.byteLength };
}

async function videoFrame(video) {
  return video.evaluate((node) => {
    const el = node;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 18;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("2D canvas unavailable");
    ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
    return Array.from(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
  });
}

function frameDelta(a, b) {
  assert.equal(a.length, b.length);
  let changedPixels = 0;
  let absoluteDelta = 0;
  for (let i = 0; i < a.length; i += 4) {
    const delta =
      Math.abs(a[i] - b[i]) +
      Math.abs(a[i + 1] - b[i + 1]) +
      Math.abs(a[i + 2] - b[i + 2]);
    absoluteDelta += delta;
    if (delta >= 6) changedPixels += 1;
  }
  return {
    changedPixels,
    absoluteDelta,
    meanRgbDelta: absoluteDelta / Math.max(1, (a.length / 4) * 3),
  };
}

async function proveLane(page, lane) {
  const stage = page.locator(lane.stage).first();
  const video = stage.locator(lane.video).first();
  await assert.doesNotReject(() => stage.waitFor({ state: "visible", timeout: 15_000 }), `${lane.id} stage missing`);
  await stage.scrollIntoViewIfNeeded();

  await page.waitForFunction(
    ({ stageSelector, videoSelector }) => {
      const stageNode = document.querySelector(stageSelector);
      const videoNode = stageNode?.querySelector(videoSelector);
      if (!(videoNode instanceof HTMLVideoElement)) return false;
      const style = getComputedStyle(videoNode);
      const rect = videoNode.getBoundingClientRect();
      return (
        videoNode.error === null &&
        videoNode.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        videoNode.videoWidth > 0 &&
        videoNode.videoHeight > 0 &&
        videoNode.paused === false &&
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number.parseFloat(style.opacity || "1") > 0.05
      );
    },
    { stageSelector: lane.stage, videoSelector: lane.video },
    { timeout: 20_000 },
  );

  const before = await video.evaluate((el) => ({
    currentTime: el.currentTime,
    readyState: el.readyState,
    networkState: el.networkState,
    width: el.videoWidth,
    height: el.videoHeight,
    paused: el.paused,
    currentSrc: el.currentSrc,
    error: el.error?.code ?? null,
  }));
  assert.ok(before.currentSrc, `${lane.id}: currentSrc is empty`);
  assert.equal(before.error, null, `${lane.id}: media error before sample`);

  const frameA = await videoFrame(video);
  await sleep(900);
  const frameB = await videoFrame(video);
  const afterTime = await video.evaluate((el) => el.currentTime);
  assert.ok(afterTime > before.currentTime + 0.05, `${lane.id}: currentTime did not advance`);

  const delta = frameDelta(frameA, frameB);
  assert.ok(
    delta.changedPixels >= 4 || delta.meanRgbDelta >= 0.15,
    `${lane.id}: decoded frames did not change meaningfully: ${JSON.stringify(delta)}`,
  );

  // Regression guard for #1991: moving the pointer away cannot freeze a still-visible window.
  const pointerT0 = afterTime;
  await page.mouse.move(0, 0);
  await sleep(600);
  const pointerState = await video.evaluate((el) => ({ paused: el.paused, currentTime: el.currentTime }));
  assert.equal(pointerState.paused, false, `${lane.id}: pointer movement paused visible video`);
  assert.ok(pointerState.currentTime > pointerT0 + 0.03, `${lane.id}: pointer movement froze visible video`);

  const delivery = await rangeProbe(before.currentSrc);
  const state = await stage.evaluate((node) => ({
    mediaState: node.getAttribute("data-media-state"),
    videoQuality: node.getAttribute("data-video-quality"),
  }));
  const evidence = {
    lane: lane.id,
    source: before.currentSrc,
    readyState: before.readyState,
    networkState: before.networkState,
    dimensions: `${before.width}x${before.height}`,
    currentTimeDelta: Number((pointerState.currentTime - before.currentTime).toFixed(3)),
    frameDelta: delta,
    delivery,
    state,
  };
  console.log("HOME_VIDEO_LANE", JSON.stringify(evidence));
  return evidence;
}

async function provePosterOnly({ reducedMotion = "no-preference", saveData = false, label }) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion,
  });
  try {
    if (saveData) {
      await context.addInitScript(() => {
        Object.defineProperty(navigator, "connection", {
          configurable: true,
          value: {
            saveData: true,
            effectiveType: "4g",
            downlink: 10,
            addEventListener() {},
            removeEventListener() {},
          },
        });
      });
    }
    const page = await context.newPage();
    await page.goto(`${BASE}/?${label}=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    for (const lane of LANES) {
      const stage = page.locator(lane.stage).first();
      await stage.scrollIntoViewIfNeeded();
      await sleep(250);
      const result = await stage.evaluate((node, selectors) => {
        const video = node.querySelector(selectors.video);
        const source = node.querySelector(selectors.source);
        return {
          paused: video instanceof HTMLVideoElement ? video.paused : null,
          sourceAttached: source?.hasAttribute("src") ?? false,
          sourceValue: source?.getAttribute("src") ?? null,
        };
      }, { video: lane.video, source: lane.source });
      assert.equal(result.paused, true, `${label}/${lane.id}: video must remain paused`);
      assert.equal(result.sourceAttached, false, `${label}/${lane.id}: source must not be eagerly attached`);
      console.log("HOME_VIDEO_FALLBACK", JSON.stringify({ policy: label, lane: lane.id, ...result }));
    }
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
  });
  try {
    const page = await context.newPage();
    await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 30_000 });
    for (const lane of LANES) await proveLane(page, lane);
  } finally {
    await context.close();
  }

  await provePosterOnly({ reducedMotion: "reduce", saveData: false, label: "reduced-motion" });
  await provePosterOnly({ reducedMotion: "no-preference", saveData: true, label: "save-data" });
  console.log("Home video production proof passed for all four lanes.");
} finally {
  await browser.close();
}
