// Shared messenger-contact validation, used by both the appointment and
// personal-meeting public booking endpoints.

export const CONTACT_METHODS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "instagram", label: "Instagram" },
];

const CONTACT_METHOD_IDS = new Set(CONTACT_METHODS.map((method) => method.id));

export function isValidContactMethod(value) {
  return CONTACT_METHOD_IDS.has(value);
}
