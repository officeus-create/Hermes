import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const concept = "/businesses/concepts/kittles-garage/";
test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, route => route.abort());
});

test("concept actions stay with Hermes and dialog works on repeated visits", async ({ page }, info) => {
  const posts: string[] = [];
  page.on("request", request => { if (request.method() === "POST") posts.push(request.url()); });
  await page.goto(concept);
  await expect(page.getByText("Website concept by Hermes / not the official business website", { exact: true })).toBeVisible();
  await expect(page.getByText("Existing free pilot · proposed design", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com" + concept);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await mkdir("../evidence", { recursive: true });
  await page.screenshot({ path: `../evidence/kittles-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  const trigger = page.getByLabel("Concept navigation").getByRole("button", { name: "Book a visit ↗", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds?.x).toBeGreaterThan(0);
  expect(bounds?.y).toBeGreaterThan(0);
  await page.screenshot({ path: `../evidence/kittles-dialog-${info.project.name}.png` });
  await expect(dialog.getByRole("link", { name: /Contact Hermes/ })).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus.com/);
  await expect(dialog.getByRole("link", { name: /Open a short/ })).toHaveAttribute("href", /type=catalog-growth/);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Explore payment ↗", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Discuss payment with Hermes" })).toBeVisible();
  await dialog.getByRole("button", { name: "Close development discussion" }).click();
  await trigger.click();
  await page.mouse.click(1, 1);
  await expect(dialog).not.toBeVisible();
  expect(posts).toEqual([]);
  await page.getByRole("button", { name: /Diagnostics/ }).click();
  await expect(dialog.getByRole("heading", { name: "Discuss diagnostics with Hermes" })).toBeVisible();
  await dialog.getByRole("link", { name: /Open a short/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Discuss website development with Hermes");
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/scope Diagnostics/);
  await expect(page.locator("[data-catalog-request]")).toHaveAttribute("data-request-type", "catalog-growth");
});

test("V4 concept stays readable across breakpoints with static reduced motion", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { conceptCLS?: number }).conceptCLS = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) (window as Window & { conceptCLS: number }).conceptCLS += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(concept);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".wheel-drawing")).toHaveCSS("animation-name", "none");
    await page.evaluate(() => document.fonts.ready);
    const cls = await page.evaluate(() => (window as Window & { conceptCLS: number }).conceptCLS);
    expect(cls).toBeLessThanOrEqual(0.1);
    console.log(`Kittle concept width=${width} CLS=${cls}`);
    await expect(page.locator(".services > .service-grid button")).toHaveCount(4);
    const details = page.locator("details.more-services");
    await details.locator("summary").click();
    await expect(details.getByRole("button", { name: /Routine maintenance/ })).toBeVisible();
    await details.getByRole("button", { name: /Routine maintenance/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close development discussion" }).click();
  }
});

const openBrief = async (page: import("@playwright/test").Page) => {
  await page.goto(concept);
  await page.getByRole("button", { name: "Explore payment ↗", exact: true }).click();
  await page.getByRole("link", { name: /Open a short/ }).click();
};
const fillBrief = async (page: import("@playwright/test").Page) => {
  await page.locator('input[name="name"]').fill("Synthetic QA");
  await page.locator('input[name="email"]').fill("qa@example.invalid");
  await page.locator('input[name="whatsapp"]').fill("+1 501 555 0100");
  const consent = page.getByRole("checkbox");
  await consent.focus();
  await page.keyboard.press("Space");
};

// Use the accessible keyboard submit path; headless Chromium on this endpoint stalls
// pointer actionability after cross-document dialog navigation. No force/DOM submit bypass.
test("short brief validates and preview never submits or reports delivery", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", request => { if (request.method() === "POST") posts.push(request.url()); });
  await openBrief(page);
  await expect(page.locator('input[name="company"]')).not.toBeVisible();
  await expect(page.locator('select[name="preferred_language"]')).not.toBeVisible();
  await page.getByRole("button", { name: "Preview development brief" }).press("Enter");
  expect(await page.locator('input[name="name"]').evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
  await fillBrief(page);
  await page.getByRole("button", { name: "Preview development brief" }).press("Enter");
  await expect(page.locator("[data-request-status]")).toHaveText(/Your information was not sent or stored/);
  await expect(page.locator("[data-request-success]")).not.toBeVisible();
  await page.getByRole("button", { name: "Preview development brief" }).press("Enter");
  expect(posts).toEqual([]);
});

test("mocked live brief rejects bad receipt and retries with the same id", async ({ page }) => {
  const payloads: { request_id: string; services: string[]; message: string }[] = [];
  await page.route("**/api/business-lead", async route => {
    const payload = route.request().postDataJSON();
    payloads.push(payload);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payloads.length === 1 ? { success: false } : { success: true, request_id: payload.request_id }) });
  });
  await openBrief(page);
  await fillBrief(page);
  await page.locator("[data-catalog-request]").evaluate((form: HTMLFormElement) => { form.dataset.conceptMode = "live"; });
  await page.getByRole("button", { name: "Preview development brief" }).press("Enter");
  await expect(page.locator("[data-request-status]")).toHaveText(/temporarily unavailable/);
  await expect(page.locator("[data-request-success]")).not.toBeVisible();
  await page.getByRole("button", { name: "Preview development brief" }).press("Enter");
  await expect(page.locator("[data-request-success]")).toBeVisible();
  await expect(page.locator("[data-success-copy]")).toHaveText(/accepted this development brief for handoff/);
  expect(payloads).toHaveLength(2);
  expect(payloads[0].request_id).toBe(payloads[1].request_id);
  expect(payloads[0].services).toEqual(["Website development"]);
  expect(payloads[0].message).toContain("development inquiry to Hermes");
});
