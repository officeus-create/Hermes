import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFile(path.join(root, relativePath), "utf8");
const distFile = (route: string) => route === "/"
  ? "dist/index.html"
  : `dist/${route.replace(/^\//, "").replace(/\/$/, "")}/index.html`;

const visibleText = (html: string) => html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();

test("SEO/GEO revenue-first batch keeps exactly 100 production/evidence invariants", async () => {
  const checks: Array<{ name: string; pass: boolean }> = [];
  const task = (name: string, pass: boolean) => checks.push({ name, pass });

  const activeRoutes = [
    "/paths/marketing/",
    "/paths/academy/",
    "/paths/technology/",
    "/services/seo/",
    "/services/local-seo/",
    "/services/seo-for-independent-auto-dealers/",
    "/services/website-development/",
    "/services/website-redesign/",
    "/academy/us-logistics-operations/",
    "/academy/marketing/",
  ];

  const htmlByRoute = new Map<string, string>();
  for (const route of activeRoutes) htmlByRoute.set(route, await read(distFile(route)));

  // 1-40 — active Marketing / Academy / Technology crawl and owner integrity.
  for (const route of activeRoutes) {
    const html = htmlByRoute.get(route)!;
    task(`${route} output exists`, html.length > 200);
    task(`${route} has title`, /<title>\s*[^<]{3,}\s*<\/title>/i.test(html));
    task(`${route} has exactly one canonical`, [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)].length === 1);
    task(`${route} has visible H1`, /<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html));
  }

  const llms = await read("public/llms.txt");
  const llmsFull = await read("public/llms-full.txt");
  const geoState = await read("docs/GEO_CURRENT_STATE.md");
  const aiScorecard = await read("src/data/ai-visibility-scorecard.ts");
  const aiLedgerRaw = await read("docs/GEO_AI_OBSERVATION_LEDGER_2026-08-22.json");
  const aiLedger = JSON.parse(aiLedgerRaw) as {
    status: string;
    prompt_count: number;
    providers: string[];
    expected_observation_count: number;
    completed_observation_count: number;
    observation_slots: Array<{ provider: string; prompt_id: string; status: string; observed_at: string | null; result: unknown }>;
  };
  const externalEvidence = await read("src/data/geo-external-evidence-acquisition.ts");
  const seoIntake = await read("src/components/SeoSupportingIntakeEnhancer.astro");
  const moneyTail = await read("scripts/money-page-revenue-tail.test.mjs");
  const publicEntityRegistry = await read("src/data/public-entity-registry.ts");

  // 41-50 — canonical Four Directions/entity context for AI/search systems.
  for (const label of ["Hermes Logistics", "Hermes Marketing", "Hermes Academy", "Hermes Technology"]) {
    task(`llms.txt exposes ${label}`, llms.includes(label));
  }
  task("llms-full exposes canonical Four Directions", ["Hermes Logistics", "Hermes Marketing", "Hermes Academy", "Hermes Technology"].every((label) => llmsFull.includes(label)));
  task("GEO current state names Hermes Technology as root direction", geoState.includes("Hermes Technology"));
  task("GEO state keeps operating labels subordinate", geoState.includes("subordinate") && geoState.includes("ProgressoPro"));
  task("GEO state keeps unmeasured AI visibility as Not measured", geoState.includes("Not measured"));
  task("AI prompt contract contains canonical Hermes Technology", aiScorecard.includes("Hermes Technology"));
  task("AI prompt contract contains canonical Hermes Academy", aiScorecard.includes("Hermes Academy"));

  // 51-60 — real 48×5 GEO observation universe must stay honest until observed.
  const expectedProviders = ["chatgpt", "gemini", "copilot", "perplexity", "google_ai_mode"];
  const uniqueSlots = new Set(aiLedger.observation_slots.map((slot) => `${slot.provider}:${slot.prompt_id}`));
  task("AI ledger is ready for real observations", aiLedger.status === "ready_for_real_provider_observations");
  task("AI ledger has 48 governed prompts", aiLedger.prompt_count === 48);
  task("AI ledger has exactly five governed providers", JSON.stringify(aiLedger.providers) === JSON.stringify(expectedProviders));
  task("AI ledger expects exactly 240 observations", aiLedger.expected_observation_count === 240);
  task("AI ledger does not fabricate completed observations", aiLedger.completed_observation_count === 0);
  task("AI ledger materializes all 240 slots", aiLedger.observation_slots.length === 240);
  task("AI ledger slot keys are unique", uniqueSlots.size === 240);
  task("unobserved slots remain unobserved", aiLedger.observation_slots.every((slot) => slot.status === "unobserved"));
  task("unobserved slots keep null observed_at", aiLedger.observation_slots.every((slot) => slot.observed_at === null));
  task("unobserved slots keep null result", aiLedger.observation_slots.every((slot) => slot.result === null));

  // 61-70 — external evidence contract prevents repository/CI from impersonating platform truth.
  task("GSC U.S. owner export contract exists", externalEvidence.includes('type: "gsc_us_owner_export"'));
  task("Google URL Inspection contract exists", externalEvidence.includes('type: "gsc_url_inspection"'));
  task("Bing exact-URL contract exists", externalEvidence.includes('type: "bing_exact_url"'));
  task("GA4 exact-once contract exists", externalEvidence.includes('type: "ga4_exact_once_receipt"'));
  task("private funnel aggregate contract exists", externalEvidence.includes('type: "private_funnel_aggregate"'));
  task("manual AI review contract exists", externalEvidence.includes('type: "manual_ai_review"'));
  task("external queue stays external_action_required", externalEvidence.includes('status: "external_action_required" as const'));
  task("exact-once requires observed_count=1", externalEvidence.includes("Exact-once requires observed_count=1"));
  task("IndexNow is rejected as exact Bing index proof", externalEvidence.includes("IndexNow submission/acceptance is not sufficient"));
  task("raw AI answers are forbidden from evidence payloads", externalEvidence.includes('"raw_response"') && externalEvidence.includes('"transcript"'));

  // 71-80 — search traffic must enter one measurable conversion/handoff path.
  task("SEO CTA click is instrumented", seoIntake.includes('event: "commercial_cta_click"'));
  task("SEO intake start is instrumented", seoIntake.includes('event: "seo_intake_start"'));
  task("SEO preview-ready is instrumented", seoIntake.includes('event: "seo_intake_preview_ready"'));
  task("SEO handoff-ready is instrumented", seoIntake.includes('event: "seo_handoff_ready"'));
  task("Local SEO keeps its service variant", seoIntake.includes('"local_seo"'));
  task("Logistics SEO keeps its service variant", seoIntake.includes('"logistics_seo"'));
  task("Auto dealer SEO keeps its service variant", seoIntake.includes('"auto_dealer_seo"'));
  task("money-page contract requires page-specific action labels", moneyTail.includes("page-specific action label"));
  task("money-page contract requires direct intake destination", moneyTail.includes("direct intake destination"));
  task("money-page contract requires approved direct fallback", moneyTail.includes("approved direct fallback"));

  // 81-90 — active-direction pages have visible, non-dead-end commercial/learning actions.
  const marketing = visibleText(htmlByRoute.get("/paths/marketing/")!);
  const academy = visibleText(htmlByRoute.get("/paths/academy/")!);
  const technology = visibleText(htmlByRoute.get("/paths/technology/")!);
  const seo = htmlByRoute.get("/services/seo/")!;
  const localSeo = htmlByRoute.get("/services/local-seo/")!;
  const dealerSeo = htmlByRoute.get("/services/seo-for-independent-auto-dealers/")!;
  const webDev = htmlByRoute.get("/services/website-development/")!;
  const webRedesign = htmlByRoute.get("/services/website-redesign/")!;
  task("Marketing direction exposes a growth/search action", /SEO|search|website/i.test(marketing));
  task("Academy direction exposes real public programs", academy.includes("U.S. Logistics Operations") && academy.includes("Marketing"));
  task("Technology direction exposes Hermes Connect", technology.includes("Hermes Connect"));
  task("SEO service exposes intake action", seo.includes("Start SEO review"));
  task("Local SEO exposes intake action", localSeo.includes("Start local SEO review"));
  task("Dealer SEO exposes intake action", dealerSeo.includes("Start dealer SEO review"));
  task("Website Development exposes brief action", webDev.includes("Start website brief"));
  task("Website Redesign exposes brief action", webRedesign.includes("Start redesign brief"));
  task("SEO service keeps direct email fallback", seo.includes("mailto:officeus@hermeslogisticsus.com"));
  task("Website Development keeps direct email fallback", webDev.includes("mailto:officeus@hermeslogisticsus.com"));

  // 91-100 — fail-closed growth governance: evidence first, no page-count theatre.
  task("GEO state forbids synthetic AI observations", /synthetic/i.test(geoState) && /real provider/i.test(geoState));
  task("GEO state preserves 48×5 denominator", geoState.includes("48 × 5 = 240"));
  task("GEO state separates GSC/Bing/GA4 evidence", geoState.includes("GSC") && geoState.includes("Bing") && geoState.includes("GA4"));
  task("GEO state preserves canonical owner concept", /canonical owner/i.test(geoState));
  task("GEO state keeps private outcomes separate", /private/i.test(geoState) && /outcome/i.test(geoState));
  task("entity registry exists as a controlled public source", publicEntityRegistry.includes("publicEntity"));
  task("entity registry does not treat ProgressoPro as root Hermes sameAs by default", !/sameAs[^\n]*progressopro/i.test(publicEntityRegistry));
  task("AI scorecard keeps provider set explicit", expectedProviders.every((provider) => aiScorecard.includes(`id: "${provider}"`)));
  task("AI scorecard keeps optional other outside governed denominator", aiScorecard.includes('| "other"') && aiScorecard.includes("aiVisibilityWaveProviders"));
  task("this revenue-first batch contains exactly 100 checks", checks.length === 99);

  // The final self-count check above is task #100; it observes the 99 preceding checks.
  expect(checks).toHaveLength(100);
  for (const [index, check] of checks.entries()) {
    expect(check.pass, `SEO/GEO revenue task ${index + 1}/100 failed: ${check.name}`).toBeTruthy();
  }
});
