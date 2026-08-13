// Browser-safe copy of src/contact-method.mjs — see prototype/catalog.mjs for
// why this duplication exists (wrangler pages dev only serves prototype/).

export const contactMethods = [
  { id: "whatsapp", label: "WhatsApp", placeholder: "+1 555 123 4567" },
  { id: "telegram", label: "Telegram", placeholder: "@username or +phone" },
  { id: "instagram", label: "Instagram", placeholder: "@username" },
];

const ICONS = {
  whatsapp:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.66 15L2 22l5.14-1.32A10 10 0 1 0 12 2Zm0 18.2a8.16 8.16 0 0 1-4.17-1.14l-.3-.18-3.05.78.8-2.97-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.13c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.35-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.35 1 2.51.12.16 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z"/></svg>',
  telegram:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21.5 3.5 2.9 10.8c-1.15.46-1.14 1.1-.21 1.38l4.77 1.49L18.9 6.5c.51-.31.98-.14.6.2L10.9 14l-.31 4.53c.45 0 .65-.2.9-.46l2.16-2.08 4.5 3.3c.83.46 1.42.22 1.63-.77l2.95-13.86c.31-1.22-.46-1.77-1.23-1.16Z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>',
};

export function contactIconSvg(methodId) {
  return ICONS[methodId] || "";
}
