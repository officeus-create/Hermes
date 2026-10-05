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
  vertical: "repair_shop" | "restaurant" | "barber_shop" | "flower_shop" | "retail" | "business_academy";
  schemaType: "LocalBusiness" | "Restaurant" | "HairSalon" | "Florist" | "Store" | "EducationalOrganization";
  primaryIntent: string;
  secondaryIntent?: string;
  featuredOffer?: { name: string; url: string; description: string; duration?: string };
  crmPreviewUrl?: string;
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
  crmPreviewUrl: "/demos/hermes-connect/academy-knb.html",
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
    { label: "Threads · @konsnabis", url: "https://www.threads.com/@konsnabis", direction: "secondary" }
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
        platform: "facebook", label: "Facebook", state: "needs_private_analytics",
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
        platform: "telegram", label: "Telegram", state: "owner_confirmation",
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

export const catalogBusinessConcepts = Object.freeze([
  chaykaStoreConcept,
  mangalIKazanConcept,
  trimmoConcept,
  cvitVyshniConcept,
  konsNaBisConcept
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
