import { expect, test } from '@playwright/test';

test.describe('Hermes Connect Mobile Web V2', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps the approved mobile brand, motion-safe shell and Hermes launcher', async ({ page }) => {
    const response = await page.goto('/demos/hermes-connect-brand-v1/mobile.html');
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Run your business');
    await expect(page.locator('.knot-launcher')).toBeVisible();
    await expect(page.locator('.knot-launcher svg')).toHaveCount(1);
    await expect(page.getByText('Hermes Intelligence').first()).toBeVisible();
  });

  test('adapts business context without changing product identity', async ({ page }) => {
    await page.goto('/demos/hermes-connect-brand-v1/mobile.html');
    await page.getByRole('button', { name: 'Logistics' }).click();
    await expect(page.locator('[data-revenue]')).toHaveText('$14,620');
    await expect(page.locator('[data-actions]')).toHaveText('58');
    await expect(page.getByText('Scoring 26 load opportunities')).toBeVisible();
    await page.locator('.knot-launcher').click();
    await expect(page.locator('[data-drawer]')).toHaveClass(/open/);
    await expect(page.locator('[data-context]')).toContainText('US logistics context is active');
  });
});
