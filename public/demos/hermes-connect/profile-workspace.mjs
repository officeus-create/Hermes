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

export const audienceCatalog = [
  {
    id: "beauty-wellness", icon: "✦", label: "Beauty & wellness", short: "Salons, private masters, clinics",
    business: "Aura Beauty Studio", initials: "AV", location: "Kyiv · By appointment",
    description: "Beauty appointments with clear services and available times.", dashboardTitle: "Today at a glance",
    metrics: ["8", "6", "4"], requestLabel: "Request an appointment", floatingRequest: "Color & care session", serviceChoice: "Signature appointment",
    services: [["Signature treatment", "60 min", "From $75"], ["Consultation", "30 min", "From $35"], ["Care package", "90 min", "From $120"]],
    appointments: [["10:00", "Consultation", "New client", "Review"], ["12:30", "Signature service", "Returning client", "Ready"], ["15:00", "Care package", "Request received", "Review"]],
    summary: "Turn service discovery, availability, and appointment requests into one polished client journey.",
    benefits: ["Service menu with duration and format", "Availability that clients can understand", "Useful questions before the appointment"],
  },
  {
    id: "fitness-coaching", icon: "↗", label: "Fitness & coaching", short: "Trainers, studios, coaches",
    business: "Motion Performance", initials: "MP", location: "Miami · Studio & online",
    description: "Training, consultations, and recurring sessions in one client path.", dashboardTitle: "Coaching schedule",
    metrics: ["12", "9", "5"], requestLabel: "Request a session", floatingRequest: "Strength assessment", serviceChoice: "Training session",
    services: [["Personal training", "60 min", "From $80"], ["Online coaching", "45 min", "From $60"], ["Performance assessment", "75 min", "From $110"]],
    appointments: [["08:00", "Personal training", "Studio", "Ready"], ["11:00", "Assessment", "New client", "Review"], ["17:30", "Online coaching", "Video call", "Ready"]],
    summary: "Let clients compare training formats, request the right session, and understand what happens next.",
    benefits: ["In-person and online service formats", "One-time and recurring session paths", "Goals collected before the first meeting"],
  },
  {
    id: "education-courses", icon: "◇", label: "Education & courses", short: "Tutors, schools, academies",
    business: "Northstar Learning Lab", initials: "NL", location: "Online · International",
    description: "Lessons, consultations, and learning programs with clear enrollment steps.", dashboardTitle: "Learning requests",
    metrics: ["16", "11", "6"], requestLabel: "Request enrollment", floatingRequest: "English assessment", serviceChoice: "Introductory lesson",
    services: [["Introductory lesson", "45 min", "From $30"], ["Private tutoring", "60 min", "From $45"], ["Program consultation", "30 min", "Free review"]],
    appointments: [["09:30", "Level assessment", "New student", "Review"], ["14:00", "Private lesson", "Online", "Ready"], ["18:30", "Program call", "Parent", "Review"]],
    summary: "Explain programs, collect student context, and guide people from interest to the right lesson or enrollment step.",
    benefits: ["Programs and lesson formats in one place", "Level and goal questions before review", "Clear enrollment or consultation action"],
  },
  {
    id: "consultants-experts", icon: "◎", label: "Consultants & experts", short: "Advisors, specialists, professionals",
    business: "Maya Santos Advisory", initials: "MS", location: "New York · Remote",
    description: "Consultations and expert services with focused qualification before the call.", dashboardTitle: "Advisory pipeline",
    metrics: ["7", "5", "3"], requestLabel: "Request a consultation", floatingRequest: "Operations review", serviceChoice: "Strategy consultation",
    services: [["Strategy consultation", "45 min", "From $150"], ["Operations review", "60 min", "From $250"], ["Implementation roadmap", "90 min", "From $400"]],
    appointments: [["10:30", "Strategy call", "Founder", "Review"], ["13:00", "Operations review", "Team lead", "Ready"], ["16:00", "Roadmap session", "Business", "Review"]],
    summary: "Move prospects from “tell me more” to a useful, qualified consultation request.",
    benefits: ["Expert positioning before contact", "Different consultation formats", "Business context collected in advance"],
  },
  {
    id: "home-local-services", icon: "⌂", label: "Home & local services", short: "Repair, cleaning, field services",
    business: "ClearHome Services", initials: "CH", location: "Chicago · Service area",
    description: "Local service requests with location, job type, and availability context.", dashboardTitle: "Service area requests",
    metrics: ["14", "8", "7"], requestLabel: "Request a service visit", floatingRequest: "Home assessment", serviceChoice: "On-site service",
    services: [["Home assessment", "30 min", "Request review"], ["Standard service", "2 hours", "From $120"], ["Recurring service", "Custom", "Program review"]],
    appointments: [["09:00", "Home assessment", "North area", "Review"], ["12:00", "Standard service", "Downtown", "Ready"], ["16:30", "Recurring plan", "West area", "Review"]],
    summary: "Collect location and job context before scheduling a visit, while keeping the service business in control.",
    benefits: ["Service-area and job-type context", "Visit windows instead of endless messages", "Recurring-service request path"],
  },
  {
    id: "logistics-operations", icon: "⇄", label: "Logistics & operations", short: "Carriers, brokers, operating teams",
    business: "Hermes Operations Desk", initials: "HO", location: "United States · Operations",
    description: "Structured operating requests, review queues, and controlled next actions.", dashboardTitle: "Operations control",
    metrics: ["19", "10", "8"], requestLabel: "Prepare an operating request", floatingRequest: "Route review", serviceChoice: "Operations consultation",
    services: [["Operations review", "60 min", "Business review"], ["Carrier workflow", "45 min", "Qualification"], ["System consultation", "60 min", "Discovery"]],
    appointments: [["08:30", "Route review", "Customer request", "Review"], ["11:30", "Carrier workflow", "Operations", "Ready"], ["15:30", "System consultation", "Management", "Review"]],
    summary: "Turn scattered operational messages into structured requests, review queues, and clear ownership.",
    benefits: ["Role-specific request paths", "Operational context before handoff", "Controlled review instead of automatic promises"],
  },
  {
    id: "creative-marketing", icon: "✺", label: "Creative & marketing", short: "Studios, agencies, creators",
    business: "Northline Creative", initials: "NC", location: "Los Angeles · Remote",
    description: "Creative packages, discovery calls, and project requests in one branded experience.", dashboardTitle: "Project inquiries",
    metrics: ["10", "7", "5"], requestLabel: "Start a project request", floatingRequest: "Brand strategy call", serviceChoice: "Discovery session",
    services: [["Discovery session", "30 min", "Free review"], ["Content sprint", "Project", "From $900"], ["Brand system", "Custom", "Scope review"]],
    appointments: [["10:00", "Discovery call", "New brand", "Review"], ["13:30", "Content sprint", "Client team", "Ready"], ["17:00", "Brand strategy", "Founder", "Review"]],
    summary: "Help clients choose the right offer and share useful project context before the first call.",
    benefits: ["Packages and discovery paths", "Brief questions before a meeting", "Clear difference between fixed and custom work"],
  },
  {
    id: "startup-team", icon: "△", label: "Startup & team", short: "Growing companies and internal teams",
    business: "Orbit Team Workspace", initials: "OT", location: "Distributed team",
    description: "Internal requests, onboarding, office hours, and team workflows from one hub.", dashboardTitle: "Team request center",
    metrics: ["22", "13", "9"], requestLabel: "Submit a team request", floatingRequest: "Founder office hours", serviceChoice: "Team support request",
    services: [["Founder office hours", "30 min", "Internal"], ["Onboarding session", "45 min", "New team"], ["Operations request", "Custom", "Triage"]],
    appointments: [["09:00", "Onboarding", "New hire", "Ready"], ["12:00", "Office hours", "Product team", "Review"], ["16:00", "Operations request", "Management", "Review"]],
    summary: "Use the same product logic for customer-facing services or structured internal team requests.",
    benefits: ["Internal and external request modes", "Clear ownership and next action", "Reusable workflows as the team grows"],
  },
  {
    id: "other-business", icon: "+", label: "Other / not sure yet", short: "Tell us how your workflow works",
    business: "Your Business", initials: "YB", location: "Your city · Your format",
    description: "A flexible service and request path designed around the way your business actually works.", dashboardTitle: "Your business workspace",
    metrics: ["—", "—", "—"], requestLabel: "Request the next step", floatingRequest: "New customer request", serviceChoice: "Your primary service",
    services: [["Primary service", "Your format", "Your terms"], ["Consultation", "Flexible", "Review first"], ["Custom request", "Needs context", "Business review"]],
    appointments: [["09:30", "Customer request", "New inquiry", "Review"], ["13:00", "Consultation", "Online or local", "Ready"], ["16:30", "Custom service", "Needs context", "Review"]],
    summary: "Choose this option when no category fits. The first step is mapping the real customer or team workflow.",
    benefits: ["No forced industry template", "Workflow discovery before automation", "A visible “not sure yet” path"],
  },
];

export function getAudienceExperience(id) {
  return audienceCatalog.find((item) => item.id === id) ?? audienceCatalog[0];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEarlyAccessDraft(draft) {
  const normalized = {
    name: cleanText(draft?.name, 100),
    email: cleanText(draft?.email, 160).toLowerCase(),
    businessName: cleanText(draft?.businessName, 160),
    category: cleanText(draft?.category, 80),
    platform: cleanText(draft?.platform, 80),
    teamSize: cleanText(draft?.teamSize, 80),
    primaryGoal: cleanText(draft?.primaryGoal, 1000),
    consent: draft?.consent === true,
    website: cleanText(draft?.website, 120),
  };
  const errors = [];
  if (normalized.website) errors.push("spam_detected");
  if (normalized.name.length < 2) errors.push("name_required");
  if (!EMAIL_PATTERN.test(normalized.email)) errors.push("valid_email_required");
  if (!audienceCatalog.some((item) => item.id === normalized.category)) errors.push("category_required");
  if (!normalized.platform) errors.push("platform_required");
  if (!normalized.teamSize) errors.push("team_size_required");
  if (normalized.primaryGoal.length < 15) errors.push("goal_too_short");
  if (!normalized.consent) errors.push("consent_required");
  return { valid: errors.length === 0, errors, normalized };
}

export function buildEarlyAccessEmail(draft) {
  const validation = validateEarlyAccessDraft(draft);
  if (!validation.valid) {
    const error = new Error(`Application validation failed: ${validation.errors.join(", ")}`);
    error.validationErrors = validation.errors;
    throw error;
  }
  const item = getAudienceExperience(validation.normalized.category);
  const lines = [
    "Hermes Connect Early Access Application",
    "---------------------------------------",
    `Name: ${validation.normalized.name}`,
    `Email: ${validation.normalized.email}`,
    `Business / project: ${validation.normalized.businessName || "Not provided"}`,
    `Category: ${item.label}`,
    `Preferred access: ${validation.normalized.platform}`,
    `Team size: ${validation.normalized.teamSize}`,
    "",
    "Primary goal:",
    validation.normalized.primaryGoal,
    "",
    "Source: Hermes Connect product preview",
    "Consent: Yes — applicant requested early-access review.",
  ];
  const subject = `Hermes Connect early access · ${item.label}`;
  return {
    subject,
    body: lines.join("\n"),
    mailto: `mailto:officeus@hermeslogisticsus.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`,
    category: item,
    normalized: validation.normalized,
  };
}
