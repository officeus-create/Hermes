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

export type VehicleEquipmentClass =
  | "car_hauler"
  | "box_truck"
  | "dry_van"
  | "flatbed"
  | "reefer"
  | "step_deck"
  | "hotshot"
  | "power_only"
  | "sprinter_van"
  | "pickup_truck";

export type VehicleAvailabilityPayload = {
  carrier_role: "carrier" | "owner_operator" | "dispatcher" | "";
  contact_name: string;
  company_name: string;
  authority_number: string;
  email: string;
  phone: string;
  equipment_class: VehicleEquipmentClass | "";
  capacity_units: number;
  available_from: string;
  origin_location: string;
  origin_radius: number;
  destination_location: string;
  anywhere: boolean;
  vehicle_name: string;
  interested_load: string;
  consent: boolean;
  website: string;
};

export type LogisticsSalesLead = {
  lead_type: "load_board_access" | "posted_load";
  department: "Logistics Sales";
  sales_tag: string;
  email_subject: string;
  email_body: string;
};

export type VehicleReviewDecision = "dispatcher_review" | "scope_review" | "needs_more_information" | "rejected";

export type VehicleReview = {
  decision: VehicleReviewDecision;
  vehicle_state: "submitted_for_review" | "needs_changes" | "rejected";
  reasons: string[];
  required_actions: string[];
  routing: string[];
};

const clean = (value: FormDataEntryValue | null, maxLength: number) =>
  String(value ?? "")
    .replace(/[<>\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);

const allowedSubmitters = new Set<LoadSubmitterType>(["private_party", "dealer", "shipper", "broker", "other_business"]);
const allowedCommodities = new Set<LoadCommodityType>(["passenger_vehicle", "motorcycle", "pickup_suv", "light_truck", "tractor", "other"]);
const allowedConditions = new Set<LoadCondition>(["operable", "inoperable_rolls", "inoperable_non_rolling"]);
const allowedEquipmentClasses = new Set<VehicleEquipmentClass>([
  "car_hauler",
  "box_truck",
  "dry_van",
  "flatbed",
  "reefer",
  "step_deck",
  "hotshot",
  "power_only",
  "sprinter_van",
  "pickup_truck",
]);
const allowedCarrierRoles = new Set<VehicleAvailabilityPayload["carrier_role"]>(["carrier", "owner_operator", "dispatcher"]);

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

export function buildVehicleAvailabilityPayload(formData: FormData): VehicleAvailabilityPayload {
  const capacity = Number.parseInt(clean(formData.get("capacity_units"), 3), 10);
  const radius = Number.parseInt(clean(formData.get("origin_radius"), 4), 10);
  return {
    carrier_role: enumValue(formData.get("carrier_role"), allowedCarrierRoles),
    contact_name: clean(formData.get("carrier_contact_name"), 100),
    company_name: clean(formData.get("carrier_company_name"), 160),
    authority_number: clean(formData.get("authority_number"), 40).toUpperCase(),
    email: clean(formData.get("carrier_email"), 160).toLowerCase(),
    phone: clean(formData.get("carrier_phone"), 40),
    equipment_class: enumValue(formData.get("equipment_class"), allowedEquipmentClasses),
    capacity_units: Number.isFinite(capacity) && capacity > 0 ? Math.min(capacity, 20) : 0,
    available_from: clean(formData.get("available_from"), 10),
    origin_location: clean(formData.get("origin_location"), 180),
    origin_radius: Number.isFinite(radius) && radius > 0 ? Math.min(radius, 1000) : 0,
    destination_location: clean(formData.get("destination_location"), 180),
    anywhere: formData.get("anywhere") === "on",
    vehicle_name: clean(formData.get("vehicle_name"), 100),
    interested_load: clean(formData.get("interested_load"), 40).toUpperCase(),
    consent: formData.get("carrier_consent") === "on",
    website: clean(formData.get("carrier_website"), 200),
  };
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isAuthorityNumber = (value: string) => /^(?:(?:MC|USDOT|DOT)\s*-?\s*\d{5,8})$/i.test(value);
const isPhone = (value: string) => value.replace(/\D/g, "").length >= 10;

export function reviewVehicleAvailabilityPayload(payload: VehicleAvailabilityPayload, today = new Date()): VehicleReview {
  const routing = ["Carrier onboarding dry-run queue", "Dispatcher vehicle review dry-run queue"];

  if (payload.website) {
    return {
      decision: "rejected",
      vehicle_state: "rejected",
      reasons: ["Bot-protection field was populated."],
      required_actions: ["Do not create access or route this preview."],
      routing: [],
    };
  }

  const missing = [
    [payload.carrier_role, "carrier role"],
    [payload.contact_name, "contact name"],
    [payload.company_name, "company name"],
    [payload.authority_number, "MC or USDOT number"],
    [payload.email, "valid email"],
    [payload.phone, "valid phone"],
    [payload.equipment_class, "equipment class"],
    [payload.capacity_units, "capacity or unit count"],
    [payload.available_from, "available-from date"],
    [payload.origin_location, "origin city, state or ZIP"],
    [payload.origin_radius, "origin radius"],
    [payload.destination_location || payload.anywhere, "destination or Anywhere"],
    [payload.consent, "preview consent"],
  ].filter(([value]) => !value).map(([, label]) => String(label));

  if (payload.email && !isEmail(payload.email)) missing.push("valid email");
  if (payload.phone && !isPhone(payload.phone)) missing.push("valid phone");
  if (payload.authority_number && !isAuthorityNumber(payload.authority_number)) missing.push("MC or USDOT number with its prefix");

  const available = new Date(`${payload.available_from}T12:00:00Z`);
  const floorToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (payload.available_from && (Number.isNaN(available.getTime()) || available < floorToday)) {
    missing.push("current available-from date");
  }

  if (missing.length) {
    return {
      decision: "needs_more_information",
      vehicle_state: "needs_changes",
      reasons: [`Missing or invalid: ${[...new Set(missing)].join(", ")}.`],
      required_actions: ["Complete the minimum placement fields before dispatcher review."],
      routing,
    };
  }

  if (payload.equipment_class !== "car_hauler") {
    return {
      decision: "scope_review",
      vehicle_state: "submitted_for_review",
      reasons: ["This equipment class was discussed, but the approved first vertical is still car hauling."],
      required_actions: ["Confirm MVP scope and collect equipment-specific dimensions, payload and capabilities before matching."],
      routing,
    };
  }

  return {
    decision: "dispatcher_review",
    vehicle_state: "submitted_for_review",
    reasons: ["Minimum car-hauler identity, availability, geography and capacity fields are present."],
    required_actions: [
      "Verify authority and contact details.",
      "Dispatcher decides whether to activate the vehicle and which loads become visible.",
    ],
    routing,
  };
}

export function buildVehicleAvailabilityPreview(payload: VehicleAvailabilityPayload, review: VehicleReview): string {
  const equipmentLabels: Record<VehicleEquipmentClass, string> = {
    car_hauler: "Car Hauler / Auto Transport",
    box_truck: "Box Truck / Straight Truck",
    dry_van: "Dry Van",
    flatbed: "Flatbed",
    reefer: "Reefer",
    step_deck: "Step Deck",
    hotshot: "Hotshot / Gooseneck",
    power_only: "Power Only",
    sprinter_van: "Sprinter Van",
    pickup_truck: "Pickup Truck",
  };
  return [
    "Hermes Load Board — Carrier Sales Lead Preview",
    "Sales tag: LOAD BOARD ACCESS / CARRIER",
    `Decision: ${review.decision}`,
    `Vehicle state: ${review.vehicle_state}`,
    `Role: ${payload.carrier_role.replaceAll("_", " ")}`,
    `Contact: ${payload.contact_name}`,
    `Company: ${payload.company_name}`,
    `Authority: ${payload.authority_number}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Equipment: ${payload.equipment_class ? equipmentLabels[payload.equipment_class] : ""}`,
    `Capacity / unit count: ${payload.capacity_units}`,
    payload.vehicle_name ? `Vehicle name: ${payload.vehicle_name}` : "",
    payload.interested_load ? `Interested load: ${payload.interested_load}` : "Interested load: free Load Board access",
    `Available from: ${payload.available_from}`,
    `Origin: ${payload.origin_location} (${payload.origin_radius} mi radius)`,
    `Destination: ${payload.anywhere ? "Anywhere" : payload.destination_location}`,
    `Reasons: ${review.reasons.join(" | ")}`,
    `Required actions: ${review.required_actions.join(" | ")}`,
    `Dry-run routing: ${review.routing.join(" | ") || "none"}`,
    "Requested follow-up: Logistics Sales call about access, carrier agreement, and next steps.",
    "Delivery: preview only — no email, account, call, CRM write, or dispatcher assignment was created.",
  ].filter(Boolean).join("\n");
}

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
    [payload.phone, "valid phone"],
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
  if (payload.phone && !isPhone(payload.phone)) missing.push("valid phone");
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
  const salesSubmitter = payload.submitter_type === "private_party"
    ? "CUSTOMER"
    : (labels[payload.submitter_type] ?? payload.submitter_type).toUpperCase();
  return [
    "Hermes Load Board — Posted Load Sales Lead Preview",
    `Sales tag: POSTED LOAD / ${salesSubmitter}`,
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
    "Requested follow-up: Logistics Sales call to confirm the move and begin carrier search.",
    "Delivery: preview only — no email, CRM write, load publication, or carrier notification was sent.",
  ].filter(Boolean).join("\n");
}

export function buildCarrierSalesLead(payload: VehicleAvailabilityPayload, review: VehicleReview): LogisticsSalesLead {
  const subjectParts = ["[HERMES SALES]", "[LOAD BOARD ACCESS]", "[CARRIER]"];
  if (payload.interested_load) subjectParts.push(`[${payload.interested_load}]`);
  return {
    lead_type: "load_board_access",
    department: "Logistics Sales",
    sales_tag: "LOAD BOARD ACCESS / CARRIER",
    email_subject: subjectParts.join(" "),
    email_body: buildVehicleAvailabilityPreview(payload, review),
  };
}

export function buildPostedLoadSalesLead(payload: LoadBoardPayload, review: LoadReview): LogisticsSalesLead {
  const submitter = payload.submitter_type === "private_party"
    ? "CUSTOMER"
    : payload.submitter_type
      ? payload.submitter_type.replaceAll("_", " ").toUpperCase()
      : "CUSTOMER";
  return {
    lead_type: "posted_load",
    department: "Logistics Sales",
    sales_tag: `POSTED LOAD / ${submitter}`,
    email_subject: `[HERMES SALES] [POSTED LOAD] [${submitter}] ${payload.pickup_location} → ${payload.delivery_location}`,
    email_body: buildLoadBoardPreview(payload, review),
  };
}

export function buildLogisticsSalesMailto(lead: LogisticsSalesLead, recipient = "officeus@hermeslogisticsus.com"): string {
  return `mailto:${recipient}?subject=${encodeURIComponent(lead.email_subject)}&body=${encodeURIComponent(lead.email_body)}`;
}
