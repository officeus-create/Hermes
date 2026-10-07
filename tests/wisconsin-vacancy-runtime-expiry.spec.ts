import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expireWisconsinHtml, expireWisconsinCareersHub } from "../functions/_lib/wisconsin-vacancy-lifecycle.mjs";

test("Wisconsin expired server HTML retains mobile contact and search owner without active JobPosting", async ({ page }) => {
  const built = readFileSync("dist/careers/wisconsin-owner-operators/index.html", "utf8");
  await page.route("**/careers/wisconsin-owner-operators/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: expireWisconsinHtml(built) }));
  await page.goto("/careers/wisconsin-owner-operators/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://hermeslogisticsus.com/careers/wisconsin-owner-operators/");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /index,follow/);
  await expect(page.getByRole("heading", { name: "Publication review due", exact: true })).toBeVisible();
  await expect(page.locator("[data-external-job-apply]")).toHaveCount(0);
  expect((await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ")).not.toContain('"JobPosting"');
  await expect(page.locator("#apply")).toHaveCount(1);
  const phone = page.getByRole("link", { name: "Ask recruiting about current status" });
  await expect(phone).toHaveAttribute("href", "tel:+14142697377");
  await phone.scrollIntoViewIfNeeded();
  await phone.click({ trial: true });
  const size = await phone.boundingBox();
  expect(size?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Careers hub no longer advertises expired Wisconsin vacancy but preserves its reference link", async ({ page }) => {
  const built = readFileSync("dist/logistics/careers/index.html", "utf8");
  await page.route("**/logistics/careers/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: expireWisconsinCareersHub(built, 0) }));
  await page.goto("/logistics/careers/");
  await expect(page.locator("[data-current-vacancy-count]")).toHaveText("0");
  await expect(page.getByRole("heading", { name: /No verified public vacancy is listed today/ })).toBeVisible();
  await expect(page.locator('a[data-external-vacancy-source]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Review recruiting information" })).toHaveAttribute("href", "/careers/wisconsin-owner-operators/");
});
