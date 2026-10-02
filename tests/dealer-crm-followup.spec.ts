import { expect, test } from '@playwright/test';

test('dealer Intelligence shows incomplete follow-up warning and clears it after repair/reload', async ({ page }, testInfo) => {
  let incomplete = true;
  // Keep this synthetic fixture local; unmatched writes never reach a provider.
  let unexpectedWrites = 0;
  await page.route('**/*', route => {
    if (new URL(route.request().url()).hostname !== '127.0.0.1') return route.abort();
    if (!['GET', 'HEAD'].includes(route.request().method())) {
      unexpectedWrites += 1;
      return route.abort();
    }
    return route.continue();
  });
  await page.route('**/api/auth/me', route => route.fulfill({ json: { success: true, specialist: { name: 'Synthetic owner', role: 'Dealer' } } }));
  await page.route('**/api/hermes-connect/dealer/crm*', route => {
    const module = new URL(route.request().url()).searchParams.get('module');
    const payload: Record<string, unknown> = { success: true, company: { company_name: 'Synthetic fixture', timezone: 'UTC' }, counts: {}, customers: [], vehicles: [], leads: [], team: { members: [], department_hours: [], member_schedules: [] } };
    if (module === 'intelligence') payload.intelligence = {
      next_actions: incomplete ? [{ code: 'lead_follow_up_incomplete', label: 'Add a next action and follow-up date to active leads.' }] : [],
    };
    return route.fulfill({ json: payload });
  });
  await page.goto('/services/hermes-connect/dealers/workspace/crm/');
  const tab = page.locator('[data-tab="intelligence"]');
  await expect(tab).toBeVisible();
  await tab.focus();
  await page.keyboard.press('Enter');
  const warning = page.locator('[data-intelligence]').getByText('Add a next action and follow-up date to active leads.', { exact: true });
  await expect(warning).toBeVisible();
  await expect(page.locator('[data-intelligence] .action-list li')).toHaveCount(1);
  const screenshot = testInfo.outputPath(`dealer-followup-${testInfo.project.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach(`dealer-followup-${testInfo.project.name}`, { path: screenshot, contentType: 'image/png' });
  incomplete = false;
  await page.reload();
  await page.locator('[data-tab="intelligence"]').click();
  await expect(warning).toHaveCount(0);
  await expect(page.locator('[data-intelligence]')).toContainText('No rule-based operational exceptions detected.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  expect(unexpectedWrites).toBe(0);
});
