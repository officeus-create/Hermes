export type CatalogBusinessConcept = {
  id: string;
  slug: string;
  countrySlug: string;
  localitySlug: string;
  name: string;
  status: "unclaimed" | "claimed" | "client";
  primaryIntent: string;
  secondaryIntent?: string;
  phone: string;
  address: string;
  locality: string;
  region: string;
  postalCode: string;
  countryCode: string;
  hours: string[];
  trust?: { source: string; rating: number; reviewCount: number; observedAt: string };
  channels: { label: string; url: string; direction: "primary" | "secondary" | "maps" }[];
  factsRequiringOwnerConfirmation: string[];
  sourceRef: string;
};

export const chaykaStoreConcept: CatalogBusinessConcept = Object.freeze({
  id: "catalog-ua-chayka-store",
  slug: "chayka-store",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "Чайка Store",
  status: "unclaimed",
  primaryIntent: "Phone repair & accessories",
  secondaryIntent: "More Chay — tea",
  phone: "+380 63 924 22 22",
  address: "вул. Валерія Лобановського, 21/3",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "08135",
  countryCode: "UA",
  hours: ["Пн–Сб 10:00–19:00", "Нд 10:00–18:30"],
  trust: { source: "Google", rating: 5.0, reviewCount: 68, observedAt: "2026-09-24" },
  channels: [
    { label: "Google Maps", url: "https://maps.app.goo.gl/J49ktCNKXmkhbsLt7?g_st=ic", direction: "maps" },
    { label: "Instagram · Чайка Store", url: "https://www.instagram.com/chayka_store1", direction: "primary" },
    { label: "Instagram · More Chay", url: "https://www.instagram.com/more_chau", direction: "secondary" },
    { label: "Telegram · More Chay", url: "https://t.me/more_chay", direction: "secondary" },
    { label: "TikTok · source 1", url: "https://vt.tiktok.com/ZSbJrfUkY/", direction: "secondary" },
    { label: "TikTok · source 2", url: "https://vt.tiktok.com/ZSbJrfRtC/", direction: "secondary" }
  ],
  factsRequiringOwnerConfirmation: [
    "exact repair service menu",
    "prices",
    "repair turnaround",
    "warranty",
    "supported device models",
    "accessory inventory",
    "tea inventory"
  ],
  sourceRef: "CLIENT-SUPPLIED-CHAYKA-STORE-20260924"
});

export const catalogBusinessConcepts = Object.freeze([chaykaStoreConcept]);
