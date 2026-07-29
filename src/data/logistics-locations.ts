export type LogisticsLocationAudience = "DEALER" | "SHIPPER";

export type LogisticsLocationPlanningNote = {
  title: string;
  body: string;
};

export type LogisticsLocationFaq = {
  question: string;
  answer: string;
};

export type VerifiedPublicLocationDetail = {
  verificationStatus: "HERMES_VERIFIED";
  exactAddress?: string;
  zipCode?: string;
};

export type LogisticsLocation = {
  slug: string;
  city: string;
  state: string;
  stateName: string;
  market: string;
  targetAudiences: LogisticsLocationAudience[];
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  planningNotes: LogisticsLocationPlanningNote[];
  faqs: LogisticsLocationFaq[];
  publicLocationDetail?: VerifiedPublicLocationDetail;
};

type LocationInput = Omit<LogisticsLocation, "title" | "metaTitle" | "metaDescription" | "summary" | "faqs"> & {
  localFaq: LogisticsLocationFaq;
};

const makeLocation = (input: LocationInput): LogisticsLocation => {
  const place = `${input.city}, ${input.stateName}`;
  const { localFaq, ...location } = input;

  return {
    ...location,
    title: `Vehicle transport requests to and from ${place}.`,
    metaTitle: `${input.city}, ${input.state} Vehicle Transport | Hermes Logistics`,
    metaDescription: `Prepare a vehicle transport request involving ${place}. Hermes reviews route, condition, timing, access, and equipment fit first.`,
    summary: `Use this page to prepare a vehicle transport request involving ${place}. Hermes reviews the route, vehicle details, timing, access, and equipment fit before discussing a possible carrier match.`,
    faqs: [
      {
        question: `How is vehicle transport involving ${input.city} priced?`,
        answer: "Pricing depends on the full route, vehicle count and condition, equipment type, access, timing, and current carrier availability. Submit the complete request for review instead of relying on a fixed public rate.",
      },
      {
        question: "Does submitting the request guarantee pickup or delivery?",
        answer: "No. Submission starts a review; it is not a booking or a guarantee. Timing and capacity are discussed only after the route, vehicle, access, and carrier fit are evaluated.",
      },
      {
        question: "Can inoperable or modified vehicles be reviewed?",
        answer: "Yes, but the condition and any loading constraints must be disclosed. Winch capability, clearance, dimensions, keys, brakes, steering, and safe site access can change the equipment required.",
      },
      {
        question: "What information should a dealer or shipper prepare?",
        answer: "Provide exact pickup and delivery points privately, VIN or vehicle details, quantity, operable status, ready date, facility hours, release documents, and a contact at each location.",
      },
      localFaq,
    ],
  };
};

/**
 * Public pages are limited to city/state markets. The source conversations also
 * contained addresses, ZIPs, fee percentages, and performance promises that
 * were not verified as Hermes facts; none of those values are published here.
 */
export const publishedLogisticsLocations: LogisticsLocation[] = [
  makeLocation({
    slug: "appleton-wi-vehicle-transport",
    city: "Appleton",
    state: "WI",
    stateName: "Wisconsin",
    market: "Fox Valley · I-41",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "Fox Valley route context",
        body: "Appleton requests often connect the Fox Valley with Wisconsin and interstate destinations. The complete origin and destination determine whether the move fits available equipment.",
      },
      {
        title: "Facility and residential access",
        body: "Dealer, auction, business, and residential pickups require different release steps and loading access. Share facility hours, gate instructions, and a safe meeting point.",
      },
      {
        title: "Weather and readiness",
        body: "Winter conditions can affect loading areas and timing. Confirm that the vehicle is released, accessible, and accurately described before a pickup window is discussed.",
      },
    ],
    localFaq: {
      question: "What should an Appleton-area pickup request include?",
      answer: "Include the precise pickup type, release contact, ready date, vehicle condition, and whether the carrier can safely enter and load at the stated location. Exact addresses are collected privately.",
    },
  }),
  makeLocation({
    slug: "pueblo-co-vehicle-transport",
    city: "Pueblo",
    state: "CO",
    stateName: "Colorado",
    market: "Southern Colorado · I-25",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "Southern Colorado routing",
        body: "Pueblo requests may connect north along the Front Range or continue to longer interstate lanes. Both endpoints are needed before equipment and route fit can be reviewed.",
      },
      {
        title: "Loading-point verification",
        body: "A city reference is not a pickup address. Provide the exact facility or meeting point privately, along with access limits, release instructions, and an on-site contact.",
      },
      {
        title: "Elevation and weather",
        body: "Front Range weather and elevation changes can affect timing and operating conditions. Flexible dates help, but no pickup window is confirmed before carrier review.",
      },
    ],
    localFaq: {
      question: "Is the Pueblo page a Hermes terminal or storage location?",
      answer: "No. This is a market-specific request guide, not a claim that Hermes owns or operates a terminal, yard, office, or storage facility in Pueblo.",
    },
  }),
  makeLocation({
    slug: "colorado-springs-co-vehicle-transport",
    city: "Colorado Springs",
    state: "CO",
    stateName: "Colorado",
    market: "Front Range · I-25",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "Front Range route review",
        body: "Colorado Springs moves can involve dense north-south traffic as well as regional origins and destinations. Route direction, dates, and vehicle count are reviewed together.",
      },
      {
        title: "Urban and facility access",
        body: "Residential streets, dealer lots, auctions, and commercial sites have different loading constraints. Note gates, hours, clearance, and any off-site meeting requirement.",
      },
      {
        title: "Condition accuracy",
        body: "State whether each vehicle starts, steers, brakes, and rolls. A vehicle described only as “inoperable” may still need a more specific equipment review.",
      },
    ],
    localFaq: {
      question: "Can a Colorado Springs request include more than one vehicle?",
      answer: "Yes. List every vehicle and its condition, dimensions if non-standard, release status, and whether all units share the same pickup and delivery points.",
    },
  }),
  makeLocation({
    slug: "springfield-mo-vehicle-transport",
    city: "Springfield",
    state: "MO",
    stateName: "Missouri",
    market: "Southwest Missouri · I-44",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "Regional lane context",
        body: "Springfield can serve as a regional origin, destination, or midpoint in a longer move. The request must identify the true endpoints rather than only a nearby metro.",
      },
      {
        title: "Pickup readiness",
        body: "Confirm title or release requirements, keys, facility hours, and the responsible contact before requesting a pickup window.",
      },
      {
        title: "Equipment fit",
        body: "Standard passenger vehicles may fit open or enclosed transport, while modified, oversized, or non-running units require additional dimensions and loading details.",
      },
    ],
    localFaq: {
      question: "Does Hermes publish a fixed Springfield vehicle-shipping rate?",
      answer: "No. A fixed city rate would omit the destination, equipment, vehicle condition, access, timing, and live capacity. Those inputs are reviewed before a price can be discussed.",
    },
  }),
  makeLocation({
    slug: "puyallup-wa-vehicle-transport",
    city: "Puyallup",
    state: "WA",
    stateName: "Washington",
    market: "South Puget Sound · SR 167 / SR 512",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "South Sound timing",
        body: "Puyallup-area requests can be affected by metro traffic and facility windows. Provide realistic availability rather than a single assumed arrival time.",
      },
      {
        title: "Exact site access",
        body: "Car carriers need safe loading space. Flag narrow streets, gated properties, low branches, steep grades, or facilities that require an alternate meeting point.",
      },
      {
        title: "Release coordination",
        body: "Auction, dealer, and commercial releases can require buyer numbers, gate passes, or scheduled access. Include the applicable process in the private request.",
      },
    ],
    localFaq: {
      question: "Can the carrier load on any residential street in Puyallup?",
      answer: "Not necessarily. The driver must evaluate legal and safe access. A nearby wide, permitted meeting point may be needed when the pickup address cannot accommodate a carrier.",
    },
  }),
  makeLocation({
    slug: "university-park-il-vehicle-transport",
    city: "University Park",
    state: "IL",
    stateName: "Illinois",
    market: "South Chicagoland · I-57",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "South Chicagoland routing",
        body: "University Park requests can connect local facilities with the broader Chicago market or interstate lanes. Traffic, tolls, and appointment windows may affect planning.",
      },
      {
        title: "Facility instructions",
        body: "Share the actual pickup type and private address, plus gate procedures, hours, release identifiers, and contact details for the responsible facility.",
      },
      {
        title: "Multi-vehicle accuracy",
        body: "For dealer or commercial lots, provide a unit-level list. A total count without condition and release details can delay equipment review.",
      },
    ],
    localFaq: {
      question: "Is University Park treated as a guaranteed Chicago pickup?",
      answer: "No. It is reviewed as its actual origin or destination. Capacity, access, and timing must be confirmed for the specific request.",
    },
  }),
  makeLocation({
    slug: "saint-paul-mn-vehicle-transport",
    city: "Saint Paul",
    state: "MN",
    stateName: "Minnesota",
    market: "Twin Cities · I-94 / I-35E",
    targetAudiences: ["SHIPPER"],
    planningNotes: [
      {
        title: "Twin Cities route context",
        body: "Saint Paul requests may involve urban traffic, regional distribution, or longer interstate moves. The full lane and date range determine the operating review.",
      },
      {
        title: "Commercial handoff",
        body: "Business and fleet shipments should include a unit list, release authority, facility hours, and one accountable contact at each end.",
      },
      {
        title: "Winter preparation",
        body: "Snow, ice, and cold can affect safe loading and vehicle readiness. Clear access and disclose battery, tire, or mechanical limitations before pickup planning.",
      },
    ],
    localFaq: {
      question: "What can delay a Saint Paul commercial pickup?",
      answer: "Incomplete release documents, blocked or unsafe access, inaccurate operability details, severe weather, and narrow facility windows can all require a revised plan.",
    },
  }),
  makeLocation({
    slug: "royal-oak-mi-vehicle-transport",
    city: "Royal Oak",
    state: "MI",
    stateName: "Michigan",
    market: "Detroit metro · I-75 / I-696",
    targetAudiences: ["SHIPPER"],
    planningNotes: [
      {
        title: "Detroit-metro coordination",
        body: "Royal Oak requests can involve dealer, fleet, commercial, or residential handoffs within a dense metro network. The true pickup and delivery points matter.",
      },
      {
        title: "Safe loading access",
        body: "Confirm whether the site can receive a full-size carrier. If not, identify a safe meeting point that both the vehicle contact and driver can use.",
      },
      {
        title: "Unit and release controls",
        body: "Commercial shipments should reconcile VINs or unit identifiers, condition, keys, and release status before dispatch coordination begins.",
      },
    ],
    localFaq: {
      question: "Can a Royal Oak shipper submit recurring volume?",
      answer: "Yes, recurring needs can be described, but each lane and operating arrangement still requires review. The page does not promise dedicated or guaranteed capacity.",
    },
  }),
  makeLocation({
    slug: "evanston-il-vehicle-transport",
    city: "Evanston",
    state: "IL",
    stateName: "Illinois",
    market: "Chicago North Shore · US 41 / I-94",
    targetAudiences: ["SHIPPER"],
    planningNotes: [
      {
        title: "North Shore access",
        body: "Evanston pickups may have street, parking, or loading-space constraints. Include a safe loading plan rather than assuming the carrier can stop at the exact address.",
      },
      {
        title: "Metro timing",
        body: "Chicago-area traffic and facility schedules can narrow feasible windows. A date range is reviewed more reliably than an unconfirmed exact time.",
      },
      {
        title: "Private and commercial releases",
        body: "The required handoff differs for a residence, dealer, auction, fleet, or business. Identify the location type and authorized contact.",
      },
    ],
    localFaq: {
      question: "What if an Evanston street cannot accommodate a car carrier?",
      answer: "Provide that constraint in advance. The parties may need to agree on a nearby safe and legal meeting location before pickup can be confirmed.",
    },
  }),
  makeLocation({
    slug: "englewood-co-vehicle-transport",
    city: "Englewood",
    state: "CO",
    stateName: "Colorado",
    market: "Denver metro · US 285 / I-25",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "Denver-metro route fit",
        body: "Englewood requests can connect local facilities, Front Range markets, or longer lanes. The origin, destination, date range, and vehicle count are reviewed together.",
      },
      {
        title: "Site constraints",
        body: "Flag low clearance, gated access, tight lots, residential restrictions, or loading rules. Those details can change the feasible meeting point.",
      },
      {
        title: "Front Range conditions",
        body: "Elevation and weather changes can affect timing outside the metro. No exact window is promised before the carrier and operating conditions are reviewed.",
      },
    ],
    localFaq: {
      question: "Are Englewood and Denver interchangeable in a request?",
      answer: "No. Use the exact city and private address for each endpoint. Nearby city names are useful context but do not replace the actual route.",
    },
  }),
  makeLocation({
    slug: "chicago-il-vehicle-transport",
    city: "Chicago",
    state: "IL",
    stateName: "Illinois",
    market: "Chicago metro · interstate network",
    targetAudiences: ["SHIPPER"],
    planningNotes: [
      {
        title: "Metro route planning",
        body: "Chicago requests require the precise endpoint, not only the city name. Congestion, tolls, commercial restrictions, and facility appointments can affect the review.",
      },
      {
        title: "Facility and curb access",
        body: "A carrier may not be able to enter every street or property. Disclose access limitations and be prepared to coordinate a safe meeting location.",
      },
      {
        title: "Commercial shipment controls",
        body: "For multiple vehicles, share a complete unit list, condition, release status, facility hours, and a clear escalation contact.",
      },
    ],
    localFaq: {
      question: "Does a Chicago request include every suburb automatically?",
      answer: "No. Each pickup and delivery point must be stated accurately. A metro label does not define the actual mileage, access, or carrier fit.",
    },
  }),
  makeLocation({
    slug: "austin-tx-vehicle-transport",
    city: "Austin",
    state: "TX",
    stateName: "Texas",
    market: "Central Texas · I-35",
    targetAudiences: ["SHIPPER"],
    planningNotes: [
      {
        title: "Central Texas timing",
        body: "Austin-area congestion and rapid development can affect access and estimated windows. Provide a realistic date range and a reachable local contact.",
      },
      {
        title: "Property access",
        body: "Gated communities, parking structures, construction zones, and tight commercial sites may require an alternate loading point.",
      },
      {
        title: "Heat and vehicle readiness",
        body: "Confirm that vehicles are accessible and accurately described, including battery or mechanical issues. Condition details help prevent failed loading attempts.",
      },
    ],
    localFaq: {
      question: "Can an Austin commercial shipper request recurring lanes?",
      answer: "Yes. Share the expected origins, destinations, frequency, volume, equipment needs, and operating constraints. Any recurring arrangement remains subject to review and agreed terms.",
    },
  }),
  makeLocation({
    slug: "milwaukee-wi-vehicle-transport",
    city: "Milwaukee",
    state: "WI",
    stateName: "Wisconsin",
    market: "Southeast Wisconsin · I-94 / I-43",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "Southeast Wisconsin routing",
        body: "Milwaukee requests may connect local, regional, or interstate lanes. The exact endpoints and timing are needed before a carrier fit can be evaluated.",
      },
      {
        title: "Urban loading access",
        body: "Residential streets, downtown sites, dealerships, and auctions have different loading conditions. Identify access limits and release procedures in advance.",
      },
      {
        title: "Seasonal readiness",
        body: "Winter weather can affect loading areas and transit estimates. Ensure the vehicle can be reached safely and disclose operability issues.",
      },
    ],
    localFaq: {
      question: "Is Milwaukee covered by a fixed Wisconsin vehicle-transport price?",
      answer: "No. The destination, vehicle, equipment, timing, access, and current capacity must be reviewed. A statewide fixed price would not represent the actual move.",
    },
  }),
  makeLocation({
    slug: "littleton-co-vehicle-transport",
    city: "Littleton",
    state: "CO",
    stateName: "Colorado",
    market: "Southwest Denver metro · C-470 / US 85",
    targetAudiences: ["DEALER", "SHIPPER"],
    planningNotes: [
      {
        title: "Southwest metro routing",
        body: "Littleton requests can involve metro, foothill, Front Range, or interstate segments. Exact endpoints and road access are required for a meaningful review.",
      },
      {
        title: "Grade and clearance details",
        body: "Steep drives, narrow streets, low trees, gated access, or restricted lots can prevent direct carrier entry. Share those constraints before scheduling is discussed.",
      },
      {
        title: "Weather and equipment",
        body: "Conditions can change quickly near the foothills. Vehicle condition, equipment fit, and a safe loading point must be confirmed.",
      },
    ],
    localFaq: {
      question: "Can a Littleton pickup be arranged from a foothill property?",
      answer: "It can be reviewed, but direct access is not assumed. Road width, grade, clearance, turn space, weather, and a possible alternate meeting point all matter.",
    },
  }),
];

/**
 * These appeared later in source research but do not yet have enough approved
 * operating evidence for public SEO pages. They remain intentionally unpublished.
 */
export const pendingLogisticsLocationSignals = [
  { city: "Merriam", state: "KS", status: "HOLD_FOR_COMPLETED_SHIPMENT_EVIDENCE" },
  { city: "San Martin", state: "CA", status: "HOLD_FOR_COMPLETED_SHIPMENT_EVIDENCE" },
  { city: "Watsonville", state: "CA", status: "HOLD_FOR_COMPLETED_SHIPMENT_EVIDENCE" },
] as const;
