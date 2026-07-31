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
};

export const logisticsAudiences: LogisticsAudience[] = [
  {
    slug: "shipper-dealer",
    label: "Shipper or dealer",
    eyebrow: "Move vehicles",
    title: "Post a car-hauling load and collect carrier options.",
    summary: "For dealerships, auctions, shippers, and businesses that need vehicles or compatible equipment moved between locations.",
    needs: ["Vehicle and pickup details", "Delivery location and ready date", "Operable or inoperable condition", "Optional target price"],
    steps: [
      { title: "Describe the load", body: "Add the route, vehicle details, quantity, condition, and pickup timing." },
      { title: "Automatic review", body: "The preview checks completeness and whether the commodity fits the car-hauling pilot." },
      { title: "Collect options", body: "Approved production requests will be matched with relevant carrier capacity." },
    ],
    faq: [{ question: "Is a carrier match guaranteed once I post a load?", answer: "No. Posting starts a review for fit and availability; matching depends on route, timing, and carrier capacity at that moment." }, { question: "What if my vehicle is inoperable?", answer: "Note the condition when you post. Inoperable units are reviewed the same way but may need different equipment or timing." }, { question: "Can I set a target price?", answer: "Yes, a target price is optional on the load form and is used as context during the review, not as a guaranteed rate." }],
    primary: { label: "Post a load", href: "/load-board/?role=shipper#post-load" },
    secondary: { label: "Call Logistics Sales", href: "tel:+12623023626" },
  },
  {
    slug: "broker",
    label: "Broker",
    eyebrow: "Carrier capacity",
    title: "Bring a car-hauling opportunity to the right operating team.",
    summary: "For brokers who need compatible carrier capacity, clear communication, and a structured route for vehicle transport opportunities.",
    needs: ["Pickup and delivery", "Commodity and equipment fit", "Timing and price context", "Broker and load verification details"],
    steps: [
      { title: "Post the opportunity", body: "Enter the same operational details a carrier needs to evaluate the move." },
      { title: "Check compatibility", body: "Unusual, oversized, or inoperable equipment is held for additional requirements." },
      { title: "Route by fit", body: "The production workflow will route approved loads to relevant car-hauling capacity." },
    ],
    faq: [{ question: "Do you guarantee capacity for every load I post?", answer: "No. Each opportunity is checked for equipment and route fit before it is routed to relevant carrier capacity; availability is not guaranteed." }, { question: "What verification details do you need?", answer: "Standard broker and load verification details, along with the commodity and equipment fit, so the opportunity can be reviewed accurately." }, { question: "How are oversized or unusual loads handled?", answer: "They are held for additional requirements rather than routed automatically, since equipment fit varies by carrier." }],
    primary: { label: "Open broker Load Board", href: "/load-board/?role=broker#post-load" },
    secondary: { label: "Call Logistics Sales", href: "tel:+12623023626" },
  },
  {
    slug: "carrier",
    label: "Carrier or owner-operator",
    eyebrow: "Find work and support",
    title: "Find car-hauling opportunities that fit your equipment and area.",
    summary: "For carriers, owner-operators, and fleets looking for load opportunities, dispatch support, document coordination, and a clearer operating plan.",
    needs: ["MC/DOT and authority status", "Trailer type and capacity", "Current location and preferred lanes", "Availability and working preferences"],
    steps: [
      { title: "Describe your operation", body: "Share equipment, capacity, authority, lanes, and current availability." },
      { title: "Confirm the fit", body: "Hermes reviews the service path and the kind of opportunities that may fit." },
      { title: "Choose the relationship", body: "Discuss loads, dispatch support, or a broader operating relationship without giving up load approval." },
    ],
    faq: [{ question: "Do I have to accept every load Hermes sends?", answer: "No. You review and approve every load; nothing is booked without your confirmation." }, { question: "What do you need from me to get started?", answer: "MC/DOT and authority status, trailer type and capacity, current location, preferred lanes, and availability." }, { question: "Can new authorities apply?", answer: "Yes, subject to a readiness review covering authority age, insurance, documentation, and equipment." }],
    primary: { label: "Open Load Board", href: "/load-board/?role=carrier#available-loads" },
    secondary: { label: "Call Logistics Sales", href: "tel:+12623023626" },
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
    faq: [{ question: "Does applying guarantee an agency will open?", answer: "No. Hermes reviews operating fit, experience, and market before any structure or terms are discussed." }, { question: "What experience is required?", answer: "Relevant logistics and management experience, an existing team or hiring capacity, and clear business goals." }, { question: "What happens after the initial review?", answer: "An approved application moves to a defined pilot with responsibilities, training, and measurable expectations." }],
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
    faq: [{ question: "Does submitting an application guarantee an interview or a job?", answer: "No. Applications are compared against current needs, and not every applicant is invited to interview." }, { question: "What should I include in my application?", answer: "Your location and time zone, languages, relevant experience, and the role you're interested in." }, { question: "Is training available if I don't have direct experience?", answer: "Some candidates may be invited to a relevant Academy training path instead of, or before, an operating role." }],
    primary: { label: "Start job application", href: "/logistics/apply/?for=career" },
    secondary: { label: "Explore training first", href: "/paths/academy/" },
  },
];
