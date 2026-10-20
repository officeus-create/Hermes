import { expect, test } from "@playwright/test";

const homeRoutes = {
  en: "/",
  uk: "/ua/",
  ru: "/ru/",
  es: "/es/",
  it: "/it/",
  fr: "/fr/",
} as const;
const directions = ["logistics", "marketing", "technology", "academy"] as const;
const evidenceRoutes = {
  logistics: "/company-information/",
  marketing: "/case/appleton-vehicle-transport-seo/",
  technology: "/case/it-development/",
  academy: "/academy/resources/",
} as const;
const directionRoutes = {
  en: ["/paths/logistics/", "/paths/marketing/", "/paths/technology/", "/paths/academy/"],
  uk: ["/ua/logistics/", "/ua/marketing/", "/ua/technology/", "/ua/academy/"],
  ru: ["/ru/logistics/", "/ru/marketing/", "/ru/technology/", "/ru/academy/"],
  es: ["/es/logistica/", "/es/marketing/", "/es/tecnologia/", "/es/academia/"],
  it: ["/it/logistica/", "/it/marketing/", "/it/tecnologia/", "/it/academy/"],
  fr: ["/fr/logistique/", "/fr/marketing/", "/fr/technologie/", "/fr/academie/"],
} as const;

// These are real existing canonical owner/evidence URLs, not new thin pages.
// Explicitly preserve the existing six-language self-canonical/hreflang system.
for (const [locale, home] of Object.entries(homeRoutes)) {
  test(`value, proof and next action stay available on the ${locale} homepage`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(home);
    const section = page.locator("[data-home-proof-decision]");
    await expect(section).toHaveCount(1);
    await expect(section).toHaveAttribute("data-proof-locale", locale);
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(section.locator("[data-proof-direction]")).toHaveCount(4);
    for (const [index, direction] of directions.entries()) {
      const card = section.locator(`[data-proof-direction="${direction}"]`);
      await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(card.locator("p")).not.toBeEmpty();
      await expect(card.locator("[data-proof-evidence]")).toHaveAttribute("href", evidenceRoutes[direction]);
      await expect(card.locator("[data-proof-service]")).toHaveAttribute("href", directionRoutes[locale as keyof typeof directionRoutes][index]);
      const links = card.locator("a");
      await expect(links).toHaveCount(2);
      for (const link of await links.all()) {
        expect(await link.evaluate((node) => node.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      }
    }
    await expect(section.locator("[data-proof-contact]")).toHaveAttribute("href", "/contacts/");
    // Localized proof links are visibly marked as English-language sources.
    if (locale !== "en") await expect(section.locator("[data-proof-evidence]").first()).toContainText(/англ|english|ingl|anglais/i);
    const proofFits = await section.evaluate((node) =>
      node.scrollWidth <= node.clientWidth + 1);
    expect(proofFits, `${locale} evidence band must fit 390px without horizontal clipping`).toBe(true);
  });
}

test("evidence links and local direction route work before any analytics consent", async ({ page }) => {
  await page.goto("/");
  const proof = page.locator("[data-home-proof-decision]");
  await proof.locator('[data-proof-direction="marketing"] [data-proof-evidence]').click();
  await expect(page).toHaveURL(/\/case\/appleton-vehicle-transport-seo\/$/);
  // A second visitor's independent journey must remain operable without relying
  // on Chromium's flaky requestAnimationFrame after same-tab navigation history.
  // BFCache/back-button behavior is a separate cross-browser acceptance gate.
  const secondPage = await page.context().newPage();
  try {
    await secondPage.goto("/");
    const technologyLink = secondPage.locator('[data-home-proof-decision] [data-proof-direction="technology"] [data-proof-service]');
    await expect(technologyLink).toBeVisible();
    await technologyLink.click();
    await expect(secondPage).toHaveURL(/\/paths\/technology\/$/);
  } finally {
    await secondPage.close();
  }
});

test("evidence-first decision band is accessible without scripts", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: testInfo.project.use.baseURL,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/ru/");
    const section = page.locator("[data-home-proof-decision]");
    await expect(section.locator("[data-proof-evidence]")).toHaveCount(4);
    await expect(section.locator("[data-proof-service]")).toHaveCount(4);
    await section.locator('[data-proof-direction="logistics"] [data-proof-service]').click();
    await expect(page).toHaveURL(/\/ru\/logistics\/$/);
  } finally {
    await context.close();
  }
});

test("mobile contact remains visually available after proof cards and deferred section rendering", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const proof = page.locator("[data-home-proof-decision]");
  await expect(proof).toBeVisible();
  // Full-page screenshots can show content-visibility:auto sections as blank
  // until scrolled into view. This tests the ACTUAL visitor journey.
  const contact = page.locator("#contact .home-final-contact");
  await contact.scrollIntoViewIfNeeded();
  await expect(contact.getByRole("heading", { name: /build your.*next step/i })).toBeVisible();
  const primary = contact.locator("[data-home-primary-contact]");
  await expect(primary).toBeVisible();
  await expect(primary).toHaveAttribute("href", "/contacts/");
  expect(await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.visibility !== "hidden" && Number(style.opacity) > 0
      && box.height >= 44 && box.width > 0;
  })).toBe(true);
  await primary.click();
  await expect(page).toHaveURL(/\/contacts\/$/);
});

test("contact section and proof anchors stay accessible without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-home-proof-decision] [data-proof-evidence]")).toHaveCount(4);
    const primary = page.locator("#contact [data-home-primary-contact]");
    await primary.scrollIntoViewIfNeeded();
    await expect(primary).toBeVisible();
    await expect(primary).toHaveAttribute("href", "/contacts/");
  } finally {
    await context.close();
  }
});

test("every linked proof and locale-specific direction resolves to an actual HTML page", async ({ request }) => {
  const paths = new Set<string>([
    ...Object.values(evidenceRoutes),
    ...Object.values(directionRoutes).flat(),
    "/contacts/",
  ]);
  for (const target of paths) {
    const response = await request.get(target);
    expect(response.status(), `linked local destination must be HTTP 200: ${target}`).toBe(200);
    expect(response.headers()["content-type"] ?? "", target).toMatch(/text\/html/);
    const body = await response.text();
    expect(body, `${target} must have visible page content`).toMatch(/<main\b/i);
  }
});

test("proof clicks emit only consent-gated, non-identifying funnel intent", async ({ page }) => {
  const externalAnalytics: string[] = [];
  page.on("request", (request) => {
    const host = new URL(request.url()).hostname;
    if (host.includes("google-analytics.com") || host.includes("googletagmanager.com")
      || host.includes("clarity.ms")) externalAnalytics.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator("[data-home-proof-decision]")).toBeVisible();

  await page.evaluate(() => {
    const events: Array<Record<string, unknown>> = [];
    (window as Window & { __proofEvents?: Array<Record<string, unknown>> }).__proofEvents = events;
    window.addEventListener("hermes:analytics", (evt) => {
      const detail = (evt as CustomEvent<Record<string, unknown>>).detail;
      if (detail.name === "home_proof_link_clicked") events.push(detail);
    });
    // Keep this test inside the site; test only the measurement intent, not an outbound action.
    document.querySelectorAll<HTMLAnchorElement>("[data-home-proof-decision] a").forEach((a) => {
      a.addEventListener("click", (event) => event.preventDefault());
    });
  });

  await page.locator('[data-proof-direction="logistics"] [data-proof-evidence]').click();
  await page.locator('[data-proof-direction="marketing"] [data-proof-service]').click();
  await page.locator("[data-proof-contact]").click();
  const events = await page.evaluate(() =>
    (window as Window & { __proofEvents?: Array<Record<string, unknown>> }).__proofEvents ?? []);
  expect(events).toHaveLength(3);
  expect(events.map(({ name, direction, action, locale, page_group }) => ({
    name, direction, action, locale, page_group,
  }))).toEqual([
    { name: "home_proof_link_clicked", direction: "logistics", action: "source", locale: "en", page_group: "corporate_home" },
    { name: "home_proof_link_clicked", direction: "marketing", action: "service", locale: "en", page_group: "corporate_home" },
    { name: "home_proof_link_clicked", direction: "all", action: "contact", locale: "en", page_group: "corporate_home" },
  ]);
  for (const event of events) {
    expect(Object.keys(event).sort()).toEqual([
      "action", "direction", "locale", "name", "page_group", "ts",
    ]);
  }
  expect(await page.evaluate(() => localStorage.getItem("hermes-analytics-consent"))).toBe("denied");
  expect(externalAnalytics).toEqual([]);
});
