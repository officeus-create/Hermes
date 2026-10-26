import { expect, test } from "@playwright/test";

// Search error matrix E13: Clarity recorded ~10% dead clicks. Cards that look clickable must follow their
// single existing link when the card body is clicked (same href, no new URLs, the link stays the focus stop).
const cases = [
  ["/insights/", "article.insight-card"],
  ["/businesses/", "article.business-card"],
  ["/opportunities/", "article.opportunity-card"],
  ["/paths/technology/", "article.technology-proof-item"],
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem("hermes-analytics-consent", "denied"); sessionStorage.setItem("hermes-intro-seen", "true"); } catch {}
  });
});

for (const [route, selector] of cases) {
  test(`${route} ${selector} body click follows the card link`, async ({ page }) => {
    await page.goto(route);
    const card = page.locator(selector).first();
    await card.scrollIntoViewIfNeeded();
    const links = card.locator("a[href]");
    await expect(links).toHaveCount(1);
    const href = (await links.getAttribute("href"))!;
    const box = (await card.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + 24);
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  });
}
