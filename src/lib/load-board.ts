export type LoadSubmitterType = "private_party" | "dealer" | "shipper" | "broker" | "other_business";
export type LoadCommodityType = "passenger_vehicle" | "motorcycle" | "pickup_suv" | "light_truck" | "tractor" | "other";
export type LoadCondition = "operable" | "inoperable_rolls" | "inoperable_non_rolling";
export type LoadDecision = "approved" | "needs_more_information" | "quarantine" | "rejected";

export type LoadBoardPayload = {
  submitter_type: LoadSubmitterType | "";
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  pickup_location: string;
  delivery_location: string;
  ready_date: string;
  commodity_type: LoadCommodityType | "";
  year_make_model: string;
  quantity: number;
  condition: LoadCondition | "";
  offered_price: string;
  notes: string;
  consent: boolean;
  website: string;
};

export type LoadReview = {
  decision: LoadDecision;
  confidence: "high" | "medium" | "low";
  reasons: string[];
  required_actions: string[];
  routing: string[];
  carrier_match_tags: string[];
};

const clean = (value: FormDataEntryValue | null, maxLength: number) =>
  String(value ?? "")
    .replace(/[<>\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);

const allowedSubmitters = new Set<LoadSubmitterType>(["private_party", "dealer", "shipper", "broker", "other_business"]);
const allowedCommodities = new Set<LoadCommodityType>(["passenger_vehicle", "motorcycle", "pickup_suv", "light_truck", "tractor", "other"]);
const allowedConditions = new Set<LoadCondition>(["operable", "inoperable_rolls", "inoperable_non_rolling"]);

const enumValue = <T extends string>(value: FormDataEntryValue | null, allowed: Set<T>): T | "" => {
  const candidate = clean(value, 80) as T;
  return allowed.has(candidate) ? candidate : "";
};

export function buildLoadBoardPayload(formData: FormData): LoadBoardPayload {
  const quantityValue = Number.parseInt(clean(formData.get("quantity"), 3), 10);
  return {
    submitter_type: enumValue(formData.get("submitter_type"), allowedSubmitters),
    contact_name: clean(formData.get("contact_name"), 100),
    company_name: clean(formData.get("company_name"), 160),
    email: clean(formData.get("email"), 160).toLowerCase(),
    phone: clean(formData.get("phone"), 40),
    pickup_location: clean(formData.get("pickup_location"), 180),
    delivery_location: clean(formData.get("delivery_location"), 180),
    ready_date: clean(formData.get("ready_date"), 10),
    commodity_type: enumValue(formData.get("commodity_type"), allowedCommodities),
    year_make_model: clean(formData.get("year_make_model"), 180),
    quantity: Number.isFinite(quantityValue) && quantityValue > 0 ? Math.min(quantityValue, 20) : 0,
    condition: enumValue(formData.get("condition"), allowedConditions),
    offered_price: clean(formData.get("offered_price"), 80),
    notes: clean(formData.get("notes"), 1200),
    consent: formData.get("consent") === "on",
    website: clean(formData.get("website"), 200),
  };
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function reviewLoadBoardPayload(payload: LoadBoardPayload, today = new Date()): LoadReview {
  const reasons: string[] = [];
  const requiredActions: string[] = [];
  const routing = ["Load Board operations queue"];
  const matchTags = ["Car hauling"];

  if (payload.website) {
    return {
      decision: "rejected",
      confidence: "high",
      reasons: ["Bot-protection field was populated."],
      required_actions: ["Do not publish or route this submission."],
      routing: [],
      carrier_match_tags: [],
    };
  }

  const missing = [
    [payload.submitter_type, "submitter type"],
    [payload.contact_name, "contact name"],
    [payload.email, "valid email"],
    [payload.pickup_location, "pickup location"],
    [payload.delivery_location, "delivery location"],
    [payload.ready_date, "ready date"],
    [payload.commodity_type, "commodity type"],
    [payload.year_make_model, "year, make and model"],
    [payload.quantity, "quantity"],
    [payload.condition, "vehicle condition"],
    [payload.consent, "consent"],
  ].filter(([value]) => !value).map(([, label]) => String(label));

  if (payload.email && !isEmail(payload.email)) missing.push("valid email");
  if (missing.length) {
    return {
      decision: "needs_more_information",
      confidence: "high",
      reasons: [`Missing or invalid: ${[...new Set(missing)].join(", ")}.`],
      required_actions: ["Ask the submitter to complete the missing information."],
      routing,
      carrier_match_tags: matchTags,
    };
  }

  const ready = new Date(`${payload.ready_date}T12:00:00Z`);
  const floorToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (Number.isNaN(ready.getTime()) || ready < floorToday) {
    return {
      decision: "needs_more_information",
      confidence: "high",
      reasons: ["Ready date is invalid or in the past."],
      required_actions: ["Ask for a current pickup date."],
      routing,
      carrier_match_tags: matchTags,
    };
  }

  if (payload.pickup_location.toLowerCase() === payload.delivery_location.toLowerCase()) {
    requiredActions.push("Confirm that pickup and delivery locations are intentionally the same.");
  }

  if (payload.submitter_type !== "private_party") {
    routing.push("Dealer and shipper sales queue");
  }
  routing.push("Dispatch Assist dry-run queue");

  if (payload.commodity_type === "motorcycle") matchTags.push("Motorcycle-capable equipment");
  if (["pickup_suv", "light_truck"].includes(payload.commodity_type)) matchTags.push("High-clearance or truck-capable trailer");

  if (payload.commodity_type === "tractor" || payload.commodity_type === "other") {
    reasons.push("Commodity requires equipment and dimensions review before carrier matching.");
    requiredActions.push("Collect dimensions, weight, loading method and required trailer type.");
  }
  if (payload.condition !== "operable") {
    reasons.push("Inoperable vehicle requires loading-method confirmation.");
    requiredActions.push("Confirm winch, forklift or other loading requirements.");
    matchTags.push("Inoperable-load capability");
  }
  if (payload.quantity > 3) {
    reasons.push("Multi-unit load requires capacity confirmation.");
    requiredActions.push("Confirm trailer capacity and whether the load may be split.");
  }

  if (reasons.length || requiredActions.length) {
    return {
      decision: "quarantine",
      confidence: "medium",
      reasons: reasons.length ? reasons : ["Route details require confirmation."],
      required_actions: requiredActions,
      routing,
      carrier_match_tags: matchTags,
    };
  }

  return {
    decision: "approved",
    confidence: "high",
    reasons: ["Standard operable car-hauling request passed the preview rules."],
    required_actions: ["Generate a carrier-match preview; do not send messages in preview mode."],
    routing,
    carrier_match_tags: matchTags,
  };
}

export function buildLoadBoardPreview(payload: LoadBoardPayload, review: LoadReview): string {
  const labels: Record<string, string> = {
    private_party: "Private party",
    dealer: "Dealer",
    shipper: "Shipper",
    broker: "Broker",
    other_business: "Other business",
    passenger_vehicle: "Passenger vehicle",
    motorcycle: "Motorcycle",
    pickup_suv: "Pickup / SUV",
    light_truck: "Light truck",
    tractor: "Truck tractor",
    other: "Other car-hauling commodity",
    operable: "Operable",
    inoperable_rolls: "Inoperable, rolls and steers",
    inoperable_non_rolling: "Inoperable, does not roll or steer",
  };
  return [
    "Hermes Load Board — Dry-run Preview",
    `Decision: ${review.decision}`,
    `Confidence: ${review.confidence}`,
    `Submitter: ${labels[payload.submitter_type] ?? payload.submitter_type}`,
    payload.company_name ? `Company: ${payload.company_name}` : "",
    `Contact: ${payload.contact_name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : "",
    `Route: ${payload.pickup_location} -> ${payload.delivery_location}`,
    `Ready date: ${payload.ready_date}`,
    `Commodity: ${labels[payload.commodity_type] ?? payload.commodity_type}`,
    `Vehicle/equipment: ${payload.year_make_model}`,
    `Quantity: ${payload.quantity}`,
    `Condition: ${labels[payload.condition] ?? payload.condition}`,
    payload.offered_price ? `Offered price: ${payload.offered_price}` : "Price: collecting carrier offers",
    `Reasons: ${review.reasons.join(" | ")}`,
    `Required actions: ${review.required_actions.join(" | ")}`,
    `Dry-run routing: ${review.routing.join(" | ") || "none"}`,
    `Carrier match tags: ${review.carrier_match_tags.join(" | ") || "none"}`,
    "Delivery: preview only — no email, CRM write, or carrier notification was sent.",
  ].filter(Boolean).join("\n");
}

