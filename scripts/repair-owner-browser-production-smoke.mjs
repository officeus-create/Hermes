import { chromium } from "@playwright/test";

const BASE = "https://hermeslogisticsus.com";
const REPAIR_ROOT = "/services/hermes-connect/repair-shops/";
const AUTH = `${REPAIR_ROOT}auth/`;
const DASHBOARD = `${REPAIR_ROOT}dashboard/`;
const MEASUREMENT_ID = "G-RY26321PVW";
const EMAIL = "repair-booking-production-smoke@hermesconnect.app";
const runId = process.env.GITHUB_RUN_ID || `manual-${Date.now()}`;
const PASSWORD = `HermesBrowser-${runId}-${Date.now()}-A9!`;
const NAME = "Hermes Browser Smoke Owner";
const FEEDBACK = "Synthetic current-main production browser proof feedback; safe to delete after verification.";

async function requireExactPagesDeploy() {
  const sha = process.env.GITHUB_SHA;
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!sha || !repository || !token) throw new Error("GitHub exact-main deployment metadata unavailable");
  const response = await fetch(`https://api.github.com/repos/${repository}/commits/${sha}/check-runs?per_page=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "hermes-repair-owner-browser-production-smoke",
    },
  });
  if (!response.ok) throw new Error(`Unable to read exact-main deployment checks (${response.status})`);
  const data = await response.json();
  const pages = (data.check_runs || []).filter((check) => check.name === "Cloudflare Pages").sort((a, b) => String(a.started_at || "").localeCompare(String(b.started_at || ""))).at(-1);
  if (!pages || pages.status !== "completed" || pages.conclusion !== "success") {
    throw new Error("Exact-main Cloudflare Pages deployment is not successful");
  }
}

async function cleanup() {
  const response = await fetch(`${BASE}/api/repair-shop/cleanup-booking-smoke`, { method: "POST" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success !== true || Number(data.remaining || 0) !== 0) {
    throw new Error(`Synthetic browser cleanup failed (${response.status})`);
  }
}

async function gotoOk(page, path) {
  const url = new URL(path, BASE);
  url.searchParams.set("_hermes_ga4_smoke", "1");
  const response = await page.goto(url.toString(), { waitUntil: "domcontentloaded", timeout: 30_000 });
  if (!response || response.status() !== 200) throw new Error(`Unexpected HTTP status for ${path}: ${response?.status() ?? 0}`);
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (metrics.documentWidth > metrics.viewport + 1 || metrics.bodyWidth > metrics.viewport + 1) {
    throw new Error(`${label} horizontal overflow: viewport=${metrics.viewport}, document=${metrics.documentWidth}, body=${metrics.bodyWidth}`);
  }
}

async function verifyLanding(page, label) {
  await gotoOk(page, REPAIR_ROOT);
  await page.waitForSelector(".repair-live-hero h1", { state: "visible", timeout: 15_000 });
  await assertNoHorizontalOverflow(page, `${label} landing`);
}

function ga4CollectPayload(request) {
  try {
    const url = new URL(request.url());
    if (!url.hostname.endsWith("google-analytics.com") || !url.pathname.endsWith("/g/collect")) return null;
    const payloads = [url.searchParams];
    const body = request.postData();
    if (body) {
      for (const line of body.split(/\r?\n/).filter(Boolean)) payloads.push(new URLSearchParams(line));
    }
    return payloads;
  } catch {
    return null;
  }
}

function isGa4CollectForStream(request) {
  const payloads = ga4CollectPayload(request);
  return Boolean(payloads?.some((params) => params.get("tid") === MEASUREMENT_ID));
}

function isGa4CompletionCollect(request) {
  const payloads = ga4CollectPayload(request);
  if (!payloads) return false;
  const streamMatches = payloads.some((params) => params.get("tid") === MEASUREMENT_ID);
  const eventMatches = payloads.some((params) => params.get("en") === "repair_shop_registration_complete");
  return streamMatches && eventMatches;
}

async function allowAnalyticsForSyntheticProof(page) {
  const accept = page.locator("[data-consent-accept]");
  await accept.waitFor({ state: "visible", timeout: 15_000 });
  const initialDelivery = page.waitForRequest(isGa4CollectForStream, { timeout: 15_000 });
  await accept.click();
  await page.waitForFunction(() => document.documentElement.dataset.analyticsConsent === "granted", null, { timeout: 10_000 });
  await page.waitForFunction(() => document.documentElement.dataset.analyticsTransport === "ga4", null, { timeout: 10_000 });
  await page.waitForSelector("script[data-hermes-ga4]", { state: "attached", timeout: 10_000 });
  await initialDelivery;
}

async function verifyDashboard(page, label) {
  await page.waitForURL((url) => url.pathname === DASHBOARD, { timeout: 20_000 });
  await page.waitForFunction(
    (email) => document.querySelector("#owner-summary")?.textContent?.includes(email),
    EMAIL,
    { timeout: 20_000 },
  );
  await page.waitForSelector(".repair-crm-shell", { state: "visible", timeout: 10_000 });
  await page.waitForSelector(".workspace-header h1", { state: "visible", timeout: 10_000 });
  await page.waitForFunction(
    () => Boolean(document.querySelector(".workspace-header h1")?.textContent?.trim()),
    null,
    { timeout: 10_000 },
  );
  await page.waitForFunction(
    () => {
      const context = document.querySelector(".repair-crm-context strong")?.textContent?.trim() || "";
      return Boolean(context) && context !== "Today";
    },
    null,
    { timeout: 10_000 },
  );
  await assertNoHorizontalOverflow(page, `${label} dashboard`);
}

await requireExactPagesDeploy();
await cleanup();

const browser = await chromium.launch({ headless: true });
let proofPassed = false;
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktop.newPage();
  await verifyLanding(desktopPage, "desktop");
  await allowAnalyticsForSyntheticProof(desktopPage);
  await gotoOk(desktopPage, AUTH);
  await desktopPage.waitForSelector("#auth-forms.active", { state: "visible", timeout: 15_000 });
  await desktopPage.locator('[data-tab="register"]').click();
  await desktopPage.locator("#reg-name").fill(NAME);
  await desktopPage.locator("#reg-email").fill(EMAIL);
  await desktopPage.locator("#reg-password").fill(PASSWORD);
  await desktopPage.locator("#reg-password-confirm").fill(PASSWORD);
  const ga4CompletionDelivery = desktopPage.waitForRequest(isGa4CompletionCollect, { timeout: 15_000 });
  const registerResponse = desktopPage.waitForResponse((response) => response.url().endsWith("/api/auth/register") && response.request().method() === "POST");
  await desktopPage.locator("#register-form button[type='submit']").click();
  const registered = await registerResponse;
  if (registered.status() !== 201) throw new Error(`Desktop UI registration failed (${registered.status()})`);
  await ga4CompletionDelivery;
  console.log("REPAIR_REGISTRATION_COMPLETE_GA4_DELIVERY_PASS=YES");
  await verifyDashboard(desktopPage, "desktop");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await verifyLanding(mobilePage, "mobile-390");
  await gotoOk(mobilePage, AUTH);
  await mobilePage.waitForSelector("#auth-forms.active", { state: "visible", timeout: 15_000 });
  await assertNoHorizontalOverflow(mobilePage, "mobile-390 auth");
  await mobilePage.locator("#login-email").fill(EMAIL);
  await mobilePage.locator("#login-password").fill(PASSWORD);
  const loginResponse = mobilePage.waitForResponse((response) => response.url().endsWith("/api/auth/login") && response.request().method() === "POST");
  await mobilePage.locator("#login-form button[type='submit']").click();
  const loggedIn = await loginResponse;
  if (loggedIn.status() !== 200) throw new Error(`Mobile UI login failed (${loggedIn.status()})`);
  await verifyDashboard(mobilePage, "mobile-390");

  await mobilePage.locator("#feedback-category").selectOption("mobile");
  await mobilePage.locator("#feedback-rating").selectOption("5");
  await mobilePage.locator("#feedback-message").fill(FEEDBACK);
  const feedbackResponse = mobilePage.waitForResponse((response) => response.url().endsWith("/api/repair-shop/feedback") && response.request().method() === "POST");
  await mobilePage.locator("#submit-feedback-btn").click();
  const feedbackCreated = await feedbackResponse;
  if (feedbackCreated.status() !== 201) throw new Error(`Private feedback submission failed (${feedbackCreated.status()})`);
  await mobilePage.waitForFunction(
    (message) => document.querySelector("#feedback-list")?.textContent?.includes(message),
    FEEDBACK,
    { timeout: 15_000 },
  );
  await assertNoHorizontalOverflow(mobilePage, "mobile-390 dashboard after feedback");
  await mobile.close();

  proofPassed = true;
  console.log("REPAIR_OWNER_DESKTOP_MOBILE_FEEDBACK_PRODUCTION_PASS=YES");
} finally {
  await browser.close();
  await cleanup();
  if (!proofPassed) console.error("REPAIR_OWNER_DESKTOP_MOBILE_FEEDBACK_PRODUCTION_PASS=NO");
}
