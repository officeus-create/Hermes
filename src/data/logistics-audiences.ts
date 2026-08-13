export type LogisticsAudience = {
  slug: "shipper-dealer" | "broker" | "carrier" | "agency" | "careers";
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  needs: string[];
  steps: { title: string; body: string }[];
  faq: { question: string; answer: string }[];
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  demo?: { label: string; href: string };
};

export const logisticsAudiences: LogisticsAudience[] = [
  {
    slug: "shipper-dealer",
    label: "Shipper or dealer",
    eyebrow: "Move vehicles",
    title: "Prepare a vehicle transportation request for review.",
    summary: "For dealerships, auctions, shippers, and businesses that need vehicles or compatible equipment moved between locations.",
    needs: ["Vehicle and pickup details", "Delivery location and ready date", "Operable or inoperable condition", "Open, enclosed, multi-car, or loading requirements", "Carrier authority, insurance, equipment, and operating-fit review"],
    steps: [
      { title: "Describe the move", body: "Add the route, vehicle details, quantity, condition, equipment preference, and pickup timing." },
      { title: "Request qualification", body: "The direct intake checks completeness and identifies release, loading, equipment, capacity, access, or timing questions." },
      { title: "Carrier review", body: "Before an option is represented as confirmed, available carrier information is checked for identity and operating authority, insurance context, equipment and capacity fit, geography, timing, vehicle condition, access requirements, and the documents needed for the move." },
      { title: "Confirm the next step", body: "Logistics Sales presents only the information available for review. The authorized customer and motor carrier separately confirm the applicable terms, assignment, pickup requirements, and transportation arrangement." },
    ],
    faq: [
      { question: "Is a carrier match guaranteed after I submit a request?", answer: "No. Submission starts a review for fit and availability; matching depends on route, timing, equipment, release status, and carrier capacity at that moment." },
      { question: "What does the carrier review check?", answer: "The review can include the carrier's identity and available operating-authority information, insurance context relevant to the move, equipment and practical capacity, route and schedule fit, vehicle condition, pickup and delivery access, required documents, and the contact path for updates or exceptions. The review uses information available at that time and does not guarantee future availability, performance, safety, delivery timing, or an insurance outcome." },
      { question: "Does carrier review mean the move is already booked?", answer: "No. Review does not create a booking or carrier assignment. The authorized customer and motor carrier must separately review and accept the applicable terms and transportation documents before the arrangement is confirmed." },
      { question: "What if my vehicle is inoperable?", answer: "State whether it starts, rolls, steers, and brakes. Inoperable units may need a winch, forklift, different access, or other equipment review before routing." },
      { question: "Can I set a target price?", answer: "Yes. A target price is optional context for review and discussion, not a guaranteed final rate." },
    ],
    primary: { label: "Prepare transport request", href: "/logistics/request-vehicle-transport/?role=shipper#transport-intake" },
    secondary: { label: "Call Logistics Sales", href: "tel:+12623023626" },
    demo: { label: "Post a load in the Load Board demo", href: "/load-board/#post-load" },
  },
  {
    slug: "broker",
    label: "Broker",
    eyebrow: "Carrier capacity",
    title: "Bring a car-hauling opportunity to the right operating team.",
    summary: "For brokers who need compatible carrier capacity, clear communication, and a structured route for vehicle transport opportunities.",
    needs: ["Pickup and delivery", "Commodity and equipment fit", "Timing and price context", "Broker and load verification details"],
    steps: [
      { title: "Prepare the opportunity", body: "Enter the operational details a carrier needs to evaluate the move." },
      { title: "Check compatibility", body: "Unusual, oversized, multi-unit, or inoperable equipment is held for additional requirements." },
      { title: "Route by fit", body: "Logistics Sales reviews qualified opportunities before any carrier notification or capacity confirmation." },
    ],
    faq: [
      { question: "Do you guarantee capacity for every opportunity?", answer: "No. Each request is checked for equipment, route, timing, release, and operating fit; carrier availability is not guaranteed." },
      { question: "What verification details do you need?", answer: "Standard broker and load verification details, together with commodity, route, timing, equipment, and contact information needed for an accurate review." },
      { question: "How are oversized or unusual loads handled?", answer: "They are held for additional requirements rather than routed automatically because equipment, permits, dimensions, and operating fit may vary." },
    ],
    primary: { label: "Prepare broker opportunity", href: "/logistics/request-vehicle-transport/?role=broker#transport-intake" },
    secondary: { label: "Call Logistics Sales", href: "tel:+12623023626" },
    demo: { label: "Open broker Load Board demo", href: "/load-board/#post-load" },
  },
  {
    slug: "carrier",
    label: "Carrier or owner-operator",
    eyebrow: "Find work and support",
    title: "Request car-hauling dispatch support for your operation.",
    summary: "For carriers, owner-operators, and fleets looking for load research, dispatch support, document coordination, and a clearer operating plan.",
    needs: ["MC/DOT and authority status", "Insurance readiness", "Trailer type and capacity", "Current location, preferred lanes, and availability"],
    steps: [
      { title: "Describe your operation", body: "Share authority, insurance, equipment, capacity, geography, availability, and current dispatch status." },
      { title: "Confirm the fit", body: "Hermes reviews whether the next step is dispatcher review, readiness review, or scope clarification." },
      { title: "Choose the relationship", body: "Discuss dispatch support or a broader operating relationship while retaining final load approval." },
    ],
    faq: [
      { question: "Do I have to accept every load Hermes presents?", answer: "No. You review and approve every load. Nothing is booked without your confirmation." },
      { question: "What do you need from me to get started?", answer: "MC/DOT and authority status, insurance readiness, equipment and capacity, current location, preferred lanes, availability, and operating constraints." },
      { question: "Can new authorities apply?", answer: "Yes, subject to a readiness review covering authority age, insurance, documents, equipment, and broker requirements." },
    ],
    primary: { label: "Start dispatch review", href: "/logistics/start-car-hauling-dispatch/" },
    secondary: { label: "Open Load Board demo", href: "/load-board/#available-loads" },
  },
  {
    slug: "agency",
    label: "Open an agency",
    eyebrow: "Build under the Hermes system",
    title: "Apply to discuss opening a remote logistics agency.",
    summary: "For experienced operators who want to discuss building an agency under the Hermes brand, operating standards, and support structure.",
    needs: ["Location and languages", "Logistics and management experience", "Existing team or hiring capacity", "Business goals and available time"],
    steps: [
      { title: "Submit an application", body: "Describe your experience, market, team, and reason for exploring an agency." },
      { title: "Initial fit review", body: "Hermes evaluates the operating fit before discussing structure or commercial terms." },
      { title: "Define a pilot", body: "Any approved path begins with responsibilities, training, controls, and measurable expectations." },
    ],
    faq: [
      { question: "Does applying guarantee an agency will open?", answer: "No. Hermes reviews operating fit, experience, market, resources, and current priorities before any structure or terms are discussed." },
      { question: "What experience is required?", answer: "Relevant logistics or management experience, an existing team or realistic hiring capacity, and clear business goals." },
      { question: "What happens after the initial review?", answer: "A suitable application may move to a defined pilot discussion with responsibilities, training, controls, and measurable expectations." },
    ],
    primary: { label: "Start agency application", href: "/logistics/apply/?for=agency" },
  },
  {
    slug: "careers",
    label: "Work with us",
    eyebrow: "Careers",
    title: "Apply for a logistics, sales, or operations role.",
    summary: "For candidates interested in carrier sales, dealer and shipper outreach, dispatch support, operations, or another relevant Hermes role.",
    needs: ["Location and time zone", "Languages", "Relevant experience", "Role interest and availability"],
    steps: [
      { title: "Complete the application", body: "Share factual experience, results, availability, and the role you want to explore." },
      { title: "Role review", body: "The team compares your background with current needs; an application does not guarantee placement." },
      { title: "Interview or training path", body: "A suitable candidate may be invited to an interview, test, or relevant Academy path." },
    ],
    faq: [
      { question: "Does submitting an application guarantee an interview or a job?", answer: "No. Applications are compared with current needs, and not every applicant is invited to an interview or training path." },
      { question: "What should I include in my application?", answer: "Your location and time zone, languages, relevant experience and measurable results, availability, and the role you want to explore." },
      { question: "Is training available if I do not have direct experience?", answer: "Some candidates may be invited to a relevant Academy path or practice opportunity, but participation, employment, and future paid work are not guaranteed." },
    ],
    primary: { label: "Start job application", href: "/logistics/apply/?for=career" },
    secondary: { label: "Explore training first", href: "/paths/academy/" },
  },
];
