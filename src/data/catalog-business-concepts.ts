export type CatalogBusinessVertical = "retail" | "restaurant" | "barber_shop" | "flower_shop";
export type CatalogBusinessMarket = "us" | "international";
export type CatalogPriority = "primary" | "secondary";

export type CatalogBusinessConcept = {
  id: string;
  slug: string;
  countrySlug: string;
  localitySlug: string;
  name: string;
  status: "unclaimed" | "claimed" | "client";
  market: CatalogBusinessMarket;
  catalogPriority: CatalogPriority;
  vertical: CatalogBusinessVertical;
  countryName: string;
  primaryIntent: string;
  secondaryIntent?: string;
  phone: string;
  address: string;
  locality: string;
  region: string;
  postalCode: string;
  countryCode: string;
  hours: string[];
  services: string[];
  crmModules: { core: string[]; vertical: string[] };
  website?: string;
  trust?: { source: string; rating: number; reviewCount: number; observedAt: string };
  channels: { label: string; url: string; direction: "primary" | "secondary" | "maps" }[];
  factsRequiringOwnerConfirmation: string[];
  sourceRef: string;
};

const coreCrmModules = Object.freeze([
  "Business profile",
  "Contacts",
  "Leads",
  "Customers",
  "Inbox / requests",
  "Reviews",
  "Analytics",
]);

export const chaykaStoreConcept = Object.freeze({
  id: "catalog-ua-chayka-store",
  slug: "chayka-store",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "Чайка Store",
  status: "unclaimed",
  market: "international",
  catalogPriority: "secondary",
  vertical: "retail",
  countryName: "Ukraine",
  primaryIntent: "Phone repair & accessories",
  secondaryIntent: "More Chay — tea",
  phone: "+380 63 924 22 22",
  address: "вул. Валерія Лобановського, 21/3",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "08135",
  countryCode: "UA",
  hours: ["Пн–Сб 10:00–19:00", "Нд 10:00–18:30"],
  services: [
    "Phone repair — exact service menu requires owner confirmation",
    "Phone accessories — current inventory requires owner confirmation",
    "Separate tea direction: More Chay",
  ],
  crmModules: {
    core: [...coreCrmModules],
    vertical: ["Products / services", "Repair requests", "Inventory", "Order status", "Customer history"],
  },
  trust: { source: "Google", rating: 5.0, reviewCount: 68, observedAt: "2026-09-24" },
  channels: [
    { label: "Google Maps", url: "https://maps.app.goo.gl/J49ktCNKXmkhbsLt7?g_st=ic", direction: "maps" },
    { label: "Instagram · Чайка Store", url: "https://www.instagram.com/chayka_store1", direction: "primary" },
    { label: "Instagram · More Chay", url: "https://www.instagram.com/more_chau", direction: "secondary" },
    { label: "Telegram · More Chay", url: "https://t.me/more_chay", direction: "secondary" },
    { label: "TikTok · source 1", url: "https://vt.tiktok.com/ZSbJrfUkY/", direction: "secondary" },
    { label: "TikTok · source 2", url: "https://vt.tiktok.com/ZSbJrfRtC/", direction: "secondary" },
  ],
  factsRequiringOwnerConfirmation: [
    "exact repair service menu",
    "prices",
    "repair turnaround",
    "warranty",
    "supported device models",
    "accessory inventory",
    "tea inventory",
  ],
  sourceRef: "CLIENT-SUPPLIED-CHAYKA-STORE-20260924",
} satisfies CatalogBusinessConcept);

export const mangalIKazanConcept = Object.freeze({
  id: "catalog-ua-mangal-i-kazan",
  slug: "mangal-i-kazan",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "Мангал і Казан",
  status: "unclaimed",
  market: "international",
  catalogPriority: "secondary",
  vertical: "restaurant",
  countryName: "Ukraine",
  primaryIntent: "Halal restaurant & local delivery",
  phone: "+380 68 831 91 39",
  address: "вул. Валерія Лобановського, 35, корпус 9",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "",
  countryCode: "UA",
  hours: ["Щодня 10:00–20:00"],
  services: [
    "Halal menu",
    "Delivery within ЖК Чайки",
    "Плов",
    "Манти",
    "Лагман",
    "Кебаб і шашлик",
  ],
  crmModules: {
    core: [...coreCrmModules],
    vertical: ["Menu", "Menu items & modifiers", "Orders / requests", "Delivery / pickup", "Order status", "Repeat-customer history"],
  },
  website: "https://mangal-i-kazan.com.ua/",
  channels: [
    { label: "Official website", url: "https://mangal-i-kazan.com.ua/", direction: "primary" },
    { label: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=%D0%9C%D0%B0%D0%BD%D0%B3%D0%B0%D0%BB%20%D1%96%20%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%2C%20%D0%B2%D1%83%D0%BB.%20%D0%92%D0%B0%D0%BB%D0%B5%D1%80%D1%96%D1%8F%20%D0%9B%D0%BE%D0%B1%D0%B0%D0%BD%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE%2035%2C%20%D0%A7%D0%B0%D0%B9%D0%BA%D0%B8", direction: "maps" },
  ],
  factsRequiringOwnerConfirmation: [
    "current complete menu and item availability",
    "current prices",
    "delivery fee and delivery timing",
    "payment methods",
    "restaurant owner claim",
  ],
  sourceRef: "OWNER-SITE-MANGAL-I-KAZAN-20260929",
} satisfies CatalogBusinessConcept);

export const trimmoIiConcept = Object.freeze({
  id: "catalog-ua-trimmo-ii",
  slug: "trimmo-ii",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "TRIMMO II",
  status: "unclaimed",
  market: "international",
  catalogPriority: "secondary",
  vertical: "barber_shop",
  countryName: "Ukraine",
  primaryIntent: "Barber shop",
  phone: "+380 98 802 09 09",
  address: "вул. Валерія Лобановського, 24",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "08135",
  countryCode: "UA",
  hours: ["Пн–Сб 10:00–21:00"],
  services: ["Men's barber services — exact service and price list requires owner confirmation"],
  crmModules: {
    core: [...coreCrmModules],
    vertical: ["Services & pricing", "Barbers / staff", "Appointments", "Chair schedule", "Client preferences", "Visit history"],
  },
  trust: { source: "Google", rating: 5.0, reviewCount: 157, observedAt: "2026-09-29" },
  channels: [
    { label: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=TRIMMO%20II%2C%20%D0%B2%D1%83%D0%BB.%20%D0%92%D0%B0%D0%BB%D0%B5%D1%80%D1%96%D1%8F%20%D0%9B%D0%BE%D0%B1%D0%B0%D0%BD%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE%2024%2C%20%D0%A7%D0%B0%D0%B9%D0%BA%D0%B8", direction: "maps" },
  ],
  factsRequiringOwnerConfirmation: [
    "complete haircut and grooming service menu",
    "prices",
    "Sunday hours",
    "barber roster",
    "booking rules",
    "owner claim",
  ],
  sourceRef: "PUBLIC-GOOGLE-TRIMMO-II-CHAIKY-20260929",
} satisfies CatalogBusinessConcept);

export const tsvitVyshniConcept = Object.freeze({
  id: "catalog-ua-tsvit-vyshni",
  slug: "tsvit-vyshni",
  countrySlug: "ukraine",
  localitySlug: "irpin",
  name: "Квіткова студія Цвіт VYSHNI",
  status: "unclaimed",
  market: "international",
  catalogPriority: "secondary",
  vertical: "flower_shop",
  countryName: "Ukraine",
  primaryIntent: "Flower shop",
  phone: "+380 99 401 86 27",
  address: "вул. Українська, 57 А",
  locality: "Ірпінь",
  region: "Київська область",
  postalCode: "08205",
  countryCode: "UA",
  hours: ["Щодня 09:00–20:00"],
  services: ["Flowers and floral retail — bouquet catalog, delivery and current availability require owner confirmation"],
  crmModules: {
    core: [...coreCrmModules],
    vertical: ["Bouquet / product catalog", "Orders", "Pickup / delivery options", "Availability / stock", "Occasions & reminders", "Order status"],
  },
  trust: { source: "Google", rating: 5.0, reviewCount: 39, observedAt: "2026-09-29" },
  channels: [
    { label: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=%D0%A6%D0%B2%D1%96%D1%82%20VYSHNI%2C%20%D0%B2%D1%83%D0%BB.%20%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0%2057%D0%90%2C%20%D0%86%D1%80%D0%BF%D1%96%D0%BD%D1%8C", direction: "maps" },
  ],
  factsRequiringOwnerConfirmation: [
    "current bouquet and product catalog",
    "prices",
    "delivery coverage and fee",
    "same-day availability",
    "payment methods",
    "owner claim",
  ],
  sourceRef: "PUBLIC-GOOGLE-TSVIT-VYSHNI-IRPIN-20260929",
} satisfies CatalogBusinessConcept);

export const catalogBusinessConcepts = Object.freeze([
  chaykaStoreConcept,
  mangalIKazanConcept,
  trimmoIiConcept,
  tsvitVyshniConcept,
]);

export const internationalCatalogBusinesses = Object.freeze(
  catalogBusinessConcepts.filter((business) => business.market === "international"),
);
