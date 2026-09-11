import { randomUUID } from "node:crypto";
import { chromium } from "@playwright/test";

const BASE = "https://hermeslogisticsus.com";
const ROOT = "/services/hermes-connect/repair-shops";
const AUTH = `${ROOT}/auth/`;
const DASHBOARD = `${ROOT}/dashboard/`;
const EMAIL = "repair-booking-production-smoke@hermesconnect.app";
const PASSWORD = `${randomUUID()}Aa9!`;
const NAME = "Hermes Locale Session Proof Owner";
const EXPECTED_LANGUAGES = ["en", "ru", "uk", "es", "it", "fr"];

function fail(message) {
  throw new Error(message);
}

async function requireCurrentMainDeployment() {
  const sha = process.env.GITHUB_SHA;
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!sha || !repository || !token) fail("GitHub current-main deployment metadata unavailable");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "hermes-repair-locale-session-production-proof",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const refResponse = await fetch(`https://api.github.com/repos/${repository}/git/ref/heads/main`, { headers });
  if (!refResponse.ok) fail(`Unable to read current main ref (${refResponse.status})`);
  const ref = await refResponse.json();
  if (ref?.object?.sha !== sha) fail(`Verifier SHA ${sha} is not current main ${ref?.object?.sha || "unknown"}`);

  const checksResponse = await fetch(`https://api.github.com/repos/${repository}/commits/${sha}/check-runs?per_page=100`, { headers });
  if (!checksResponse.ok) fail(`Unable to read current-main deployment checks (${checksResponse.status})`);
  const checks = await checksResponse.json();
  const pages = (checks.check_runs || [])
    .filter((check) => check.name === "Cloudflare Pages")
    .sort((a, b) => String(a.started_at || "").localeCompare(String(b.started_at || "")))
    .at(-1);
  if (!pages || pages.status !== "completed" || pages.conclusion !== "success") {
    fail("Current-main Cloudflare Pages deployment is not successful");
  }

  for (const url of [`${BASE}${ROOT}/`, "https://connect.hermeslogisticsus.com/"]) {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) fail(`Production surface unavailable: ${url} (${response.status})`);
  }
}

async function cleanup() {
  const response = await fetch(`${BASE}/api/repair-shop/cleanup-booking-smoke`, { method: "POST" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success !== true || Number(data.remaining || 0) !== 0) {
    fail(`Synthetic cleanup failed (${response.status})`);
  }
}

async function gotoOk(page, path) {
  const response = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  if (!response || response.status() !== 200) fail(`Unexpected HTTP status for ${path}: ${response?.status() ?? 0}`);
}

async function privateProfileStatus(context) {
  const response = await context.request.get(`${BASE}/api/repair-shop/profile`, { failOnStatusCode: false });
  return response.status();
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (metrics.documentWidth > metrics.viewport + 1 || metrics.bodyWidth > metrics.viewport + 1) {
    fail(`${label} horizontal overflow: viewport=${metrics.viewport}, document=${metrics.documentWidth}, body=${metrics.bodyWidth}`);
  }
}

async function assertOwnerLocale(page, locale, contextLabel) {
  await page.waitForSelector(".repair-crm-shell", { state: "visible", timeout: 15_000 });
  await page.waitForFunction(
    ({ expectedLocale, expectedContext }) => {
      const htmlLocale = (document.documentElement.lang || "").toLowerCase();
      const context = document.querySelector(".repair-crm-context small")?.textContent?.trim() || "";
      const summary = document.querySelector(".repair-crm-language summary")?.textContent?.trim().toLowerCase() || "";
      return htmlLocale === expectedLocale && context === expectedContext && summary === expectedLocale;
    },
    { expectedLocale: locale, expectedContext: contextLabel },
    { timeout: 15_000 },
  );
  const stored = await page.evaluate(() => window.localStorage.getItem("hermes-connect-language"));
  if (stored !== locale) fail(`Stored locale mismatch: expected ${locale}, got ${stored || "empty"}`);
}

async function registerOwner(page) {
  await gotoOk(page, AUTH);
  await page.waitForSelector("#auth-forms.active", { state: "visible", timeout: 15_000 });
  await page.locator('[data-tab="register"]').click();
  await page.locator("#reg-name").fill(NAME);
  await page.locator("#reg-email").fill(EMAIL);
  await page.locator("#reg-password").fill(PASSWORD);
  await page.locator("#reg-password-confirm").fill(PASSWORD);
  const registration = page.waitForResponse((response) => response.url().endsWith("/api/auth/register") && response.request().method() === "POST");
  await page.locator("#register-form button[type='submit']").click();
  const response = await registration;
  if (response.status() !== 201) fail(`Synthetic owner registration failed (${response.status()})`);
  await page.waitForURL((url) => url.pathname === DASHBOARD, { timeout: 20_000 });
}

async function loginOwner(page) {
  await gotoOk(page, AUTH);
  await page.waitForSelector("#auth-forms.active", { state: "visible", timeout: 15_000 });
  await page.locator("#login-email").fill(EMAIL);
  await page.locator("#login-password").fill(PASSWORD);
  const login = page.waitForResponse((response) => response.url().endsWith("/api/auth/login") && response.request().method() === "POST");
  await page.locator("#login-form button[type='submit']").click();
  const response = await login;
  if (response.status() !== 200) fail(`Synthetic owner login failed (${response.status()})`);
  await page.waitForURL((url) => url.pathname === DASHBOARD, { timeout: 20_000 });
}

async function switchLocale(page, locale, expectedContext) {
  const details = page.locator(".repair-crm-language");
  const isOpen = await details.evaluate((element) => element.hasAttribute("open"));
  if (!isOpen) await details.locator("summary").click();
  const link = details.locator(`a[lang="${locale}"]`);
  await link.waitFor({ state: "visible", timeout: 10_000 });
  await link.click();
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await assertOwnerLocale(page, locale, expectedContext);
}

async function verifyRuNavigation(page, context) {
  const routes = [
    { segment: "appointments", path: `${ROOT}/appointments/`, label: "Записи" },
    { segment: "customers", path: `${ROOT}/customers/`, label: "Клиенты" },
    { segment: "services", path: `${ROOT}/services/`, label: "Услуги" },
    { segment: "availability", path: `${ROOT}/availability/`, label: "График" },
    { segment: "settings", path: `${ROOT}/settings/`, label: "Компания" },
  ];

  for (const route of routes) {
    const link = page.locator(`.repair-crm-nav-item[href*="/${route.segment}/"]`).first();
    await link.click();
    await page.waitForURL((url) => url.pathname === route.path && url.searchParams.get("lang") === "ru", { timeout: 15_000 });
    await assertOwnerLocale(page, "ru", "Кабинет владельца");
    await page.waitForFunction(
      (label) => document.querySelector(".repair-crm-context strong")?.textContent?.trim() === label,
      route.label,
      { timeout: 10_000 },
    );
    if (await privateProfileStatus(context) !== 200) fail(`Authenticated session lost on ${route.segment}`);
    await page.reload({ waitUntil: "domcontentloaded" });
    await assertOwnerLocale(page, "ru", "Кабинет владельца");
    if (new URL(page.url()).searchParams.get("lang") !== "ru") fail(`RU locale was not preserved after ${route.segment} reload`);
  }
}

async function verifyMobileLanguageMenu(page) {
  await assertNoHorizontalOverflow(page, "mobile-390 dashboard");
  const details = page.locator(".repair-crm-language");
  await details.locator("summary").click();
  const nav = details.locator("nav");
  await nav.waitFor({ state: "visible", timeout: 10_000 });
  const languages = await nav.locator("a[lang]").evaluateAll((links) => links.map((link) => (link.getAttribute("lang") || "").toLowerCase()));
  if (languages.length !== EXPECTED_LANGUAGES.length || EXPECTED_LANGUAGES.some((language) => !languages.includes(language))) {
    fail(`Mobile language menu mismatch: ${languages.join(",")}`);
  }
  const bounds = await nav.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: window.innerWidth, height: window.innerHeight };
  });
  if (bounds.left < -1 || bounds.right > bounds.width + 1 || bounds.top < -1 || bounds.bottom > bounds.height + 1) {
    fail(`Mobile language menu is clipped: ${JSON.stringify(bounds)}`);
  }
}

await requireCurrentMainDeployment();
await cleanup();

const browser = await chromium.launch({ headless: true });
let passed = false;
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  await registerOwner(page);

  await assertOwnerLocale(page, "en", "Owner workspace");
  if (new URL(page.url()).searchParams.has("lang")) fail("Clean owner browser did not default to queryless English");
  if (await privateProfileStatus(desktop) !== 200) fail("Authenticated private API is unavailable after registration");
  console.log("REPAIR_LOCALE_DEFAULT_EN=PASS");

  await switchLocale(page, "ru", "Кабинет владельца");
  if (new URL(page.url()).searchParams.get("lang") !== "ru") fail("In-CRM RU switch did not persist in URL");
  await verifyRuNavigation(page, desktop);
  console.log("REPAIR_LOCALE_RU_SWITCH_NAV_RELOAD=PASS");

  await gotoOk(page, `${DASHBOARD}?lang=fr`);
  await assertOwnerLocale(page, "fr", "Espace propriétaire");
  if (new URL(page.url()).searchParams.get("lang") !== "fr") fail("Explicit FR locale did not win over saved RU state");
  console.log("REPAIR_LOCALE_EXPLICIT_OVERRIDES_STORED=PASS");

  await switchLocale(page, "en", "Owner workspace");
  if (new URL(page.url()).searchParams.has("lang")) fail("In-CRM EN switch did not return to queryless English");
  console.log("REPAIR_LOCALE_EN_SWITCH=PASS");

  const logoutResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/logout") && response.request().method() === "POST");
  await page.locator("[data-repair-crm-logout]:visible").first().click();
  const logout = await logoutResponse;
  if (logout.status() !== 200) fail(`Owner logout failed (${logout.status()})`);
  await page.waitForURL((url) => url.pathname === AUTH, { timeout: 15_000 });
  if (await privateProfileStatus(desktop) !== 401) fail("Private API remained authenticated after logout");

  await page.goBack({ waitUntil: "domcontentloaded", timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(500);
  if (await privateProfileStatus(desktop) !== 401) fail("Browser Back restored authenticated private API access");
  const summaries = await page.locator("#owner-summary").allTextContents().catch(() => []);
  if (summaries.some((text) => text.includes(EMAIL))) fail("Browser Back exposed cached private owner summary after logout");
  console.log("REPAIR_SESSION_LOGOUT_BACK_PRIVATE_BOUNDARY=PASS");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await loginOwner(mobilePage);
  await assertOwnerLocale(mobilePage, "en", "Owner workspace");
  await verifyMobileLanguageMenu(mobilePage);
  await switchLocale(mobilePage, "ru", "Кабинет владельца");
  await assertNoHorizontalOverflow(mobilePage, "mobile-390 RU dashboard");
  console.log("REPAIR_LOCALE_MOBILE_390_MENU=PASS");

  await mobilePage.locator("[data-repair-crm-menu]").click();
  const mobileLogoutButton = mobilePage.locator(".repair-crm-mobile-logout");
  await mobileLogoutButton.waitFor({ state: "visible", timeout: 10_000 });
  const mobileLogoutResponse = mobilePage.waitForResponse((response) => response.url().endsWith("/api/auth/logout") && response.request().method() === "POST");
  await mobileLogoutButton.click();
  const mobileLogout = await mobileLogoutResponse;
  if (mobileLogout.status() !== 200) fail(`Mobile owner logout failed (${mobileLogout.status()})`);
  if (await privateProfileStatus(mobile) !== 401) fail("Mobile private API remained authenticated after logout");
  await mobile.close();

  passed = true;
  console.log("REPAIR_LOCALE_SESSION_PRODUCTION_PROOF=PASS");
} finally {
  await browser.close();
  await cleanup();
  console.log(`REPAIR_LOCALE_SESSION_CLEANUP=${passed ? "PASS" : "PASS_AFTER_FAILURE"}`);
}

if (!passed) process.exitCode = 1;
