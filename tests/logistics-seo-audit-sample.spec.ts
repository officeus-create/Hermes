import { expect, test } from "@playwright/test";

const route = "/resources/logistics-seo-audit-sample/";
const canonical = `https://hermeslogisticsus.com${route}`;

test("Logistics SEO audit sample is indexable, illustrative, and conversion-ready", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Logistics SEO Audit Sample | Hermes Marketing");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("heading", { level: 1, name: "Logistics SEO Audit Sample" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Illustrative sample — not a client case." })).toBeVisible();
  await expect(page.getByText(/No client identity, private operating record, ranking, traffic, inquiry, revenue, testimonial, or guaranteed result/i)).toBeVisible();

  await expect(page.locator('[data-sample-priority="P0"]')).toHaveCount(2);
  await expect(page.locator('[data-sample-priority="P1"]')).toHaveCount(3);
  await expect(page.locator('[data-sample-priority="Measure"]')).toHaveCount(1);

  await expect(page.getByRole("link", { name: /Request an SEO scope review/i })).toHaveAttribute(
    "href",
    "/paths/marketing/?service=seo#contact",
  );
  await expect(page.getByRole("link", { name: /Review Logistics SEO services/i })).toHaveAttribute(
    "href",
    "/services/seo-for-logistics-companies/",
  );
  await expect(page.locator(".digital-faq-list details")).toHaveCount(5);
});

test("Logistics SEO audit sample exposes Article, Service, FAQ, and breadcrumb schema", async ({ page }) => {
  await page.goto(route);

  const schemaTypes = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.flatMap((script) => {
      try {
        const parsed = JSON.parse(script.textContent ?? "null");
        const values = Array.isArray(parsed) ? parsed : [parsed];
        return values.map((value) => value?.["@type"]).filter(Boolean);
      } catch {
        return [];
      }
    }),
  );

  expect(schemaTypes).toEqual(expect.arrayContaining(["Article", "Service", "FAQPage", "BreadcrumbList"]));
});

test("SEO services and sitemap discover the Logistics SEO audit sample", async ({ page, request }) => {
  await page.goto("/services/seo/");
  await expect(page.getByRole("link", { name: "Logistics SEO Audit Sample" })).toHaveAttribute("href", route);

  const sitemap = await request.get("/sitemap-digital-services.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain(canonical);
});
