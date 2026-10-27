import { expect, test } from "@playwright/test";

const cases = [
  {
    route: "/case/",
    caseId: "case_hub",
    selector: ".case-method-layout [data-case-cta]",
    action: "discuss_measurable_project",
    destination: "/contacts/",
    trackOpen: false,
  },
  {
    route: "/case/appleton-vehicle-transport-seo/",
    caseId: "appleton_vehicle_transport_seo",
    selector: ".case-cta [data-case-cta]",
    action: "review_logistics_seo",
    destination: "/services/seo-for-logistics-companies/",
    trackOpen: true,
  },
  {
    route: "/case/it-development/",
    caseId: "it_development",
    selector: ".case-study-commercial [data-case-cta]",
    action: "start_project_brief",
    destination: "/paths/technology/",
    trackOpen: true,
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
    (window as unknown as { __caseAnalytics: Array<Record<string, unknown>> }).__caseAnalytics = [];
    window.addEventListener("hermes:analytics", (event) => {
      (window as unknown as { __caseAnalytics: Array<Record<string, unknown>> }).__caseAnalytics.push(
        (event as CustomEvent).detail as Record<string, unknown>,
      );
    });
  });
});

for (const item of cases) {
  test(`${item.route} uses the approved case-study funnel analytics`, async ({ page }) => {
    const response = await page.goto(item.route);
    expect(response?.ok()).toBeTruthy();

    const initial = await page.evaluate(() =>
      (window as unknown as { __caseAnalytics: Array<Record<string, unknown>> }).__caseAnalytics,
    );

    if (item.trackOpen) {
      expect(initial).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: "case_opened", caseId: item.caseId }),
      ]));
    } else {
      expect(initial.find((event) => event.name === "case_opened")).toBeUndefined();
    }

    const cta = page.locator(item.selector);
    await expect(cta).toHaveCount(1);
    await cta.evaluate((element) => {
      element.addEventListener("click", (event) => event.preventDefault(), { once: true });
    });
    await cta.click();

    const events = await page.evaluate(() =>
      (window as unknown as { __caseAnalytics: Array<Record<string, unknown>> }).__caseAnalytics,
    );

    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "case_study_cta",
        caseId: item.caseId,
        action: item.action,
        destination: item.destination,
      }),
    ]));
  });
}
