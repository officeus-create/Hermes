import { chromium } from "@playwright/test";

const BASE = "https://hermeslogisticsus.com";
const REPAIR_ROOT = "/services/hermes-connect/repair-shops/";
const AUTH = `${REPAIR_ROOT}auth/`;
const DASHBOARD = `${REPAIR_ROOT}dashboard/`;
const BOOKING = `${REPAIR_ROOT}booking/`;
const EMAIL = "repair-booking-production-smoke@hermesconnect.app";
const CLIENT_EMAIL = "repair-p0-production-client@hermesconnect.app";
const RUN_ID = process.env.GITHUB_RUN_ID || `manual-${Date.now()}`;
const PASSWORD = `HermesP0-${RUN_ID}-${Date.now()}-A9!`;
const FEEDBACK = `Synthetic Repair Shop P0 current-main proof ${RUN_ID}; safe to delete after verification.`;
const SERVICE_NAMES = ["P0 Brake Inspection", "P0 Oil Service", "P0 Diagnostic Scan"];

console.log(`::add-mask::${PASSWORD}`);

function fail(message) {
  throw new Error(message);
}

async function responseJson(response, label, expectedStatus) {
  const status = response.status();
  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  if (status !== expectedStatus) fail(`${label} failed with HTTP ${status}`);
  return body;
}

async function browserApi(context, method, path, data, expectedStatus = 200) {
  const response = await context.request.fetch(`${BASE}${path}`, {
    method,
    data,
    headers: { "Content-Type": "application/json" },
  });
  return responseJson(response, `${method} ${path}`, expectedStatus);
}

async function publicApi(method, path, data, expectedStatus = 200) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  if (response.status !== expectedStatus) fail(`${method} ${path} failed with HTTP ${response.status}`);
  return body;
}

function chicagoDatePlus(days) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const date = new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day) + days));
  return date.toISOString().slice(0, 10);
}

async function requireCurrentMainDeployment() {
  const sha = process.env.GITHUB_SHA;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!sha || !repository) fail("GitHub current-main metadata unavailable");

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hermes-repair-p0-production-proof-v2",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const refResponse = await fetch(`https://api.github.com/repos/${repository}/git/ref/heads/main`, { headers });
  if (!refResponse.ok) fail(`Unable to read current main ref (${refResponse.status})`);
  const ref = await refResponse.json();
  if (ref?.object?.sha !== sha) fail(`Verifier SHA ${sha} is not current main ${ref?.object?.sha || "unknown"}`);

  const checksResponse = await fetch(`https://api.github.com/repos/${repository}/commits/${sha}/check-runs?per_page=100`, { headers });
  if (!checksResponse.ok) fail(`Unable to read current-main deployment checks (${checksResponse.status})`);
  const checks = await checksResponse.json();
  const pages = (checks.check_runs || [])
    .filter((check) => check.name === "Cloudflare Pages")
    .sort((a, b) => String(a.started_at || "").localeCompare(String(b.started_at || "")))
    .at(-1);
  if (!pages || pages.status !== "completed" || pages.conclusion !== "success") {
    fail("Current-main Cloudflare Pages deployment is not successful");
  }

  for (const url of [`${BASE}${REPAIR_ROOT}`, "https://connect.hermeslogisticsus.com/"]) {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) fail(`Production surface unavailable: ${url} (${response.status})`);
  }
}

async function cleanup() {
  const response = await fetch(`${BASE}/api/repair-shop/cleanup-booking-smoke`, { method: "POST" });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok || data.success !== true || Number(data.remaining || 0) !== 0) {
    fail(`Synthetic cleanup failed (${response.status})`);
  }
}

async function gotoOk(page, path) {
  const response = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  if (!response || response.status() !== 200) fail(`Unexpected HTTP status for ${path}: ${response?.status() ?? 0}`);
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (metrics.documentWidth > metrics.viewport + 1 || metrics.bodyWidth > metrics.viewport + 1) {
    fail(`${label} horizontal overflow: viewport=${metrics.viewport}, document=${metrics.documentWidth}, body=${metrics.bodyWidth}`);
  }
}

async function verifyDashboard(page, label) {
  if (new URL(page.url()).pathname !== DASHBOARD) await gotoOk(page, DASHBOARD);
  await page.waitForURL((url) => url.pathname === DASHBOARD, { timeout: 20_000 });
  await page.waitForFunction(
    (email) => document.querySelector("#owner-summary")?.textContent?.includes(email),
    EMAIL,
    { timeout: 20_000 },
  );
  const heading = (await page.locator(".workspace-header h1").textContent())?.trim();
  if (heading !== "Repair Shop workspace") fail(`${label} dashboard heading mismatch: ${JSON.stringify(heading)}`);
  await assertNoHorizontalOverflow(page, `${label} dashboard`);
}

async function registerDesktop(page) {
  await gotoOk(page, REPAIR_ROOT);
  await page.waitForSelector(".repair-live-hero h1", { state: "visible", timeout: 15_000 });
  await assertNoHorizontalOverflow(page, "desktop landing");
  await gotoOk(page, AUTH);
  await page.waitForSelector("#auth-forms.active", { state: "visible", timeout: 15_000 });
  await page.locator('[data-tab="register"]').click();
  await page.locator("#reg-name").fill("Hermes P0 Proof Owner");
  await page.locator("#reg-email").fill(EMAIL);
  await page.locator("#reg-password").fill(PASSWORD);
  await page.locator("#reg-password-confirm").fill(PASSWORD);
  const registerResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/register") && response.request().method() === "POST");
  await page.locator("#register-form button[type='submit']").click();
  const registered = await registerResponse;
  if (registered.status() !== 201) fail(`Desktop UI registration failed (${registered.status()})`);
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await verifyDashboard(page, "desktop");
}

async function loginMobile(page) {
  await gotoOk(page, REPAIR_ROOT);
  await page.waitForSelector(".repair-live-hero h1", { state: "visible", timeout: 15_000 });
  await assertNoHorizontalOverflow(page, "mobile-390 landing");
  await gotoOk(page, AUTH);
  await page.waitForSelector("#auth-forms.active", { state: "visible", timeout: 15_000 });
  await assertNoHorizontalOverflow(page, "mobile-390 auth");
  await page.locator("#login-email").fill(EMAIL);
  await page.locator("#login-password").fill(PASSWORD);
  const loginResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/login") && response.request().method() === "POST");
  await page.locator("#login-form button[type='submit']").click();
  const loggedIn = await loginResponse;
  if (loggedIn.status() !== 200) fail(`Mobile UI login failed (${loggedIn.status()})`);
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await verifyDashboard(page, "mobile-390");
}

await requireCurrentMainDeployment();
await cleanup();

const browser = await chromium.launch({ headless: true });
let passed = false;
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktop.newPage();
  await registerDesktop(desktopPage);

  const profile = await browserApi(desktop, "PUT", "/api/repair-shop/profile", {
    name: "Hermes P0 Proof Shop",
    phone: "+1 501 555 0199",
    address_line1: "100 P0 Proof Way",
    city: "Little Rock",
    state: "AR",
    postal_code: "72201",
    timezone: "America/Chicago",
  });
  const slug = profile?.shop?.slug;
  if (!slug) fail("Profile did not persist a public shop slug");

  const services = [];
  for (const [index, name] of SERVICE_NAMES.entries()) {
    const created = await browserApi(desktop, "POST", "/api/services", {
      name,
      duration_minutes: [45, 60, 30][index],
    }, 201);
    if (!created?.service?.id) fail(`Service ${index + 1} did not persist`);
    services.push(created.service);
  }

  await browserApi(desktop, "PUT", "/api/repair-shop/availability", {
    days: Array.from({ length: 7 }, (_, day) => ({
      day_of_week: day,
      is_open: true,
      start_time: "09:00",
      end_time: "17:00",
    })),
  });

  const publicShop = await publicApi("GET", `/api/public/repair-shop?slug=${encodeURIComponent(slug)}`);
  const publicIds = new Set((publicShop.services || []).map((service) => service.id));
  if (services.length !== 3 || services.some((service) => !publicIds.has(service.id))) {
    fail("Public shop readback did not expose all three persisted services");
  }

  await gotoOk(desktopPage, `${BOOKING}?shop=${encodeURIComponent(slug)}`);
  await desktopPage.waitForFunction(() => document.querySelectorAll("#service-select option").length >= 4, null, { timeout: 20_000 });
  const bookingServiceNames = await desktopPage.locator("#service-select option").allTextContents();
  for (const name of SERVICE_NAMES) {
    if (!bookingServiceNames.includes(name)) fail(`Public booking UI is missing service: ${name}`);
  }

  const date1 = chicagoDatePlus(1);
  const date2 = chicagoDatePlus(2);
  const vin = "1FTFW1E50MFA76543";

  const firstBooking = await publicApi("POST", "/api/public/repair-booking", {
    shop_slug: slug,
    service_id: services[0].id,
    appointment_date: date1,
    start_time: "10:00",
    client_name: "P0 Repeat Customer",
    client_email: CLIENT_EMAIL,
    client_phone: "+1 501 555 0188",
    vehicle_year: 2021,
    vehicle_make: "Ford",
    vehicle_model: "F-150",
    mileage: 84500,
    vin,
  }, 201);
  const firstId = firstBooking?.booking?.id;
  if (!firstId) fail("First public booking did not persist");

  let ownerBookings = await browserApi(desktop, "GET", "/api/repair-shop/bookings");
  const firstOwnerReadback = (ownerBookings.bookings || []).find((booking) => booking.id === firstId);
  if (!firstOwnerReadback || firstOwnerReadback.status !== "confirmed" || firstOwnerReadback.vehicle?.vin !== vin) {
    fail("Owner booking readback is missing confirmed booking/vehicle data");
  }

  await browserApi(desktop, "PATCH", `/api/repair-shop/bookings/${encodeURIComponent(firstId)}/status`, { status: "in_progress" });
  await browserApi(desktop, "PATCH", `/api/repair-shop/bookings/${encodeURIComponent(firstId)}/status`, { status: "completed" });

  ownerBookings = await browserApi(desktop, "GET", "/api/repair-shop/bookings");
  const completed = (ownerBookings.bookings || []).find((booking) => booking.id === firstId);
  if (!completed || completed.status !== "completed" || (completed.history || []).length < 3) {
    fail("Owner status/history processing did not persist through completed");
  }

  const secondBooking = await publicApi("POST", "/api/public/repair-booking", {
    shop_slug: slug,
    service_id: services[1].id,
    appointment_date: date2,
    start_time: "11:30",
    client_name: "P0 Repeat Customer",
    client_email: CLIENT_EMAIL,
    client_phone: "+1 501 555 0188",
    vehicle_year: 2021,
    vehicle_make: "Ford",
    vehicle_model: "F-150",
    mileage: 90250,
    vin,
  }, 201);
  const secondId = secondBooking?.booking?.id;
  if (!secondId) fail("Second public booking did not persist");

  const customers = await browserApi(desktop, "GET", "/api/repair-shop/customers");
  const customer = (customers.customers || []).find((item) => item.email === CLIENT_EMAIL);
  if (!customer) fail("Customer CRM did not aggregate the repeat customer");
  if (customer.total_bookings !== 2 || customer.completed_visits !== 1) fail("Customer CRM booking/completed counts mismatch");
  if (customer.next_appointment?.booking_id !== secondId || customer.next_appointment?.status !== "confirmed") fail("Customer CRM next appointment mismatch");
  if (customer.vehicles?.[0]?.mileage !== 90250 || customer.vehicles?.[0]?.vin !== vin) fail("Customer CRM vehicle readback mismatch");
  if (!customer.services?.includes(SERVICE_NAMES[0]) || !customer.services?.includes(SERVICE_NAMES[1])) fail("Customer CRM service history mismatch");

  const access = await browserApi(desktop, "GET", "/api/repair-shop/access");
  if (access?.access?.state !== "trialing" || access?.access?.plan_id !== "repair_shop_founding") {
    fail("Default Repair Shop access state mismatch");
  }

  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await loginMobile(mobilePage);

  await mobilePage.locator("#feedback-category").selectOption("mobile");
  await mobilePage.locator("#feedback-rating").selectOption("5");
  await mobilePage.locator("#feedback-message").fill(FEEDBACK);
  const feedbackResponse = mobilePage.waitForResponse((response) => response.url().endsWith("/api/repair-shop/feedback") && response.request().method() === "POST");
  await mobilePage.locator("#submit-feedback-btn").click();
  const feedbackCreated = await feedbackResponse;
  if (feedbackCreated.status() !== 201) fail(`Private feedback submission failed (${feedbackCreated.status()})`);
  await mobilePage.waitForFunction((message) => document.querySelector("#feedback-list")?.textContent?.includes(message), FEEDBACK, { timeout: 15_000 });

  const feedback = await browserApi(mobile, "GET", "/api/repair-shop/feedback");
  if (!(feedback.feedback || []).some((item) => item.message === FEEDBACK && item.rating === 5 && item.category === "mobile")) {
    fail("Private feedback API readback mismatch");
  }
  await assertNoHorizontalOverflow(mobilePage, "mobile-390 dashboard after feedback");
  await mobile.close();

  passed = true;
  console.log("REPAIR_P0_CURRENT_MAIN_THREE_SERVICES=PASS");
  console.log("REPAIR_P0_CURRENT_MAIN_BOOKING_STATUS_HISTORY=PASS");
  console.log("REPAIR_P0_CURRENT_MAIN_CUSTOMER_VEHICLE_CRM=PASS");
  console.log("REPAIR_P0_CURRENT_MAIN_DESKTOP_390_AUTH_DASHBOARD=PASS");
  console.log("REPAIR_P0_CURRENT_MAIN_PRIVATE_FEEDBACK=PASS");
} finally {
  await browser.close();
  await cleanup();
  console.log(`REPAIR_P0_CURRENT_MAIN_CLEANUP=${passed ? "PASS" : "PASS_AFTER_FAILURE"}`);
}

if (!passed) process.exitCode = 1;
