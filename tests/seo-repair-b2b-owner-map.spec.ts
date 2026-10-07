import { expect, test } from "@playwright/test";

const repairSeoIntake = "/paths/marketing/?service=seo&vertical=auto_repair&source_path=%2Fservices%2Fseo-for-auto-repair-shops%2F#contact";
const repairWebsiteBrief = "/paths/technology/?project=website_development&vertical=auto_repair&source_path=%2Fservices%2Fauto-repair-website-design%2F#project-brief";

test("auto repair SEO owner keeps one B2B search-to-intake path", async ({ page }, testInfo) => {
  await page.goto("/services/seo-for-auto-repair-shops/");
  await expect(page).toHaveTitle("SEO for Auto Repair Shops | Local Auto Repair SEO | Hermes");
  await expect(page.getByRole("heading", { level: 1, name: "SEO for Auto Repair Shops" })).toBeVisible();
  const primaryCta = page.locator(".digital-service-actions").getByRole("link", { name: "Start an auto repair SEO review", exact: true });
  await expect(primaryCta).toBeVisible();
  await expect(primaryCta).toHaveAttribute("href", repairSeoIntake);
  await expect(page.locator('a[href="/services/auto-repair-website-design/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/services/hermes-connect/repair-shops/"]').first()).toBeVisible();
  const actionBar = page.locator(".money-page-action-bar");
  if (testInfo.project.name === "mobile") await expect(actionBar).toBeVisible();
  else await expect(actionBar).toBeHidden();
});

test("auto repair website owner keeps one website brief path", async ({ page }, testInfo) => {
  await page.goto("/services/auto-repair-website-design/");
  await expect(page).toHaveTitle("Auto Repair Website Design | Repair Shop Websites | Hermes");
  await expect(page.getByRole("heading", { level: 1, name: "Auto Repair Website Design for Independent Repair Shops" })).toBeVisible();
  const primaryCta = page.locator(".digital-service-actions").getByRole("link", { name: "Start an auto repair website brief", exact: true });
  await expect(primaryCta).toBeVisible();
  await expect(primaryCta).toHaveAttribute("href", repairWebsiteBrief);
  await expect(page.locator('a[href="/services/seo-for-auto-repair-shops/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/services/hermes-connect/repair-shops/"]').first()).toBeVisible();
  const actionBar = page.locator(".money-page-action-bar");
  if (testInfo.project.name === "mobile") await expect(actionBar).toBeVisible();
  else await expect(actionBar).toBeHidden();
});

test("Hermes Connect repair scheduling owner routes growth to specialized owners", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");
  await expect(page).toHaveTitle("Auto Repair Shop Software & Scheduling | Hermes Connect");
  await expect(page.getByRole("heading", { level: 1, name: "Auto repair shop software for bookings, customers, and availability." })).toBeVisible();
  await expect(page.locator('a[href="/services/hermes-connect/repair-shops/auth/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/services/seo-for-auto-repair-shops/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/services/auto-repair-website-design/"]').first()).toBeVisible();
});
