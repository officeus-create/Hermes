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
  console.log('auth-language-actionability', JSON.stringify(await page.evaluate(async (mobile) => {
    const selector = mobile ? '[data-menu-button]' : '[data-language-menu] summary';
    const samples = [];
    for (let sample = 0; sample < 3; sample++) {
      const node = document.querySelector(selector)!;
      const r = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      samples.push({ x: r.x, y: r.y, width: r.width, height: r.height, display: style.display, visibility: style.visibility, transform: style.transform, ready: document.readyState, fonts: document.fonts.status, scrollY });
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    return { href: location.href, viewport: innerWidth, samples };
  }, isMobile)));
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
