import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expireWisconsinHtml, expireWisconsinCareersHub } from "../functions/_lib/wisconsin-vacancy-lifecycle.mjs";

test("Wisconsin expired server HTML retains mobile contact and search owner without active JobPosting", async ({ page }) => {
  const built = readFileSync("dist/careers/wisconsin-owner-operators/index.html", "utf8");
  await page.route("**/careers/wisconsin-owner-operators/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: expireWisconsinHtml(built) }));
  await page.goto("/careers/wisconsin-owner-operators/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page).toHaveTitle(/Wisconsin Owner-Operator Truck & Trailer/);
  await expect(page.getByRole("heading", { name: "Wisconsin owner-operator recruiting at a glance" })).toBeVisible();
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://hermeslogisticsus.com/careers/wisconsin-owner-operators/");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /index,follow/);
  await expect(page.getByRole("heading", { name: "Publication review due", exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("continuously recruits Wisconsin owner-operators");
  await expect(page.locator("body")).toContainText("A fresh owner review is required before the page represents a current opening.");
  await expect(page.locator("[data-external-job-apply]")).toHaveCount(0);
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(jsonLd).not.toContain('"JobPosting"');
  expect(jsonLd).toContain('"WebPage"');
  expect(jsonLd).toContain('"BreadcrumbList"');
  expect(jsonLd).toContain('"Wisconsin"');
  await expect(page.locator("#apply")).toHaveCount(1);
  await expect(page.getByText("Markets to discuss, not confirmed local offices, dedicated freight, or guaranteed lanes.")).toBeVisible();
  await expect(page.getByText("Which Wisconsin markets can an owner-operator ask about?")).toHaveCount(1);
  const email = page.getByRole("link", { name: "Email recruiting status question" });
  await expect(email).toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com?subject=Wisconsin%20Owner-Operator%20Recruiting%20Status");
  const phone = page.getByRole("link", { name: "Ask recruiting about current status" });
  await expect(phone).toHaveAttribute("href", "tel:+14142697377");
  await phone.scrollIntoViewIfNeeded();
  await phone.click({ trial: true });
  const size = await phone.boundingBox();
  expect(size?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Careers hub expires an old cached Wisconsin vacancy and preserves its reference link", async ({ page }) => {
  const legacyHub = `<!doctype html><html><body>
    <h2 data-current-vacancy-heading>Verified public vacancies are open.</h2>
    <strong data-current-vacancy-count>1</strong>
    <article data-vacancy-slug="wisconsin-owner-operators">
      <a data-external-vacancy-source href="https://100hires.com/j/G4ek3eN">Apply</a>
    </article>
    <a href="/logistics/apply/?for=career">General careers inquiry</a>
  </body></html>`;
  await page.route("**/logistics/careers/", (route) => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: expireWisconsinCareersHub(legacyHub, 0),
  }));
  await page.goto("/logistics/careers/");
  await expect(page.locator("[data-current-vacancy-count]")).toHaveText("0");
  await expect(page.getByRole("heading", { name: /No verified public vacancy is listed today/ })).toBeVisible();
  await expect(page.locator('a[data-external-vacancy-source]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Review recruiting information" })).toHaveAttribute("href", "/careers/wisconsin-owner-operators/");
});

test("fresh careers build remains fail-closed after Wisconsin vacancy expiry", async ({ page }) => {
  const built = readFileSync("dist/logistics/careers/index.html", "utf8");
  await page.route("**/logistics/careers/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: built }));
  await page.goto("/logistics/careers/");
  await expect(page.locator("[data-current-vacancy-count]")).toHaveText("0");
  await expect(page.getByRole("heading", { name: /No verified public vacancy is listed today/ })).toBeVisible();
  await expect(page.locator('a[data-external-vacancy-source]')).toHaveCount(0);
  await expect(page.locator('a[href="https://100hires.com/j/G4ek3eN"]')).toHaveCount(0);
});
