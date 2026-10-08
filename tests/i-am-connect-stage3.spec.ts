import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const route = "/demos/hermes-connect/i-am-shopping/";
const canonical = `https://hermeslogisticsus.com${route}`;
const shortlistKey = "iam-italy-shortlist-v1";

type SafetyEvidence = {
  storageMutations: Array<{ operation: string; key: string | null; value: string | null }>;
  submitEvents: number;
  uncancelledSubmits: number;
  fetches: number;
  xhrs: number;
  beacons: number;
  nativeSubmitCalls: number;
};

const installSafetyEvidence = async (page: Page) => {
  await page.addInitScript(() => {
    const evidence: SafetyEvidence = {
      storageMutations: [],
      submitEvents: 0,
      uncancelledSubmits: 0,
      fetches: 0,
      xhrs: 0,
      beacons: 0,
      nativeSubmitCalls: 0,
    };
    Object.defineProperty(window, "__iamSafetyEvidence", { value: evidence });

    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      evidence.storageMutations.push({ operation: "setItem", key, value });
      return setItem.call(this, key, value);
    };
    const removeItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) {
      evidence.storageMutations.push({ operation: "removeItem", key, value: null });
      return removeItem.call(this, key);
    };
    const clear = Storage.prototype.clear;
    Storage.prototype.clear = function () {
      evidence.storageMutations.push({ operation: "clear", key: null, value: null });
      return clear.call(this);
    };

    const nativeFetch = window.fetch.bind(window);
    window.fetch = ((...args: Parameters<typeof fetch>) => {
      evidence.fetches += 1;
      return nativeFetch(...args);
    }) as typeof fetch;
    const xhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
      evidence.xhrs += 1;
      return xhrSend.apply(this, args as Parameters<XMLHttpRequest["send"]>);
    };
    const sendBeacon = navigator.sendBeacon?.bind(navigator);
    if (sendBeacon) {
      navigator.sendBeacon = ((...args: Parameters<Navigator["sendBeacon"]>) => {
        evidence.beacons += 1;
        return sendBeacon(...args);
      }) as Navigator["sendBeacon"];
    }

    const nativeSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () {
      evidence.nativeSubmitCalls += 1;
      return nativeSubmit.call(this);
    };
    document.addEventListener("submit", (event) => {
      evidence.submitEvents += 1;
      if (!event.defaultPrevented) evidence.uncancelledSubmits += 1;
    });
  });
};

const readSafetyEvidence = (page: Page) =>
  page.evaluate(() => (window as typeof window & { __iamSafetyEvidence: SafetyEvidence }).__iamSafetyEvidence);

test("Stage 3 exposes one noindex app route with no product mailto or PII fields", async ({ page }) => {
  await page.goto(route, { waitUntil: "networkidle" });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Make your Italy shopping list before landing");
  await expect(page.locator("main")).toContainText("Do not enter passport details, payment data, passwords");
  await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="mailto:officeus@hermeslogisticsus.com"]')).toHaveCount(1);
  await expect(page.locator('main input[type="email"], main input[type="tel"], main input[type="password"], main input[type="file"]')).toHaveCount(0);
  await expect(page.locator('main [name="name"], main [name="email"], main [name="phone"], main [name="passport"], main [name="message"]')).toHaveCount(0);
});

test("journey composer performs no network, external submission, storage mutation, or PII handoff", async ({ page }) => {
  await installSafetyEvidence(page);
  await page.goto(route, { waitUntil: "networkidle" });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()}`));
  await page.evaluate(() => {
    const evidence = (window as typeof window & { __iamSafetyEvidence: SafetyEvidence }).__iamSafetyEvidence;
    evidence.fetches = 0;
    evidence.xhrs = 0;
    evidence.beacons = 0;
  });

  const form = page.locator("#iam-journey-form");
  await expect(form).not.toHaveAttribute("action", /.+/);
  const input = page.getByRole("textbox", { name: "Your travel or cross-border goal" });
  await input.fill("I want to shop in Italy and understand Tax Free");
  await page.getByRole("button", { name: "Build an example journey" }).click();
  await expect(page.locator("#iam-journey-result")).toContainText("Italy Shopping Shortlist");
  await expect(page.locator("#iam-journey-result")).toContainText("Italy Tax Free Guidance");
  await page.getByRole("button", { name: "Add to my menu" }).first().click();
  await expect(page.locator("#iam-journey-menu")).toBeVisible();
  await page.waitForFunction(() => (window as typeof window & { __iamSafetyEvidence: SafetyEvidence }).__iamSafetyEvidence.submitEvents === 1);

  const evidence = await readSafetyEvidence(page);
  expect(evidence.uncancelledSubmits).toBe(0);
  expect(evidence.fetches).toBe(0);
  expect(evidence.xhrs).toBe(0);
  expect(evidence.beacons).toBe(0);
  expect(evidence.nativeSubmitCalls).toBe(0);
  expect(evidence.storageMutations).toEqual([]);
  expect(requests).toEqual([]);
  await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}$`));
});

test("shopping stays memory-only until explicit opt-in and then stores allowlisted IDs only", async ({ page }) => {
  await installSafetyEvidence(page);
  await page.goto(route, { waitUntil: "networkidle" });
  expect((await readSafetyEvidence(page)).storageMutations).toEqual([]);

  await page.evaluate((key) => localStorage.setItem(key, "{not-json"), shortlistKey);
  await page.evaluate(() => {
    (window as typeof window & { __iamSafetyEvidence: SafetyEvidence }).__iamSafetyEvidence.storageMutations = [];
  });
  await page.reload({ waitUntil: "networkidle" });
  expect((await readSafetyEvidence(page)).storageMutations).toEqual([]);
  expect(await page.evaluate((key) => localStorage.getItem(key), shortlistKey)).toBe("{not-json");

  const farfetch = page.locator('.store-card[data-merchant-id="farfetch"]');
  await farfetch.getByRole("button", { name: /Add FARFETCH to shortlist/ }).click();
  await expect(page.locator("#saved-count")).toHaveText("1");
  await page.getByRole("button", { name: "Remove FARFETCH" }).click();
  await page.getByRole("button", { name: /Clear shortlist and saved data/ }).click();
  await farfetch.getByRole("button", { name: /Add FARFETCH to shortlist/ }).click();

  let evidence = await readSafetyEvidence(page);
  expect(evidence.storageMutations).toEqual([]);
  expect(await page.evaluate((key) => localStorage.getItem(key), shortlistKey)).toBe("{not-json");

  await page.locator("#save-on-device").check();
  evidence = await readSafetyEvidence(page);
  expect(evidence.storageMutations).toEqual([
    { operation: "setItem", key: shortlistKey, value: '["farfetch"]' },
  ]);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), shortlistKey)).toEqual(["farfetch"]);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("#save-on-device")).toBeChecked();
  await expect(page.locator("#my-merchant-list")).toContainText("FARFETCH");
  await page.getByRole("button", { name: /Clear shortlist and saved data/ }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), shortlistKey)).toBeNull();
});

test("Tax Free precheck stays local and distinguishes guidance from entitlement", async ({ page }) => {
  await installSafetyEvidence(page);
  await page.goto(route, { waitUntil: "networkidle" });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()}`));
  await page.evaluate(() => {
    const evidence = (window as typeof window & { __iamSafetyEvidence: SafetyEvidence }).__iamSafetyEvidence;
    evidence.fetches = 0;
    evidence.xhrs = 0;
    evidence.beacons = 0;
    evidence.submitEvents = 0;
    evidence.uncancelledSubmits = 0;
  });

  const form = page.locator("#iam-taxfree-check");
  await form.locator('input[name="amount"]').fill("70.01");
  await form.locator('select[name="residence"]').selectOption("non-eu");
  await form.locator('select[name="purpose"]').selectOption("personal");
  await form.locator('input[name="invoice"]').fill("2026-01-10");
  await form.locator('input[name="export"]').fill("2026-04-30");
  await form.getByRole("button", { name: "Check general conditions" }).click();
  await expect(page.locator("#iam-taxfree-result")).toContainText("General conditions appear compatible");
  await expect(page.locator("#iam-taxfree-result")).toContainText("not a right-to-refund decision");
  await page.waitForFunction(() => (window as typeof window & { __iamSafetyEvidence: SafetyEvidence }).__iamSafetyEvidence.submitEvents === 1);

  const evidence = await readSafetyEvidence(page);
  expect(evidence.uncancelledSubmits).toBe(0);
  expect(evidence.fetches).toBe(0);
  expect(evidence.xhrs).toBe(0);
  expect(evidence.beacons).toBe(0);
  expect(evidence.nativeSubmitCalls).toBe(0);
  expect(evidence.storageMutations).toEqual([]);
  expect(requests).toEqual([]);
  await expect(page).toHaveURL(/\/demos\/hermes-connect\/i-am-shopping\/$/);
});

test("capability, country-rule, provider, and evidence states remain explicit", async ({ page }) => {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-merchant-id]")).toHaveCount(6);
  await expect(page.locator("[data-capability-id]")).toHaveCount(8);
  await expect(page.locator('[data-capability-state="prototype"]')).toHaveCount(2);
  await expect(page.locator('[data-capability-state="research"]')).toHaveCount(2);
  await expect(page.locator('[data-capability-state="blocked"]')).toHaveCount(2);
  await expect(page.locator('[data-capability-state="future"]')).toHaveCount(2);
  await expect(page.locator("[data-country-rule-id]")).toHaveCount(5);
  await expect(page.locator('[data-country-rule-id="it-tax-free-otello"]')).toHaveAttribute("data-rule-implementation", "partner-required");
  await expect(page.locator("[data-provider-candidate]")).toHaveCount(4);
  await expect(page.locator('[data-provider-candidate="skyscanner-affiliate"]')).toContainText("SEPARATE TECH PARTNERSHIP REQUIRED");
  await expect(page.locator('[data-evidence-rule="click-order"]')).toHaveText("Click ≠ order");
  await expect(page.locator('[data-evidence-rule="commission-payout"]')).toHaveText("Commission ≠ payout");
});

test("Stage 3 implementation avoids unsafe HTML execution sinks", () => {
  const sources = [
    "src/pages/demos/hermes-connect/i-am-shopping/index.astro",
    "src/components/IAmTaxFreePrecheck.astro",
  ].map((file) => readFileSync(file, "utf8")).join("\n");
  expect(sources).not.toMatch(/\b(?:innerHTML|outerHTML|insertAdjacentHTML|eval)\b/);
});

test("shared workspace exposes an I am demo without adding an I am lead-intake or PII route", async ({ page }) => {
  const workspace = "/demos/hermes-connect/workspace.html?source_direction=technology&business_type=i_am&business_subtype=travel_platform&module=home";
  await page.goto(workspace, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-onboarding-modal]")).not.toHaveClass(/open/);
  await expect(page.locator("[data-workspace-name]").first()).toHaveText("I am Travel Lab");
  await expect(page.locator("[data-workspace-label]").first()).toContainText("Cross-border travel");
  await expect(page.locator("[data-vertical-module-entry]")).toHaveAttribute("href", route);
  await expect(page.locator('[data-lead-vertical-select] option[value="iam"]')).toHaveCount(0);
  expect(await page.evaluate(() => Object.hasOwn((window as typeof window & { HermesAIBrain: { VERTICALS: object } }).HermesAIBrain.VERTICALS, "iam"))).toBe(false);
});

test("Stage 3 stays outside every sitemap and the sitemap-driven IndexNow payload", async ({ page }) => {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");

  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const sitemapPaths = (await robots.text())
    .split("\n")
    .filter((line) => line.startsWith("Sitemap:"))
    .map((line) => new URL(line.replace("Sitemap:", "").trim()).pathname);
  for (const sitemapPath of sitemapPaths) {
    const sitemap = await page.request.get(sitemapPath);
    expect(sitemap.ok(), sitemapPath).toBe(true);
    expect(await sitemap.text(), sitemapPath).not.toContain(canonical);
  }

  const stdout = execFileSync(process.execPath, ["scripts/indexnow-submit.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, INDEXNOW_DRY_RUN: "1", INDEXNOW_USE_SITEMAPS: "1", INDEXNOW_URLS: "" },
  });
  const payload = JSON.parse(stdout) as { urlList: string[] };
  expect(payload.urlList).not.toContain(canonical);
});

test("Stage 3 remains usable at 390px and is linked only from the merged Stage 2 Italy page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  await expect(page.locator("main h1")).toBeVisible();
  await page.goto("/businesses/italy/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(`a[href="${route}"]`)).toBeVisible();
});
