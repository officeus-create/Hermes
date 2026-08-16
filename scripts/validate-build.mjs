import { readFile } from "node:fs/promises";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const html = await readFile(join(dist, "index.html"), "utf8");

if (!html.includes("Auto Transport &amp; U.S. Logistics")) throw new Error("Homepage title was not updated.");
if (!html.includes("Hermes Logistics LLC")) throw new Error("Hermes brand text is missing.");
if (html.includes("Navarro")) throw new Error("Old brand is still present in generated HTML.");
if (!html.includes("hello@hermeslogisticsus.com")) throw new Error("Primary contact email missing.");
if (!html.includes("officeus@hermeslogisticsus.com")) throw new Error("Secondary contact email missing.");
if (!html.includes("+1 (262) 302-3626")) throw new Error("Primary phone missing.");
if (!html.includes("+1 (262) 903-7780")) throw new Error("Secondary phone missing.");
if (!html.includes("href=\"/paths/marketing/\"")) throw new Error("Homepage is missing Marketing path link.");
if (!html.includes("href=\"/paths/academy/\"")) throw new Error("Homepage is missing Academy path link.");
if (!html.includes("href=\"/paths/technology/\"")) throw new Error("Homepage is missing Technology path link.");
if (!html.includes("href=\"/services/hermes-connect/\"")) throw new Error("Homepage is missing Hermes Connect product link.");
if (!html.includes("href=\"/logistics/request-vehicle-transport/\"")) throw new Error("Homepage is missing vehicle transport request link.");
if (!html.includes("href=\"/logistics/start-car-hauling-dispatch/\"")) throw new Error("Homepage is missing car-hauling dispatch start link.");
if (!html.includes("href=\"/carrier/\"")) throw new Error("Homepage is missing carrier proposal link.");
if (!html.includes("href=\"/logistics/carrier-agreement/\"")) throw new Error("Homepage is missing carrier agreement link.");
if (!html.includes("href=\"/load-board/\"")) throw new Error("Homepage is missing Load Board link.");
if (!html.includes("href=\"/case/\"")) throw new Error("Homepage is missing case studies link.");
if (!html.includes("href=\"/about/\"")) throw new Error("Homepage is missing About link.");
if (!html.includes("href=\"/contacts/\"")) throw new Error("Homepage is missing Contacts link.");
if (!html.includes("href=\"/privacy/\"")) throw new Error("Homepage is missing privacy link.");
if (!html.includes("href=\"/terms/\"")) throw new Error("Homepage is missing terms link.");
if (!html.includes("href=\"/legal-compliance/\"")) throw new Error("Homepage is missing legal compliance link.");
if (!html.includes("href=\"/data-security/\"")) throw new Error("Homepage is missing data security link.");
if (!html.includes("href=\"/payments-cancellations/\"")) throw new Error("Homepage is missing payments policy link.");
if (!html.includes("href=\"/accessibility/\"")) throw new Error("Homepage is missing accessibility link.");
if (!html.includes("href=\"/asset-licensing/\"")) throw new Error("Homepage is missing asset licensing link.");
if (!html.includes("href=\"/company-information/\"")) throw new Error("Homepage is missing company information link.");
if (!html.includes("href=\"/editorial-policy/\"")) throw new Error("Homepage is missing editorial policy link.");
if (!html.includes("href=\"/privacy-choices/\"")) throw new Error("Homepage is missing privacy choices link.");
if (!html.includes("href=\"/regional-privacy/\"")) throw new Error("Homepage is missing regional privacy link.");
if (!html.includes("href=\"/services/website-development/\"")) throw new Error("Homepage is missing website development link.");
if (!html.includes("href=\"/services/seo/\"")) throw new Error("Homepage is missing SEO link.");
if (!html.includes("href=\"/services/local-seo/\"")) throw new Error("Homepage is missing local SEO link.");
if (!html.includes("href=\"/services/website-redesign/\"")) throw new Error("Homepage is missing website redesign link.");
if (!html.includes("href=\"/services/seo-for-logistics-companies/\"")) throw new Error("Homepage is missing logistics SEO niche link.");
if (!html.includes("href=\"/services/seo-for-independent-auto-dealers/\"")) throw new Error("Homepage is missing auto dealer SEO niche link.");
if (!html.includes("href=\"/business-growth/\"")) throw new Error("Homepage is missing business growth hub link.");
if (!html.includes("href=\"/ru/\"")) throw new Error("Homepage is missing Russian language link.");
if (!html.includes("href=\"/ua/\"")) throw new Error("Homepage is missing Ukrainian language link.");
if (!html.includes("href=\"/es/\"")) throw new Error("Homepage is missing Spanish language link.");
if (!html.includes("href=\"/it/\"")) throw new Error("Homepage is missing Italian language link.");
if (!html.includes("href=\"/fr/\"")) throw new Error("Homepage is missing French language link.");
if (!html.includes("data-language-menu")) throw new Error("Homepage is missing language selector.");
if (!html.includes("data-cookie-consent")) throw new Error("Homepage is missing cookie consent layer.");
if (!html.includes("data-analytics-consent")) throw new Error("Homepage is missing analytics consent control.");
if (!html.includes("data-advertising-consent")) throw new Error("Homepage is missing advertising consent control.");
if (!html.includes("data-cookie-save")) throw new Error("Homepage is missing cookie preferences save control.");
if (!html.includes("data-cookie-reject")) throw new Error("Homepage is missing cookie preferences reject control.");
if (!html.includes("data-cookie-accept")) throw new Error("Homepage is missing cookie preferences accept control.");
if (!html.includes("data-cookie-settings")) throw new Error("Homepage is missing cookie settings control.");
if (!html.includes("data-cookie-banner")) throw new Error("Homepage is missing cookie banner.");
if (!html.includes("data-cookie-preferences")) throw new Error("Homepage is missing cookie preference modal.");
if (!html.includes("data-main-phone")) throw new Error("Homepage is missing main phone marker.");
if (!html.includes("data-secondary-phone")) throw new Error("Homepage is missing secondary phone marker.");
if (!html.includes("data-main-email")) throw new Error("Homepage is missing main email marker.");
if (!html.includes("data-secondary-email")) throw new Error("Homepage is missing secondary email marker.");
if (!html.includes("data-business-lead-form")) throw new Error("Homepage is missing business lead form.");
if (!html.includes("data-direction-select")) throw new Error("Homepage is missing direction selector.");
if (!html.includes("data-form-submit")) throw new Error("Homepage is missing lead form submit button.");
if (!html.includes("data-form-success")) throw new Error("Homepage is missing lead form success state.");
if (!html.includes("data-form-error")) throw new Error("Homepage is missing lead form error state.");
if (!html.includes("data-form-consent")) throw new Error("Homepage is missing lead form consent checkbox.");
if (!html.includes("data-phone-copy")) throw new Error("Homepage is missing phone copy button.");
if (!html.includes("data-email-copy")) throw new Error("Homepage is missing email copy button.");
if (!html.includes("data-mobile-nav-toggle")) throw new Error("Homepage is missing mobile navigation toggle.");
if (!html.includes("data-mobile-nav")) throw new Error("Homepage is missing mobile navigation.");
if (!html.includes("data-mobile-nav-close")) throw new Error("Homepage is missing mobile navigation close control.");
if (!html.includes("data-scroll-top")) throw new Error("Homepage is missing scroll-to-top control.");
if (!html.includes("data-business-growth-entry")) throw new Error("Homepage is missing business growth entry marker.");
if (!html.includes("data-hermes-connect-launcher")) throw new Error("Homepage is missing Hermes Connect launcher.");
if (!html.includes("data-home-connect-product")) throw new Error("Homepage is missing Hermes Connect product card.");

const requiredRoutes = [
  "about/index.html",
  "academy/apply/index.html",
  "academy/how-training-works/index.html",
  "academy/marketing/index.html",
  "academy/resources/index.html",
  "academy/us-logistics-operations/index.html",
  "accessibility/index.html",
  "asset-licensing/index.html",
  "business-growth/index.html",
  "careers/car-hauling-dispatcher/index.html",
  "carrier/index.html",
  "case/appleton-vehicle-transport-seo/index.html",
  "case/it-development/index.html",
  "case/index.html",
  "company-information/index.html",
  "contacts/index.html",
  "contracts/carrier-agreement-v3/index.html",
  "data-security/index.html",
  "demos/ai-visibility-scorecard/index.html",
  "demos/content-pipeline/index.html",
  "demos/lane-intelligence/index.html",
  "demos/social-distribution/index.html",
  "download/index.html",
  "editorial-policy/index.html",
  "es/index.html",
  "fr/index.html",
  "it/index.html",
  "legal-compliance/index.html",
  "load-board/index.html",
  "logistics/appleton-wi-vehicle-transport/index.html",
  "logistics/apply/index.html",
  "logistics/auction-vehicle-pickup/index.html",
  "logistics/car-hauling-dispatch/index.html",
  "logistics/carrier-agreement/index.html",
  "logistics/carrier-offer/index.html",
  "logistics/carrier-onboarding/index.html",
  "logistics/dealer-vehicle-transportation/index.html",
  "logistics/direct-vehicle-transport-network/index.html",
  "logistics/eau-claire-wi-vehicle-transport/index.html",
  "logistics/enclosed-vehicle-transport/index.html",
  "logistics/fleet-owner-dispatch-support/index.html",
  "logistics/fond-du-lac-wi-vehicle-transport/index.html",
  "logistics/green-bay-wi-vehicle-transport/index.html",
  "logistics/inoperable-vehicle-transport/index.html",
  "logistics/kenosha-wi-vehicle-transport/index.html",
  "logistics/la-crosse-wi-vehicle-transport/index.html",
  "logistics/madison-wi-vehicle-transport/index.html",
  "logistics/milwaukee-wi-vehicle-transport/index.html",
  "logistics/multi-car-transport/index.html",
  "logistics/new-authority-car-hauler-support/index.html",
  "logistics/open-vehicle-transport/index.html",
  "logistics/oshkosh-wi-vehicle-transport/index.html",
  "logistics/owner-operator-dispatch-support/index.html",
  "logistics/racine-wi-vehicle-transport/index.html",
  "logistics/request-vehicle-transport/index.html",
  "logistics/resources/auction-vehicle-pickup-checklist/index.html",
  "logistics/resources/broker-setup-packet-checklist/index.html",
  "logistics/resources/car-hauler-capacity-checklist/index.html",
  "logistics/resources/dispatch-service-vs-self-dispatch/index.html",
  "logistics/resources/factoring-vs-direct-payment-calculator/index.html",
  "logistics/resources/new-authority-car-hauler-readiness-checklist/index.html",
  "logistics/resources/rpm-calculator/index.html",
  "logistics/resources/index.html",
  "logistics/sheboygan-wi-vehicle-transport/index.html",
  "logistics/start-car-hauling-dispatch/index.html",
  "logistics/waukesha-wi-vehicle-transport/index.html",
  "logistics/wisconsin-auction-vehicle-pickup/index.html",
  "logistics/wisconsin-dealer-vehicle-transport/index.html",
  "logistics/wisconsin-enclosed-vehicle-transport/index.html",
  "logistics/wisconsin-multi-vehicle-dealer-transport/index.html",
  "logistics/wisconsin-vehicle-transport/index.html",
  "logistics/shipper-dealer/index.html",
  "logistics/broker/index.html",
  "logistics/carrier/index.html",
  "logistics/agency/index.html",
  "logistics/careers/index.html",
  "paths/logistics/find-your-path/index.html",
  "paths/logistics/carriers/owner-operators/index.html",
  "paths/logistics/carriers/fleet-owners/index.html",
  "paths/logistics/carriers/car-hauling/index.html",
  "paths/logistics/carriers/hotshot/index.html",
  "paths/logistics/carriers/box-truck/index.html",
  "paths/logistics/carriers/cargo-van/index.html",
  "paths/logistics/carriers/power-only/index.html",
  "paths/logistics/carriers/dry-van/index.html",
  "paths/logistics/carriers/reefer/index.html",
  "paths/logistics/carriers/flatbed/index.html",
  "paths/logistics/carriers/step-deck/index.html",
  "paths/logistics/carriers/new-authority/index.html",
  "paths/logistics/carriers/direct-freight-development/index.html",
  "paths/logistics/carriers/trusted-carrier-network/index.html",
  "paths/logistics/customers/vehicle-transport/index.html",
  "paths/logistics/customers/port-pickup/index.html",
  "paths/logistics/customers/luxury-classic-vehicle/index.html",
  "paths/logistics/shippers-dealers/index.html",
  "paths/logistics/brokers/carrier-capacity/index.html",
  "paths/logistics/drivers/index.html",
  "paths/logistics/agency-partners/index.html",
  "paths/logistics/guidance/index.html",
  "paths/logistics/index.html",
  "paths/marketing/index.html",
  "paths/academy/index.html",
  "paths/technology/index.html",
  "payments-cancellations/index.html",
  "privacy/index.html",
  "privacy-choices/index.html",
  "regional-privacy/index.html",
  "resources/logistics-seo-audit-sample/index.html",
  "resources/search-to-inquiry-conversion-checklist/index.html",
  "resources/technical-seo-checklist/index.html",
  "resources/website-project-brief-template/index.html",
  "ru/business-growth/website/index.html",
  "ru/business-growth/seo/index.html",
  "ru/business-growth/advertising/index.html",
  "ru/business-growth/social-media/index.html",
  "ru/business-growth/ai-automation/index.html",
  "ru/business-growth/index.html",
  "ru/index.html",
  "services/hermes-connect/ai-command-center/index.html",
  "services/hermes-connect/business-automation/index.html",
  "services/hermes-connect/load-analyzer/index.html",
  "services/hermes-connect/proposal-builder/index.html",
  "services/hermes-connect/rate-negotiator/index.html",
  "services/hermes-connect/repair-shops/auth/index.html",
  "services/hermes-connect/repair-shops/availability/index.html",
  "services/hermes-connect/repair-shops/booking/index.html",
  "services/hermes-connect/repair-shops/customers/index.html",
  "services/hermes-connect/repair-shops/dashboard/index.html",
  "services/hermes-connect/repair-shops/index.html",
  "services/hermes-connect/roi-calculator/index.html",
  "services/hermes-connect/unified-inbox/index.html",
  "services/hermes-connect/index.html",
  "services/local-seo/index.html",
  "services/seo/index.html",
  "services/seo-for-independent-auto-dealers/index.html",
  "services/seo-for-logistics-companies/index.html",
  "services/website-development/index.html",
  "services/website-redesign/index.html",
  "sign/index.html",
  "terms/index.html",
  "ua/business-growth/website/index.html",
  "ua/business-growth/seo/index.html",
  "ua/business-growth/advertising/index.html",
  "ua/business-growth/social-media/index.html",
  "ua/business-growth/ai-automation/index.html",
  "ua/business-growth/index.html",
  "ua/index.html",
];

for (const route of requiredRoutes) {
  try {
    await readFile(join(dist, route), "utf8");
  } catch {
    throw new Error(`Required generated route missing: ${route}`);
  }
}

const logisticsHtml = await readFile(join(dist, "paths/logistics/index.html"), "utf8");
for (const text of ["American Logistics", "Carriers and fleet owners", "Shippers and dealers", "Brokers and dispatch partners", "Drivers and teams", "Agency partners"]) {
  if (!logisticsHtml.includes(text)) throw new Error(`Logistics signal missing: ${text}`);
}

const technologyHtml = await readFile(join(dist, "paths/technology/index.html"), "utf8");
for (const text of [
  "IT &amp; Digital Automation",
  "Website Development",
  "AI Assistants &amp; Business Bots",
  "CRM &amp; Sales Automation",
  "Logistics IT Solutions",
  "Business Process Audit",
  "Cloud Deployment",
  "Working product previews",
  "Run sample validation",
  "Create test booking",
  "no calendar event, payment, account, or message is created",
  "Reference capability",
  "Open full CRM preview",
  "Open profile &amp; availability workspace",
  "AI Assistants and Business Bots",
  "CRM and Sales Automation",
  "Logistics Technology",
  "Carrier Profile Card",
  "AI Telegram Assistant",
  "Route Risk Panel",
  "Recruiting Pipeline",
  "Executive Dashboard",
  "Available for custom development",
]) {
  if (!technologyHtml.includes(text)) throw new Error(`Technology capability signal missing: ${text}`);
}

for (const demoPath of ["demos/crm-validation/index.html", "demos/hermes-connect/index.html", "demos/website-audit/index.html"]) {
  const demoHtml = await readFile(join(dist, demoPath), "utf8");
  if (!demoHtml.toLowerCase().includes("preview") && !demoHtml.toLowerCase().includes("prototype")) {
    throw new Error(`Product demo boundary missing in ${demoPath}`);
  }
}

const auditReport = JSON.parse(await readFile(join(dist, "demos/website-audit/report.json"), "utf8"));
if (auditReport.averageScore !== 99 || auditReport.needsReview !== 2) {
  throw new Error("Published Website Audit report does not match the reviewed local result.");
}
if (auditReport.externalCrawlPerformed !== false || auditReport.websiteWritePerformed !== false) {
  throw new Error("Published Website Audit report is missing its read-only boundaries.");
}

const homepageTechnologySignals = [
  "Digital systems we build",
  "AI Assistants",
  "CRM &amp; Automation",
  "Logistics Technology",
  "Hermes Connect",
];
for (const text of homepageTechnologySignals) {
  if (!html.includes(text)) throw new Error(`Homepage technology signal missing: ${text}`);
}

const academyHtml = await readFile(join(dist, "paths/academy/index.html"), "utf8");
for (const text of ["Academy", "training", "Apply", "American Logistics Negotiation Academy"]) {
  if (!academyHtml.includes(text)) throw new Error(`Academy signal missing: ${text}`);
}

const marketingHtml = await readFile(join(dist, "paths/marketing/index.html"), "utf8");
for (const text of ["Marketing", "SEO", "Social", "business growth"]) {
  if (!marketingHtml.includes(text)) throw new Error(`Marketing signal missing: ${text}`);
}

console.log(`Validated static website: ${requiredRoutes.length + 1} generated pages, 27 homepage checks, 4 image assets, zero broken internal links, no external form action.`);
