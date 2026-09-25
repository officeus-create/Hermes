export type CatalogLifecycleState =
  | "DISCOVERED"
  | "RESEARCHED"
  | "CONCEPT_DRAFT"
  | "REVIEWED"
  | "PUBLISHED_UNCLAIMED"
  | "CLAIMED"
  | "CLIENT"
  | "OWN_DOMAIN_LIVE";

export type CatalogConceptLocale = "uk" | "en";
export type CatalogConceptSourceImport = {
  url: string;
  type: string;
  status: "pending" | "verified" | "failed";
  note?: string;
};
export type CatalogConceptReference = {
  role: "visual" | "functionality" | "structure-conversion";
  url: string;
  note?: string;
};
export type CatalogConceptCopy = {
  disclosure: string;
  heroKicker: string;
  heroTitle: string;
  heroLead: string;
  requestLabel: string;
  claimLabel: string;
  verifiedLabel: string;
  proposedLabel: string;
  ownerConfirmationLabel: string;
  primaryIntentLabel: string;
  secondaryIntentLabel: string;
  truthTitle: string;
  opportunityTitle: string;
  opportunityBody: string;
  requestTitle: string;
  requestBody: string;
  seoTitle: string;
};

export type CatalogBusinessConcept = {
  id: string;
  slug: string;
  countrySlug: string;
  localitySlug: string;
  name: string;
  status: "unclaimed" | "claimed" | "client";
  lifecycleState: CatalogLifecycleState;
  schemaType: "LocalBusiness" | "AutoRepair" | "Store" | "ProfessionalService";
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
  verifiedFacts: string[];
  proposedConcepts: string[];
  factsRequiringOwnerConfirmation: string[];
  sourceImports: CatalogConceptSourceImport[];
  competitorReferences: CatalogConceptReference[];
  semanticCore: string[];
  localIntents: string[];
  ownerApproval: { required: boolean; approvedAt: string | null; approvedBy: string | null };
  attributionLinks: { label: string; url: string; relationship: string; reciprocalRequired: false }[];
  copy: Record<CatalogConceptLocale, CatalogConceptCopy>;
  seo: { title: string; description: string };
  sourceRef: string;
};

export const chaykaStoreConcept = Object.freeze({
  id: "catalog-ua-chayka-store",
  slug: "chayka-store",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "Чайка Store",
  status: "unclaimed",
  lifecycleState: "PUBLISHED_UNCLAIMED",
  schemaType: "LocalBusiness",
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
  verifiedFacts: [
    "business name",
    "phone",
    "Chaiky location",
    "published hours",
    "Google Maps source",
    "repair/accessories social channel",
    "separate More Chay tea direction",
  ],
  proposedConcepts: [
    "conversion-oriented website presentation",
    "local SEO/GEO structure",
    "Hermes Connect CRM handoff",
    "owner-controlled claim and growth workflow",
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
  sourceImports: [
    { url: "https://maps.app.goo.gl/J49ktCNKXmkhbsLt7?g_st=ic", type: "google_business", status: "verified", note: "Client-supplied business location source." },
    { url: "https://www.instagram.com/chayka_store1", type: "instagram", status: "verified", note: "Client-supplied repair/accessories social source." },
    { url: "https://www.instagram.com/more_chau", type: "instagram", status: "verified", note: "Client-supplied tea-direction source." },
    { url: "https://t.me/more_chay", type: "telegram", status: "verified", note: "Client-supplied tea-direction source." },
  ],
  competitorReferences: [],
  semanticCore: [
    "ремонт телефонів Чайки",
    "ремонт смартфонів Чайки",
    "аксесуари для телефонів Чайки",
  ],
  localIntents: [
    "phone repair in Chaiky",
    "smartphone repair Kyiv region",
    "phone accessories Chaiky",
  ],
  ownerApproval: { required: true, approvedAt: null, approvedBy: null },
  attributionLinks: [
    { label: "Google Maps", url: "https://maps.app.goo.gl/J49ktCNKXmkhbsLt7?g_st=ic", relationship: "verified source", reciprocalRequired: false },
    { label: "Instagram · Чайка Store", url: "https://www.instagram.com/chayka_store1", relationship: "verified source", reciprocalRequired: false },
  ],
  copy: {
    uk: {
      disclosure: "Публічні та надані бізнесом дані + концепція презентації Hermes",
      heroKicker: "Ремонт телефонів · Чайки",
      heroTitle: "Телефон зламався? Почніть із Чайка Store.",
      heroLead: "Локальна точка в Чайках. Зателефонуйте або напишіть, щоб уточнити ремонт, аксесуари та актуальну наявність.",
      requestLabel: "Залишити запит",
      claimLabel: "Власник? Підтвердити профіль",
      verifiedLabel: "Підтверджений факт",
      proposedLabel: "Концепція Hermes",
      ownerConfirmationLabel: "Потрібне підтвердження власника",
      primaryIntentLabel: "Основний напрям",
      secondaryIntentLabel: "Окремий напрям",
      truthTitle: "Факти, концепція та межі підтвердження",
      opportunityTitle: "Перетворіть концепцію на власну систему зростання.",
      opportunityBody: "Сайт, Google Maps, SEO/GEO, Hermes Connect CRM, SMM та автоматизацію можна підключати лише після перевірки власника та окремого погодження.",
      requestTitle: "Потрібен ремонт або зв’язок із бізнесом?",
      requestBody: "Hermes збереже джерело запиту. Сторінка не означає, що бізнес уже є клієнтом Hermes.",
      seoTitle: "SEO / GEO foundation",
    },
    en: {
      disclosure: "Verified/public and business-supplied data + Hermes presentation concept",
      heroKicker: "Phone repair · Chaiky",
      heroTitle: "Phone problem? Start with Chayka Store.",
      heroLead: "A local business in Chaiky. Call or message to confirm repair, accessories and current availability.",
      requestLabel: "Start request",
      claimLabel: "Owner? Verify profile",
      verifiedLabel: "Verified fact",
      proposedLabel: "Hermes concept",
      ownerConfirmationLabel: "Owner confirmation required",
      primaryIntentLabel: "Primary direction",
      secondaryIntentLabel: "Separate direction",
      truthTitle: "Facts, concept and confirmation boundaries",
      opportunityTitle: "Turn the concept into an owned growth system.",
      opportunityBody: "Website, Google Maps, SEO/GEO, Hermes Connect CRM, SMM and automation can be activated only after owner verification and separate approval.",
      requestTitle: "Need repair or contact with the business?",
      requestBody: "Hermes preserves the request source. This page does not mean the business is already a Hermes customer.",
      seoTitle: "SEO / GEO foundation",
    },
  },
  seo: {
    title: "Ремонт телефонів у Чайках | Чайка Store — Hermes Catalog",
    description: "Hermes Catalog website concept for Чайка Store in Чайки: phone repair discovery, verified contact channels and a separate More Chay tea direction.",
  },
  sourceRef: "CLIENT-SUPPLIED-CHAYKA-STORE-20260924"
} satisfies CatalogBusinessConcept);

export const catalogBusinessConcepts = Object.freeze([chaykaStoreConcept]);
