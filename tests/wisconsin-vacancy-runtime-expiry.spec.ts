import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expireWisconsinHtml, expireWisconsinCareersHub } from "../functions/_lib/wisconsin-vacancy-lifecycle.mjs";

const jobRoute = "/careers/wisconsin-owner-operators/";
const built = () => readFileSync("dist/careers/wisconsin-owner-operators/index.html", "utf8");

test("evergreen Wisconsin recruiting stays indexable with a real direct application method", async ({ page }) => {
  await page.route("**/careers/wisconsin-owner-operators/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: built() }));
  await page.goto(jobRoute);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page).toHaveTitle(/Owner-Operator Truck Drivers in Wisconsin/);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://hermeslogisticsus.com/careers/wisconsin-owner-operators/");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /index,follow/);
  await expect(page.getByRole("heading", { name: "Wisconsin owner-operator recruiting at a glance" })).toBeVisible();
  await expect(page.getByText("Applications accepted continuously")).toBeVisible();
  await expect(page.getByRole("link", { name: "Apply by email" })).toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com?subject=Wisconsin%20Owner-Operator%20Application");
  await expect(page.getByRole("link", { name: "Call Yuri · interview" })).toHaveAttribute("href", "tel:+14142697377");
  await expect(page.locator(".recruiting-section").getByRole("link", { name: "+1 (414) 269-7377" })).toHaveAttribute("href", "tel:+14142697377");
  await expect(page.locator(".hours-card")).toContainText("Saturday–Sunday: 10:00 AM–9:00 PM CT");
  await expect(page.locator(".recruiting-section").getByRole("link", { name: /Apply directly at officeus@hermeslogisticsus.com/ })).toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com?subject=Wisconsin%20Owner-Operator%20Application");
  await expect(page.getByText("Markets to discuss, not confirmed local offices, dedicated freight, or guaranteed lanes.")).toBeVisible();
  await expect(page.getByText("Which Wisconsin markets can an owner-operator ask about?")).toHaveCount(1);
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(jsonLd).toContain('"JobPosting"');
  expect(jsonLd).toContain('"WebPage"');
  expect(jsonLd).toContain('"BreadcrumbList"');
  expect(jsonLd).toContain('"datePosted":"2026-10-03"');
  expect(jsonLd).toContain('"hiringOrganization":{"@type":"Organization","@id":"https://hermeslogisticsus.com/#logistics","name":"Hermes Logistics LLC","url":"https://hermeslogisticsus.com/paths/logistics/"}');
  expect(jsonLd).not.toContain('"hiringOrganization":{"@type":"Organization","@id":"https://hermeslogisticsus.com/#organization"');
  expect(jsonLd).not.toContain('"validThrough"');
  expect(jsonLd).not.toContain('"sameAs":"https://100hires.com/j/G4ek3eN"');
  const apply = page.getByRole("link", { name: "Apply by email" });
  await apply.scrollIntoViewIfNeeded();
  await apply.click({ trial: true });
  expect((await apply.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("explicitly paused Wisconsin recruiting hides an old built application's JobPosting and CTAs", async ({ page }) => {
  await page.route("**/careers/wisconsin-owner-operators/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: expireWisconsinHtml(built()) }));
  await page.goto(jobRoute);
  await expect(page.getByRole("heading", { name: "Recruiting temporarily unavailable" })).toBeVisible();
  await expect(page.locator(".career-lead")).toContainText("Applications are temporarily unavailable");
  await expect(page.locator(".career-updated")).toContainText("Recruiting temporarily unavailable");
  await expect(page.locator(".recruiting-section")).toHaveCount(0);
  await expect(page.locator(".faq-section")).toHaveCount(0);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Applications are temporarily unavailable/);
  await expect(page.getByRole("link", { name: "Apply by email" })).toHaveCount(0);
  await expect(page.locator("[data-wi-vacancy-open-source]")).toHaveCount(0);
  await expect(page.locator("[data-wi-vacancy-closed-source] span").getByText("Not currently accepting applications", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Email recruiting status question" })).toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com?subject=Wisconsin%20Owner-Operator%20Recruiting%20Question");
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(jsonLd).not.toContain('"JobPosting"');
  expect(jsonLd).toContain('"BreadcrumbList"');
});

test("Careers hub keeps permanent opening visible and can still honor an explicit pause", async ({ page }) => {
  const hub = readFileSync("dist/logistics/careers/index.html", "utf8");
  await page.route("**/logistics/careers/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: hub }));
  await page.goto("/logistics/careers/");
  await expect(page.locator("[data-current-vacancy-count]")).toHaveText("1");
  await expect(page.getByRole("heading", { name: /Verified public vacancies are open/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "View vacancy" })).toHaveAttribute("href", jobRoute);
  const pausedHub = expireWisconsinCareersHub(hub, 0);
  await page.route("**/logistics/careers/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: pausedHub }));
  await page.reload();
  await expect(page.locator("[data-current-vacancy-count]")).toHaveText("0");
  await expect(page.getByRole("heading", { name: /No verified public vacancy is listed today/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Review recruiting information" })).toHaveAttribute("href", jobRoute);
});
