import { expect, test, type Page } from "@playwright/test";

// GA4 (gtag.js) is the one approved external telemetry integration on this site (see
// public/_headers connect-src / script-src). "Zero external delivery" checks below assert
// that no form submission, CRM write, or operational request leaves the browser — they must
// keep failing on any other outbound request, so only these known GA4 hosts are excluded.
const APPROVED_ANALYTICS_HOSTS = [/^https:\/\/(www\.)?google-analytics\.com$/, /^https:\/\/www\.googletagmanager\.com$/, /^https:\/\/www\.google\.com$/];

function isApprovedAnalyticsRequest(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (!APPROVED_ANALYTICS_HOSTS.some((pattern) => pattern.test(parsed.origin))) return false;
  if (parsed.origin === "https://www.google.com") return parsed.pathname === "/g/collect";
  return true;
}

async function openRegularHome(page: Page) {
  await page.goto("/");
  const intro = page.locator("[data-site-intro]");
  if (await intro.isVisible()) {
    await page.getByRole("button", { name: /Open Home/ }).click();
    await expect(intro).toHaveCount(0);
  }
}

const routes = [
  "/",
  "/paths/logistics/",
  "/paths/marketing/",
  "/paths/academy/",
  "/paths/technology/",
  "/case/it-development/",
  "/privacy/",
  "/ua/",
  "/ru/",
  "/es/",
  "/it/",
  "/fr/",
  "/logistics/appleton-wi-vehicle-transport/",
  "/logistics/resources/auction-vehicle-pickup-checklist/",
  "/logistics/resources/car-hauler-capacity-checklist/",
];

for (const route of routes) {
  test(`${route} renders without broken layout`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("#main-content")).toBeVisible();

    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
    }));

    expect(result.overflow).toBe(false);
    expect(result.brokenImages).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("direction card opens the matching page and preselects the form", async ({ page }) => {
  await openRegularHome(page);
  await page.getByRole("tab", { name: /Hermes IT Development/ }).click();
  await page.getByRole("link", { name: "Explore IT Development: Hermes IT Development" }).click();
  await expect(page).toHaveURL(/\/paths\/technology\/$/);
  await expect(page.locator('select[name="path"]')).toHaveValue("IT Development");
});

test("business pillars reveal one direction at a time and support keyboard navigation", async ({ page }) => {
  await page.goto("/#paths");
  const logistics = page.getByRole("tab", { name: /Hermes Logistics/ });
  const marketing = page.getByRole("tab", { name: /Hermes Marketing/ });

  await expect(logistics).toHaveAttribute("aria-selected", "true");
  await marketing.click();
  await expect(marketing).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: /Hermes Marketing/ })).toContainText("Website and conversion");
  await expect(page.getByRole("tabpanel", { name: /Hermes Logistics/ })).toBeHidden();

  await marketing.press("ArrowRight");
  const academy = page.getByRole("tab", { name: /Hermes Academy/ });
  await expect(academy).toBeFocused();
  await expect(academy).toHaveAttribute("aria-selected", "true");
});

test("desktop business portals expand on hover and keep click navigation", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop hover interaction");
  await page.goto("/#paths");

  const marketing = page.getByRole("tab", { name: /Hermes Marketing/ });
  await marketing.hover();
  await expect(marketing).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: /Hermes Marketing/ })).toContainText("Website and conversion");
  await expect(marketing.locator("xpath=.." )).toHaveAttribute("data-active", "true");
});

test("premium opening explains four directions, supports choice, and runs once per session", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const intro = page.locator("[data-site-intro]");
  await expect(intro).toBeVisible();
  await expect(intro.getByText("Move.", { exact: true })).toHaveAttribute("data-active", "true");
  await expect(page.locator('[data-intro-rail="logistics"]')).toHaveAttribute("data-active", "true");
  await expect(page.getByRole("link", { name: /Open Logistics/ })).toHaveAttribute("href", "/paths/logistics/");
  await expect(page.getByRole("link", { name: /Open Marketing/ })).toHaveAttribute("href", "/paths/marketing/");
  await expect(page.getByRole("link", { name: /Open Academy/ })).toHaveAttribute("href", "/paths/academy/");
  await expect(page.getByRole("link", { name: /Open IT Development/ })).toHaveAttribute("href", "/paths/technology/");

  await expect.poll(() => page.locator("[data-intro-count]").textContent(), { timeout: 7000 }).not.toBe("01");
  await expect(page.locator('[data-intro-rail][data-active="true"]')).toHaveCount(1);

  const marketingRail = page.locator('[data-intro-rail="marketing"]');
  await marketingRail.focus();
  await expect(marketingRail).toHaveAttribute("data-active", "true");
  const marketingStory = marketingRail.locator("[data-intro-story-line]");
  await expect.poll(() => marketingStory.nth(0).getAttribute("data-visible"), { timeout: 1500 }).toBe("true");
  await expect.poll(() => marketingStory.nth(2).getAttribute("data-visible"), { timeout: 4000 }).toBe("true");
  await page.waitForTimeout(2500);
  await expect(page.locator("[data-intro-count]")).toHaveText("02");

  await page.getByRole("button", { name: /Open Home/ }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("hermes-intro-seen"))).toBe("true");
  await expect(intro).toHaveCount(0, { timeout: 1000 });
  await page.reload();
  await expect(page.locator("[data-site-intro]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Four directions. One way forward." })).toBeVisible();
});

test("premium opening honors the visitor's reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-site-intro]")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Four directions. One way forward." })).toBeVisible();
});

test("homepage hero combines office and handwritten typography with a restrained living i-dot", async ({ page }) => {
  await openRegularHome(page);
  const title = page.getByRole("heading", { name: "Four directions. One way forward." });
  await expect(title).toBeVisible();
  await expect(title.locator(".hero-title-office")).toHaveText("Four dırections.");
  await expect(title.locator(".hero-title-script")).toHaveText("One way forward.");
  await expect(title.locator(".hero-letter-i > i")).toHaveCount(1);
  await expect(title.locator(".hero-letter-i > i")).not.toHaveCSS("animation-name", "none");
});

test("Load Board demo search reveals a fictional load for a presented city", async ({ page }) => {
  await page.goto("/load-board/");
  await page.getByRole("button", { name: "Rockford, IL" }).click();
  const demoStatus = page.locator("[data-demo-search-status]");
  await expect(demoStatus).toContainText("1 fictional demonstration load found");
  await expect(page.locator("[data-demo-load-card]:visible")).toHaveCount(1);
  await expect(page.locator("[data-demo-load-card]:visible")).toContainText("Nashville, TN");
  await expect(demoStatus).toContainText("not available to book or dispatch");
});

test("Appleton guide routes customers, dealers, and carriers into the existing Logistics forms", async ({ page }) => {
  await page.goto("/logistics/appleton-wi-vehicle-transport/");
  await expect(page).toHaveTitle("Appleton Vehicle Transport | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/appleton-wi-vehicle-transport/",
  );
  await expect(page.getByRole("heading", { name: "Vehicle transport to and from Appleton, Wisconsin." })).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

  await page.getByRole("link", { name: /Dealer request/ }).click();
  await expect(page).toHaveURL(/\/load-board\/\?role=dealer&origin=Appleton%2C%20WI#post-load$/);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("dealer");
  await expect(page.locator('input[name="pickup_location"]')).toHaveValue("Appleton, WI");

  await page.goto("/logistics/appleton-wi-vehicle-transport/");
  const carrierIntakeLink = page.getByRole("link", { name: "Carrier: share capacity" });
  await expect(carrierIntakeLink).toHaveAttribute(
    "href",
    "/load-board/?role=carrier&area=Appleton%2C%20WI#carrier-access",
  );
  await page.goto("/load-board/?role=carrier&area=Appleton%2C%20WI#carrier-access");
  await expect(page).toHaveURL(/\/load-board\/\?role=carrier&area=Appleton%2C%20WI#carrier-access$/);
  await expect(page.locator('input[name="origin_location"]')).toHaveValue("Appleton, WI");
});

test("auction pickup checklist stays non-affiliated and opens the existing shipper intake", async ({ page }) => {
  await page.goto("/logistics/resources/auction-vehicle-pickup-checklist/");
  await expect(page).toHaveTitle("Auction Vehicle Pickup Checklist | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/",
  );
  await expect(page.getByText(/Requirements vary by auction and location/)).toBeVisible();
  await expect(page.getByText(/does not guarantee a price, pickup date/)).toBeVisible();
  await page.getByRole("link", { name: /Open transport request/ }).click();
  await expect(page).toHaveURL(/\/load-board\/\?role=shipper#post-load$/);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("shipper");
});

test("car hauler checklist keeps load claims safe and opens the existing carrier intake", async ({ page }) => {
  await page.goto("/logistics/resources/car-hauler-capacity-checklist/");
  await expect(page).toHaveTitle("Car Hauler Capacity Checklist | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/",
  );
  await expect(page.getByText("No guaranteed load", { exact: true })).toBeVisible();
  await expect(page.getByText("No guaranteed rate or revenue", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Open carrier intake/ }).click();
  await expect(page).toHaveURL(/\/load-board\/\?role=carrier#carrier-access$/);
  await expect(page.locator('select[name="carrier_role"]')).toHaveValue("");
});

test("Academy presents AI automation as a safe practical learning lab", async ({ page }) => {
  await page.goto("/paths/academy/");
  await page.getByRole("button", { name: /Choose a track/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /See the 6 layers/ }).click();
  await page.getByRole("button", { name: /Method & FAQ/ }).click();
  await expect(page.getByRole("heading", { name: "Learn AI automation by building one useful assistant." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fitness AI Telegram Assistant" })).toBeVisible();
  await expect(page.getByText(/no live bot, member data, messages, enrollment, or payment/i)).toBeVisible();
});

test("premium opening plays a direction cue after consented interaction and keeps sound optional", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const soundButton = page.getByRole("button", { name: "Turn direction sounds off" });
  await expect(soundButton).toHaveAttribute("aria-pressed", "true");

  await page.evaluate(() => {
    window.addEventListener("hermes:intro-sound", (event) => {
      const direction = (event as CustomEvent<{ direction: string }>).detail.direction;
      sessionStorage.setItem("hermes-last-intro-sound", direction);
    });
  });

  await page.locator('[data-intro-rail="marketing"]').click();
  await expect(page).toHaveURL(/\/paths\/marketing\/$/, { timeout: 2500 });
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("hermes-last-intro-sound"))).toBe("marketing");

  await page.evaluate(() => {
    sessionStorage.removeItem("hermes-intro-seen");
    localStorage.setItem("hermes-intro-sound", "off");
  });
  await page.goto("/");
  const mutedButton = page.getByRole("button", { name: "Turn direction sounds on" });
  await expect(mutedButton).toHaveAttribute("aria-pressed", "false");
  await expect(mutedButton).toContainText("Sound off");
});

test("homepage proves the website product and routes to IT Development", async ({ page }) => {
  await openRegularHome(page);
  const proof = page.getByRole("heading", { name: "This website is our first live product." });
  await proof.scrollIntoViewIfNeeded();
  await expect(proof).toBeVisible();
  await page.getByRole("link", { name: "See how it was built" }).click();
  await expect(page).toHaveURL(/\/case\/it-development\/$/);
  await expect(page.getByRole("heading", { name: "One digital front door for four businesses." })).toBeVisible();
});

test("homepage presents four Hermes products with honest maturity labels", async ({ page }) => {
  await openRegularHome(page);
  const portfolio = page.locator(".product-showcase");
  await expect(portfolio.getByText("Product 01", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Live product", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Product 02", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Working prototype", { exact: true })).toHaveCount(2);
  await expect(portfolio.getByText("Product 03", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Product discovery", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Product 04", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Hermes Load Board", { exact: true })).toBeVisible();
  await expect(portfolio.getByRole("heading", { name: "A serious operating workspace built around your real process." })).toBeVisible();
  await expect(portfolio.getByRole("heading", { name: "One intelligent workspace for appointments, clients, teams, and growth." })).toBeVisible();
  await expect(portfolio.getByText("No account, booking, calendar, payment, or AI action is connected", { exact: false })).toBeVisible();
  await expect(portfolio.getByText("No load, truck, offer, dispatch, external-board sync, or scheduled update is live", { exact: false })).toBeVisible();
  await expect(portfolio.getByRole("link", { name: "Open Hermes Load Board" })).toHaveAttribute("href", "/load-board/");
  await expect(portfolio.locator("[data-product-line]")).toHaveCount(4);
});

test("IT case presents verified delivery evidence and a working inquiry route", async ({ page }) => {
  await page.goto("/case/it-development/");
  await expect(page.getByRole("heading", { name: "Quality was tested as part of the product." })).toBeVisible();
  await expect(page.getByText("70", { exact: true })).toBeVisible();
  await expect(page.getByText("browser scenarios passed", { exact: true })).toBeVisible();
  await expect(page.locator('.site-header a[href="/paths/technology/"][aria-current="page"]')).toHaveCount(2);
  await page.getByRole("link", { name: "Start your project brief" }).click();
  await expect(page).toHaveURL(/\/paths\/technology\/#project-brief$/);
  await expect(page.locator("[data-it-project-brief]")).toBeVisible();
  await expect.poll(() => page.locator("[data-it-project-brief]").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(60);
  await expect.poll(() => page.locator("[data-it-project-brief]").evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(100);
});

test("direction navigation identifies the current business", async ({ page }) => {
  await page.goto("/paths/marketing/");
  await expect(page.locator('.site-header a[href="/paths/marketing/"][aria-current="page"]')).toHaveCount(2);
});

test("language menu opens all localized overview pages", async ({ page, isMobile }) => {
  await page.goto("/paths/technology/");
  const languageMenu = isMobile ? page.locator(".mobile-language-switcher") : page.locator("[data-language-menu]");
  if (isMobile) {
    await page.locator("[data-menu-button]").click();
  } else {
    await expect(languageMenu.locator("summary")).toContainText("English");
    await languageMenu.locator("summary").click();
  }
  await expect(languageMenu.locator("a")).toHaveText([
    "English",
    "Español",
    "Français",
    "Українська",
    "Italiano",
    "Русский",
  ]);
  for (const path of ["es", "fr", "ua", "it", "ru"]) {
    await expect(languageMenu.locator(`a[href="/${path}/#technology"]`)).toHaveCount(1);
  }

  await page.goto("/ua/");
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.getByRole("heading", { name: "Чотири напрями. Одна екосистема для зростання." })).toBeVisible();
  await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/ru/");
  await expect(page.getByRole("link", { name: "Надіслати опис електронною поштою" })).toHaveAttribute("href", /mailto:officeus@hermeslogisticsus.com/);

  await page.goto("/ru/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("heading", { name: "Четыре направления. Одна экосистема для роста." })).toBeVisible();
  await expect(page.locator('link[rel="alternate"][hreflang="uk"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/ua/");
  await expect(page.getByText("AI и messaging-ассистенты", { exact: true })).toBeVisible();

  await page.goto("/es/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { name: "Cuatro áreas. Un ecosistema para crecer." })).toBeVisible();

  await page.goto("/it/");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.getByRole("heading", { name: "Quattro aree. Un ecosistema per crescere." })).toBeVisible();

  await page.goto("/fr/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("heading", { name: "Quatre pôles. Un écosystème pour grandir." })).toBeVisible();
});

test("preview contact workflow validates and sends no request", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && !isApprovedAnalyticsRequest(request.url())) posts.push(request.url());
  });

  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Test User");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Logistics");
  await expect(page.locator('input[name="phone"]')).toBeVisible();
  await page.locator('input[name="phone"]').fill("+1 (312) 555-0182");
  await page.locator('textarea[name="message"]').fill("I would like to discuss a logistics workflow.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-form-status]")).toContainText("Your information was not sent or stored");
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();
  await expect(page.locator("[data-handoff-summary]")).toContainText("Direction: Hermes Logistics");
  await expect(page.locator("[data-handoff-summary]")).toContainText("Phone: +1 (312) 555-0182");
  await expect(page.locator("[data-handoff-route-link]")).toHaveAttribute("href", "tel:+12623023626");
  await expect(page.locator(".contact-direct-routes").getByRole("link", { name: "Call Logistics" })).toHaveAttribute("href", "tel:+12623023626");
  expect(posts).toEqual([]);
});

test("Load Board approves a standard car-hauling preview with zero external delivery", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !isApprovedAnalyticsRequest(request.url())) {
      writes.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/load-board/");
  await page.locator('select[name="submitter_type"]').selectOption("private_party");
  await page.locator('input[name="contact_name"]').fill("Test Customer");
  await page.locator('input[name="email"]').fill("customer@example.com");
  await page.locator('input[name="phone"]').fill("+1 (312) 555-0182");
  await page.locator('input[name="pickup_location"]').fill("Madison, WI");
  await page.locator('input[name="delivery_location"]').fill("Chicago, IL");
  await page.locator('input[name="ready_date"]').fill("2026-08-01");
  await page.locator('select[name="commodity_type"]').selectOption("passenger_vehicle");
  await page.locator('input[name="year_make_model"]').fill("2021 Toyota Camry");
  await page.locator('select[name="condition"]').selectOption("operable");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Review posted load" }).click();

  await expect(page.locator("[data-load-result]")).toBeVisible();
  await expect(page.locator("[data-load-decision]")).toHaveText("approved");
  await expect(page.locator("[data-load-routing]")).toContainText("Dispatch Assist dry-run queue");
  await expect(page.locator("[data-load-preview]")).toContainText("Sales tag: POSTED LOAD / CUSTOMER");
  await expect(page.locator("[data-load-preview]")).toContainText("no email, CRM write, load publication, or carrier notification was sent");
  await expect(page.locator("[data-load-email]")).toHaveAttribute("href", /subject=%5BHERMES%20SALES%5D%20%5BPOSTED%20LOAD%5D/);
  expect(writes).toEqual([]);
});

test("Load Board routes each role to the right workspace and keeps demo loads non-operational", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !isApprovedAnalyticsRequest(request.url())) {
      writes.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/load-board/?role=carrier#available-loads");
  await expect(page.getByRole("link", { name: /Carrier or owner-operator/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "See the lane before you spend time on it." })).toBeVisible();
  await expect(page.locator(".available-load-card")).toHaveCount(4);
  await expect(page.getByText("Demo data", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "Request dispatch" }).first().click();
  await expect(page.locator("[data-demo-load-title]")).toContainText("HLB-1042");
  await expect(page.locator("[data-demo-load-copy]")).toContainText("sales request");
  await expect(page.locator('input[name="interested_load"]')).toHaveValue("HLB-1042");

  await page.goto("/load-board/?role=broker#post-load");
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("broker");
  await expect(page.locator("#post-load")).toBeVisible();
  expect(writes).toEqual([]);
});

test("Load Board prepares a carrier vehicle for dispatcher review with zero external delivery", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !isApprovedAnalyticsRequest(request.url())) {
      writes.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/load-board/");
  const vehicleForm = page.locator("[data-vehicle-form]");
  await vehicleForm.locator('select[name="carrier_role"]').selectOption("owner_operator");
  await vehicleForm.locator('input[name="carrier_company_name"]').fill("Test Carrier LLC");
  await vehicleForm.locator('input[name="carrier_contact_name"]').fill("Test Driver");
  await vehicleForm.locator('input[name="authority_number"]').fill("MC 123456");
  await vehicleForm.locator('select[name="equipment_class"]').selectOption("car_hauler");
  await vehicleForm.locator('input[name="carrier_email"]').fill("driver@example.com");
  await vehicleForm.locator('input[name="carrier_phone"]').fill("+1 (312) 555-0182");
  await vehicleForm.locator('input[name="capacity_units"]').fill("3");
  await vehicleForm.locator('input[name="available_from"]').fill("2026-08-03");
  await vehicleForm.locator('input[name="origin_location"]').fill("Chicago, IL");
  await vehicleForm.locator('input[name="origin_radius"]').fill("150");
  await vehicleForm.locator('input[name="anywhere"]').check();
  await vehicleForm.locator('input[name="carrier_consent"]').check();
  await vehicleForm.getByRole("button", { name: "Review access request" }).click();

  await expect(page.locator("[data-vehicle-result]")).toBeVisible();
  await expect(page.locator("[data-vehicle-decision]")).toHaveText("dispatcher review");
  await expect(page.locator("[data-vehicle-state]")).toContainText("submitted for review");
  await expect(page.locator("[data-vehicle-actions]")).toContainText("Dispatcher decides");
  await expect(page.locator("[data-vehicle-preview]")).toContainText("Sales tag: LOAD BOARD ACCESS / CARRIER");
  await expect(page.locator("[data-vehicle-preview]")).toContainText("no email, account, call, CRM write, or dispatcher assignment was created");
  await expect(page.locator("[data-vehicle-email]")).toHaveAttribute("href", /subject=%5BHERMES%20SALES%5D%20%5BLOAD%20BOARD%20ACCESS%5D/);
  expect(writes).toEqual([]);
});

test("Load Board quarantines an inoperable tractor for equipment review", async ({ page }) => {
  await page.goto("/load-board/");
  await page.locator('select[name="submitter_type"]').selectOption("dealer");
  await page.locator('input[name="company_name"]').fill("Test Dealer");
  await page.locator('input[name="contact_name"]').fill("Dealer Contact");
  await page.locator('input[name="email"]').fill("dealer@example.com");
  await page.locator('input[name="phone"]').fill("+1 (312) 555-0182");
  await page.locator('input[name="pickup_location"]').fill("Green Bay, WI");
  await page.locator('input[name="delivery_location"]').fill("Milwaukee, WI");
  await page.locator('input[name="ready_date"]').fill("2026-08-02");
  await page.locator('select[name="commodity_type"]').selectOption("tractor");
  await page.locator('input[name="year_make_model"]').fill("2019 Freightliner Cascadia");
  await page.locator('select[name="condition"]').selectOption("inoperable_non_rolling");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Review posted load" }).click();

  await expect(page.locator("[data-load-decision]")).toHaveText("quarantine");
  await expect(page.locator("[data-load-actions]")).toContainText("dimensions");
  await expect(page.locator("[data-load-routing]")).toContainText("Dealer and shipper sales queue");
});

test("logistics page routes each visitor type to a dedicated path", async ({ page }) => {
  await page.goto("/paths/logistics/");
  const hub = page.locator("#choose-your-path");
  await expect(hub.getByRole("link", { name: /Shipper or dealer/ })).toHaveAttribute("href", "/logistics/shipper-dealer/");
  await expect(hub.getByRole("link", { name: /Broker/ })).toHaveAttribute("href", "/logistics/broker/");
  await expect(hub.getByRole("link", { name: /Carrier or owner-operator/ })).toHaveAttribute("href", "/logistics/carrier/");
  await expect(hub.getByRole("link", { name: /Open an agency/ })).toHaveAttribute("href", "/logistics/agency/");
  await expect(hub.getByRole("link", { name: /Work with us/ })).toHaveAttribute("href", "/logistics/careers/");
  await expect(hub.getByRole("link", { name: /Training/ })).toHaveAttribute("href", "/paths/academy/");
  await expect(hub.getByRole("link", { name: /Post a load/ })).toHaveAttribute("href", "/load-board/?role=shipper#post-load");
});

test("logistics audience pages open role-specific Load Board workspaces", async ({ page }) => {
  await page.goto("/logistics/shipper-dealer/");
  await expect(page.getByRole("link", { name: "Post a load" })).toHaveAttribute("href", "/load-board/?role=shipper#post-load");

  await page.goto("/logistics/broker/");
  await expect(page.getByRole("link", { name: "Open broker Load Board" })).toHaveAttribute("href", "/load-board/?role=broker#post-load");

  await page.goto("/logistics/carrier/");
  await expect(page.getByRole("link", { name: "Open Load Board" })).toHaveAttribute("href", "/load-board/?role=carrier#available-loads");
});

test("agency and career applications create local previews without sending", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !isApprovedAnalyticsRequest(request.url())) {
      writes.push(`${request.method()} ${request.url()}`);
    }
  });
  await page.goto("/logistics/apply/?for=agency");
  await expect(page.locator('select[name="application_type"]')).toHaveValue("agency");
  await page.locator('input[name="name"]').fill("Agency Candidate");
  await page.locator('input[name="email"]').fill("agency@example.com");
  await page.locator('input[name="location"]').fill("Milwaukee, WI");
  await page.locator('input[name="languages"]').fill("English, Russian");
  await page.locator('input[name="interest"]').fill("Remote car-hauling agency");
  await page.locator('textarea[name="experience"]').fill("Five years in logistics operations with documented team leadership results.");
  await page.locator('textarea[name="availability"]').fill("Available full time in Central Time.");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Preview application" }).click();
  await expect(page.locator("[data-application-result]")).toBeVisible();
  await expect(page.locator("[data-application-preview]")).toContainText("Application type: agency");
  await expect(page.locator("[data-application-preview]")).toContainText("no application was sent or stored");
  expect(writes).toEqual([]);
});

test("preview handoff exposes the approved email route for marketing", async ({ page }) => {
  await page.goto("/paths/marketing/#contact");
  await page.locator('input[name="name"]').fill("Marketing Lead");
  await page.locator('input[name="email"]').fill("lead@example.com");
  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await expect(page.locator('input[name="phone"]')).toHaveCount(0);
  await page.locator('textarea[name="message"]').fill("We need a clearer growth system for our service business.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-contact-handoff]")).toBeVisible();
  await expect(page.locator("[data-handoff-route-link]")).toHaveAttribute(
    "href",
    "mailto:officeus@hermeslogisticsus.com?subject=ProgressoPro%20Marketing%20Inquiry",
  );
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
});

test("copy request places sanitized plain text on the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Clipboard User");
  await page.locator('input[name="email"]').fill("copy@example.com");
  await page.locator('select[name="path"]').selectOption("IT Development");
  await page.locator('textarea[name="tech_system_or_workflow_needed"]').fill("A CRM workflow for client follow-up.");
  await page.locator('textarea[name="tech_integrations_needed"]').fill("<script>alert(1)</script> Zapier + webhooks.");
  await page.locator('textarea[name="message"]').fill("I need a CRM workflow for client follow-up.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await page.locator("[data-copy-request]").click();
  await expect(page.locator("[data-copy-status]")).toContainText("Request copied");

  const clipboardText = await page.evaluate(async () => navigator.clipboard.readText());
  expect(clipboardText).toContain("Hermes Contact Request (Preview)");
  expect(clipboardText).toContain("Direction: IT Development");
  expect(clipboardText).toContain("Name: Clipboard User");
  expect(clipboardText).toContain("I need a CRM workflow for client follow-up.");
  expect(clipboardText).toContain("System/workflow needed: A CRM workflow for client follow-up.");
  expect(clipboardText).not.toContain("<");
  expect(clipboardText).not.toMatch(/<script/i);
});

test("clipboard failure shows recoverable manual-copy guidance", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
  });

  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Manual Copy User");
  await page.locator('input[name="email"]').fill("manual@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Business Academy");
  await expect(page.locator('input[name="academy_preferred_language"]')).toBeVisible();
  await expect(page.locator('input[name="phone"]')).toHaveCount(0);
  await page.locator('textarea[name="message"]').fill("I want to explore the logistics program.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();
  await page.locator("[data-copy-request]").click();

  await expect(page.locator("[data-copy-status]")).toContainText("Copy did not work");
  await expect(page.locator("[data-handoff-summary]")).toContainText("Direction: Hermes Business Academy");
});

test("changing direction clears a stale preview handoff", async ({ page }) => {
  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Stale Handoff User");
  await page.locator('input[name="email"]').fill("stale@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Logistics");
  await page.locator('input[name="phone"]').fill("+1 (312) 555-0182");
  await page.locator('textarea[name="message"]').fill("I would like to discuss carrier onboarding.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();

  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await expect(page.locator("[data-contact-handoff]")).toBeHidden();
  await expect(page.locator('input[name="phone"]')).toHaveCount(0);
});

test("each non-logistics direction exposes a working direct contact route", async ({ page }) => {
  const cases = [
    { slug: "marketing", link: "Email Marketing", subject: "ProgressoPro%20Marketing%20Inquiry" },
    { slug: "academy", link: "Email the Academy", subject: "Hermes%20Business%20Academy%20Inquiry" },
    { slug: "technology", link: "Email IT Development", subject: "IT%20Development%20Inquiry" },
  ];

  for (const item of cases) {
    await page.goto(`/paths/${item.slug}/#contact`);
    await expect(page.getByRole("link", { name: item.link })).toHaveAttribute(
      "href",
      `mailto:officeus@hermeslogisticsus.com?subject=${item.subject}`,
    );
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.locator('input[type="tel"]')).toHaveCount(0);
  }
});

test("public logistics contacts use the approved department routing", async ({ page }) => {
  await page.goto("/contacts/");
  const contacts = page.locator(".contact-block-list");

  await expect(contacts.getByRole("link", { name: "+1 (262) 302-3626" })).toHaveAttribute("href", "tel:+12623023626");
  await expect(contacts.getByText("Logistics Sales Department", { exact: true })).toBeVisible();
  await expect(contacts.getByRole("link", { name: "freight_301@hermeslogisticsus.com" })).toHaveAttribute("href", "mailto:freight_301@hermeslogisticsus.com");
  await expect(contacts.getByText("Email-only international coordination", { exact: true })).toBeVisible();
  await expect(contacts.getByText("Milan · Berlin · Paris · Miami · California · New York · England", { exact: true })).toBeVisible();
  const telephoneTargets = await page.locator('a[href^="tel:"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")))]);
  expect(telephoneTargets).toEqual(["tel:+12623023626"]);
  await expect(page.getByText("+1 (351) 777-5337", { exact: true })).toHaveCount(0);
  await expect(page.getByText("+1 (717) 696-6829", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Box Truck Department", { exact: true })).toHaveCount(0);
  await expect(page.getByText("General Inquiries", { exact: true })).toHaveCount(0);
});

test("marketing field group supports multiple platforms + 3/6/9/12 horizon and includes direction details in summary", async ({ page }, testInfo) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && !isApprovedAnalyticsRequest(request.url())) posts.push(request.url());
  });

  await page.goto("/paths/marketing/#contact");
  await page.locator('input[name="name"]').fill("Marketing Discovery");
  await page.locator('input[name="email"]').fill("lead@example.com");
  await page.locator('textarea[name="message"]').fill("We need a clearer growth system for our service business.");
  await page.locator('input[name="consent"]').check();

  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await page.locator('input[name="platforms"][value="SEO / Google Search"]').check();
  await page.locator('input[name="platforms"][value="Google Ads / Paid Search"]').check();
  await page.locator('select[name="planning_horizon"]').selectOption("6 months");
  await page.locator('input[name="primary_goal"]').fill("More qualified leads <script>alert(1)</script>");

  if (testInfo.project.name === "desktop") {
    await page.locator("[data-direction-fields]").screenshot({ path: "docs/screenshots/intake02-marketing-desktop.png" });
  }

  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-contact-handoff]")).toBeVisible();
  await expect(page.locator("[data-handoff-summary]")).toContainText("Platforms: SEO / Google Search, Google Ads / Paid Search");
  await expect(page.locator("[data-handoff-summary]")).toContainText("Planning horizon: 6 months");
  await expect(page.locator("[data-handoff-summary]")).not.toContainText("<");

  expect(posts).toEqual([]);
});

test("direction-specific input changes clear stale preview handoff", async ({ page }) => {
  await page.goto("/paths/logistics/#contact");
  await page.locator('input[name="name"]').fill("Logistics Discovery");
  await page.locator('input[name="email"]').fill("fleet@example.com");
  await page.locator('textarea[name="message"]').fill("We need dispatch + document coordination.");
  await page.locator('input[name="consent"]').check();

  await page.locator('input[name="phone"]').fill("+1 (312) 555-0182");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();

  await page.locator('input[name="phone"]').fill("+1 (555) 123-4567");
  await expect(page.locator("[data-contact-handoff]")).toBeHidden();
});

test("technology page offers concrete industry starting points", async ({ page }) => {
  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { name: "Fitness and wellness" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Beauty and salon" })).toBeVisible();
  await page.getByRole("link", { name: "Add Beauty and Salon Starter System to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("Beauty and Salon Starter System");
  await expect(page).toHaveURL(/#project-brief$/);
});

test("mobile menu supports keyboard close", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only behavior");
  await openRegularHome(page);
  const button = page.locator("[data-menu-button]");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
});

test("academy screen flow selects track and advances layers", async ({ page }) => {
  await page.goto("/paths/academy/");
  await page.getByRole("button", { name: /Choose a track/i }).click();
  const coo = page.getByRole("tab", { name: /COO \/ Operational Director/i });
  await coo.click();
  await expect(coo).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: /^Next$/i }).click();
  await expect(page.locator("#academy-screen-2").getByText(/Problem: The company runs on heroics/i)).toBeVisible();
  await page.getByRole("button", { name: /See the 6 layers/i }).click();
  await expect(page.getByText("Operating Career System")).toBeVisible();
  await expect(page.getByText("Executive", { exact: true }).first()).toBeVisible();
});

test("marketing growth flow supports click and keyboard navigation", async ({ page }) => {
  await page.goto("/paths/marketing/");
  const contentTab = page.getByRole("tab", { name: "02 Content" });
  await contentTab.click();
  await expect(contentTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "02 Content" })).toContainText("Message system and content direction");

  await contentTab.press("ArrowRight");
  const distributionTab = page.getByRole("tab", { name: "03 Distribution" });
  await expect(distributionTab).toBeFocused();
  await expect(distributionTab).toHaveAttribute("aria-selected", "true");
});

test("technology solution pre-fills the project brief", async ({ page }) => {
  await page.goto("/paths/technology/");
  await page.getByRole("link", { name: "Add AI Assistant and Workflow to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("AI Assistant and Workflow");
  await expect(page).toHaveURL(/#project-brief$/);
});

test("company operating system starts the full project brief", async ({ page }) => {
  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { name: "Hermes IT Development" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quality assurance" })).toBeVisible();
  await page.getByRole("link", { name: "Add Company Digital Operating System to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("Company Digital Operating System");
  await expect(page).toHaveURL(/#project-brief$/);
});

test("technology partnership presents four growth layers and evidence statuses", async ({ page }) => {
  await page.goto("/paths/technology/");
  const partnership = page.locator(".technology-partnership");
  await expect(partnership.getByRole("heading", { name: "One partner that can keep building as your company grows." })).toBeVisible();
  for (const heading of [
    "Build the products your next stage needs.",
    "Create demand around the new capability.",
    "Prepare people to operate the system.",
    "Support the physical operation behind growth.",
  ]) {
    await expect(partnership.getByRole("heading", { name: heading })).toBeVisible();
  }

  await expect(page.getByText("Live product", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Working prototype", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Build-ready capability", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Local preview", { exact: true })).toBeVisible();
  await expect(page.getByText("Implemented capability", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Carrier and dispatcher workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Multilingual website foundation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Controlled intake and review" })).toBeVisible();
  await expect(page.getByText("WhatsApp", { exact: true })).toBeVisible();
  await expect(page.getByText("Google Chat", { exact: true })).toBeVisible();
  await expect(page.getByText(/digital employee/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Open the working CRM preview" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("CRM and Operations Control");
});

test("marketing presents website, SEO, social media, and growth as connected service pillars", async ({ page }) => {
  await page.goto("/paths/marketing/");
  const pillars = page.locator("[data-marketing-service-pillars]");
  for (const heading of ["Website & Conversion", "SEO Optimization", "Social Media Marketing", "Growth & Sales System"]) {
    await expect(pillars.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(pillars.getByText(/not guaranteed/i)).toBeVisible();
  await expect(pillars.getByRole("link", { name: "Discuss this pillar" })).toHaveCount(4);
});

test("business directions expose the approved service areas and service schema", async ({ page }) => {
  await page.goto("/paths/logistics/");
  await expect(page).toHaveTitle(/Wisconsin/);
  await expect(page.getByText(/Wisconsin first/)).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

  for (const slug of ["marketing", "academy", "technology"]) {
    await page.goto(`/paths/${slug}/`);
    await expect(page).not.toHaveTitle(/Wisconsin/);
    await expect(page.getByText(/Email coordination only/)).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  }
});

test("AI assistant roles show setup time and pre-fill the brief", async ({ page }) => {
  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { name: "Operations AI Assistant", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "HR and Recruiting AI Assistant" })).toBeVisible();
  await expect(page.locator(".digital-workforce").getByText("4-8 weeks", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Add AI Assistant Program to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("AI Assistant Program");
});

test("IT project brief turns unstructured ideas into an email-ready summary", async ({ page }) => {
  await page.goto("/paths/technology/#project-brief");
  const brief = page.locator("[data-it-project-brief]");
  await expect(brief.locator('input[type="tel"]')).toHaveCount(0);

  await brief.locator('select[name="company_stage"]').selectOption({ label: "Small company ready to grow" });
  await brief.locator('input[name="industry"]').fill("Professional services");
  await brief.locator('textarea[name="business_goal"]').fill("Increase qualified sales while reducing manual administrative work.");
  await brief.locator('textarea[name="project_1"]').fill("A corporate website that qualifies customer requests.");
  await brief.locator('textarea[name="project_2"]').fill("A CRM with a clear sales pipeline.");
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('input[name="example_1"]').fill("https://example.com");
  await brief.locator('textarea[name="example_1_detail"]').fill("The service selection is simple and clear.");
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('select[name="budget_mode"]').selectOption("monthly");
  await brief.locator('input[name="budget_amount"]').fill("USD 2,500 per month");
  await brief.locator('select[name="investment_horizon"]').selectOption({ label: "6 months" });
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('input[name="company_name"]').fill("Example Services");
  await brief.locator('input[name="contact_name"]').fill("Alex Morgan");
  await brief.locator('input[name="contact_role"]').fill("Owner");
  await brief.locator('input[name="contact_email"]').fill("alex@example.com");
  await brief.locator('input[name="country"]').fill("United States");
  await brief.locator('input[name="region_city"]').fill("Milwaukee, Wisconsin");
  await brief.locator('textarea[name="public_presence"]').fill("https://example.com");
  await brief.locator('input[name="brief_consent"]').check();
  await brief.getByRole("button", { name: "Continue" }).click();

  await expect(brief.locator("[data-brief-summary]")).toContainText("Example Services");
  await expect(brief.locator("[data-brief-summary]")).toContainText("USD 2,500 per month");
  await expect(brief.locator("[data-brief-summary]")).toContainText("A CRM with a clear sales pipeline.");
  await expect(brief.locator("[data-brief-email]")).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus\.com\?subject=/);
});

test("IT pages publish no fixed prices", async ({ page }) => {
  for (const route of ["/paths/technology/", "/case/it-development/"]) {
    await page.goto(route);
    const publicCopy = await page.locator("body").innerText();
    expect(publicCopy).not.toMatch(/\$\s?\d[\d,.]*\s*(?:\/|per\s+(?:month|project|hour)|monthly|one-time)/i);
  }
});
