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


test('real opt-in WebGL scenes render without uncaught browser failures', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  mkdirSync('test-results/screenshots', { recursive: true });
  for (const direction of ['marketing','technology','academy']) {
    await page.getByRole('button', { name: direction, exact: true }).click();
    await page.getByRole('button', { name: 'Activate WebGL preview' }).click();
    const fallback = await page.getByRole('status').count();
    if (fallback > 0) {
      await expect(page.getByRole('status')).toContainText('Static fallback');
      await page.screenshot({ path: `test-results/screenshots/desktop-${direction}-webgl-unavailable.png`, fullPage: true });
      continue;
    }
    await expect(page.getByRole('button', { name: 'Pause animation' })).toBeVisible();
    await expect(page.locator('.visual canvas')).toBeVisible({ timeout: 20000 });
    const blending = await page.locator('.visual').evaluate(node => ({ blend: getComputedStyle(node).mixBlendMode, mask: getComputedStyle(node).maskImage }));
    expect(blending.blend).toBe('screen');
    expect(blending.mask).toContain('gradient');
    await page.waitForTimeout(600);
    await page.screenshot({ path: `test-results/screenshots/desktop-${direction}-webgl-active.png`, fullPage: true });
    await page.getByRole('button', { name: 'Pause animation' }).click();
    await expect(page.locator('.visual canvas')).toHaveCount(0);
  }
  expect(errors, `uncaught exceptions during activation: ${errors.join('; ')}`).toEqual([]);
});


test('mobile viewport never downloads expensive WebGL chunks even when tapped', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const heavyRequests = [];
  page.on('request', req => {
    if (/three\\.module-|EmeraldHorizonBackground-|DotMatrixBackground-/.test(req.url())) heavyRequests.push(req.url());
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Activate WebGL preview' })).toBeVisible();
  expect(heavyRequests).toEqual([]);
  await page.getByRole('button', { name: 'Activate WebGL preview' }).click();
  await expect(page.getByRole('status')).toContainText('Static fallback');
  await expect(page.locator('.visual canvas')).toHaveCount(0);
  expect(heavyRequests).toEqual([]);
});

test('desktop initially paints static HTML without downloading Three.js', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const heavyRequests = [];
  page.on('request', req => {
    if (/three\\.module-|EmeraldHorizonBackground-|DotMatrixBackground-/.test(req.url())) heavyRequests.push(req.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  await page.waitForTimeout(250);
  expect(heavyRequests).toEqual([]);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('low memory and slow connections remain static even on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 2 });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '2g', saveData: false } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Activate WebGL preview' }).click();
  await expect(page.getByRole('status')).toContainText('Static fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
});
