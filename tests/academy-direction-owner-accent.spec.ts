import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Academy direction owner uses Academy family accent without changing search ownership", async ({ page }) => {
  const response = await page.goto("/paths/academy/");
  expect(response?.ok()).toBeTruthy();

  const body = page.locator("body");
  await expect(body).toHaveAttribute("data-direction-family", "academy");

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", "https://hermeslogisticsus.com/paths/academy/");

  const academyColor = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("--family-accent").trim(),
  );
  expect(academyColor).toBeTruthy();

  const eyebrow = page.locator("section.resource-related p.eyebrow").first();
  const eyebrowColor = await eyebrow.evaluate((node) => getComputedStyle(node).color);
  const academyFamilyText = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--family-accent-text)";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
  const legacyViolet = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "#7c5cff";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
  expect(eyebrowColor).toBe(academyFamilyText);
  expect(eyebrowColor).not.toBe(legacyViolet);

  const proof = page.locator('[data-direction-story="academy"] .ds-proof');
  await expect(proof).toContainText("Real entry points");
  await expect(proof.locator(".ds-proof-card")).toHaveCount(3);
  await expect(proof).toContainText("Public exercises & guides");
  await expect(proof).toContainText("How training works");
  await expect(proof).toContainText("London entry path");
});

test("Technology and Marketing direction owners retain their reviewed owner styling", async ({ page }) => {
  for (const path of ["/paths/technology/", "/paths/marketing/"]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).not.toHaveAttribute("data-direction-family", /.+/);
  }
});
