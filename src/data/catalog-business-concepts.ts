export type CatalogBusinessConcept = {
  id: string;
  slug: string;
  countrySlug: string;
  localitySlug: string;
  name: string;
  status: "unclaimed" | "claimed" | "client";
  market: "us" | "international";
  catalogPriority: "primary" | "secondary";
  vertical: "repair_shop" | "restaurant" | "barber_shop" | "flower_shop" | "retail";
  schemaType: "LocalBusiness" | "Restaurant" | "BarberShop" | "Florist" | "Store";
  primaryIntent: string;
  secondaryIntent?: string;
  phone: string;
  address: string;
  locality: string;
  region: string;
  postalCode: string;
  countryCode: string;
  hours: string[];
  website?: string;
  services: string[];
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
  market: "international",
  catalogPriority: "secondary",
  vertical: "repair_shop",
  schemaType: "Store",
  primaryIntent: "Phone repair & accessories",
  secondaryIntent: "More Chay — tea",
  phone: "+380 63 924 22 22",
  address: "вул. Валерія Лобановського, 21/3",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "08135",
  countryCode: "UA",
  hours: ["Пн–Сб 10:00–19:00", "Нд 10:00–18:30"],
  services: ["Phone repair discovery", "Accessories discovery", "Tea direction"],
  trust: { source: "Google", rating: 5.0, reviewCount: 68, observedAt: "2026-09-24" },
  channels: [
    { label: "Google Maps", url: "https://maps.app.goo.gl/J49ktCNKXmkhbsLt7?g_st=ic", direction: "maps" },
    { label: "Instagram · Чайка Store", url: "https://www.instagram.com/chayka_store1", direction: "primary" },
    { label: "Instagram · More Chay", url: "https://www.instagram.com/more_chau", direction: "secondary" },
    { label: "Telegram · More Chay", url: "https://t.me/more_chay", direction: "secondary" }
  ],
  factsRequiringOwnerConfirmation: ["exact repair service menu", "prices", "repair turnaround", "warranty", "supported device models", "accessory inventory", "tea inventory"],
  sourceRef: "CLIENT-SUPPLIED-CHAYKA-STORE-20260924"
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
  schemaType: "Restaurant",
  primaryIntent: "Halal restaurant and food delivery",
  phone: "+380 68 831 91 39",
  address: "вул. Валерія Лобановського, 35, корпус 9",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "08135",
  countryCode: "UA",
  hours: ["Щодня 10:00–20:00"],
  website: "https://mangal-i-kazan.com.ua/",
  services: ["Шашлик", "Люля-кебаб", "Плов", "Манти", "Лагман", "Шурпа", "Доставка по ЖК Чайки"],
  channels: [
    { label: "Official website", url: "https://mangal-i-kazan.com.ua/", direction: "primary" },
    { label: "Google Maps search", url: "https://www.google.com/maps/search/?api=1&query=%D0%9C%D0%B0%D0%BD%D0%B3%D0%B0%D0%BB+%D1%96+%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD+%D0%A7%D0%B0%D0%B9%D0%BA%D0%B8", direction: "maps" }
  ],
  factsRequiringOwnerConfirmation: ["current full menu", "current prices", "delivery radius beyond ЖК Чайки", "official social accounts", "Google Business Profile ownership"],
  sourceRef: "PUBLIC-OWNER-SITE-MANGAL-I-KAZAN-20260929"
} satisfies CatalogBusinessConcept);

export const trimmoConcept = Object.freeze({
  id: "catalog-ua-trimmo-ii-chaiky",
  slug: "trimmo-ii",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "TRIMMO II барбершоп",
  status: "unclaimed",
  market: "international",
  catalogPriority: "secondary",
  vertical: "barber_shop",
  schemaType: "BarberShop",
  primaryIntent: "Barbershop and men's grooming",
  phone: "+380 98 802 09 09",
  address: "вул. Валерія Лобановського, 24",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "08135",
  countryCode: "UA",
  hours: ["Пн–Сб 10:00–21:00", "Нд · потребує підтвердження"],
  services: ["Чоловіча стрижка", "Стрижка машинкою", "Стрижка бороди", "Камуфлювання голови", "Камуфлювання бороди"],
  trust: { source: "Google", rating: 5.0, reviewCount: 157, observedAt: "2026-09-29" },
  channels: [
    { label: "Google Maps search", url: "https://www.google.com/maps/search/?api=1&query=TRIMMO+II+%D0%A7%D0%B0%D0%B9%D0%BA%D0%B8", direction: "maps" },
    { label: "MAKEUP HUB", url: "https://hub.makeup.com.ua/salon/trimmo-barbersop", direction: "secondary" }
  ],
  factsRequiringOwnerConfirmation: ["Sunday hours", "current prices", "master roster", "online booking URL", "official social accounts"],
  sourceRef: "PUBLIC-WEB-TRIMMO-II-CHAIKY-20260929"
} satisfies CatalogBusinessConcept);

export const cvitVyshniConcept = Object.freeze({
  id: "catalog-ua-cvit-vyshni-irpin",
  slug: "cvit-vyshni",
  countrySlug: "ukraine",
  localitySlug: "irpin",
  name: "Квіткова студія Цвіт VYSHNI",
  status: "unclaimed",
  market: "international",
  catalogPriority: "secondary",
  vertical: "flower_shop",
  schemaType: "Florist",
  primaryIntent: "Flower shop and floral studio",
  phone: "+380 99 401 86 27",
  address: "вул. Українська, 57 А",
  locality: "Ірпінь",
  region: "Київська область",
  postalCode: "08205",
  countryCode: "UA",
  hours: ["Щодня 09:00–20:00"],
  services: ["Квіти", "Букети", "Флористична студія"],
  trust: { source: "Google", rating: 5.0, reviewCount: 39, observedAt: "2026-09-29" },
  channels: [
    { label: "Google Maps search", url: "https://www.google.com/maps/search/?api=1&query=%D0%A6%D0%B2%D1%96%D1%82+VYSHNI+%D0%86%D1%80%D0%BF%D1%96%D0%BD%D1%8C", direction: "maps" }
  ],
  factsRequiringOwnerConfirmation: ["current bouquet catalog", "delivery area", "current prices", "custom-order terms", "official website and social accounts"],
  sourceRef: "PUBLIC-MAPS-CVIT-VYSHNI-IRPIN-20260929"
} satisfies CatalogBusinessConcept);

export const catalogBusinessConcepts = Object.freeze([
  chaykaStoreConcept,
  mangalIKazanConcept,
  trimmoConcept,
  cvitVyshniConcept
]);
