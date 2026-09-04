import { expect, test } from '@playwright/test';

test.describe('Logistics career → private HR intake', () => {
  test('career application persists one candidate and one bounded intake-evidence snapshot', async ({ page }) => {
    const calls: Array<{ method: string; headers: Record<string, string>; body: any }> = [];

    await page.route('**/api/hr/candidate', async (route) => {
      const request = route.request();
      const method = request.method();
      const body = request.postDataJSON();
      calls.push({ method, headers: request.headers(), body });

      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            duplicate: false,
            candidate_id: body.candidate_id,
            session_id: 'hr-session-test',
            status: 'interviewing',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          candidate_id: body.candidate_id,
          accepted_answers: 3,
          accepted_events: 1,
          completed: true,
          status: 'completed',
        }),
      });
    });

    await page.goto('/logistics/apply/?for=career&role=car-hauling-dispatcher&source=linkedin&utm_campaign=career-test');
    await page.locator('[name="name"]').fill('Synthetic Candidate');
    await page.locator('[name="email"]').fill('synthetic.candidate@example.com');
    await page.locator('[name="location"]').fill('Kyiv, Ukraine');
    await page.locator('[name="languages"]').fill('EN, UA');
    await page.locator('[name="experience"]').fill('Built a small outbound workflow and improved follow-up consistency with measurable call notes.');
    await page.locator('[name="availability"]').fill('Monday through Friday, 9 AM to 5 PM Central Time.');
    await page.locator('[name="consent"]').check();

    await page.locator('[data-application-submit]').click();
    await expect(page.locator('[data-application-result-title]')).toHaveText('Application received for human review');
    await expect(page.locator('[data-application-preview]')).toContainText('Status: completed intake · human review required');

    expect(calls).toHaveLength(2);
    const start = calls[0];
    const evidence = calls[1];

    expect(start.method).toBe('POST');
    expect(start.body.candidate_id).toMatch(/^hr_[a-zA-Z0-9][a-zA-Z0-9_-]{20,100}$/);
    expect(start.headers['idempotency-key']).toBe(start.body.candidate_id);
    expect(start.headers['x-hr-candidate-token']?.length).toBeGreaterThanOrEqual(48);
    expect(start.body).toMatchObject({
      name: 'Synthetic Candidate',
      email: 'synthetic.candidate@example.com',
      country: 'Kyiv, Ukraine',
      language: 'en',
      source: 'linkedin',
      track: 'logistics',
      consent: true,
    });
    expect(start.body.attribution).toMatchObject({
      vacancy: 'car-hauling-dispatcher',
      utm_campaign: 'career-test',
      landing_path: '/logistics/apply/',
    });
    expect(JSON.stringify(start.body.attribution)).not.toContain('Synthetic Candidate');
    expect(JSON.stringify(start.body.attribution)).not.toContain('synthetic.candidate@example.com');

    expect(evidence.method).toBe('PUT');
    expect(evidence.body.candidate_id).toBe(start.body.candidate_id);
    expect(evidence.headers['x-hr-candidate-token']).toBe(start.headers['x-hr-candidate-token']);
    expect(evidence.body.completed_at).toBe(start.body.submitted_at);
    expect(evidence.body.answers).toHaveLength(3);
    expect(evidence.body.answers.map((answer: any) => answer.question_id)).toEqual([
      'application_languages',
      'application_experience',
      'application_availability',
    ]);
    expect(evidence.body.answers[0].answer).toBe('Reported languages: EN, UA');
    expect(evidence.body.events).toHaveLength(1);
    expect(evidence.body.events[0]).toMatchObject({
      type: 'public_logistics_application_submitted',
      payload: {
        application_type: 'career',
        vacancy: 'car-hauling-dispatcher',
        source: 'linkedin',
        landing_path: '/logistics/apply/',
      },
    });
    expect(JSON.stringify(evidence.body.events[0].payload)).not.toContain('synthetic.candidate@example.com');
  });

  test('agency inquiry remains local preview and does not enter HR', async ({ page }) => {
    let apiCalls = 0;
    await page.route('**/api/hr/candidate', async (route) => {
      apiCalls += 1;
      await route.abort();
    });

    await page.goto('/logistics/apply/?for=agency&source=referral');
    await page.locator('[name="name"]').fill('Synthetic Agency Owner');
    await page.locator('[name="email"]').fill('agency.preview@example.com');
    await page.locator('[name="location"]').fill('London, UK');
    await page.locator('[name="languages"]').fill('EN, RU');
    await page.locator('[name="interest"]').fill('Remote logistics agency');
    await page.locator('[name="experience"]').fill('Managed a small remote sales team and maintained a documented daily operating cadence.');
    await page.locator('[name="availability"]').fill('Weekdays during U.S. business hours.');
    await page.locator('[name="consent"]').check();

    await page.locator('[data-application-submit]').click();
    await expect(page.locator('[data-application-result-title]')).toHaveText('Ready to copy');
    await expect(page.locator('[data-application-preview]')).toContainText('Delivery: preview only — no agency inquiry was sent or stored.');
    expect(apiCalls).toBe(0);
  });
});
