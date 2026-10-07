import { expect, test } from '@playwright/test';

test('header contact works from a public page with no local contact section', async ({ page }) => {
  await page.goto('/company-information/');
  await expect(page.locator('.header-cta')).toHaveAttribute('href', '/contacts/');
  if (test.info().project.name === 'mobile') {
    await page.locator('[data-menu-button]').click();
    await page.locator('[data-mobile-menu] a[href="/contacts/"]').click();
  } else {
    await page.locator('.header-cta').click();
  }
  await expect(page).toHaveURL(/\/contacts\/$/);
  await expect(page.locator('h1')).toBeVisible();
});

for (const track of ['it', 'sales', 'operations']) {
  test(`Academy ${track} deep link opens useful content and the correct learning track`, async ({ page }) => {
    await page.goto(`/paths/academy/#academy-${track}`);
    const entry = page.locator(`#academy-${track}`);
    await expect(entry).toBeVisible();
    await expect(entry.locator('a')).toHaveAttribute('href', /^mailto:officeus@hermeslogisticsus\.com\?subject=/);
    await entry.locator('button').click();
    await expect(page.locator('[data-academy-flow]')).toHaveAttribute('data-active-screen', '2');
    await expect(page.locator(`[data-academy-track="${track}"]`)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-academy-screen="2"] h2')).toBeFocused();
  });
}

test('public homepage does not download the unrelated Repair owner runtime', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  expect(requests.some(url => url.endsWith('/repair-owner-runtime-fixes.js'))).toBe(false);
});
