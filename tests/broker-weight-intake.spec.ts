import { test, expect } from '@playwright/test';

test('broker original weight survives review and mock submitted receipt, without delivery claims', async ({ page }) => {
  const received: Record<string, unknown>[] = [];
  const origin = 'https://hermeslogisticsus.com';
  await page.addInitScript(() => localStorage.setItem('hermes-analytics-consent', 'denied'));
  // Every production-origin request is served locally; the receiver is mock only.
  await page.route(`${origin}/**`, async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/logistics-lead') {
      const body = route.request().postDataJSON(); received.push(body);
      await route.fulfill({ status: 200, json: { success: true, request_id: body.request_id } });
      return;
    }
    const response = await fetch(`http://127.0.0.1:${process.env.HERMES_E2E_PORT ?? '4321'}${url.pathname}${url.search}`);
    await route.fulfill({ status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/octet-stream' }, body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.goto(`${origin}/logistics/request-vehicle-transport/?role=broker#transport-intake`);
  const form = page.locator('[data-transport-form]');
  await expect(form.locator('[data-broker-weight]')).toBeVisible();
  await expect(form.locator('[name="broker_weight_state"]')).toHaveValue('unknown');
  for (const [name, value] of Object.entries({ contact_name: 'Fixture Broker', email: 'broker@example.test', phone: '+1 312 555 0100', pickup_location: 'Chicago, IL', delivery_location: 'Madison, WI', ready_date: '2099-10-08', year_make_model: '2025 Fixture Vehicle', quantity: '1' })) await form.locator(`[name="${name}"]`).fill(value);
  await form.locator('[name="request_type"]').selectOption('other');
  await form.locator('[name="commodity_type"]').selectOption('passenger_vehicle');
  await form.locator('[name="condition"]').selectOption('operable');
  await form.locator('[name="consent"]').check();
  await form.locator('[name="broker_weight_state"]').selectOption('known');
  await form.locator('[name="broker_weight_value"]').fill('003500.50');
  await form.locator('[name="broker_weight_unit"]').selectOption('kg');
  await form.getByRole('button', { name: 'Review transport request' }).click();
  await expect(page.locator('[data-transport-preview]')).toContainText('003500.50 kg');
  await page.locator('[data-send-transport-lead]').click();
  await expect.poll(() => received.length).toBe(1);
  expect(received[0].broker_weight).toEqual({ state: 'known', value: '003500.50', unit: 'kg' });
  expect(received[0].sales_tag).toBe('POSTED LOAD / BROKER');
  const status = page.locator('[data-transport-delivery-status]');
  await expect(status).toHaveAttribute('data-submission-state', 'submitted');
  await expect(status).toHaveAttribute('data-delivery-state', 'unconfirmed');
  await expect(status).toHaveAttribute('data-human-receipt-state', 'unconfirmed');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await form.locator('[name="broker_weight_value"]').fill('-1');
  await expect(page.locator('[data-transport-result]')).toBeHidden();
  await expect(page.locator('[data-transport-email]')).not.toHaveAttribute('href', /003500/);
  await form.locator('[name="submitter_type"]').selectOption('shipper');
  await expect(page.locator('[data-transport-email]')).toBeHidden();
  expect(received).toHaveLength(1);
});

test('broker fields cannot bleed into shipper review and invalid weight cannot prepare a handoff', async ({ page }) => {
  await page.goto('/logistics/request-vehicle-transport/?role=broker#transport-intake');
  const form = page.locator('[data-transport-form]');
  await form.locator('[name="broker_weight_value"]').fill('-1');
  await form.locator('[name="submitter_type"]').selectOption('shipper');
  await expect(form.locator('[data-broker-weight]')).toBeHidden();
  expect(await form.evaluate(node => new FormData(node as HTMLFormElement).has('broker_weight_value'))).toBe(false);
  await form.locator('[name="submitter_type"]').selectOption('broker');
  for (const [name, value] of Object.entries({ contact_name: 'Fixture Broker', email: 'broker@example.test', phone: '+1 312 555 0100', pickup_location: 'Chicago, IL', delivery_location: 'Madison, WI', ready_date: '2099-10-08', year_make_model: '2025 Fixture Vehicle', quantity: '1' })) await form.locator(`[name="${name}"]`).fill(value);
  await form.locator('[name="request_type"]').selectOption('other');
  await form.locator('[name="commodity_type"]').selectOption('passenger_vehicle');
  await form.locator('[name="condition"]').selectOption('operable');
  await form.locator('[name="consent"]').check();
  await form.getByRole('button', { name: 'Review transport request' }).click();
  await expect(form.locator('[data-transport-alert]')).toContainText('Invalid broker weight');
  await expect(page.locator('[data-transport-result]')).toBeHidden();
});
