import assert from "node:assert/strict";
import { chromium } from "playwright";

const origin = "https://connect.hermeslogisticsus.com";
const path = "/search-opportunity-radar/?_hermes_ga4_smoke=1";
const measurementId = "G-RY26321PVW";

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_USE_SYSTEM_CHROME ? { channel: "chrome" } : {}),
});
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const collects = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/.test(url)) {
      collects.push({ url, at: Date.now() });
    }
  });
  await page.addInitScript(() => {
    try { localStorage.removeItem("hermes-analytics-consent"); } catch {}
  });
  await page.goto(origin + path, { waitUntil: "domcontentloaded", timeout: 45_000 });

  const allow = page.locator("#hermes-connect-analytics-consent .connect-analytics-allow");
  await allow.waitFor({ state: "visible", timeout: 15_000 });
  await allow.click();

  const grantDeadline = Date.now() + 15_000;
  while (collects.length === 0 && Date.now() < grantDeadline) {
    await page.waitForTimeout(250);
  }
  assert.ok(collects.length > 0, "synthetic granted production session must emit at least one GA collect before withdrawal");

  await page.waitForTimeout(1500);
  await page.locator("#hermes-connect-analytics-manage").click();
  const decline = page.locator("#hermes-connect-analytics-consent .connect-analytics-decline");
  await decline.waitFor({ state: "visible", timeout: 10_000 });

  const beforeWithdrawal = collects.length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30_000 }),
    decline.click(),
  ]);
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1800);

  const state = await page.evaluate((id) => ({
    consent: localStorage.getItem("hermes-analytics-consent"),
    disabled: window[`ga-disable-${id}`] === true,
    gaScript: Boolean(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')),
    transport: document.documentElement.dataset.analyticsTransport || null,
  }), measurementId);

  assert.equal(state.consent, "denied", "withdrawal must persist denied");
  assert.equal(state.disabled, true, "GA kill switch must remain true after withdrawal reload");
  assert.equal(state.gaScript, false, "denied reload must not bootstrap GA");
  assert.equal(collects.length, beforeWithdrawal, "no GA collect may start after withdrawal");

  console.log(JSON.stringify({
    ok: true,
    beforeWithdrawal,
    afterWithdrawal: collects.length,
    consent: state.consent,
    disabled: state.disabled,
    gaScript: state.gaScript,
    transport: state.transport,
  }, null, 2));
} finally {
  await browser.close();
}
