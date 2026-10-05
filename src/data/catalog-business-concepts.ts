export type CatalogAuditPlatform = "website" | "google" | "instagram" | "facebook" | "threads" | "tiktok" | "youtube" | "telegram";
export type CatalogAuditState = "observed" | "needs_private_analytics" | "owner_confirmation";
export type CatalogAuditText = { uk: string; en: string };
export type CatalogDigitalAuditFinding = {
  platform: CatalogAuditPlatform;
  label: string;
  url?: string;
  state: CatalogAuditState;
  headline: CatalogAuditText;
  findings: CatalogAuditText[];
  nextStep: CatalogAuditText;
};
export type CatalogDigitalAudit = {
  observedAt: string;
  summary: CatalogAuditText;
  prerequisite: CatalogAuditText;
  sequence: CatalogAuditText[];
  findings: CatalogDigitalAuditFinding[];
};

export type CatalogBusinessConcept = {
  id: string;
  slug: string;
  countrySlug: string;
  localitySlug: string;
  name: string;
  status: "unclaimed" | "claimed" | "client";
  market: "us" | "international";
  catalogPriority: "primary" | "secondary";
  vertical: "repair_shop" | "restaurant" | "barber_shop" | "flower_shop" | "retail" | "business_academy" | "junk_removal";
  schemaType: "LocalBusiness" | "Restaurant" | "HairSalon" | "Florist" | "Store" | "EducationalOrganization";
  primaryIntent: string;
  secondaryIntent?: string;
  featuredOffer?: { name: string; url: string; description: string; duration?: string };
  crmPreviewUrl?: string;\n  strategyPreviewUrl?: string;
  digitalAudit?: CatalogDigitalAudit;
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

export const konsNaBisConcept = Object.freeze({
  id: "catalog-ua-kons-na-bis-bila-tserkva",
  slug: "kons-na-bis",
  countrySlug: "ukraine",
  localitySlug: "bila-tserkva",
  name: "Конс на Бі$",
  status: "client",
  market: "international",
  catalogPriority: "secondary",
  vertical: "business_academy",
  schemaType: "EducationalOrganization",
  primaryIntent: "Бізнес-клуб та навчання для власників малого і середнього бізнесу",
  secondaryIntent: "7-тижнева програма «Стратегія керованого зростання у бізнесі»",
  featuredOffer: {
    name: "Стратегія керованого зростання у бізнесі",
    url: "https://biznes-club-knb.com/zrostannia-u-biznesi",
    description: "Комплексна онлайн-програма для підприємців із супроводом; офіційний опис програми заявляє 7-тижневий формат.",
    duration: "7 тижнів"
  },
  crmPreviewUrl: "/demos/hermes-connect/academy-knb.html",\n  strategyPreviewUrl: "/businesses/concepts/kons-na-bis/",
  phone: "+380 67 11 55 111",
  address: "вул. Ярослава Мудрого, 16/2, 16",
  locality: "Біла Церква",
  region: "Київська область",
  postalCode: "09107",
  countryCode: "UA",
  hours: ["Онлайн-програми та бізнес-клуб · актуальний розклад уточнюйте на офіційному сайті"],
  website: "https://kons-na-bis.com/",
  services: [
    "Стратегія керованого зростання у бізнесі · 7 тижнів",
    "Бізнес-клуб для підприємців",
    "Бізнес-аудити",
    "Маркетинг і систематизація залучення клієнтів",
    "Систематизація продажів",
    "Найм і делегування",
    "Навчальні події та групові програми"
  ],
  channels: [
    { label: "Official website", url: "https://kons-na-bis.com/", direction: "primary" },
    { label: "Instagram · @konsnabis", url: "https://www.instagram.com/konsnabis/", direction: "secondary" },
    { label: "YouTube · Олександр Морозов", url: "https://www.youtube.com/@Oleksandr_Morozov_KnB", direction: "secondary" },
    { label: "TikTok · @konsnabis", url: "https://www.tiktok.com/@konsnabis", direction: "secondary" },
    { label: "Threads · @konsnabis", url: "https://www.threads.com/@konsnabis", direction: "secondary" },\n    { label: "Facebook · Конс на Бі$", url: "https://www.facebook.com/konsnabis/", direction: "secondary" },\n    { label: "Telegram · Конс на Бі$", url: "https://t.me/konsnabis", direction: "secondary" }
  ],
  digitalAudit: {
    observedAt: "2026-10-05",
    summary: {
      uk: "З відкритих даних можна зробити первинний digital-аудит, але не чесно оголосити готовий social funnel або оффер. Для робочого рішення спочатку потрібні внутрішня аналітика, стабільний органічний baseline і контрольований paid-learning.",
      en: "Public sources support an initial digital audit, but not an honest claim that a social funnel or offer is already validated. A working decision requires internal analytics, a stable organic baseline, and controlled paid learning first."
    },
    prerequisite: {
      uk: "Порядок для social: доступи до Meta Business Suite / Instagram Insights / Ads Manager → органічне програмування та baseline → paid learning на органічних переможцях → лише потім offer hypothesis, funnel і масштабування.",
      en: "Social sequence: Meta Business Suite / Instagram Insights / Ads Manager access → organic programming and baseline → paid learning on organic winners → only then an offer hypothesis, funnel, and scale."
    },
    sequence: [
      { uk: "1 · Public + internal audit", en: "1 · Public + internal audit" },
      { uk: "2 · Органічне програмування + стабільний baseline", en: "2 · Organic programming + stable baseline" },
      { uk: "3 · Контрольоване paid learning на organic winners", en: "3 · Controlled paid learning on organic winners" },
      { uk: "4 · Offer hypothesis + funnel тільки після signal gate", en: "4 · Offer hypothesis + funnel only after the signal gate" },
      { uk: "5 · CRM attribution → sales → verified outcome", en: "5 · CRM attribution → sales → verified outcome" }
    ],
    findings: [
      {
        platform: "website", label: "Website", url: "https://kons-na-bis.com/", state: "observed",
        headline: { uk: "Сайт і окрема сторінка 7-тижневої програми існують; змінні комерційні умови мають залишатися на офіційному source.", en: "The website and a dedicated seven-week program page exist; changing commercial terms should remain on the official source." },
        findings: [
          { uk: "Hermes може підтвердити саму програму та її 7-тижневий online-формат із публічних джерел.", en: "Hermes can verify the program itself and its seven-week online format from public sources." },
          { uk: "Ціна, дата потоку, пакет і результативні claims можуть змінюватися — не дублюємо їх як постійні факти Catalog.", en: "Price, cohort date, package, and outcome claims can change, so Catalog must not duplicate them as permanent facts." },
          { uk: "До offer-тесту website повинен мати один canonical conversion path і зберігати source/UTM у CRM.", en: "Before offer testing, the website should have one canonical conversion path and preserve source/UTM into CRM." }
        ],
        nextStep: { uk: "Визначити один canonical commercial route після social readiness gate та підключити privacy-safe attribution.", en: "Choose one canonical commercial route after the social readiness gate and connect privacy-safe attribution." }
      },
      {
        platform: "google", label: "Google", state: "owner_confirmation",
        headline: { uk: "Локальна присутність у Google має працювати як окремий SEO/GEO surface, але офіційний Business Profile та його owner-доступ у поточному evidence registry не підтверджені.", en: "Google local presence should operate as a separate SEO/GEO surface, but the official Business Profile and owner access are not confirmed in the current evidence registry." },
        findings: [
          { uk: "NAP, категорії, сайт, фото, відгуки, Q&A та локальні запити потрібно звіряти з підтвердженим Google Business Profile, а не реконструювати з випадкових search results.", en: "NAP, categories, website, photos, reviews, Q&A, and local queries should be checked against a verified Google Business Profile rather than reconstructed from incidental search results." },
          { uk: "Catalog-профіль може підсилювати entity discovery, але не повинен дублювати непідтверджені рейтинги, години або review counts.", en: "The Catalog profile can reinforce entity discovery, but it must not duplicate unverified ratings, hours, or review counts." }
        ],
        nextStep: { uk: "Підтвердити canonical Google Business Profile/Maps URL і owner access; після цього зв’язати local search → website action → CRM source.", en: "Verify the canonical Google Business Profile/Maps URL and owner access, then connect local search → website action → CRM source." }
      },
      {
        platform: "instagram", label: "Instagram", url: "https://www.instagram.com/konsnabis/", state: "needs_private_analytics",
        headline: { uk: "Публічний профіль не дає достатніх даних, щоб валідно рахувати ER, retention, audience quality або ефективність оффера.", en: "The public profile does not provide enough data to validly calculate ER, retention, audience quality, or offer performance." },
        findings: [
          { uk: "Потрібні Meta Business Suite, Instagram Insights і Ads Manager: мінімум 90-денний зріз Reach, ER, retention/watch time, saves, shares, profile visits, географії та paid/organic split.", en: "Meta Business Suite, Instagram Insights, and Ads Manager are required: at least a 90-day view of Reach, ER, retention/watch time, saves, shares, profile visits, geography, and paid/organic split." },
          { uk: "Якість аудиторії, боти або anomalous followers перевіряються по account data; не оголошуємо їх фактом із зовнішнього перегляду.", en: "Audience quality, bots, or anomalous followers must be checked from account data; they are not declared as facts from an external view." },
          { uk: "Спочатку будуємо scheduled organic content / Reels matrix і шукаємо повторюваних organic winners.", en: "First build a scheduled organic content/Reels matrix and identify repeatable organic winners." }
        ],
        nextStep: { uk: "Після стабільного organic baseline запускати малий контрольований paid-learning тільки на переможцях; offer test — після накопичення signal.", en: "After a stable organic baseline, run small controlled paid learning only on winners; test the offer after sufficient signal accumulates." }
      },
      {
        platform: "facebook", label: "Facebook", url: "https://www.facebook.com/konsnabis/", state: "needs_private_analytics",
        headline: { uk: "Facebook має бути частиною Meta learning system, але incremental lift від crossposting потрібно вимірювати, а не припускати.", en: "Facebook should participate in the Meta learning system, but incremental lift from crossposting must be measured rather than assumed." },
        findings: [
          { uk: "Потрібні Page/Business Suite insights, paid/organic split та downstream actions.", en: "Page/Business Suite insights, paid/organic split, and downstream actions are required." },
          { uk: "Crossposting використовуємо як distribution test із єдиною content identity, а не як доказ подвоєння охоплення.", en: "Use crossposting as a distribution test with one content identity, not as proof that reach doubles." }
        ],
        nextStep: { uk: "Зв’язати Instagram/Facebook assets одним measurement contract і порівнювати organic winner → paid-learning → qualified action.", en: "Connect Instagram/Facebook assets with one measurement contract and compare organic winner → paid learning → qualified action." }
      },
      {
        platform: "threads", label: "Threads", url: "https://www.threads.com/@konsnabis", state: "needs_private_analytics",
        headline: { uk: "Threads підходить для швидкого тестування hooks, питань і позиціонування, але самі views не валідовують sales offer.", en: "Threads is useful for fast testing of hooks, questions, and positioning, but views alone do not validate a sales offer." },
        findings: [
          { uk: "Тести повинні мати тему, audience hypothesis і наступну вимірювану дію.", en: "Tests should carry a topic, audience hypothesis, and next measurable action." },
          { uk: "Переможні формулювання можна переносити в Reels/Stories/Facebook тільки після порівняння response quality.", en: "Winning language can move into Reels/Stories/Facebook only after response quality is compared." }
        ],
        nextStep: { uk: "Використовувати Threads як дешевий hypothesis layer до paid offer testing.", en: "Use Threads as a low-cost hypothesis layer before paid offer testing." }
      },
      {
        platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@konsnabis", state: "needs_private_analytics",
        headline: { uk: "Short-form канал можна оцінювати по organic patterns, але public views не замінюють retention і audience data.", en: "The short-form channel can be evaluated through organic patterns, but public views do not replace retention and audience data." },
        findings: [
          { uk: "Порівнюємо hooks, watch time, completion, shares і profile actions до будь-якої paid рекомендації.", en: "Compare hooks, watch time, completion, shares, and profile actions before any paid recommendation." }
        ],
        nextStep: { uk: "Знайти repeatable organic format і тільки потім вирішувати, чи потрібен paid test.", en: "Find a repeatable organic format before deciding whether a paid test is warranted." }
      },
      {
        platform: "youtube", label: "YouTube", url: "https://www.youtube.com/@Oleksandr_Morozov_KnB", state: "needs_private_analytics",
        headline: { uk: "YouTube може давати trust і search intent, але його роль у продажі потрібно доводити через click/lead attribution.", en: "YouTube can build trust and search intent, but its role in sales must be proven through click/lead attribution." },
        findings: [
          { uk: "Shorts і long-form оцінюються окремо; retention, returning viewers і переходи важливіші за raw views.", en: "Shorts and long-form should be evaluated separately; retention, returning viewers, and transitions matter more than raw views." }
        ],
        nextStep: { uk: "Зв’язати searchable education з canonical website action і CRM source.", en: "Connect searchable education to a canonical website action and CRM source." }
      },
      {
        platform: "telegram", label: "Telegram", url: "https://t.me/konsnabis", state: "needs_private_analytics",
        headline: { uk: "Telegram логічний як nurture/retention layer, але приватні conversion та якість аудиторії ззовні не видно.", en: "Telegram is a logical nurture/retention layer, but private conversion and audience quality are not externally visible." },
        findings: [
          { uk: "Не змішуємо channel membership із qualified lead або sale.", en: "Do not equate channel membership with a qualified lead or sale." }
        ],
        nextStep: { uk: "Після owner access виміряти source → join → next action → consultation без дублювання CRM identity.", en: "After owner access, measure source → join → next action → consultation without duplicating CRM identity." }
      }
    ]
  },
  factsRequiringOwnerConfirmation: [
    "актуальна дата старту наступної групи",
    "актуальна вартість програми",
    "поточний розклад занять і подій",
    "формулювання результатів/гарантій для публікації Hermes",
    "остаточне погодження оформлення Hermes Catalog профілю"
  ],
  localeCopy: {
    uk: {
      disclosure: "Клієнтський профіль Hermes Catalog на основі офіційних публічних джерел; оформлення та змінні комерційні умови потребують окремого погодження.",
      heroKicker: "Бізнес-клуб · навчання підприємців · Біла Церква",
      heroTitle: "Конс на Бі$ — бізнес-клуб і 7-тижнева програма керованого зростання.",
      heroLead: "Публічний профіль об’єднує перевірені контакти, напрямки навчання та офіційну програму «Стратегія керованого зростання у бізнесі», щоб її можна було знаходити через Hermes Catalog та пошук.",
      requestLabel: "Перейти до програми",
      claimLabel: "Керування профілем",
      truthTitle: "Підтверджені факти та межі публікації",
      opportunityTitle: "Органічна видимість без дублювання офіційного сайту.",
      opportunityBody: "Hermes Catalog працює як додаткова discovery-сторінка: з канонічним зв’язком на офіційний сайт і програму, структурованими фактами, внутрішніми посиланнями та окремою CRM-демонстрацією.",
      requestTitle: "Шукаєте програму «Стратегія керованого зростання»?",
      requestBody: "Використовуйте офіційне посилання на програму для актуальних умов участі; Hermes не підміняє офіційний сайт і не вигадує ціну, дату старту чи результати."
    },
    en: {
      disclosure: "Hermes Catalog client profile based on official public sources; presentation and changing commercial terms require separate approval.",
      heroKicker: "Business club · entrepreneur training · Bila Tserkva",
      heroTitle: "Kons na Bis — business club and a seven-week managed-growth program.",
      heroLead: "This public profile connects verified contact details, training directions and the official “Managed Business Growth Strategy” program so the entity can be discovered through Hermes Catalog and organic search.",
      requestLabel: "Open the program",
      claimLabel: "Manage profile",
      truthTitle: "Verified facts and publication boundaries",
      opportunityTitle: "Organic discovery without duplicating the official website.",
      opportunityBody: "Hermes Catalog acts as an additional discovery page with canonical links to the official site and program, structured facts, internal linking, and a separate CRM demonstration.",
      requestTitle: "Looking for the Managed Business Growth Strategy program?",
      requestBody: "Use the official program page for current participation terms. Hermes does not invent pricing, cohort dates, or outcome claims."
    }
  },
  faq: [
    { question: "Що таке «Стратегія керованого зростання у бізнесі»?", answer: "За офіційним описом КНБ це комплексна онлайн-програма для підприємців тривалістю 7 тижнів. Актуальну програму, дату старту та умови участі слід перевіряти на офіційній сторінці." },
    { question: "Чи є ця сторінка офіційним сайтом КНБ?", answer: "Ні. Це додатковий профіль Hermes Catalog для пошуку й навігації, який посилається на офіційні ресурси КНБ і не замінює їх." },
    { question: "Що Hermes реалізував для КНБ?", answer: "Окремо від цього індексованого профілю підготовлено Academy CRM demo та noindex marketing-assessment із social-аудитом, funnel/offer і KPI-моделлю." }
  ],
  semanticCore: [
    "Конс на Бі$",
    "Конс на Біс",
    "бізнес клуб підприємців",
    "Стратегія керованого зростання у бізнесі",
    "бізнес курс для підприємців",
    "Олександр Морозов бізнес клуб",
    "бізнес навчання Україна",
    "Біла Церква бізнес клуб"
  ],
  sourceRef: "OFFICIAL-KNB-SITE-POLICY-PROGRAM-20261005"
} satisfies CatalogBusinessConcept);

export const mzmJunkRemovalConcept = Object.freeze({
  id: "catalog-us-mzm-junk-removal-roseville",
  slug: "mzm-junk-removal",
  countrySlug: "california",
  localitySlug: "roseville",
  name: "MZM Junk Removal",
  status: "client",
  market: "us",
  catalogPriority: "primary",
  vertical: "junk_removal",
  schemaType: "LocalBusiness",
  primaryIntent: "Junk removal, hauling and cleanouts in Roseville and Greater Sacramento",
  secondaryIntent: "Same-day and next-day residential, commercial and construction debris removal",
  crmPreviewUrl: "/demos/hermes-connect/mzm-junk-removal.html",
  phone: "+1 279-239-1800",
  address: "906 Main St",
  locality: "Roseville",
  region: "California",
  postalCode: "95678",
  countryCode: "US",
  hours: ["Daily 3:00 AM–7:00 PM"],
  schemaHours: ["Mo-Su 03:00-19:00"],
  website: "https://mzm-junk-removal.com/",
  services: [
    "Junk removal",
    "Furniture removal",
    "Appliance removal",
    "Mattress removal",
    "Garage cleanout",
    "Estate cleanout",
    "Eviction cleanout",
    "Property cleanout",
    "Office cleanout",
    "Storage unit cleanout",
    "Construction debris removal",
    "Yard debris cleanout",
    "Shed removal"
  ],
  trust: { source: "Google Business Profile", rating: 5.0, reviewCount: 46, observedAt: "2026-10-05" },
  channels: [
    { label: "Official website", url: "https://mzm-junk-removal.com/", direction: "primary" },
    { label: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=MZM%20Junk%20Removal%20906%20Main%20St%20Roseville%20CA%2095678", direction: "maps" },
    { label: "Thumbtack", url: "https://www.thumbtack.com/ca/roseville/junk-removal/mzm-junk-removal/service/574285364726562823", direction: "secondary" }
  ],
  digitalAudit: {
    observedAt: "2026-10-05",
    summary: {
      uk: "Публічні джерела вже показують сильну основу: локальний сайт, Google presence, Thumbtack, city/service coverage, before/after та відгуки. Але рішення про масштабування мають спиратися на owner analytics і CRM attribution, а не лише на публічні лічильники.",
      en: "Public sources already show a strong foundation: a local website, Google presence, Thumbtack, city/service coverage, before/after proof, and reviews. Growth decisions still need owner analytics and CRM attribution rather than public counters alone."
    },
    prerequisite: {
      uk: "Зберігаємо source/query/city/service/landing page у CRM → вимірюємо organic baseline → тестуємо paid тільки на підтверджених сигналах → після signal gate формуємо offer/funnel і масштабуємо.",
      en: "Preserve source/query/city/service/landing page in CRM → measure the organic baseline → run paid learning only on proven signals → build the offer/funnel after the signal gate and then scale."
    },
    sequence: [
      { uk: "1 · Public + internal audit", en: "1 · Public + internal audit" },
      { uk: "2 · SEO/local/social organic baseline", en: "2 · SEO/local/social organic baseline" },
      { uk: "3 · Controlled paid learning on proven signals", en: "3 · Controlled paid learning on proven signals" },
      { uk: "4 · Signal gate → offer + funnel", en: "4 · Signal gate → offer + funnel" },
      { uk: "5 · CRM attribution → booked job → revenue → review", en: "5 · CRM attribution → booked job → revenue → review" }
    ],
    findings: [
      {
        platform: "website", label: "Website", url: "https://mzm-junk-removal.com/", state: "observed",
        headline: { uk: "Сайт уже працює як локальний conversion surface з quote CTA, service/city coverage, proof і before/after.", en: "The site already works as a local conversion surface with quote CTAs, service/city coverage, proof, and before/after content." },
        findings: [
          { uk: "Публічно видно окремі service/city pages, ZIP/local context, same-day messaging, FAQ та social proof.", en: "Public pages expose service/city coverage, ZIP/local context, same-day messaging, FAQ, and social proof." },
          { uk: "Статичні counters на jobs/reviews можуть розходитись із зовнішніми джерелами, тому їх потрібно зберігати source-specific із observed_at.", en: "Static jobs/review counters can drift from external sources, so they should be stored source-by-source with observed_at." },
          { uk: "Кожна форма/дзвінок має зберігати landing page, UTM/referrer і city/service context до CRM.", en: "Every form/call path should preserve landing page, UTM/referrer, and city/service context into CRM." }
        ],
        nextStep: { uk: "Підключити GSC/GA4/call-form attribution та замінити ручні aggregate counters на source-owned evidence.", en: "Connect GSC/GA4/call-form attribution and replace manual aggregate counters with source-owned evidence." }
      },
      {
        platform: "google", label: "Google", url: "https://www.google.com/maps/search/?api=1&query=MZM%20Junk%20Removal%20906%20Main%20St%20Roseville%20CA%2095678", state: "needs_private_analytics",
        headline: { uk: "Google local presence підтверджена публічно; query/rank/conversion висновки потребують owner access.", en: "Google local presence is publicly confirmed; query, ranking, and conversion conclusions require owner access." },
        findings: [
          { uk: "Публічний listing узгоджується з Roseville, телефоном, адресою та годинами роботи.", en: "The public listing aligns with Roseville, the phone number, street address, and operating hours." },
          { uk: "Google reviews — окремий source; не змішуємо його count із Thumbtack без дати та джерела.", en: "Google reviews are a separate source; do not merge their count with Thumbtack without a date and source." },
          { uk: "Search Console, GBP Performance і CRM мають зійтися на landing page → lead → booked job → revenue.", en: "Search Console, GBP Performance, and CRM should converge on landing page → lead → booked job → revenue." }
        ],
        nextStep: { uk: "Після owner access підключити GBP/GSC/GA4 evidence та city/query reporting.", en: "After owner access, connect GBP/GSC/GA4 evidence and city/query reporting." }
      },
      {
        platform: "instagram", label: "Instagram", state: "owner_confirmation",
        headline: { uk: "Бізнес повідомив, що Instagram використовується для реальних робіт, фото та відео; точний public URL ще не зафіксований.", en: "The business reports using Instagram for real jobs, photos, and video; the exact public URL is not yet verified." },
        findings: [
          { uk: "Не вигадуємо handle або performance; після підключення зберігаємо asset/campaign → lead attribution.", en: "Do not invent a handle or performance; once connected, preserve asset/campaign → lead attribution." }
        ],
        nextStep: { uk: "Підтвердити official URL, підключити Insights і зафіксувати organic baseline до paid tests.", en: "Confirm the official URL, connect Insights, and establish the organic baseline before paid tests." }
      },
      {
        platform: "facebook", label: "Facebook", state: "owner_confirmation",
        headline: { uk: "Facebook заявлений власником як активний канал, але exact Page URL та внутрішні metrics ще не підтверджені.", en: "Facebook is reported by the owner as an active channel, but the exact Page URL and internal metrics are not yet verified." },
        findings: [
          { uk: "Facebook/Instagram контент має використовувати одну систему UTM/source labels і не створювати окрему CRM identity.", en: "Facebook/Instagram content should share one UTM/source-label system and not create a separate CRM identity." }
        ],
        nextStep: { uk: "Підтвердити Page/Meta access і вимірювати organic winners перед controlled paid learning.", en: "Confirm the Page/Meta access and measure organic winners before controlled paid learning." }
      },
      {
        platform: "threads", label: "Threads", state: "owner_confirmation",
        headline: { uk: "Official Threads presence у поточних bounded sources не підтверджена.", en: "An official Threads presence is not confirmed in the current bounded sources." },
        findings: [{ uk: "Unknown не означає absent.", en: "Unknown does not mean absent." }],
        nextStep: { uk: "Підтвердити URL; якщо канал використовується — тестувати local hooks і зберігати downstream action у CRM.", en: "Confirm the URL; if used, test local hooks and preserve downstream actions in CRM." }
      },
      {
        platform: "tiktok", label: "TikTok", state: "owner_confirmation",
        headline: { uk: "Official TikTok presence не підтверджена.", en: "An official TikTok presence is not confirmed." },
        findings: [{ uk: "Публічний audit не повинен вигадувати views, retention або audience fit.", en: "A public audit must not invent views, retention, or audience fit." }],
        nextStep: { uk: "Підключати тільки після підтвердження owner URL і контентної ролі.", en: "Connect only after confirming the owner URL and content role." }
      },
      {
        platform: "youtube", label: "YouTube", state: "owner_confirmation",
        headline: { uk: "Official YouTube channel не підтверджений у поточному source set.", en: "An official YouTube channel is not confirmed in the current source set." },
        findings: [{ uk: "Для локального service business канал має мати вимірювану роль: trust, how-to/search або proof.", en: "For a local service business, the channel should have a measurable trust, how-to/search, or proof role." }],
        nextStep: { uk: "Не створювати канал заради presence; спочатку визначити search/proof use case.", en: "Do not create a channel for presence alone; define the search/proof use case first." }
      },
      {
        platform: "telegram", label: "Telegram", state: "owner_confirmation",
        headline: { uk: "Telegram не підтверджений як customer acquisition channel.", en: "Telegram is not confirmed as a customer-acquisition channel." },
        findings: [{ uk: "Не додаємо зайвий канал без operational use case.", en: "Do not add another channel without an operational use case." }],
        nextStep: { uk: "Залишити off, доки owner не визначить конкретну роль.", en: "Keep it off until the owner defines a concrete role." }
      }
    ]
  },
  factsRequiringOwnerConfirmation: [
    "official Instagram URL",
    "official Facebook URL",
    "Meta Business Suite / Instagram Insights access",
    "Google Business Profile owner access",
    "Google Search Console and GA4 access",
    "Thumbtack lead-cost and job-history export",
    "exact disposal facilities and landfill fee rules",
    "Grass Valley and Nevada City service coverage before publishing city pages",
    "driver/team access roles and labor-cost inputs"
  ],
  localeCopy: {
    uk: {
      disclosure: "Клієнтський профіль Hermes Catalog на основі client-supplied facts та bounded public sources; private CRM/marketing metrics не публікуються.",
      heroKicker: "Junk removal · Roseville + Greater Sacramento",
      heroTitle: "MZM Junk Removal — локальний вивіз сміття, cleanouts і debris removal.",
      heroLead: "Публічний профіль об’єднує перевірені контакти, основні послуги, service area та Digital Audit, а operational CRM зберігається окремо від публічного Catalog.",
      requestLabel: "Запросити estimate",
      claimLabel: "Керування профілем",
      truthTitle: "Підтверджені факти та межі вимірювання",
      opportunityTitle: "Search → lead → quote → booked job → revenue → review.",
      opportunityBody: "Наступний рівень — не більше сторінок заради сторінок, а одна attribution-модель для Website, Google, Thumbtack і social, пов’язана з job economics.",
      requestTitle: "Потрібен junk removal у Roseville або Greater Sacramento?",
      requestBody: "Використовуйте офіційний сайт або запит через Hermes. Ціна, доступність і final quote підтверджуються бізнесом."
    },
    en: {
      disclosure: "Hermes Catalog client profile based on client-supplied facts and bounded public sources; private CRM and marketing metrics are not published.",
      heroKicker: "Junk removal · Roseville + Greater Sacramento",
      heroTitle: "MZM Junk Removal — local hauling, cleanouts, and debris removal.",
      heroLead: "This public profile connects verified contact details, core services, service-area context, and a Digital Audit while operational CRM data stays separate from the public Catalog.",
      requestLabel: "Request an estimate",
      claimLabel: "Manage profile",
      truthTitle: "Verified facts and measurement boundaries",
      opportunityTitle: "Search → lead → quote → booked job → revenue → review.",
      opportunityBody: "The next layer is not more pages for their own sake. It is one attribution model across Website, Google, Thumbtack, and social tied to job economics.",
      requestTitle: "Need junk removal in Roseville or Greater Sacramento?",
      requestBody: "Use the official website or a Hermes request. Availability, price, and the final quote are confirmed by the business."
    }
  },
  faq: [
    { question: "What areas does MZM Junk Removal serve?", answer: "The public website lists Roseville and Greater Sacramento coverage including Sacramento, Rocklin, Auburn, Folsom, Citrus Heights, Carmichael, Fair Oaks, Orangevale, Antelope, Granite Bay, Lincoln, Loomis, Penryn, Newcastle, Rancho Cordova and North Highlands. Additional cities should be confirmed before publishing new location pages." },
    { question: "Can the price be confirmed from this Catalog page?", answer: "No. The business prepares an estimate from the job type, address, volume and, when needed, photos. Final pricing remains owner-controlled." },
    { question: "How should reviews be measured?", answer: "Google, Thumbtack and website counters are separate evidence sources. Hermes stores source, count and observed date instead of presenting an unsourced combined total as permanent truth." }
  ],
  semanticCore: [
    "junk removal Roseville CA",
    "junk removal Sacramento CA",
    "junk removal Rocklin CA",
    "junk removal Auburn CA",
    "furniture removal",
    "appliance removal",
    "garage cleanout",
    "estate cleanout",
    "construction debris removal",
    "yard debris removal",
    "same day junk removal",
    "junk removal cost"
  ],
  sourceRef: "CLIENT-BRIEF+PUBLIC-MZM-WEB-20261005"
} satisfies CatalogBusinessConcept);

export const catalogBusinessConcepts = Object.freeze([
  chaykaStoreConcept,
  mangalIKazanConcept,
  trimmoConcept,
  cvitVyshniConcept,
  konsNaBisConcept,
  mzmJunkRemovalConcept
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
