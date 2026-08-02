import { expect, test } from "@playwright/test";

const trustPages = [
  { path: "/about/", h1: "About Hermes", title: /About Hermes/ },
  { path: "/terms/", h1: "Terms of Use", title: /Terms of Use/ },
  { path: "/editorial-policy/", h1: "Editorial and Corrections Policy", title: /Editorial & Corrections Policy/ },
  { path: "/accessibility/", h1: "Accessibility Statement", title: /Accessibility Statement/ },
] as const;

for (const item of trustPages) {
  test(`${item.path} publishes a canonical trust page with one H1`, async ({ page }) => {
    await page.goto(item.path);
    await expect(page).toHaveTitle(item.title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(item.h1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://hermeslogisticsus.com${item.path}`,
    );
    await expect(page.getByRole("link", { name: /Email officeus@hermeslogisticsus.com/i })).toHaveAttribute(
      "href",
      /^mailto:officeus@hermeslogisticsus\.com/,
    );
  });
}

test("English footer exposes all public trust routes", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "About Hermes" })).toHaveAttribute("href", "/about/");
  await expect(footer.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/terms/");
  await expect(footer.getByRole("link", { name: "Editorial & Corrections" })).toHaveAttribute("href", "/editorial-policy/");
  await expect(footer.getByRole("link", { name: "Accessibility" })).toHaveAttribute("href", "/accessibility/");
});

test("trust sitemap and robots expose all trust URLs", async ({ request }) => {
  const sitemapResponse = await request.get("/sitemap-trust.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  for (const item of trustPages) {
    expect(sitemap).toContain(`<loc>https://hermeslogisticsus.com${item.path}</loc>`);
  }

  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBeTruthy();
  expect(await robotsResponse.text()).toContain("Sitemap: https://hermeslogisticsus.com/sitemap-trust.xml");
});

test("trust pages preserve evidence and no-guarantee boundaries", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByText(/Case studies and testimonials are published only/i)).toBeVisible();
  await expect(page.getByText(/does not use a virtual office/i)).toBeVisible();

  await page.goto("/terms/");
  await expect(page.getByText(/does not guarantee rankings, impressions, traffic, leads, revenue/i)).toBeVisible();

  await page.goto("/editorial-policy/");
  await expect(page.getByText(/not as a separate LSI-word target/i)).toBeVisible();
  await expect(page.getByText(/private link networks, and fake reviews are prohibited/i)).toBeVisible();
});
