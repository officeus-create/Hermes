import { expect, test } from "@playwright/test";

const route = "/news/google-measurement-tools-september-2026/";

test("marketing news preview preserves source, boundary, CTA, and structured data", async ({ page }) => {
  await page.goto(route);
  await expect(page).toHaveTitle(/Google Measurement Tools Update/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("source-to-sale map");
  await expect(page.getByRole("link", { name: /official Google source/i })).toHaveAttribute("href", "https://blog.google/products/ads-commerce/data-strength-updates/");
  await expect(page.getByText(/not a performance guarantee/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Start a Marketing review/i })).toHaveAttribute("href", "/paths/marketing/?service=seo#contact");
  await expect(page.getByRole("link", { name: /Explore Marketing Academy/i })).toHaveAttribute("href", "/academy/marketing/");
  const schema = (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
  expect(schema).toContain('"NewsArticle"');
  expect(schema).toContain('"2026-09-10"');
  expect(schema).toContain("data-strength-updates");
});

test("news preview records only categorical CTA context and does not overflow", async ({ page }) => {
  await page.goto(route);
  const academy = page.getByRole("link", { name: /Explore Marketing Academy/i });
  await academy.evaluate((link: HTMLAnchorElement) => {
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    link.click();
  });
  const event = await page.evaluate(() => (window.dataLayer || []).find((item: any) => item?.event === "content_cta_click"));
  expect(event).toEqual({
    event: "content_cta_click",
    content_id: "google_measurement_tools_2026_09_10",
    content_section: "marketing_news",
    cta_type: "academy_marketing",
    destination_path: "/academy/marketing/",
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
