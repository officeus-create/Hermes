import { expect, test } from '@playwright/test';

const websiteOwner = '/services/auto-repair-website-design/';
const seoOwner = '/services/seo-for-auto-repair-shops/';

// All API traffic in these synthetic checks stays local/mocked. No account, lead or booking is created.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"success":false}' }));
});

test('clean English access stays English with a stale Ukrainian preference and explains the pilot', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hermes-connect-language', 'uk'));
  await page.goto('/services/hermes-connect/access/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Sign in and registration | Hermes Connect');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One sign-in. A CRM matched to your business.');
  await expect(page.locator('[data-hc-product-context]')).toContainText('Repair Shop is the current live pilot');
  await expect(page.locator('[data-hc-product-context]')).not.toContainText('REFERENCE CAPABILITY');
  await expect(page.locator('[data-consent-settings]')).toHaveText('Privacy settings');
  const visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toMatch(/[\u0400-\u04ff]/);
  await expect(page.locator('[data-access-form]')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hermeslogisticsus.com/services/hermes-connect/access/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: `test-results/repair-access-${test.info().project.name}.png`, fullPage: true });
});

test('explicit Ukrainian access remains available', async ({ page }) => {
  await page.goto('/services/hermes-connect/access/?lang=uk');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Один вхід. CRM — під ваш тип бізнесу.');
  await expect(page.locator('[data-hc-product-context]')).not.toContainText('ДОВІДКОВИЙ МОДУЛЬ');
});

for (const [owner, label, destination, query, anchor] of [
  [websiteOwner, 'Start an auto repair website brief', '/paths/technology/', 'project=website_development', '#project-brief'],
  [seoOwner, 'Start an auto repair SEO review', '/paths/marketing/', 'service=seo', '#contact'],
]) {
  test(`${owner} keeps the canonical search owner and repair context in server HTML`, async ({ page, request }) => {
    const response = await request.get(owner);
    const html = await response.text();
    expect(html).toContain('vertical=auto_repair');
    expect(html).toContain(`source_path=${encodeURIComponent(owner)}`);
    await page.goto(owner);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://hermeslogisticsus.com${owner}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index,follow/);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const schema of schemas) expect(() => JSON.parse(schema)).not.toThrow();
    const cta = page.locator('.digital-service-actions').getByRole('link', { name: label });
    await cta.click();
    await expect(page).toHaveURL(`${destination}?${query}&vertical=auto_repair&source_path=${encodeURIComponent(owner)}${anchor}`);
    if (owner === websiteOwner) {
      await expect(page.locator('input[name="industry"]')).toHaveValue('Auto repair shop / service center');
      await expect(page.locator('textarea[name="project_1"]')).toHaveValue(/Repair shop:/);
      await expect(page.locator('select[name="website_project_type"] option[value="rebranding"]')).toHaveText('Website rebranding');
      await page.locator('select[name="website_project_type"]').selectOption('rebranding');
      // Context is editable, never an assertion about the visitor's actual company.
      await page.locator('input[name="industry"]').fill('Mobile mechanic');
      await expect(page.locator('input[name="industry"]')).toHaveValue('Mobile mechanic');
      const brief = page.locator('[data-it-project-brief]');
      await brief.locator('select[name="company_stage"]').selectOption({ label: 'Small company ready to grow' });
      await brief.locator('textarea[name="business_goal"]').fill('Synthetic QA of repair website rebranding context only.');
      await brief.locator('input[name="website_target_market"]').fill('United States');
      await brief.locator('select[name="website_page_range"]').selectOption('not_sure');
      await brief.locator('[data-brief-next]').click();
      await brief.locator('input[name="no_examples"]').check();
      await brief.locator('[data-brief-next]').click();
      await brief.locator('select[name="investment_horizon"]').selectOption({ label: 'Not sure yet' });
      await brief.locator('[data-brief-next]').click();
      for (const [name, value] of Object.entries({ company_name: 'Synthetic QA', contact_name: 'Synthetic QA', contact_role: 'QA', contact_email: 'synthetic@example.invalid', country: 'United States', region_city: 'Synthetic QA' })) {
        await brief.locator(`input[name="${name}"]`).fill(value);
      }
      await brief.locator('input[name="brief_consent"]').check();
      await brief.locator('[data-brief-next]').click();
      await expect(brief.locator('[data-brief-summary]')).toContainText('Website rebranding');
      await expect(brief.locator('[data-brief-summary]')).toContainText(websiteOwner);
      const post = page.waitForRequest(request => request.url().endsWith('/api/logistics-lead') && request.method() === 'POST');
      await brief.locator('[data-brief-send]').click();
      const payload = (await post).postDataJSON();
      expect(payload.interest).toBe('IT Development');
      expect(payload.message).toContain(websiteOwner);
      await expect(brief.locator('[data-brief-status]')).toContainText('temporarily unavailable');

    } else {
      const form = page.locator('[data-contact-form]');
      await expect(form.locator('select[name="path"]')).toHaveValue('ProgressoPro');
      await expect(form.locator('select[name="seo_vertical"]')).toHaveValue('auto_repair');
      await form.locator('input[name="name"]').fill('Synthetic QA');
      await form.locator('input[name="email"]').fill('synthetic@example.invalid');
      await form.locator('input[name="seo_primary_market"]').fill('United States');
      await form.locator('select[name="seo_search_scope"]').selectOption('local');
      await form.locator('select[name="seo_gsc_access"]').selectOption('unknown');
      await form.locator('select[name="seo_ga4_access"]').selectOption('unknown');
      await form.locator('select[name="seo_work_scope"]').selectOption('technical_audit');
      await form.locator('select[name="seo_timeline"]').selectOption('Flexible');
      await form.locator('textarea[name="seo_current_problem"]').fill('Synthetic local search qualification check, not a customer request.');
      await form.locator('textarea[name="message"]').fill('Synthetic context preservation check only.');
      await form.locator('input[name="consent"]').check();
      await form.getByRole('button', { name: 'Preview request' }).click();
      await expect(form.locator('[data-handoff-summary]')).toContainText('Repair shop / service center');
      await expect(form.locator('[data-handoff-summary]')).toContainText(seoOwner);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.screenshot({ path: `test-results/repair-${owner === websiteOwner ? 'website' : 'seo'}-${test.info().project.name}.png`, fullPage: true });
  });
}
