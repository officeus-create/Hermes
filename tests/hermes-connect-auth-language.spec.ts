import { expect, test, type Page } from '@playwright/test';

const routes = [
  { path: 'access/', title: 'One sign-in. A CRM matched to your business.' },
  { path: 'academy/auth/', title: 'Use one Hermes account across the ecosystem.' },
  { path: 'academy/business/auth/', title: 'A CRM adapted to an academy, courses, or a business club.' },
];
async function chooseLanguage(page: Page, isMobile: boolean, language: string) {
  // Language navigation preserves #main-content; return to the header as a user would.
  // Mobile emulation does not implement desktop Home-key scrolling.
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  // Interaction checks need the newly navigated page to produce animation frames.
  // CI observations already proved geometry stable, styles visible and fonts loaded.
  await page.bringToFront();
  await page.waitForLoadState('load');
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  if (isMobile) {
    await page.locator('[data-menu-button]').click();
    await page.locator(`.mobile-language-switcher a[lang="${language}"]`).click();
  } else {
    await page.locator('[data-language-menu] summary').click();
    await page.locator(`[data-language-menu] a[lang="${language}"]`).click();
  }
}

test.beforeEach(async ({ page }) => {
  // Keep this language regression entirely local: no account creation or external calls.
  await page.route('**/api/**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"success":false,"error":"not_authenticated"}' }));
});
for (const { path, title } of routes) {
  test(`${path} keeps default English through reload and uses one language control`, async ({ page, isMobile }) => {
    await page.goto(`/services/hermes-connect/${path}?mode=register#main-content`);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page.locator('.desktop-nav [data-nav-tone="logistics"]')).toHaveText('Logistics');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main button[data-lang]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('main h1')).toHaveText(title);
    await chooseLanguage(page, isMobile, 'uk');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.locator('main h1')).not.toHaveText(title);
    await expect(page.locator('[data-hc-english-only]')).toHaveCount(0);
    await chooseLanguage(page, isMobile, 'en');
    await expect(page.locator('main h1')).toHaveText(title);
    expect(new URL(page.url()).searchParams.get('mode')).toBe('register');
    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });
  test(`${path} respects saved Ukrainian and explicit English overrides it`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('hermes-connect-language', 'uk'));
    await page.goto(`/services/hermes-connect/${path}`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.locator('main h1')).not.toHaveText(title);
    await page.goto(`/services/hermes-connect/${path}?lang=en`);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
}
