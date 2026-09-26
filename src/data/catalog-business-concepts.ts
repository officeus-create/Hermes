export type CatalogBusinessConcept = {
  id: string;
  slug: string;
  countrySlug: string;
  localitySlug: string;
  name: string;
  status: "unclaimed" | "claimed" | "client";
  primaryIntent: string;
  secondaryIntent?: string;
  lifecycle: "discovered" | "researched" | "concept_draft" | "reviewed" | "published_unclaimed" | "claimed" | "client" | "own_domain_live";
  publication: "preview_noindex" | "public_indexable";
  locales: { default: "uk" | "en"; supported: ("uk" | "en")[] };
  semanticCore: { primary: string[]; secondary: string[]; geography: string[] };
  factLabels: { verified: string[]; proposed: string[]; ownerConfirmation: string[] };
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

export const chaykaStoreConcept = Object.freeze({
  id: "catalog-ua-chayka-store",
  slug: "chayka-store",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "Чайка Store",
  status: "unclaimed",
  lifecycle: "published_unclaimed",
  publication: "public_indexable",
  locales: { default: "uk", supported: ["uk","en"] },
  semanticCore: {
    primary: ["ремонт телефонів Чайки","ремонт смартфонів Чайки"],
    secondary: ["аксесуари для телефонів Чайки","чай Чайки"],
    geography: ["Чайки","Київська область"]
  },
  factLabels: {
    verified: ["business name","phone","address","hours","public social channels","Google rating/review count"],
    proposed: ["website design","conversion structure","SEO/GEO architecture","Hermes CRM/SMM/automation"],
    ownerConfirmation: ["exact services","prices","turnaround","warranty","supported models","inventory"]
  },
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
} satisfies CatalogBusinessConcept);

export const catalogBusinessConcepts = Object.freeze([chaykaStoreConcept]);
