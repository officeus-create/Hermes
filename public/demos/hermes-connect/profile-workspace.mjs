const MAX_SERVICES = 6;
const MAX_AVAILABILITY_SLOTS = 12;

export const serviceCatalog = [
  { id: "strategy-session", name: "Strategy session", durationMinutes: 45 },
  { id: "operations-review", name: "Operations review", durationMinutes: 60 },
  { id: "website-consultation", name: "Website consultation", durationMinutes: 45 },
];

export const availabilityCatalog = [
  "Tue · 10:30 AM",
  "Tue · 2:00 PM",
  "Wed · 9:00 AM",
  "Wed · 1:30 PM",
  "Thu · 11:00 AM",
];

export const categoryCatalog = [
  {
    id: "beauty-wellness",
    name: "Beauty & wellness",
    label: "Salons, barbers, nail, spa",
    headline: "Show services beautifully and turn interest into a clear booking request.",
    previewName: "Luna Beauty Studio",
    previewRole: "Beauty studio · Chicago / Remote consultation",
    previewServices: ["Nail service", "Hair appointment", "Skin consultation"],
    accent: "#ff6f91",
    icon: "BW",
  },
  {
    id: "fitness-coaching",
    name: "Fitness & coaching",
    label: "Trainers, studios, coaches",
    headline: "Package sessions, programs, and available times in one clear client path.",
    previewName: "Northline Performance",
    previewRole: "Personal training · Online and in-person",
    previewServices: ["1:1 training", "Program review", "Intro consultation"],
    accent: "#67e8c4",
    icon: "FC",
  },
  {
    id: "professional-services",
    name: "Professional services",
    label: "Consultants, agencies, experts",
    headline: "Explain the offer, qualify the request, and give prospects a professional next step.",
    previewName: "Atlas Advisory",
    previewRole: "Business consulting · United States",
    previewServices: ["Strategy session", "Operations review", "Project discovery"],
    accent: "#80a7ff",
    icon: "PS",
  },
  {
    id: "logistics-field",
    name: "Logistics & field services",
    label: "Dispatch, transport, mobile teams",
    headline: "Route each request to the right service, location, equipment, or operations review.",
    previewName: "Hermes Field Desk",
    previewRole: "Logistics support · U.S. operations",
    previewServices: ["Carrier review", "Transport request", "Operations call"],
    accent: "#b99cff",
    icon: "LF",
  },
  {
    id: "auto-service-repair",
    name: "Auto service & repair",
    label: "Repair shops, mobile mechanics, detailers",
    headline: "Turn vehicle symptoms, service needs, and preferred times into a structured appointment request.",
    previewName: "Precision Auto Care",
    previewRole: "Automotive service · Local and mobile appointments",
    previewServices: ["Diagnostic request", "Maintenance visit", "Repair estimate"],
    accent: "#58c7ff",
    icon: "AR",
  },
  {
    id: "truck-car-hauler-repair",
    name: "Truck & car-hauler repair",
    label: "Diesel, trailer, car-hauler service",
    headline: "Qualify equipment, operating condition, location, and urgency before the service team responds.",
    previewName: "FleetLine Repair",
    previewRole: "Commercial truck and car-hauler service · U.S. field support",
    previewServices: ["Truck diagnostic", "Trailer repair", "Car-hauler service"],
    accent: "#6f8cff",
    icon: "TR",
  },
  {
    id: "heavy-equipment-service",
    name: "Heavy equipment service",
    label: "Construction, agricultural, industrial equipment",
    headline: "Capture machine type, service location, availability, and the next safe inspection step.",
    previewName: "IronWorks Equipment Service",
    previewRole: "Heavy equipment support · Shop and field service",
    previewServices: ["Equipment inspection", "Field service request", "Maintenance planning"],
    accent: "#f4b94f",
    icon: "HE",
  },
  {
    id: "oversize-specialty-equipment",
    name: "Oversize & specialty equipment",
    label: "Specialty vehicles, machinery, oversize units",
    headline: "Organize complex equipment requests without collecting private shipment documents in the first step.",
    previewName: "Titan Specialty Support",
    previewRole: "Oversize and specialty equipment · Coordinated review",
    previewServices: ["Equipment review", "Service coordination", "Specialist consultation"],
    accent: "#ff8b5d",
    icon: "OS",
  },
  {
    id: "education-events",
    name: "Education & events",
    label: "Tutors, academies, workshops",
    headline: "Present programs, schedules, and application steps without losing the learner.",
    previewName: "LearnSkill Studio",
    previewRole: "Practical education · Online cohorts",
    previewServices: ["Program overview", "Application review", "Workshop registration"],
    accent: "#ffc766",
    icon: "EE",
  },
  {
    id: "home-local",
    name: "Home & local services",
    label: "Cleaning, repair, photo, pet care",
    headline: "Make local services easy to understand, request, and coordinate from any browser.",
    previewName: "Bright Local Services",
    previewRole: "Local service team · Milwaukee area",
    previewServices: ["Service estimate", "Visit request", "Recurring service"],
    accent: "#ff9472",
    icon: "HL",
  },
];

export const platformCatalog = [
  {
    id: "web",
    name: "Web app",
    status: "Controlled web access",
    description: "Open Hermes Connect from a modern browser on desktop, tablet, or phone. No app-store installation is required.",
  },
];

export const defaultDraft = {
  name: "Maya Santos",
  role: "Business consultant",
  location: "Miami / Remote",
  bio: "Operations, customer journey, and practical growth systems.",
  serviceIds: ["strategy-session", "operations-review"],
  availability: ["Tue · 10:30 AM", "Wed · 9:00 AM"],
};

function cleanText(value, max) {
  return String(value ?? "").replace(/[<>\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

function unique(values) {
  return [...new Set(values)];
}

function slugify(value) {
  return cleanText(value, 120)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function getCategory(categoryId) {
  return categoryCatalog.find((category) => category.id === categoryId) ?? null;
}

export function getPlatform(platformId) {
  return platformCatalog.find((platform) => platform.id === platformId) ?? null;
}

export function validateEarlyAccessDraft(draft) {
  const name = cleanText(draft.name, 100);
  const email = cleanText(draft.email, 160).toLowerCase();
  const businessName = cleanText(draft.businessName, 140);
  const categoryId = cleanText(draft.categoryId, 60);
  const platformId = cleanText(draft.platformId || "web", 40);
  const role = cleanText(draft.role, 100);
  const teamSize = cleanText(draft.teamSize, 40);
  const currentMethod = cleanText(draft.currentMethod, 120);
  const mustHave = cleanText(draft.mustHave, 1_000);
  const consent = draft.consent === true;
  const website = cleanText(draft.website, 120);
  const errors = [];

  if (website) errors.push("automated_submission_rejected");
  if (name.length < 2) errors.push("name_required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email_required");
  if (!getCategory(categoryId)) errors.push("category_required");
  if (!getPlatform(platformId)) errors.push("platform_required");
  if (role.length < 2) errors.push("role_required");
  if (mustHave.length < 10) errors.push("feature_required");
  if (!consent) errors.push("consent_required");

  return {
    valid: errors.length === 0,
    errors,
    normalized: {
      name,
      email,
      businessName,
      categoryId,
      platformId,
      role,
      teamSize,
      currentMethod,
      mustHave,
      consent,
    },
  };
}

export function createEarlyAccessRequest(draft) {
  const validation = validateEarlyAccessDraft({ ...draft, platformId: "web" });
  if (!validation.valid) {
    const error = new Error(`Early-access validation failed: ${validation.errors.join(", ")}`);
    error.validationErrors = validation.errors;
    throw error;
  }

  const value = validation.normalized;
  const category = getCategory(value.categoryId);
  const platform = getPlatform("web");
  const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `connect-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const message = [
    "Hermes Connect web-access request",
    `Category: ${category.name}`,
    "Requested product: Hermes Connect Web App",
    value.businessName ? `Business: ${value.businessName}` : "",
    `Role: ${value.role}`,
    value.teamSize ? `Team size: ${value.teamSize}` : "",
    value.currentMethod ? `Current booking/request method: ${value.currentMethod}` : "",
    `Must-have workflow: ${value.mustHave}`,
    "Request: review this business for controlled Hermes Connect web access.",
  ].filter(Boolean).join("\n");

  return {
    request_id: requestId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80),
    submitted_at: new Date().toISOString(),
    source_path: "/hermes-connect/web-access/",
    name: value.name,
    email: value.email,
    interest: "IT Development",
    message,
    consent: true,
    direction_fields: {
      direction: "IT Development",
      fields: {
        system_or_workflow_needed: `Hermes Connect Web App · ${category.name}`,
        current_tools: value.currentMethod,
        number_of_users: value.teamSize,
        integrations_needed: `Web app; ${value.mustHave}`,
        timeline: platform.status,
      },
    },
    public_dimensions: {
      category_id: category.id,
      platform_id: "web",
    },
  };
}

export function validateProfileDraft(draft) {
  const errors = [];
  const name = cleanText(draft.name, 100);
  const role = cleanText(draft.role, 120);
  const location = cleanText(draft.location, 120);
  const bio = cleanText(draft.bio, 500);
  const serviceIds = unique(Array.isArray(draft.serviceIds) ? draft.serviceIds : []).slice(0, MAX_SERVICES);
  const availability = unique(Array.isArray(draft.availability) ? draft.availability : []).slice(0, MAX_AVAILABILITY_SLOTS);

  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (location.length < 2) errors.push("location_required");
  if (bio.length < 20) errors.push("bio_too_short");
  if (!serviceIds.length) errors.push("service_required");
  if (!availability.length) errors.push("availability_required");
  if (serviceIds.some((id) => !serviceCatalog.some((service) => service.id === id))) errors.push("unknown_service");
  if (availability.some((slot) => !availabilityCatalog.includes(slot))) errors.push("unknown_availability");

  return {
    valid: errors.length === 0,
    errors,
    normalized: { name, role, location, bio, serviceIds, availability },
  };
}

export function createProfilePreview(draft) {
  const validation = validateProfileDraft(draft);
  if (!validation.valid) {
    const error = new Error(`Profile validation failed: ${validation.errors.join(", ")}`);
    error.validationErrors = validation.errors;
    throw error;
  }

  const profile = validation.normalized;
  const services = profile.serviceIds.map((id) => serviceCatalog.find((service) => service.id === id));
  const slug = slugify(profile.name) || "specialist-preview";
  return {
    id: `PREVIEW-${slug}`,
    mode: "simulation",
    status: "profile_preview_ready",
    personalPath: `/hermes-connect/preview/${slug}`,
    ...profile,
    services,
    accountCreated: false,
    databaseWritePerformed: false,
    calendarConnected: false,
    paymentConnected: false,
    messageSent: false,
  };
}

export function createTestBookingForProfile(profile, { serviceId, time }) {
  if (profile?.status !== "profile_preview_ready") throw new Error("Profile preview is required");
  const service = profile.services.find((item) => item.id === serviceId);
  if (!service) throw new Error("Service is not available");
  if (!profile.availability.includes(time)) throw new Error("Time is not available");

  return {
    id: `TEST-${profile.id}-${serviceId}-${profile.availability.indexOf(time) + 1}`,
    mode: "simulation",
    status: "test_booking_created",
    specialist: profile.name,
    service: service.name,
    time,
    externalWritePerformed: false,
    calendarEventCreated: false,
    paymentCreated: false,
    messageSent: false,
  };
}
