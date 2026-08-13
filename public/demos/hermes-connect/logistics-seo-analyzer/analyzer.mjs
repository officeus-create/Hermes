export const analyzerOptions = Object.freeze({
  businessType: Object.freeze(["trucking", "car_hauling", "freight_broker", "vehicle_transport", "logistics_services", "logistics_technology"]),
  searchConsole: Object.freeze(["verified", "unavailable", "unknown"]),
  analyticsReceipt: Object.freeze(["verified", "code_only", "unknown"]),
  moneyPageOwnership: Object.freeze(["clear", "overlapping", "unknown"]),
  canonicalIndexability: Object.freeze(["verified", "issues", "unknown"]),
  internalLinks: Object.freeze(["strong", "weak", "unknown"]),
  primaryCta: Object.freeze(["direct_intake", "demo_or_generic", "missing"]),
  deliverySemantics: Object.freeze(["receiver_confirmed", "optimistic_or_unknown"]),
  mobilePerformance: Object.freeze(["acceptable", "material_issue", "no_comparable_evidence"]),
  proofState: Object.freeze(["permissioned", "private_unapproved", "absent"]),
  entityConsistency: Object.freeze(["consistent", "conflicts", "unknown"]),
  locationUniqueness: Object.freeze(["distinct", "repeated_thin_risk", "not_applicable"]),
  baseline: Object.freeze(["available", "partial", "unavailable"]),
});

const priorityWeight = Object.freeze({ P0: 5, P1: 4, MEASURE: 3, HOLD: 2, P2: 1 });

function option(value, name, allowed) {
  if (!allowed.includes(value)) throw new Error(`${name} is invalid`);
  return value;
}

function finding(priority, dimension, condition, why, action, evidence, validation) {
  return { priority, dimension, condition, why, action, evidence, validation };
}

export function analyzeLogisticsSeo(input = {}) {
  const values = Object.fromEntries(
    Object.entries(analyzerOptions).map(([key, allowed]) => [key, option(input[key], key, allowed)]),
  );
  const findings = [];

  if (values.primaryCta === "missing") {
    findings.push(finding("P0", "Search-to-inquiry path", "Primary commercial CTA is missing", "A ready buyer can reach the page without a clear next human decision path.", "Add one page-specific commercial action that routes to the real approved intake or contact path.", "Rendered CTA destination and buyer-flow review.", "Desktop/mobile browser test reaches the approved intake without a demo or dead end."));
  } else if (values.primaryCta === "demo_or_generic") {
    findings.push(finding("P0", "Search-to-inquiry path", "Primary CTA routes to a demo or generic path", "A ready buyer may explore a concept instead of reaching the team that can review the commercial request.", "Make the real intake the primary action and keep demos/exploration as clearly secondary.", "Rendered CTA destination and funnel-state review.", "Primary CTA resolves to the real approved intake; demo remains separately labeled."));
  }

  if (values.deliverySemantics === "optimistic_or_unknown") {
    findings.push(finding("P0", "Search-to-inquiry path", "Delivery success semantics are optimistic or unverified", "A visitor can be shown success without proof that the approved receiver accepted the request.", "Show success only after confirmed receiver response and preserve a clear fallback when delivery is unconfirmed.", "Receiver/network contract and failure-path evidence.", "Synthetic success/failure/duplicate tests reconcile with the approved receiver."));
  }

  if (values.canonicalIndexability === "issues") {
    findings.push(finding("P0", "Technical and indexation", "Canonical or indexability issues are observed", "Search engines may index the wrong owner, skip a money page, or split signals across URLs.", "Repair status/robots/canonical/sitemap ownership on the affected commercial pages before content expansion.", "Public response, built HTML, sitemap and authenticated index evidence where available.", "Current production returns the intended canonical/index state and later platform evidence confirms the expected owner."));
  } else if (values.canonicalIndexability === "unknown") {
    findings.push(finding("MEASURE", "Technical and indexation", "Canonical/indexability state is unknown", "Changing content before confirming crawl/index ownership risks optimizing a page Google is not treating as intended.", "Verify the canonical money-page set in production and authenticated search tools before expansion.", "HTTP/built HTML plus Search Console/Bing where available.", "Each priority page receives an explicit VERIFIED / ISSUE / DATA_PENDING state."));
  }

  if (values.moneyPageOwnership === "overlapping") {
    findings.push(finding("P1", "Query and URL ownership", "Commercial intent overlaps across multiple pages", "Competing owners can dilute relevance and make internal links/CTAs inconsistent.", "Assign one preferred owner per intent family; consolidate or support rather than create synonym pages.", "Query×page evidence, titles/H1s, internal-link graph and page purpose.", "One approved owner exists for each core intent and competing pages have a documented support/consolidation role."));
  } else if (values.moneyPageOwnership === "unknown") {
    findings.push(finding("MEASURE", "Query and URL ownership", "Preferred money-page owners are not documented", "Without ownership, a content sprint can create cannibalization even when every page is individually useful.", "Build a query-to-page ownership map before adding service/location variants.", "Current commercial route inventory and query evidence.", "Every core buyer intent has one preferred owner and one measurable next action."));
  }

  if (values.internalLinks === "weak") {
    findings.push(finding("P1", "Query and URL ownership", "Internal support into money pages is weak", "Useful resources may rank or attract discovery without reinforcing the commercial owner or giving the visitor a next step.", "Add natural contextual links from relevant hubs/resources into the approved money-page owner.", "Internal-link graph and rendered anchor review.", "Priority owners receive relevant crawl paths and informational winners preserve useful commercial handoffs."));
  } else if (values.internalLinks === "unknown") {
    findings.push(finding("MEASURE", "Query and URL ownership", "Internal-link support has not been reviewed", "Search ownership and buyer flow cannot be evaluated from page copy alone.", "Audit inbound internal links, anchor context and click path to the core money pages.", "Crawl/internal-link report.", "Each priority owner has a documented supporting cluster and no misleading anchor pattern."));
  }

  if (values.searchConsole !== "verified") {
    findings.push(finding("MEASURE", "Measurement", values.searchConsole === "unavailable" ? "Search Console access is unavailable" : "Search Console ownership/evidence is unknown", "Indexation, query ownership, impressions and position changes would otherwise be guesses.", "Confirm the correct Search Console property or explicitly keep platform-dependent conclusions DATA_PENDING.", "Authenticated property access and safe aggregate export.", "Current query/page/index evidence is labeled PLATFORM_VERIFIED or explicitly unavailable."));
  }

  if (values.analyticsReceipt === "code_only") {
    findings.push(finding("MEASURE", "Measurement", "Analytics events exist in code but production receipt is unverified", "Repository instrumentation does not prove events arrive once, use the right property, or respect consent in production.", "Verify the existing production stream in Realtime/DebugView with synthetic non-private interactions before using conversion rates.", "Authenticated analytics receipt plus network/privacy inspection.", "Priority events appear exactly once with allowlisted parameters and synthetic tests are excluded from KPIs."));
  } else if (values.analyticsReceipt === "unknown") {
    findings.push(finding("MEASURE", "Measurement", "Production analytics receipt is unknown", "A traffic or conversion claim would mix implementation assumptions with platform evidence.", "Locate the existing production analytics owner/stream before creating anything new, then test receipt/privacy.", "Authenticated analytics UI evidence.", "Production stream ownership and priority event receipt are explicit."));
  }

  if (values.baseline === "partial") {
    findings.push(finding("MEASURE", "Measurement", "7-day / 28-day baseline is incomplete", "A change can move impressions or audit scores without proving qualified commercial impact.", "Complete separate search, CTA/delivery, human qualification and opportunity/revenue aggregates before scale decisions.", "Authenticated aggregate sources with exact date range/timezone.", "A 7-day and 28-day scorecard preserves evidence classes and excludes synthetic tests."));
  } else if (values.baseline === "unavailable") {
    findings.push(finding("MEASURE", "Measurement", "No comparable 7-day / 28-day baseline is available", "Without a baseline there is no reliable stop/keep/scale decision after a release.", "Establish the smallest authenticated measurement slice before a broad content/location sprint.", "Search/analytics/receiver/private-operations aggregates.", "First comparable baseline is stored with date range, timezone, attribution basis and DATA_PENDING where needed."));
  }

  if (values.mobilePerformance === "material_issue") {
    findings.push(finding("P1", "Technical and indexation", "Material mobile performance issue is observed", "Slow first-view rendering can reduce usable search traffic even when crawl/indexation is healthy.", "Fix the measured bottleneck with a bounded keep/revert experiment rather than chasing a perfect score.", "Comparable lab and field evidence kept separate.", "Mobile performance improves without CTA, accessibility, privacy, navigation or layout regressions."));
  } else if (values.mobilePerformance === "no_comparable_evidence") {
    findings.push(finding("MEASURE", "Technical and indexation", "No comparable mobile performance evidence is available", "One screenshot or one Lighthouse score is insufficient for a causal performance decision.", "Capture a repeatable baseline and label field CWV DATA_PENDING when CrUX/GSC data is absent.", "Repeated lab run plus field evidence when available.", "Performance conclusions state device, run count, date and evidence class."));
  }

  if (values.entityConsistency === "conflicts") {
    findings.push(finding("P1", "Evidence and claim controls", "External company/entity profiles conflict", "Buyers and search/AI systems can connect inconsistent staff, office, service, or company facts to the same entity.", "Approve one canonical company-facts source and correct controlled external profiles field by field.", "Dated profile inventory plus owner-approved facts.", "High-visibility controlled profiles use the same approved name, domain, geography and service scope."));
  } else if (values.entityConsistency === "unknown") {
    findings.push(finding("HOLD", "Evidence and claim controls", "External entity consistency has not been verified", "Adding more authority/distribution can amplify conflicting facts if identity is not settled first.", "Inventory high-visibility profiles and classify keep/update/remove before broad authority work.", "Dated public profile inventory and owner approval.", "Entity facts are verified or explicitly held rather than inferred."));
  }

  if (values.proofState === "private_unapproved") {
    findings.push(finding("HOLD", "Evidence and claim controls", "Operational proof exists but publication permission is not approved", "A real business relationship does not automatically grant permission to publish identity, metrics, screenshots or outcomes.", "Verify facts, sanitize private details, obtain explicit publication permission, then approve exact public wording.", "Owner-controlled evidence plus consent/rights record.", "Proof reaches APPROVED_FOR_PUBLICATION before any case/result claim goes live."));
  } else if (values.proofState === "absent") {
    findings.push(finding("HOLD", "Evidence and claim controls", "No publication-ready case or proof is available", "Generic claims cannot substitute for evidence-backed trust when buyers need proof of execution.", "Identify one real eligible case and run it through evidence, permission and sanitization gates; do not fabricate a testimonial.", "Owner-controlled operational evidence and explicit permission.", "At least one case is permissioned, sanitized and mapped claim-by-claim to evidence."));
  }

  if (values.locationUniqueness === "repeated_thin_risk") {
    findings.push(finding("P1", "Query and URL ownership", "Location/service pages show repeated-thin risk", "Near-duplicate permutations can add crawl noise, cannibalization and little buyer value.", "Stop bulk generation; keep only pages with distinct buyer intent, service truth, useful data/content and measurable demand.", "Template comparison, query evidence, page differentiation and internal-link review.", "Weak permutations are held/consolidated and any new page has a distinct approved reason to exist."));
  }

  if (findings.length === 0) {
    findings.push(finding("P2", "Executive summary", "No blocker was selected in the guided evidence set", "A clean guided review does not prove rankings, leads or revenue; it only means the selected controls do not currently expose a blocker.", "Protect current owners and conversion paths, then continue measured search/qualified-action experiments.", "Current authenticated search, analytics and private outcome evidence.", "Next release is judged by comparable qualified commercial evidence, not page count."));
  }

  findings.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.dimension.localeCompare(b.dimension));

  const roadmap = {
    days30: findings.filter((item) => item.priority === "P0").map((item) => item.action),
    days90: findings.filter((item) => ["P1", "MEASURE"].includes(item.priority)).map((item) => item.action),
    days180: [
      "Scale only existing impression owners and product/tool surfaces that show useful demand plus qualified actions.",
      "Consolidate or hold thin service/location permutations instead of publishing for every wording variant.",
    ],
    days365: [
      "Integrate authenticated aggregate search, analytics, receiver and private outcome evidence into a repeatable revenue scorecard.",
      "Stop or consolidate clusters that create visibility without qualified commercial value.",
    ],
  };
  if (!roadmap.days30.length) roadmap.days30.push("Protect current conversion/index ownership; resolve measurement or evidence gaps before a broad rebuild.");

  const blockers = findings.filter((item) => item.priority === "P0").length;
  const measurementGaps = findings.filter((item) => item.priority === "MEASURE").length;
  const holds = findings.filter((item) => item.priority === "HOLD").length;
  const score = Math.max(0, 100 - blockers * 18 - findings.filter((item) => item.priority === "P1").length * 8 - measurementGaps * 6 - holds * 5);

  return { values, findings, roadmap, summary: { score, blockers, measurementGaps, holds, findingCount: findings.length } };
}
