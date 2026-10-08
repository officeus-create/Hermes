import { test, expect } from '@playwright/test';
for (const route of ['dealer-vehicle-transportation', 'car-hauling-dispatch']) {
  test(`versioned hero preserves approved content and actions: ${route}`, async ({ page }) => {
    await page.goto(`/logistics/${route}/`);
    const hero = page.locator('.commercial-hero-grid > img');
    await expect(hero).toBeVisible();
    const src = await hero.getAttribute('src');
    expect(src).toMatch(/^\/_astro\/path-logistics-system\.[\w-]+\.jpg$/);
    const response = await page.request.get(src!);
    expect(response.ok()).toBeTruthy();
    expect((await response.body()).length).toBe(90337);
    await expect(page.locator('.commercial-actions a').first()).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    if (route.startsWith('dealer')) {
      await expect(page.locator('.commercial-actions [data-commercial-primary-cta]')).toHaveAttribute('href', '/logistics/request-vehicle-transport/?role=dealer&request=dealer_inventory#transport-intake');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  });
}
