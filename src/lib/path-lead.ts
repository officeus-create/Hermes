export type HermesPathLead = {
  idempotencyKey: string;
  sessionId: string;
  createdAt: string;
  locale: string;
  direction: "logistics" | "marketing" | "academy" | "technology";
  role: string;
  primaryNeed: string;
  selections: Record<string, string | string[]>;
  recommendationId: string;
  resultRoute: string;
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    preferredChannel?: string;
    preferredLanguage?: string;
    bestContactTime?: string;
  };
  attribution: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
    referrer?: string;
    landingPage?: string;
  };
  consent: {
    privacyAccepted: boolean;
    marketingAccepted?: boolean;
    timestamp: string;
  };
  routing: {
    department: string;
    queue: string;
    priority: "normal" | "high";
    nextAction: string;
  };
};

const queueByRole: Record<string, HermesPathLead["routing"]> = {
  carrier: { department: "Logistics Sales", queue: "LOGISTICS_CARRIER_SALES", priority: "normal", nextAction: "Verify carrier and assign onboarding owner" },
  "owner-operator": { department: "Logistics Sales", queue: "LOGISTICS_DISPATCH_ONBOARDING", priority: "normal", nextAction: "Verify carrier and schedule service-fit call" },
  "fleet-owner": { department: "Logistics Operations", queue: "LOGISTICS_DISPATCH_ONBOARDING", priority: "high", nextAction: "Review fleet scope and assign operating owner" },
  shipper: { department: "Shipper/Dealer", queue: "LOGISTICS_SHIPPER_DEALER", priority: "high", nextAction: "Qualify transportation request" },
  dealer: { department: "Shipper/Dealer", queue: "LOGISTICS_SHIPPER_DEALER", priority: "high", nextAction: "Qualify inventory movement" },
  "private-customer": { department: "Customer Transport", queue: "LOGISTICS_CUSTOMER_TRANSPORT", priority: "normal", nextAction: "Qualify vehicle transportation request" },
  broker: { department: "Carrier Capacity", queue: "LOGISTICS_BROKER_CAPACITY", priority: "high", nextAction: "Verify load and capacity requirements" },
  driver: { department: "Recruiting", queue: "LOGISTICS_DRIVER_RECRUITING", priority: "normal", nextAction: "Review candidate application" },
  "agency-partner": { department: "Agency Development", queue: "LOGISTICS_AGENCY_DEVELOPMENT", priority: "normal", nextAction: "Review agency fit" },
};

const cleanChoice = (value: unknown) => String(value ?? "").replace(/[^a-z0-9-]/gi, "").slice(0, 80);

export function buildLogisticsLeadDraft(input: {
  idempotencyKey: string;
  sessionId: string;
  locale?: string;
  selections: Record<string, string | string[]>;
  recommendationId: string;
  resultRoute: string;
  contact?: HermesPathLead["contact"];
  attribution?: HermesPathLead["attribution"];
  privacyAccepted: boolean;
  createdAt?: string;
}): HermesPathLead {
  const role = cleanChoice(input.selections.role);
  const primaryNeed = cleanChoice(input.selections["carrier-need"] ?? input.selections["customer-cargo"] ?? "");
  return {
    idempotencyKey: input.idempotencyKey,
    sessionId: input.sessionId,
    createdAt: input.createdAt ?? new Date().toISOString(),
    locale: input.locale ?? "en",
    direction: "logistics",
    role,
    primaryNeed,
    selections: Object.fromEntries(Object.entries(input.selections).map(([key, value]) => [
      cleanChoice(key),
      Array.isArray(value) ? value.map(cleanChoice).slice(0, 10) : cleanChoice(value),
    ])),
    recommendationId: cleanChoice(input.recommendationId),
    resultRoute: input.resultRoute.startsWith("/paths/logistics/") ? input.resultRoute : "/paths/logistics/guidance/",
    contact: input.contact ?? {},
    attribution: input.attribution ?? {},
    consent: { privacyAccepted: input.privacyAccepted, timestamp: input.createdAt ?? new Date().toISOString() },
    routing: queueByRole[role] ?? {
      department: "Logistics Sales",
      queue: "LOGISTICS_CARRIER_SALES",
      priority: "normal",
      nextAction: "Clarify request and reroute",
    },
  };
}

export function toAnalyticsDimensions(lead: HermesPathLead) {
  const equipment = lead.selections.equipment;
  return {
    direction: lead.direction,
    role: lead.role,
    need: lead.primaryNeed,
    recommendationId: lead.recommendationId,
    equipmentCategory: Array.isArray(equipment) ? equipment[0] : equipment,
    locale: lead.locale,
    resultRoute: lead.resultRoute,
  };
}

