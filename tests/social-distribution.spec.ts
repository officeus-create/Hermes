import { expect, test } from "@playwright/test";

test("social distribution workspace is noindex and creates four distinct preview drafts", async ({ page }) => {
  const response = await page.goto("/demos/social-distribution/");
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Social Distribution Preview Queue/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow,noarchive");
  await expect(page.getByRole("heading", { level: 1, name: /Approved Website Asset.*Platform Draft Review Queue/ })).toBeVisible();
  await expect(page.locator("[data-distribution-card]")).toHaveCount(4);
  await expect(page.locator('[data-platform="facebook"]')).toHaveCount(1);
  await expect(page.locator('[data-platform="threads"]')).toHaveCount(1);
  await expect(page.locator('[data-platform="instagram"]')).toHaveCount(1);
  await expect(page.locator('[data-platform="x"]')).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Publish$/i })).toHaveCount(0);

  const copies = await page.locator("[data-distribution-copy]").evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLTextAreaElement).value),
  );
  expect(new Set(copies).size).toBe(4);

  const trackedUrls = await page.locator("[data-tracked-url]").allTextContents();
  expect(trackedUrls).toHaveLength(4);
  for (const platform of ["facebook", "threads", "instagram", "x"]) {
    expect(trackedUrls.some((url) => url.includes(`utm_source=${platform}`))).toBeTruthy();
  }
  expect(trackedUrls.every((url) => url.includes("utm_medium=organic_social"))).toBeTruthy();
  expect(trackedUrls.every((url) => url.includes("utm_campaign=logistics_insights"))).toBeTruthy();

  const xCopy = await page.locator('[data-platform="x"] [data-distribution-copy]').inputValue();
  expect(xCopy.length).toBeLessThanOrEqual(280);
  await expect(page.locator('[data-platform="instagram"]')).toContainText("Do not assume a clickable caption link");
  await expect(page.getByText(/zero live accounts verified/i)).toBeVisible();
});

test("reviewed draft can reach manual export only through human approval", async ({ page }) => {
  await page.goto("/demos/social-distribution/");
  const card = page.locator('[data-platform="facebook"]');

  await expect(card.locator("[data-distribution-state]")).toHaveText("generated");
  await expect(card.getByRole("button", { name: "Approve manual export" })).toBeDisabled();
  await expect(card.getByRole("button", { name: "Prepare manual export" })).toBeDisabled();

  await card.locator("[data-distribution-copy]").fill("Edited Facebook preview copy with a clear practical point and the existing tracked URL.");
  await card.getByRole("button", { name: "Mark reviewed" }).click();
  await expect(card.locator("[data-distribution-state]")).toHaveText("reviewed");
  await expect(card.getByRole("button", { name: "Approve manual export" })).toBeEnabled();

  await card.getByRole("button", { name: "Approve manual export" }).click();
  await expect(card.locator("[data-distribution-state]")).toHaveText("approved");
  await expect(card.getByRole("button", { name: "Prepare manual export" })).toBeEnabled();

  await card.getByRole("button", { name: "Prepare manual export" }).click();
  await expect(card.locator("[data-distribution-state]")).toHaveText("manual_export_ready");
  await expect(card.locator("[data-manual-export]")).toBeVisible();
  await expect(card.locator("[data-manual-export] pre")).toContainText("Mode: synthetic_preview");
  await expect(card.locator("[data-manual-export] pre")).toContainText("Platform: facebook");
  await expect(card.locator("[data-manual-export] pre")).toContainText("Edited Facebook preview copy");
  await expect(card.locator("[data-audit-log] li")).toHaveCount(3);
  await expect(card.locator("[data-distribution-status]")).toContainText("No external action");
});

test("draft rejection requires a reason and ends the local workflow", async ({ page }) => {
  await page.goto("/demos/social-distribution/");
  const card = page.locator('[data-platform="threads"]');

  await card.getByRole("button", { name: "Reject" }).click();
  await expect(card.locator("[data-distribution-state]")).toHaveText("generated");
  await expect(card.locator("[data-distribution-status]")).toContainText("rejection reason is required");

  await card.locator("[data-rejection-reason]").fill("The hook needs a different audience angle.");
  await card.getByRole("button", { name: "Reject" }).click();
  await expect(card.locator("[data-distribution-state]")).toHaveText("rejected");
  await expect(card.getByRole("button", { name: "Mark reviewed" })).toBeDisabled();
  await expect(card.getByRole("button", { name: "Approve manual export" })).toBeDisabled();
  await expect(card.getByRole("button", { name: "Prepare manual export" })).toBeDisabled();
  await expect(card.locator("[data-audit-log]")).toContainText("The hook needs a different audience angle");
});

test("social distribution preview remains outside all declared sitemaps", async ({ page }) => {
  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const sitemapUrls = (await robots.text())
    .split("\n")
    .filter((line) => line.startsWith("Sitemap:"))
    .map((line) => new URL(line.replace("Sitemap:", "").trim()).pathname);

  for (const sitemapUrl of sitemapUrls) {
    const response = await page.request.get(sitemapUrl);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).not.toContain("/demos/social-distribution/");
  }
});
