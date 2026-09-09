import { carHaulerGeoMarkets } from "./car-hauler-geo-markets";

export type CarrierEquipmentSlug =
  | "car-hauling"
  | "hotshot"
  | "box-truck"
  | "cargo-van"
  | "power-only"
  | "dry-van"
  | "reefer"
  | "flatbed"
  | "step-deck";

export type LoadBoardKey =
  | "central-dispatch"
  | "super-dispatch"
  | "ship-cars"
  | "carsarrive"
  | "runbuggy"
  | "dat"
  | "truckstop"
  | "123loadboard";

export type LoadBoardReference = {
  key: LoadBoardKey;
  name: string;
  publicCarrierPrice: string;
  pricingNote: string;
  marketData: string;
  url: string;
  verifiedOn: string;
};

export type CarrierEquipmentEconomics = {
  slug: CarrierEquipmentSlug;
  label: string;
  loadBoardEquipment: string;
  boards: LoadBoardKey[];
  fitChecks: string[];
  marketFocus: string;
  cityPageIndexing: "index" | "evidence-gated";
};

export const HERMES_DISPATCH_FEE_PCT = 8;
export const HERMES_MODELED_GROSS_UPLIFT_LOW_PCT = 10;
export const HERMES_MODELED_GROSS_UPLIFT_HIGH_PCT = 15;
export const HERMES_BREAK_EVEN_GROSS_UPLIFT_PCT = Number(
  ((1 / (1 - HERMES_DISPATCH_FEE_PCT / 100) - 1) * 100).toFixed(1),
);

export const loadBoardReferences: Record<LoadBoardKey, LoadBoardReference> = {
  "central-dispatch": {
    key: "central-dispatch",
    name: "Central Dispatch",
    publicCarrierPrice: "Core starts at $139.95/mo",
    pricingNote: "Carrier Core pricing shown publicly; taxes and add-ons may apply.",
    marketData: "Price Check; optional Price Check Plus / market intelligence features.",
    url: "https://www.centraldispatch.com/plans",
    verifiedOn: "2026-09-09",
  },
  "super-dispatch": {
    key: "super-dispatch",
    name: "Super Dispatch",
    publicCarrierPrice: "Carrier Pro starts at $55/user/mo",
    pricingNote: "Carrier TMS pricing; Super Loadboard access is included in the carrier product.",
    marketData: "Pricing insights and lane pricing products exist separately; access depends on product/tier.",
    url: "https://superdispatch.com/carrier-pricing/",
    verifiedOn: "2026-09-09",
  },
  "ship-cars": {
    key: "ship-cars",
    name: "Ship.Cars",
    publicCarrierPrice: "$0 Free · $39 Starter · $49/driver Growth",
    pricingNote: "Free is limited; Starter and Growth have different booking/usage limits.",
    marketData: "Trip Builder and load-scouting tools; public pricing does not expose a universal lane-rate benchmark.",
    url: "https://ship.cars/pricing/carriers/",
    verifiedOn: "2026-09-09",
  },
  carsarrive: {
    key: "carsarrive",
    name: "CarsArrive Network",
    publicCarrierPrice: "Public carrier subscription price not verified",
    pricingNote: "Account, eligibility, and commercial terms must be confirmed directly with the source.",
    marketData: "Do not publish a rate benchmark unless current authorized source data is available.",
    url: "https://www.carsarrive.com/",
    verifiedOn: "2026-09-09",
  },
  runbuggy: {
    key: "runbuggy",
    name: "RunBuggy",
    publicCarrierPrice: "Public carrier subscription price not verified",
    pricingNote: "Account, eligibility, and commercial terms must be confirmed directly with the source.",
    marketData: "Do not publish a rate benchmark unless current authorized source data is available.",
    url: "https://runbuggy.com/",
    verifiedOn: "2026-09-09",
  },
  dat: {
    key: "dat",
    name: "DAT One",
    publicCarrierPrice: "$59–$339/mo",
    pricingNote: "Public carrier plans range from Standard through Office; features differ by tier.",
    marketData: "Lane-rate averages and market-condition tools are available on qualifying plans for van, reefer, and flatbed.",
    url: "https://www.dat.com/load-boards",
    verifiedOn: "2026-09-09",
  },
  truckstop: {
    key: "truckstop",
    name: "Truckstop Load Board",
    publicCarrierPrice: "$42 Basic · $135 Advanced · $159 Pro",
    pricingNote: "Public carrier pricing; application fee, taxes, and equipment-specific offers may apply.",
    marketData: "Pro includes rate insights, live loads, lane planning, and load comparison.",
    url: "https://truckstop.com/product/load-board/pricing/",
    verifiedOn: "2026-09-09",
  },
  "123loadboard": {
    key: "123loadboard",
    name: "123Loadboard",
    publicCarrierPrice: "$39 Standard · $59 Premium · $79 Premium Plus",
    pricingNote: "Monthly carrier plans; public pricing says no contracts.",
    marketData: "Premium Plus includes Rate Check; lower tiers focus on search, matching, routing, and credit tools.",
    url: "https://www.123loadboard.com/pricing/",
    verifiedOn: "2026-09-09",
  },
};

const generalBoards: LoadBoardKey[] = ["dat", "truckstop", "123loadboard"];
const autoBoards: LoadBoardKey[] = ["central-dispatch", "super-dispatch", "ship-cars", "carsarrive", "runbuggy"];

export const carrierEquipmentEconomics: Record<CarrierEquipmentSlug, CarrierEquipmentEconomics> = {
  "car-hauling": {
    slug: "car-hauling",
    label: "Car Hauling",
    loadBoardEquipment: "car_hauler",
    boards: autoBoards,
    fitChecks: ["Open vs. enclosed trailer", "Vehicle count and deck position", "INOP capability", "Pickup/delivery access", "Deadhead and reload direction"],
    marketFocus: "Compare vehicle count, total loaded miles, deadhead, pickup constraints, destination direction, and the value of combining multiple vehicles into one profitable route.",
    cityPageIndexing: "index",
  },
  hotshot: {
    slug: "hotshot",
    label: "Hotshot",
    loadBoardEquipment: "hotshot",
    boards: generalBoards,
    fitChecks: ["Deck length", "Payload", "Gooseneck/trailer type", "Securement", "Commodity and CDL fit"],
    marketFocus: "Prioritize total-mile economics, partial/load compatibility, pickup urgency, securement requirements, and a realistic reload radius.",
    cityPageIndexing: "evidence-gated",
  },
  "box-truck": {
    slug: "box-truck",
    label: "Box Truck",
    loadBoardEquipment: "box_truck",
    boards: generalBoards,
    fitChecks: ["Box dimensions", "Payload", "Liftgate", "Dock access", "Pallet/commodity restrictions"],
    marketFocus: "Evaluate local/regional density, dock and liftgate requirements, appointment windows, total miles, and whether a backhaul can be paired without excessive deadhead.",
    cityPageIndexing: "evidence-gated",
  },
  "cargo-van": {
    slug: "cargo-van",
    label: "Cargo Van",
    loadBoardEquipment: "cargo_van",
    boards: generalBoards,
    fitChecks: ["Interior dimensions", "Payload", "Door clearance", "Expedite timing", "Commodity restrictions"],
    marketFocus: "Focus on expedite timing, true all-in miles, pickup radius, delivery urgency, and whether the next reload market improves total-day economics.",
    cityPageIndexing: "evidence-gated",
  },
  "power-only": {
    slug: "power-only",
    label: "Power Only",
    loadBoardEquipment: "power_only",
    boards: generalBoards,
    fitChecks: ["Tractor configuration", "Trailer type", "Bobtail/deadhead", "Drop-and-hook rules", "Customer/broker trailer requirements"],
    marketFocus: "Compare trailer availability, drop-and-hook timing, bobtail miles, detention exposure, and the next trailer or reload opportunity.",
    cityPageIndexing: "evidence-gated",
  },
  "dry-van": {
    slug: "dry-van",
    label: "Dry Van",
    loadBoardEquipment: "dry_van",
    boards: generalBoards,
    fitChecks: ["Trailer length", "Weight", "Commodity", "Live vs. drop", "Appointment and detention risk"],
    marketFocus: "Compare lane benchmark, loaded and deadhead miles, appointment timing, detention exposure, and reload-market strength before approving the load.",
    cityPageIndexing: "evidence-gated",
  },
  reefer: {
    slug: "reefer",
    label: "Reefer",
    loadBoardEquipment: "reefer",
    boards: generalBoards,
    fitChecks: ["Temperature range", "Trailer condition", "Washout", "Commodity compatibility", "Appointment and detention risk"],
    marketFocus: "Evaluate rate against total miles plus temperature, washout, fuel, appointment, detention, and reload constraints rather than loaded RPM alone.",
    cityPageIndexing: "evidence-gated",
  },
  flatbed: {
    slug: "flatbed",
    label: "Flatbed",
    loadBoardEquipment: "flatbed",
    boards: generalBoards,
    fitChecks: ["Deck length", "Weight", "Tarping", "Securement", "Commodity dimensions"],
    marketFocus: "Compare rate with tarping/securement work, dimensions, total miles, appointment windows, and the quality of the reload market.",
    cityPageIndexing: "evidence-gated",
  },
  "step-deck": {
    slug: "step-deck",
    label: "Step Deck",
    loadBoardEquipment: "step_deck",
    boards: generalBoards,
    fitChecks: ["Deck dimensions", "Loaded height", "Weight", "Tarping/securement", "Permit implications"],
    marketFocus: "Evaluate cargo dimensions, loaded height, securement, permit risk, total miles, and the probability of a compatible reload before accepting a lane.",
    cityPageIndexing: "evidence-gated",
  },
};

export const carrierMarketAnchors = carHaulerGeoMarkets.map(({ slug, city, state, stateName, region, nearby }) => ({
  slug,
  city,
  state,
  stateName,
  region,
  nearby,
}));

export function getRelevantBoards(equipment: CarrierEquipmentSlug) {
  return carrierEquipmentEconomics[equipment].boards.map((key) => loadBoardReferences[key]);
}

export function getEquipmentByRecommendationId(recommendationId: string): CarrierEquipmentSlug | null {
  const map: Record<string, CarrierEquipmentSlug> = {
    "carrier-car-hauling": "car-hauling",
    "carrier-hotshot": "hotshot",
    "carrier-box-truck": "box-truck",
    "carrier-cargo-van": "cargo-van",
    "carrier-power-only": "power-only",
    "carrier-dry-van": "dry-van",
    "carrier-reefer": "reefer",
    "carrier-flatbed": "flatbed",
    "carrier-step-deck": "step-deck",
  };
  return map[recommendationId] ?? null;
}

export function marketPageHref(equipment: CarrierEquipmentSlug, marketSlug: string) {
  if (equipment === "car-hauling") return `/logistics/car-hauler-loads/${marketSlug}/`;
  return `/logistics/equipment-market/${equipment}/${marketSlug}/`;
}
