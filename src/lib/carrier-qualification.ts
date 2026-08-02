export type CarrierRole = "carrier" | "owner_operator" | "dispatcher";
export type CarrierEquipmentClass =
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
export type AuthorityStatus = "active" | "pending" | "inactive" | "not_sure";
export type AuthorityAge = "under_90_days" | "three_to_twelve_months" | "over_one_year" | "not_sure";
export type InsuranceStatus = "active" | "quote_in_progress" | "inactive" | "not_sure";
export type FleetSize = "one" | "two_to_three" | "four_to_ten" | "eleven_plus";
export type DispatchStatus = "self_dispatching" | "working_with_dispatcher" | "needs_dispatcher" | "not_sure";

export type QualifiedCarrierPayload = {
  carrier_role: CarrierRole | "";
  contact_name: string;
  company_name: string;
  authority_number: string;
  authority_status: AuthorityStatus | "";
  authority_age: AuthorityAge | "";
  insurance_status: InsuranceStatus | "";
  fleet_size: FleetSize | "";
  dispatch_status: DispatchStatus | "";
  email: string;
  phone: string;
  equipment_class: CarrierEquipmentClass | "";
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

export type QualifiedCarrierDecision = "dispatcher_review" | "readiness_review" | "scope_review" | "needs_more_information" | "rejected";

export type QualifiedCarrierReview = {
  decision: QualifiedCarrierDecision;
  vehicle_state: "submitted_for_review" | "needs_changes" | "rejected";
  reasons: string[];
  required_actions: string[];
  routing: string[];
};

export type QualifiedCarrierLead = {
  lead_type: "load_board_access";
  department: "Logistics Sales";
  sales_tag: string;
  email_subject: string;
  email_body: string;
};

const clean = (value: FormDataEntryValue | null, maxLength: number) =>
  String(value ?? "")
    .replace(/[<>\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);

const enumValue = <T extends string>(value: FormDataEntryValue | null, allowed: Set<T>): T | "" => {
  const candidate = clean(value, 80) as T;
  return allowed.has(candidate) ? candidate : "";
};

const allowedRoles = new Set<CarrierRole>(["carrier", "owner_operator", "dispatcher"]);
const allowedEquipment = new Set<CarrierEquipmentClass>([
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
const allowedAuthorityStatus = new Set<AuthorityStatus>(["active", "pending", "inactive", "not_sure"]);
const allowedAuthorityAge = new Set<AuthorityAge>(["under_90_days", "three_to_twelve_months", "over_one_year", "not_sure"]);
const allowedInsuranceStatus = new Set<InsuranceStatus>(["active", "quote_in_progress", "inactive", "not_sure"]);
const allowedFleetSize = new Set<FleetSize>(["one", "two_to_three", "four_to_ten", "eleven_plus"]);
const allowedDispatchStatus = new Set<DispatchStatus>(["self_dispatching", "working_with_dispatcher", "needs_dispatcher", "not_sure"]);

export function buildQualifiedCarrierPayload(formData: FormData): QualifiedCarrierPayload {
  const capacity = Number.parseInt(clean(formData.get("capacity_units"), 3), 10);
  const radius = Number.parseInt(clean(formData.get("origin_radius"), 4), 10);
  return {
    carrier_role: enumValue(formData.get("carrier_role"), allowedRoles),
    contact_name: clean(formData.get("carrier_contact_name"), 100),
    company_name: clean(formData.get("carrier_company_name"), 160),
    authority_number: clean(formData.get("authority_number"), 40).toUpperCase(),
    authority_status: enumValue(formData.get("authority_status"), allowedAuthorityStatus),
    authority_age: enumValue(formData.get("authority_age"), allowedAuthorityAge),
    insurance_status: enumValue(formData.get("insurance_status"), allowedInsuranceStatus),
    fleet_size: enumValue(formData.get("fleet_size"), allowedFleetSize),
    dispatch_status: enumValue(formData.get("dispatch_status"), allowedDispatchStatus),
    email: clean(formData.get("carrier_email"), 160).toLowerCase(),
    phone: clean(formData.get("carrier_phone"), 40),
    equipment_class: enumValue(formData.get("equipment_class"), allowedEquipment),
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

export function reviewQualifiedCarrierPayload(payload: QualifiedCarrierPayload, today = new Date()): QualifiedCarrierReview {
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
    [payload.authority_status, "authority status"],
    [payload.authority_age, "authority age"],
    [payload.insurance_status, "insurance status"],
    [payload.fleet_size, "fleet size"],
    [payload.dispatch_status, "current dispatch status"],
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
      required_actions: ["Complete the carrier, authority, insurance, equipment, availability, and operating-area fields before review."],
      routing,
    };
  }

  if (payload.equipment_class !== "car_hauler") {
    return {
      decision: "scope_review",
      vehicle_state: "submitted_for_review",
      reasons: ["The approved first commercial vertical is car hauling; this equipment requires a separate scope review."],
      required_actions: ["Collect equipment-specific dimensions, payload, capabilities, lanes, and operating requirements before matching."],
      routing,
    };
  }

  if (payload.authority_status === "inactive" || payload.insurance_status === "inactive") {
    return {
      decision: "needs_more_information",
      vehicle_state: "needs_changes",
      reasons: [
        payload.authority_status === "inactive" ? "Operating authority is reported inactive." : "Insurance is reported inactive.",
      ],
      required_actions: ["Confirm active operating authority and insurance before load access or dispatch representation."],
      routing: ["Carrier readiness review queue"],
    };
  }

  const readinessReasons: string[] = [];
  const readinessActions: string[] = ["Verify MC/USDOT, operating authority, insurance, contact, equipment, and capacity details."];

  if (payload.authority_status === "pending" || payload.authority_status === "not_sure") {
    readinessReasons.push("Authority activation requires confirmation before normal carrier onboarding.");
    readinessActions.push("Confirm the authority activation date and current FMCSA status.");
  }
  if (payload.authority_age === "under_90_days" || payload.authority_age === "not_sure") {
    readinessReasons.push("New or unknown authority age may affect broker setup and load availability.");
    readinessActions.push("Review new-authority broker setup, documents, and lane expectations.");
  }
  if (payload.insurance_status === "quote_in_progress" || payload.insurance_status === "not_sure") {
    readinessReasons.push("Insurance readiness requires confirmation before dispatch activation.");
    readinessActions.push("Confirm active policy details and required certificates.");
  }
  if (payload.fleet_size === "eleven_plus") {
    readinessReasons.push("A fleet above ten units requires operating-process and account-ownership review.");
    readinessActions.push("Confirm fleet contacts, dispatch roles, onboarding order, reporting, and account permissions.");
  }
  if (payload.dispatch_status === "working_with_dispatcher") {
    readinessActions.push("Confirm the existing dispatcher relationship and whether a change or non-exclusive arrangement is permitted.");
  } else if (payload.dispatch_status === "needs_dispatcher") {
    readinessActions.push("Route the lead to dispatch-service qualification after authority and insurance verification.");
  } else if (payload.dispatch_status === "not_sure") {
    readinessActions.push("Clarify whether the carrier needs load search, negotiation, paperwork, back-office support, or full dispatch service.");
  }

  if (readinessReasons.length) {
    return {
      decision: "readiness_review",
      vehicle_state: "submitted_for_review",
      reasons: readinessReasons,
      required_actions: readinessActions,
      routing: ["Carrier readiness review queue", ...routing],
    };
  }

  return {
    decision: "dispatcher_review",
    vehicle_state: "submitted_for_review",
    reasons: ["Required car-hauler identity, authority, insurance, fleet, dispatch, availability, geography, and capacity fields are present."],
    required_actions: [
      ...readinessActions,
      "Dispatcher and Logistics Sales decide whether to activate the carrier and which opportunities become visible.",
    ],
    routing,
  };
}

const labels = {
  carrier_role: {
    carrier: "Carrier",
    owner_operator: "Owner-operator",
    dispatcher: "Dispatcher for a carrier",
  },
  equipment_class: {
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
  },
  authority_status: {
    active: "Active",
    pending: "Pending activation",
    inactive: "Inactive",
    not_sure: "Not sure",
  },
  authority_age: {
    under_90_days: "Under 90 days",
    three_to_twelve_months: "3–12 months",
    over_one_year: "Over one year",
    not_sure: "Not sure",
  },
  insurance_status: {
    active: "Active policy",
    quote_in_progress: "Quote / policy in progress",
    inactive: "Not active",
    not_sure: "Not sure",
  },
  fleet_size: {
    one: "1 unit",
    two_to_three: "2–3 units",
    four_to_ten: "4–10 units",
    eleven_plus: "11+ units",
  },
  dispatch_status: {
    self_dispatching: "Self-dispatching",
    working_with_dispatcher: "Working with a dispatcher",
    needs_dispatcher: "Needs dispatch service",
    not_sure: "Not sure",
  },
} as const;

export function buildQualifiedCarrierPreview(payload: QualifiedCarrierPayload, review: QualifiedCarrierReview): string {
  return [
    "Hermes Load Board — Qualified Carrier Sales Lead Preview",
    "Sales tag: LOAD BOARD ACCESS / CARRIER",
    `Decision: ${review.decision}`,
    `Vehicle state: ${review.vehicle_state}`,
    `Role: ${payload.carrier_role ? labels.carrier_role[payload.carrier_role] : ""}`,
    `Contact: ${payload.contact_name}`,
    `Company: ${payload.company_name}`,
    `Authority number: ${payload.authority_number}`,
    `Authority status: ${payload.authority_status ? labels.authority_status[payload.authority_status] : ""}`,
    `Authority age: ${payload.authority_age ? labels.authority_age[payload.authority_age] : ""}`,
    `Insurance status: ${payload.insurance_status ? labels.insurance_status[payload.insurance_status] : ""}`,
    `Fleet size: ${payload.fleet_size ? labels.fleet_size[payload.fleet_size] : ""}`,
    `Current dispatch status: ${payload.dispatch_status ? labels.dispatch_status[payload.dispatch_status] : ""}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Equipment: ${payload.equipment_class ? labels.equipment_class[payload.equipment_class] : ""}`,
    `Capacity / unit count: ${payload.capacity_units}`,
    payload.vehicle_name ? `Vehicle name: ${payload.vehicle_name}` : "",
    payload.interested_load ? `Interested load: ${payload.interested_load}` : "Interested load: free Load Board access",
    `Available from: ${payload.available_from}`,
    `Origin: ${payload.origin_location} (${payload.origin_radius} mi radius)`,
    `Destination: ${payload.anywhere ? "Anywhere" : payload.destination_location}`,
    `Reasons: ${review.reasons.join(" | ")}`,
    `Required actions: ${review.required_actions.join(" | ")}`,
    `Dry-run routing: ${review.routing.join(" | ") || "none"}`,
    "Requested follow-up: Logistics Sales review of authority, insurance, equipment, dispatch needs, access, carrier agreement, and next steps.",
    "Delivery: preview only — no email, account, call, CRM write, load booking, or dispatcher assignment was created automatically.",
  ].filter(Boolean).join("\n");
}

export function buildQualifiedCarrierLead(payload: QualifiedCarrierPayload, review: QualifiedCarrierReview): QualifiedCarrierLead {
  const subjectParts = ["[HERMES SALES]", "[LOAD BOARD ACCESS]", "[CARRIER]"];
  if (payload.authority_status === "pending" || payload.authority_age === "under_90_days") subjectParts.push("[READINESS REVIEW]");
  if (payload.dispatch_status === "needs_dispatcher") subjectParts.push("[DISPATCH SERVICE]");
  if (payload.interested_load) subjectParts.push(`[${payload.interested_load}]`);
  return {
    lead_type: "load_board_access",
    department: "Logistics Sales",
    sales_tag: "LOAD BOARD ACCESS / CARRIER",
    email_subject: subjectParts.join(" "),
    email_body: buildQualifiedCarrierPreview(payload, review),
  };
}

export function buildQualifiedCarrierMailto(lead: QualifiedCarrierLead, recipient = "officeus@hermeslogisticsus.com"): string {
  return `mailto:${recipient}?subject=${encodeURIComponent(lead.email_subject)}&body=${encodeURIComponent(lead.email_body)}`;
}
