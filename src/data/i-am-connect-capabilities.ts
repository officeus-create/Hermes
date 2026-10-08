export type IAmCapabilityState = "prototype" | "research" | "blocked" | "future";

export type IAmCapability = {
  id: string;
  label: string;
  state: IAmCapabilityState;
  country: "IT" | "GLOBAL";
  userValue: string;
  currentTruth: string;
  nextGate: string;
  privateDataAllowed: boolean;
};

export const iamConnectCapabilities: readonly IAmCapability[] = Object.freeze([
  {
    id: "intent-router",
    label: "Intent Router",
    state: "prototype",
    country: "GLOBAL",
    userValue: "Turn one natural-language request into one or more proposed journey modules.",
    currentTruth: "Current public prototype is deterministic text routing only; no production voice model or autonomous submission.",
    nextGate: "Real-user task tests, unsupported-intent rate, consent and provider handoff design.",
    privateDataAllowed: false,
  },
  {
    id: "italy-shopping-shortlist",
    label: "Italy Shopping Shortlist",
    state: "prototype",
    country: "IT",
    userValue: "Build a temporary list of public merchant candidates before or during travel.",
    currentTruth: "Device-local demo can save allowlisted merchant IDs only after explicit user opt-in.",
    nextGate: "Authenticated Hermes Connect workspace, retention controls and real partner inventory/offer evidence.",
    privateDataAllowed: false,
  },
  {
    id: "italy-tax-free-guidance",
    label: "Italy Tax Free Guidance",
    state: "research",
    country: "IT",
    userValue: "Explain general eligibility and direct travellers to official Italian channels.",
    currentTruth: "Information-only guidance. I am does not issue invoices, validate customs exports or pay refunds.",
    nextGate: "Legal review plus authorized merchant/operator/OTELLO/PSP relationship before operational actions.",
    privateDataAllowed: false,
  },
  {
    id: "affiliate-commerce",
    label: "Affiliate Commerce",
    state: "blocked",
    country: "IT",
    userValue: "Route users through approved merchant programmes and measure verified attributable sales.",
    currentTruth: "Public affiliate programmes were discovered, but no I am publisher approval, tracked link, sale or payout is verified.",
    nextGate: "Legal entity and publisher approval, compliant tracking links, consent/disclosure, sale and payout reconciliation.",
    privateDataAllowed: false,
  },
  {
    id: "travel-mobility",
    label: "Travel & Mobility",
    state: "research",
    country: "GLOBAL",
    userValue: "Help a traveller identify flights, transport and vehicle-rental options with source-backed provider rules.",
    currentTruth: "Concept only; no live booking inventory or merchant integration is active.",
    nextGate: "Permissioned provider adapters and truthful availability/price evidence.",
    privateDataAllowed: false,
  },
  {
    id: "company-formation",
    label: "Company Formation",
    state: "future",
    country: "GLOBAL",
    userValue: "Guide a user through official jurisdiction requirements and approved formation providers.",
    currentTruth: "Concept only. No legal formation, KYC, signatures or filings are performed.",
    nextGate: "Country-by-country legal/provider review and authenticated identity/consent model.",
    privateDataAllowed: false,
  },
  {
    id: "documents-registrations",
    label: "Documents & Registrations",
    state: "future",
    country: "GLOBAL",
    userValue: "Create a sourced checklist and status view for permitted administrative procedures.",
    currentTruth: "Concept only; no official form submission or document custody.",
    nextGate: "Official API/provider authority, privacy/retention review and human escalation.",
    privateDataAllowed: false,
  },
  {
    id: "cross-device-workspace",
    label: "Cross-device Private Workspace",
    state: "blocked",
    country: "GLOBAL",
    userValue: "Keep approved journeys, receipts and status across devices.",
    currentTruth: "Current demo is not an authenticated I am account and does not provide cross-device sync.",
    nextGate: "Reuse Hermes Connect authenticated Identity/Workspace/Role/Consent with retention and deletion controls.",
    privateDataAllowed: false,
  },
]);

export const iamCapabilityCounts = Object.freeze(
  iamConnectCapabilities.reduce((counts, capability) => {
    counts[capability.state] += 1;
    return counts;
  }, { prototype: 0, research: 0, blocked: 0, future: 0 } as Record<IAmCapabilityState, number>),
);
