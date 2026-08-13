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
