import fs from "node:fs/promises";
import { chromium } from "@playwright/test";

const URL = "https://hermeslogisticsus.com/";
const OUTPUT_DIR = process.env.OUTPUT_DIR || "artifacts/homepage-hero-session-control";
const PAIRS = Number(process.env.PAIRS || 5);

const median = (values) => {
  const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const round = (value) => Number.isFinite(value) ? Math.round(value * 10) / 10 : null;

const browser = await chromium.launch({ headless: true });
const runs = [];

async function runMode(mode, pair, order) {
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
    hasTouch: true,
  });

  await context.addInitScript(({ selectedMode }) => {
    try {
      if (selectedMode === "regular") {
        sessionStorage.setItem("hermes-intro-seen", "true");
      } else {
        sessionStorage.removeItem("hermes-intro-seen");
      }
    } catch {
      // The diagnostic records the final intro state below.
    }

    window.__seo12HeroDiagnostic = { lcp: [] };
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const element = entry.element;
          window.__seo12HeroDiagnostic.lcp.push({
            startTime: entry.startTime,
            renderTime: entry.renderTime || 0,
            loadTime: entry.loadTime || 0,
            size: entry.size || 0,
            tagName: element?.tagName || null,
            id: element?.id || null,
            className: typeof element?.className === "string" ? element.className : null,
            currentSrc: element?.currentSrc || element?.src || null,
            alt: element?.alt || null,
          });
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // Unsupported observer data is surfaced as an empty LCP list.
    }
  }, { selectedMode: mode });

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
    uploadThroughput: Math.floor((750 * 1024) / 8),
    connectionType: "cellular3g",
  });

  const startedAt = Date.now();
  await page.goto(URL, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(5_000);

  const result = await page.evaluate(() => {
    const hero = document.querySelector("section#top .hero-media picture img");
    const heroMedia = document.querySelector("section#top .hero-media");
    const intro = document.querySelector("[data-site-intro]");
    const nav = performance.getEntriesByType("navigation")[0];
    const lcpEntries = window.__seo12HeroDiagnostic?.lcp || [];
    const lcp = lcpEntries.at(-1) || null;
    const currentSrc = hero?.currentSrc || hero?.src || null;
    const resources = performance.getEntriesByType("resource");
    const resource = currentSrc
      ? resources.find((entry) => entry.name === currentSrc)
        || resources.find((entry) => currentSrc.includes(entry.name) || entry.name.includes(currentSrc))
      : null;
    const heroStyle = hero ? getComputedStyle(hero) : null;
    const mediaStyle = heroMedia ? getComputedStyle(heroMedia) : null;
    const introStyle = intro ? getComputedStyle(intro) : null;

    return {
      href: location.href,
      hash: location.hash,
      introSeen: (() => {
        try { return sessionStorage.getItem("hermes-intro-seen"); } catch { return null; }
      })(),
      introPending: document.documentElement.classList.contains("intro-pending"),
      motionEnabled: document.documentElement.classList.contains("motion-enabled"),
      hero: hero ? {
        complete: hero.complete,
        naturalWidth: hero.naturalWidth,
        naturalHeight: hero.naturalHeight,
        currentSrc,
        rect: hero.getBoundingClientRect().toJSON(),
        style: heroStyle ? {
          display: heroStyle.display,
          visibility: heroStyle.visibility,
          opacity: heroStyle.opacity,
          transform: heroStyle.transform,
          animationName: heroStyle.animationName,
          animationDuration: heroStyle.animationDuration,
        } : null,
      } : null,
      heroMediaStyle: mediaStyle ? {
        display: mediaStyle.display,
        visibility: mediaStyle.visibility,
        opacity: mediaStyle.opacity,
        transform: mediaStyle.transform,
        animationName: mediaStyle.animationName,
        animationDuration: mediaStyle.animationDuration,
      } : null,
      intro: intro ? {
        display: introStyle?.display || null,
        visibility: introStyle?.visibility || null,
        opacity: introStyle?.opacity || null,
        rect: intro.getBoundingClientRect().toJSON(),
      } : null,
      navigation: nav ? {
        startTime: nav.startTime,
        responseStart: nav.responseStart,
        responseEnd: nav.responseEnd,
        domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
        loadEventEnd: nav.loadEventEnd,
      } : null,
      resource: resource ? {
        name: resource.name,
        initiatorType: resource.initiatorType,
        startTime: resource.startTime,
        responseStart: resource.responseStart,
        responseEnd: resource.responseEnd,
        duration: resource.duration,
        transferSize: resource.transferSize,
        decodedBodySize: resource.decodedBodySize,
      } : null,
      lcp,
      lcpEntries,
    };
  });

  const heroLcp = result.lcp?.currentSrc && result.hero?.currentSrc
    ? result.lcp.currentSrc === result.hero.currentSrc
    : result.lcp?.tagName === "IMG" && result.lcp?.alt === result.hero?.alt;
  const resourceEnd = result.resource?.responseEnd ?? null;
  const lcpTime = result.lcp?.renderTime || result.lcp?.startTime || null;

  const record = {
    mode,
    pair,
    order,
    wallMs: Date.now() - startedAt,
    ...result,
    derived: {
      heroIsLcp: Boolean(heroLcp),
      heroRenderDelayMs: Number.isFinite(lcpTime) && Number.isFinite(resourceEnd) ? round(lcpTime - resourceEnd) : null,
      ttfbMs: round(result.navigation?.responseStart),
      heroResourceDelayMs: Number.isFinite(result.resource?.startTime) && Number.isFinite(result.navigation?.responseStart)
        ? round(result.resource.startTime - result.navigation.responseStart)
        : null,
    },
  };

  await context.close();
  return record;
}

for (let pair = 1; pair <= PAIRS; pair += 1) {
  const order = pair % 2 === 1 ? ["first", "regular"] : ["regular", "first"];
  for (let index = 0; index < order.length; index += 1) {
    const mode = order[index];
    const record = await runMode(mode, pair, index + 1);
    runs.push(record);
    console.log(JSON.stringify({
      pair,
      mode,
      lcp: round(record.lcp?.startTime),
      renderDelay: record.derived.heroRenderDelayMs,
      introPending: record.introPending,
      heroIsLcp: record.derived.heroIsLcp,
      hash: record.hash,
    }));
  }
}

await browser.close();

const byMode = Object.groupBy(runs, (run) => run.mode);
const summarize = (mode) => {
  const items = byMode[mode] || [];
  return {
    runs: items.length,
    lcpMedianMs: round(median(items.map((run) => run.lcp?.startTime))),
    heroRenderDelayMedianMs: round(median(items.map((run) => run.derived.heroRenderDelayMs))),
    ttfbMedianMs: round(median(items.map((run) => run.derived.ttfbMs))),
    heroResourceDelayMedianMs: round(median(items.map((run) => run.derived.heroResourceDelayMs))),
    heroIsLcpCount: items.filter((run) => run.derived.heroIsLcp).length,
    introPendingCount: items.filter((run) => run.introPending).length,
    hashes: [...new Set(items.map((run) => run.hash))],
  };
};

const first = summarize("first");
const regular = summarize("regular");
const summary = {
  checkedAt: new Date().toISOString(),
  url: URL,
  pairs: PAIRS,
  control: "same exact / URL; fresh browser context per run; regular mode pre-seeds sessionStorage via addInitScript before page scripts; no hash/query product bypass",
  first,
  regular,
  deltaFirstMinusRegular: {
    lcpMedianMs: round((first.lcpMedianMs ?? 0) - (regular.lcpMedianMs ?? 0)),
    heroRenderDelayMedianMs: round((first.heroRenderDelayMedianMs ?? 0) - (regular.heroRenderDelayMedianMs ?? 0)),
    ttfbMedianMs: round((first.ttfbMedianMs ?? 0) - (regular.ttfbMedianMs ?? 0)),
  },
};

await fs.mkdir(OUTPUT_DIR, { recursive: true });
await fs.writeFile(`${OUTPUT_DIR}/runs.json`, `${JSON.stringify(runs, null, 2)}\n`);
await fs.writeFile(`${OUTPUT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(`${OUTPUT_DIR}/summary.md`, `# Homepage hero session-control diagnostic\n\n- URL: ${URL}\n- Pairs: ${PAIRS}\n- Control: exact same \\`/\\` URL, fresh context per run, no hash/query bypass.\n- Regular mode: \\`sessionStorage.hermes-intro-seen=true\\` injected before page scripts.\n\n| Metric | First visit | Regular home | First - regular |\n|---|---:|---:|---:|\n| LCP median | ${first.lcpMedianMs} ms | ${regular.lcpMedianMs} ms | ${summary.deltaFirstMinusRegular.lcpMedianMs} ms |\n| Hero render delay median | ${first.heroRenderDelayMedianMs} ms | ${regular.heroRenderDelayMedianMs} ms | ${summary.deltaFirstMinusRegular.heroRenderDelayMedianMs} ms |\n| TTFB median | ${first.ttfbMedianMs} ms | ${regular.ttfbMedianMs} ms | ${summary.deltaFirstMinusRegular.ttfbMedianMs} ms |\n| Hero-is-LCP | ${first.heroIsLcpCount}/${first.runs} | ${regular.heroIsLcpCount}/${regular.runs} | — |\n| intro-pending | ${first.introPendingCount}/${first.runs} | ${regular.introPendingCount}/${regular.runs} | — |\n\nDiagnostic only; do not infer a production change unless the same-URL paired result is stable and the LCP node is the same hero in both modes.\n`);

console.log(JSON.stringify(summary, null, 2));
