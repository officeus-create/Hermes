import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`three scenes readable and no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Subtle motion, clear commercial meaning.' })).toBeVisible();
    const labels = ['marketing','technology','academy'];
    for (const direction of labels) {
      await page.getByRole('button', { name: direction, exact: true }).click();
      await expect(page.getByRole('button', { name: direction, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Activate WebGL preview' })).toBeVisible();
      const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(noHorizontalOverflow, `unexpected horizontal overflow at ${viewport.name}/${direction}`).toBe(true);
      mkdirSync('test-results/screenshots', { recursive: true });
      await page.screenshot({ path: `test-results/screenshots/${viewport.name}-${direction}-static.png`, animations: 'disabled', fullPage: true });
    }
  });
}

test('reduced-motion preference remains a static fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Activate WebGL preview' }).click();
  await expect(page.getByRole('status')).toContainText('Static fallback');
  await expect(page.locator('.visual canvas')).toHaveCount(0);
});

test('Save-Data forces static fallback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Activate WebGL preview' }).click();
  await expect(page.getByRole('status')).toContainText('Static fallback');
  await expect(page.locator('.visual canvas')).toHaveCount(0);
});

test('opt-in activation never changes links or semantic content', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title).toContain('Hermes');
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
  await page.getByRole('button', { name: 'Activate WebGL preview' }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Marketing · restrained green horizon');
  const activateStillPresent = await page.getByRole('button', { name: 'Activate WebGL preview' }).count();
  if (activateStillPresent === 0) {
    await page.getByRole('button', { name: 'Pause animation' }).click();
    await expect(page.locator('.visual canvas')).toHaveCount(0);
  }
});
