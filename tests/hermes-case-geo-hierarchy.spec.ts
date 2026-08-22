import { expect, test } from "@playwright/test";

const route = "/case/it-development/";

test("technology case keeps Hermes as master brand and Technology as the public direction", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/Hermes Website Case Study \| Hermes Technology/);
  await expect(page.getByRole("link", { name: "Hermes Technology" })).toHaveAttribute("href", "/paths/technology/");
  await expect(page.getByRole("heading", { name: "One digital front door for four directions." })).toBeVisible();
  await expect(page.getByText("Hermes Logistics, Hermes Marketing, Hermes Academy, and Hermes Technology", { exact: false })).toBeVisible();

  const schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
  expect(schemaText).toContain('"name":"Hermes"');
  expect(schemaText).toContain('"name":"Hermes Technology"');
  expect(schemaText).not.toContain('"name":"Hermes IT Development"');

  const visible = await page.locator("main").innerText();
  expect(visible).not.toContain("four businesses");
});

test("technology case remains readable and overflow-safe at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  await expect(page.getByRole("heading", { name: "One digital front door for four directions." })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});
