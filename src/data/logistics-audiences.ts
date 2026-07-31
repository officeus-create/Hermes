export type LogisticsAudience = {
  slug: "shipper-dealer" | "broker" | "carrier" | "agency" | "careers";
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  needs: string[];
  steps: { title: string; body: string }[];
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
    primary: { label: "Start agency application", href: "/logistics/apply/?for=agency" },
  },
  {
    slug: "careers",
    label: "Work with us",
    eyebrow: "Careers",
    title: "Apply for a logistics, sales, or operations role.",
    summary: "For candidates interested in carrier sales, dealer and shipper outreach, dispatch support, operations, websites, SEO, or another relevant Hermes role.",
    needs: ["Location and time zone", "Languages", "Relevant experience", "Role interest and availability"],
    steps: [
      { title: "Review current vacancies", body: "Read the actual responsibilities, language expectations, and application requirements before applying." },
      { title: "Role review", body: "The team compares your background with current needs; an application does not guarantee placement." },
      { title: "Interview or training path", body: "A suitable candidate may be invited to an interview, test, or relevant Academy path." },
    ],
    primary: { label: "Start job application", href: "/careers/#international-sales-manager" },
    secondary: { label: "Explore training first", href: "/paths/academy/" },
  },
];
