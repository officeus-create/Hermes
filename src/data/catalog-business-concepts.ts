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
  schemaType: "LocalBusiness" | "Restaurant" | "HairSalon" | "Florist" | "Store";
  primaryIntent: string;
  secondaryIntent?: string;
  phone: string;
  address: string;
  locality: string;
  region: string;
  postalCode?: string;
  countryCode: string;
  hours: string[];
  schemaHours?: string[];
  website?: string;
  services: string[];
  trust?: { source: string; rating: number; reviewCount: number; observedAt: string };
  channels: { label: string; url: string; direction: "primary" | "secondary" | "maps" }[];
  factsRequiringOwnerConfirmation: string[];
  localeCopy?: {
    uk: {
      disclosure: string; heroKicker: string; heroTitle: string; heroLead: string;
      requestLabel: string; claimLabel: string; truthTitle: string;
      opportunityTitle: string; opportunityBody: string; requestTitle: string; requestBody: string;
    };
    en: {
      disclosure: string; heroKicker: string; heroTitle: string; heroLead: string;
      requestLabel: string; claimLabel: string; truthTitle: string;
      opportunityTitle: string; opportunityBody: string; requestTitle: string; requestBody: string;
    };
  };
  faq?: { question: string; answer: string }[];
  semanticCore?: string[];
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
  schemaHours: ["Mo-Sa 10:00-19:00", "Su 10:00-18:30"],
  services: ["Phone repair discovery", "Accessories discovery", "Tea direction"],
  trust: { source: "Google", rating: 5.0, reviewCount: 68, observedAt: "2026-09-24" },
  channels: [
    { label: "Google Maps", url: "https://maps.app.goo.gl/J49ktCNKXmkhbsLt7?g_st=ic", direction: "maps" },
    { label: "Instagram · Чайка Store", url: "https://www.instagram.com/chayka_store1", direction: "primary" },
    { label: "Instagram · More Chay", url: "https://www.instagram.com/more_chau", direction: "secondary" },
    { label: "Telegram · More Chay", url: "https://t.me/more_chay", direction: "secondary" }
  ],
  factsRequiringOwnerConfirmation: ["exact repair service menu", "prices", "repair turnaround", "warranty", "supported device models", "accessory inventory", "tea inventory"],
  localeCopy: {
    uk: {
      disclosure: "Публічні та надані бізнесом дані + концепція презентації Hermes",
      heroKicker: "Ремонт телефонів · Чайки",
      heroTitle: "Телефон зламався? Почніть із Чайка Store.",
      heroLead: "Локальна точка в Чайках. Зателефонуйте або напишіть, щоб уточнити ремонт, аксесуари та актуальну наявність.",
      requestLabel: "Залишити запит",
      claimLabel: "Власник? Підтвердити профіль",
      truthTitle: "Факти, концепція та межі підтвердження",
      opportunityTitle: "Перетворіть концепцію на власну систему зростання.",
      opportunityBody: "Сайт, Google Maps, SEO/GEO, Hermes Connect CRM, SMM та автоматизацію можна підключати лише після перевірки власника та окремого погодження.",
      requestTitle: "Потрібен ремонт або зв’язок із бізнесом?",
      requestBody: "Hermes збереже джерело запиту. Сторінка не означає, що бізнес уже є клієнтом Hermes."
    },
    en: {
      disclosure: "Verified/public and business-supplied data + Hermes presentation concept",
      heroKicker: "Phone repair · Chaiky",
      heroTitle: "Phone problem? Start with Chayka Store.",
      heroLead: "A local business in Chaiky. Call or message to confirm repair, accessories and current availability.",
      requestLabel: "Start request",
      claimLabel: "Owner? Verify profile",
      truthTitle: "Facts, concept and confirmation boundaries",
      opportunityTitle: "Turn the concept into an owned growth system.",
      opportunityBody: "Website, Google Maps, SEO/GEO, Hermes Connect CRM, SMM and automation can be activated only after owner verification and separate approval.",
      requestTitle: "Need repair or contact with the business?",
      requestBody: "Hermes preserves the request source. This page does not mean the business is already a Hermes customer."
    }
  },
  faq: [
    { question: "Чи можна уточнити ремонт телефону через цю сторінку?", answer: "Так. Ви можете залишити контактний запит; конкретні послуги, ціна, строки та гарантія мають бути підтверджені бізнесом." },
    { question: "Це офіційний сайт Чайка Store?", answer: "Ні. Це Hermes Catalog Website Concept на основі публічних і наданих бізнес-даних; профіль залишається непідтвердженим власником у Hermes." }
  ],
  semanticCore: ["ремонт телефонів Чайки", "ремонт смартфонів Чайки", "local entity + NAP", "Google Business", "FAQ + schema", "UA / EN"],
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
  countryCode: "UA",
  hours: ["Щодня 10:00–20:00"],
  schemaHours: ["Mo-Su 10:00-20:00"],
  website: "https://mangal-i-kazan.com.ua/",
  services: ["Шашлик", "Люля-кебаб", "Плов", "Манти", "Лагман", "Шурпа", "Доставка по ЖК Чайки"],
  channels: [
    { label: "Official website", url: "https://mangal-i-kazan.com.ua/", direction: "primary" }
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
  schemaType: "HairSalon",
  primaryIntent: "Barbershop and men's grooming",
  phone: "+380 98 802 09 09",
  address: "вул. Валерія Лобановського, 24",
  locality: "Чайки",
  region: "Київська область",
  postalCode: "08135",
  countryCode: "UA",
  hours: ["Пн–Сб 10:00–21:00", "Нд · потребує підтвердження"],
  schemaHours: ["Mo-Sa 10:00-21:00"],
  services: ["Чоловіча стрижка", "Стрижка машинкою", "Стрижка бороди", "Камуфлювання голови", "Камуфлювання бороди"],
  trust: { source: "Google", rating: 5.0, reviewCount: 157, observedAt: "2026-09-29" },
  channels: [
    { label: "Google Maps search", url: "https://www.google.com/maps/search/?api=1&query=TRIMMO%20II%20Chaiky&query_place_id=ChIJMS7DeQA1K0cRK1y1L5Z0iOE", direction: "maps" },
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
  schemaHours: ["Mo-Su 09:00-20:00"],
  services: ["Квіти", "Букети", "Флористична студія"],
  trust: { source: "Google", rating: 5.0, reviewCount: 39, observedAt: "2026-09-29" },
  channels: [
    { label: "Google Maps search", url: "https://www.google.com/maps/search/?api=1&query=Cvit%20VYSHNI%20Irpin&query_place_id=ChIJz2BQqVIzK0cRhKao5k9b71E", direction: "maps" }
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

// A non-indexable concept snapshot, not a second directory or CRM business record.
// Public facts: official website/services; address/hours: source-review handoff, 2026-09-30.
export const kittlesWebsiteConcept = Object.freeze({
  id: "catalog-concept-kittles-garage",
  slug: "kittles-garage", countrySlug: "us", localitySlug: "north-little-rock",
  name: "Kittle’s Garage", status: "client", market: "us", catalogPriority: "primary",
  vertical: "repair_shop", schemaType: "LocalBusiness",
  primaryIntent: "American & Asian passenger / light-vehicle repair",
  phone: "(501) 376-1519", address: "1300 N Poplar St", locality: "North Little Rock",
  region: "Arkansas", postalCode: "72114", countryCode: "US",
  hours: ["Monday–Thursday · 7:30 AM–5:30 PM", "Friday · 7:30 AM–2:00 PM", "Saturday & Sunday · closed"],
  website: "https://www.kittlesgarage.com/",
  services: ["Diagnostics", "Brakes", "Steering & suspension", "Electrical", "Heating & A/C", "Drivetrain", "Tires", "Wheel alignment", "Routine maintenance"],
  channels: [{ label: "Official business website", url: "https://www.kittlesgarage.com/", direction: "primary" }],
  factsRequiringOwnerConfirmation: ["current service scope", "hours and address", "appointment availability", "prices"],
  sourceRef: "PUBLIC-KITTLES-OFFICIAL-SITE-SERVICES-20260930",
} satisfies CatalogBusinessConcept);
