import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

test("car hauling dispatch owner stays separate from load-board search intent", () => {
  const source = read("src/pages/logistics/car-hauling-dispatch/index.astro");

  expect(source).toContain("Car Hauling Dispatch Services for Owner-Operators");
  expect(source).toContain('/logistics/start-car-hauling-dispatch/');
  expect(source).toContain('/load-board/?role=carrier&equipment=car_hauler#available-loads');
  expect(source).not.toContain("Where can I find car hauling loads?");
});

test("repair shop commercial funnel is attributable to the existing canonical owner", () => {
  const component = read("src/components/Seo4ConversionEnhancer.astro");
  const enhancer = read("public/seo4-conversion-enhancer.js");
  const auth = read("src/pages/services/hermes-connect/repair-shops/auth.astro");
  const repairOwner = read("src/pages/services/hermes-connect/repair-shops.astro");

  expect(repairOwner).toContain("<h1>Auto repair CRM, online booking & scheduling for independent shops.</h1>");
  expect(component).toContain('src="/seo4-conversion-enhancer.js"');
  expect(enhancer).toContain('cta_type: "repair_shop_registration"');
  expect(enhancer).toContain('cta_type: "repair_shop_plan"');
  expect(enhancer).toContain('service_group: "repair_shop_software"');
  expect(enhancer).toContain('event: "repair_shop_registration_start"');
  expect(enhancer).toContain('event: "repair_shop_registration_complete"');
  expect(enhancer).toContain('form.id !== "register-form"');
  expect(enhancer).toContain('window.addEventListener("hermes:repair-registration-complete"');
  expect(auth).toContain('if (res.ok && data.success) {\n        window.dispatchEvent(new Event("hermes:repair-registration-complete"));\n        await checkSession();');
  const repairCompletionStart = enhancer.indexOf('window.addEventListener("hermes:repair-registration-complete"');
  const repairCompletionEnd = enhancer.indexOf("refreshLoadBoardDemoLabels();", repairCompletionStart);
  expect(repairCompletionStart).toBeGreaterThanOrEqual(0);
  expect(repairCompletionEnd).toBeGreaterThan(repairCompletionStart);
  expect(enhancer.slice(repairCompletionStart, repairCompletionEnd)).not.toContain("MutationObserver");
  expect(enhancer).not.toContain("repair_shop_registration_complete\",\n      email:");
  expect(enhancer).not.toContain("repair_shop_registration_complete\",\n      name:");
  expect(enhancer).not.toContain("repair_shop_registration_complete\",\n      password:");
});

test("commercial SEO events use the consent-created gtag transport", () => {
  const enhancer = read("public/seo4-conversion-enhancer.js");
  const consent = read("src/components/TrackingConsent.astro");

  expect(enhancer).toContain('window.gtag?.("event", event, parameters)');
  expect(enhancer).toContain("window.dataLayer.push(payload)");
  expect(consent).toContain('if (choice === "granted") loadAnalytics()');
  expect(consent).toContain('window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); }');
  expect(consent).toContain('dataset.analyticsTransport = "ga4"');
});
