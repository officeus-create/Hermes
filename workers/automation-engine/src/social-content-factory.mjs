// Deterministic two-lane social content factory.
// Business policy lives in Hermes Marketing Growth; this module only creates bounded,
// truthful platform-native candidates for the existing HAE scheduler/provider gates.

export const SOCIAL_LANES = Object.freeze(["HERMES_LOGISTICS", "PROGRESSOPRO"]);
export const SOCIAL_PLATFORMS = Object.freeze(["threads", "instagram", "facebook", "x"]);

const BASE_URL = "https://hermeslogisticsus.com";
const encoder = new TextEncoder();

const HERMES_THEMES = Object.freeze([
  {
    id: "deadhead",
    audience: "U.S. car-hauling owner-operators and small fleets",
    objective: "qualified_carrier_interest",
    path: "/logistics/car-hauling-dispatch/",
    hook: "Car haulers: a good-looking rate can turn weak after deadhead.",
    point: "Compare loaded miles, empty miles, pickup timing and reload position before you commit.",
    question: "What hurts your route more right now: deadhead, timing or destination fit?",
  },
  {
    id: "rpm",
    audience: "U.S. car-hauling owner-operators and small fleets",
    objective: "qualified_carrier_interest",
    path: "/logistics/car-hauling-dispatch/",
    hook: "Car haulers: RPM only helps when the miles in the calculation are real.",
    point: "Use total route miles and keep equipment fit, timing and reload position beside the rate.",
    question: "Do you calculate RPM on loaded miles or total miles?",
  },
  {
    id: "load-fit",
    audience: "U.S. car-hauling carriers",
    objective: "qualified_carrier_interest",
    path: "/logistics/car-hauler-loads/",
    hook: "More load listings do not automatically mean a better day.",
    point: "The useful load is the one that fits equipment, route, timing, authority and insurance.",
    question: "What do you check first before calling on a vehicle?",
  },
  {
    id: "broker-setup",
    audience: "U.S. car-hauling carriers",
    objective: "carrier_operations_education",
    path: "/logistics/car-hauling-dispatch/",
    hook: "A strong load can disappear while carrier setup is still incomplete.",
    point: "Keep current authority, insurance, W-9 and carrier details organized so paperwork is not the bottleneck.",
    question: "Which setup document costs you the most time?",
  },
  {
    id: "paperwork",
    audience: "U.S. car-hauling owner-operators and small fleets",
    objective: "carrier_operations_education",
    path: "/logistics/car-hauling-dispatch/",
    hook: "Delivery is not the end of the workflow if the paperwork is still incomplete.",
    point: "Tie BOL, delivery confirmation and invoicing to the same load record so billing follow-up stays visible.",
    question: "Which document do you chase most often after delivery?",
  },
  {
    id: "route-sequence",
    audience: "U.S. car-hauling owner-operators and small fleets",
    objective: "carrier_operations_education",
    path: "/logistics/car-hauling-dispatch/",
    hook: "One good load does not automatically make a good route.",
    point: "The destination matters because it changes the realistic reload options after delivery.",
    question: "How far ahead do you plan the next pickup?",
  },
  {
    id: "equipment-fit",
    audience: "U.S. car-hauling carriers",
    objective: "carrier_operations_education",
    path: "/logistics/car-hauler-loads/",
    hook: "Load fit starts with equipment fit, not with the rate alone.",
    point: "Vehicle count, size, operability, access, route and timing can change whether a listing is actually workable.",
    question: "Which equipment constraint eliminates the most loads for you?",
  },
  {
    id: "dealer-inventory",
    audience: "U.S. car-hauling carriers and small fleets",
    objective: "carrier_market_education",
    path: "/logistics/dealer-vehicle-transportation/",
    hook: "Dealer inventory moves can look simple until unit count, release and sequence are reviewed.",
    point: "Equipment fit, operability, pickup readiness, delivery sequence and timing should be clear before capacity is matched.",
    question: "Which dealer-move detail creates the most avoidable delay?",
  },
  {
    id: "auction-readiness",
    audience: "U.S. car-hauling carriers and owner-operators",
    objective: "carrier_operations_education",
    path: "/logistics/resources/auction-vehicle-pickup-checklist/",
    hook: "Auction pickups can stall before the truck ever moves.",
    point: "Release status, facility hours, storage deadline, keys, operability and loading access belong in the pickup check.",
    question: "What auction detail do you verify before dispatching toward the gate?",
  },
  {
    id: "delivery-to-invoice",
    audience: "U.S. car-hauling owner-operators and small fleets",
    objective: "carrier_operations_education",
    path: "/logistics/car-hauling-dispatch/",
    hook: "A delivered vehicle can still become a slow-paying load when the document trail is incomplete.",
    point: "Keep delivery confirmation, BOL or condition records and invoice follow-up tied to the same load workflow.",
    question: "Where does your post-delivery paperwork slow down most often?",
  },
]);

const PROGRESSOPRO_THEMES = Object.freeze([
  {
    id: "website-conversion",
    audience: "U.S. small and mid-size businesses",
    objective: "qualified_growth_review",
    path: "/paths/marketing/",
    hook: "More website traffic is not the goal if the page does not turn attention into action.",
    point: "Check the offer, proof, CTA and follow-up path before buying more traffic.",
    question: "Where is your biggest leak today: discovery, conversion or follow-up?",
  },
  {
    id: "seo-geo",
    audience: "U.S. businesses that depend on digital discovery",
    objective: "qualified_growth_review",
    path: "/paths/marketing/",
    hook: "Ranking for more terms is useful only when the right pages own the right demand.",
    point: "SEO, local discovery and AI visibility should point qualified intent to one clear commercial owner.",
    question: "Can you name the page that should win your highest-value search intent?",
  },
  {
    id: "social-demand",
    audience: "U.S. businesses using social media for growth",
    objective: "qualified_growth_review",
    path: "/paths/marketing/",
    hook: "High reach can still produce weak business results.",
    point: "Treat content as the start of a path: attention, owned visit, explicit inquiry, qualification and follow-up.",
    question: "Are you measuring views, inquiries or qualified opportunities?",
  },
  {
    id: "crm-followup",
    audience: "U.S. service businesses",
    objective: "qualified_growth_review",
    path: "/paths/marketing/",
    hook: "A lead is expensive when the follow-up system loses it.",
    point: "Connect source, inquiry, owner, next action and status so marketing and sales see the same record.",
    question: "How many handoffs happen before a new inquiry gets a real response?",
  },
  {
    id: "offer-positioning",
    audience: "U.S. businesses selling services",
    objective: "qualified_growth_review",
    path: "/paths/marketing/",
    hook: "A vague offer makes every channel work harder.",
    point: "Make the audience, problem, outcome boundary and next step clear before scaling content or ads.",
    question: "Would a new visitor understand what you do in ten seconds?",
  },
  {
    id: "automation",
    audience: "U.S. businesses with repeated sales and marketing work",
    objective: "qualified_growth_review",
    path: "/paths/marketing/",
    hook: "Automation should remove repeated work, not hide a broken process.",
    point: "Define the trigger, owner, evidence, failure state and human handoff before automating the step.",
    question: "Which repeated task creates the most delay in your current pipeline?",
  },
  {
    id: "website-system",
    audience: "U.S. service businesses that need more qualified inquiries",
    objective: "qualified_website_review",
    path: "/services/website-development/",
    hook: "A website is not finished when it looks good; it is useful when the next action is clear.",
    point: "Offer, proof, search intent, CTA and follow-up should operate as one conversion path.",
    question: "What should a qualified visitor do in the first sixty seconds on your site?",
  },
  {
    id: "local-seo",
    audience: "U.S. local businesses",
    objective: "qualified_local_growth_review",
    path: "/services/local-seo/",
    hook: "Local discovery gets weaker when your website, business profile and service geography tell different stories.",
    point: "Keep entity details, service intent, location relevance and the inquiry path consistent across owned surfaces.",
    question: "Can a local customer confirm what you do and how to contact you without guessing?",
  },
  {
    id: "technology-systems",
    audience: "U.S. businesses with disconnected tools and workflows",
    objective: "qualified_technology_review",
    path: "/paths/technology/",
    hook: "Adding another tool rarely fixes a workflow that has no clear owner.",
    point: "Connect CRM, automation, websites and AI around one reviewable business flow with explicit human control.",
    question: "Which handoff between your systems creates the most duplicate work?",
  },
  {
    id: "hermes-connect",
    audience: "U.S. service businesses evaluating CRM and operating systems",
    objective: "qualified_software_review",
    path: "/services/hermes-connect/",
    hook: "A useful CRM should show the next action, not just store another record.",
    point: "Leads, bookings, customers, operations and follow-up become easier to manage when they share one operating context.",
    question: "Which part of your customer workflow is still split across separate tools?",
  },
  {
    id: "academy-training",
    audience: "People and teams building practical U.S.-market business skills",
    objective: "qualified_training_interest",
    path: "/paths/academy/",
    hook: "Training is stronger when practice produces evidence, not just completed lessons.",
    point: "Use real tasks, review, correction and progression to build capability without promising employment or income.",
    question: "Which skill would improve fastest if you had a real practice workflow this week?",
  },
]);

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
function clean(value, max = 2000) {
  return String(value ?? "").replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
function laneThemes(lane) {
  if (lane === "HERMES_LOGISTICS") return HERMES_THEMES;
  if (lane === "PROGRESSOPRO") return PROGRESSOPRO_THEMES;
  return null;
}
export function accountKeyForLane(lane) {
  if (lane === "HERMES_LOGISTICS") return "hermes_logistics";
  if (lane === "PROGRESSOPRO") return "progressopro";
  return null;
}
export function laneForAccountKey(accountKey) {
  if (accountKey === "hermes_logistics") return "HERMES_LOGISTICS";
  if (accountKey === "progressopro") return "PROGRESSOPRO";
  return null;
}
export function buildSocialTrackedUrl(path, platform, lane, themeId, slotKey) {
  const url = new URL(path, BASE_URL);
  url.searchParams.set("utm_source", platform === "x" ? "x" : platform);
  url.searchParams.set("utm_medium", "organic_social");
  url.searchParams.set("utm_campaign", lane === "HERMES_LOGISTICS" ? "car_hauler_carrier_growth" : "progressopro_growth");
  url.searchParams.set("utm_content", clean(themeId + "-" + slotKey, 80).toLowerCase().replace(/[^a-z0-9_-]+/g, "-"));
  return url.toString();
}
function assertMaxBytes(text, limit, errorClass) {
  const bytes = encoder.encode(text).byteLength;
  if (bytes > limit) throw new Error(errorClass);
  return bytes;
}
function buildXText(theme, url) {
  const candidates = [
    theme.hook + "\n" + theme.question + "\n" + url,
    theme.hook + "\n" + url,
  ];
  for (const candidate of candidates) {
    if ([...candidate].length <= 280) return candidate;
  }
  throw new Error("x_post_too_long");
}

export function buildHourlySocialPackage(lane, slotKey, variantIndex = 0) {
  if (!SOCIAL_LANES.includes(lane)) throw new Error("social_lane_invalid");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(String(slotKey || ""))) throw new Error("social_slot_invalid");
  const themes = laneThemes(lane);
  const ordinal = (fnv1a(lane + ":" + slotKey) + Math.max(0, Number(variantIndex) || 0)) >>> 0;
  const theme = themes[ordinal % themes.length];
  const accountKey = accountKeyForLane(lane);
  const packageId = "social:" + accountKey + ":" + slotKey + ":" + theme.id;

  const canonical = Object.freeze({
    package_id: packageId,
    lane,
    account_key: accountKey,
    audience: theme.audience,
    objective: theme.objective,
    market: "US",
    topic: theme.id,
    approved_claim_set: Object.freeze([theme.hook, theme.point, theme.question]),
    source_url: new URL(theme.path, BASE_URL).toString(),
    cta: lane === "HERMES_LOGISTICS" ? "Explore carrier-side Hermes resources" : "Request a growth review",
    campaign: lane === "HERMES_LOGISTICS" ? "car_hauler_carrier_growth" : "progressopro_growth",
    slot_key: slotKey,
  });

  const threadsUrl = buildSocialTrackedUrl(theme.path, "threads", lane, theme.id, slotKey);
  const facebookUrl = buildSocialTrackedUrl(theme.path, "facebook", lane, theme.id, slotKey);
  const xUrl = buildSocialTrackedUrl(theme.path, "x", lane, theme.id, slotKey);

  const threadsText = theme.hook + "\n\n" + theme.point + "\n\n" + theme.question + "\n" + threadsUrl;
  const facebookText = theme.hook + "\n\n" + theme.point + "\n\n" + theme.question + "\n\n" + canonical.cta + ": " + facebookUrl;
  const instagramText = theme.hook + "\n\n" + theme.point + "\n\n" + theme.question + "\n\n" +
    (lane === "HERMES_LOGISTICS" ? "Carrier resources: use the link in our profile." : "Growth review: use the link in our profile.");
  const xText = buildXText(theme, xUrl);

  assertMaxBytes(threadsText, 500, "threads_post_too_long");
  assertMaxBytes(facebookText, 4000, "facebook_post_too_long");
  assertMaxBytes(instagramText, 2200, "instagram_caption_too_long");
  if ([...xText].length > 280) throw new Error("x_post_too_long");

  const variants = Object.freeze({
    threads: Object.freeze({
      platform: "threads", body: threadsText, destination_url: threadsUrl,
      state: "READY_FOR_PROVIDER_GATE", cadence: "hourly_evaluate",
    }),
    instagram: Object.freeze({
      platform: "instagram", body: instagramText, destination_url: canonical.source_url,
      state: "DRAFT_REQUIRES_MEDIA", cadence: "min_3h_and_max_6_feed_per_ct_day",
    }),
    facebook: Object.freeze({
      platform: "facebook", body: facebookText, destination_url: facebookUrl,
      state: "READY_FOR_PROVIDER_GATE", cadence: "quality_and_dedupe_gate",
    }),
    x: Object.freeze({
      platform: "x", body: xText, destination_url: xUrl,
      state: "HOLD_PAID_PROVIDER", cadence: "hourly_evaluate",
    }),
  });

  return Object.freeze({ canonical, variants });
}

export function variantForPlatform(lane, slotKey, platform, variantIndex = 0) {
  if (!SOCIAL_PLATFORMS.includes(platform)) throw new Error("social_platform_invalid");
  return buildHourlySocialPackage(lane, slotKey, variantIndex).variants[platform];
}

export const HERMES_SOCIAL_THEMES = HERMES_THEMES;
export const PROGRESSOPRO_SOCIAL_THEMES = PROGRESSOPRO_THEMES;
