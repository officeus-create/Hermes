import { academyExpansionCountries } from "./hermes-catalog-offers";

export const academyLaunchTracks = [
  "logistics",
  "marketing",
  "sales",
  "operations",
] as const;
export type AcademyLaunchTrack = (typeof academyLaunchTracks)[number];
export type AcademyCountryProfile = {
  country: string;
  slug: string;
  primaryLocale: string;
  primaryLanguage: string;
  secondaryLocales: readonly string[];
  tracks: readonly AcademyLaunchTrack[];
  localizationState: "sample_ready" | "planned";
  complianceState: "screening_required";
  paymentState: "provider_check_required";
  indexability: "registry_only";
  localizedHeadline?: string;
  localizedBody?: string;
};

const localeProfiles: Record<
  (typeof academyExpansionCountries)[number],
  readonly [string, string, readonly string[]]
> = {
  "United States": ["en", "English", ["es"]],
  Canada: ["en", "English", ["fr"]],
  Mexico: ["es", "Español", ["en"]],
  Guatemala: ["es", "Español", ["en"]],
  Honduras: ["es", "Español", ["en"]],
  "El Salvador": ["es", "Español", ["en"]],
  Nicaragua: ["es", "Español", ["en"]],
  "Costa Rica": ["es", "Español", ["en"]],
  Panama: ["es", "Español", ["en"]],
  Tajikistan: ["tg", "Тоҷикӣ", ["ru", "en"]],
  "Dominican Republic": ["es", "Español", ["en"]],
  Jamaica: ["en", "English", []],
  "Trinidad and Tobago": ["en", "English", []],
  Colombia: ["es", "Español", ["en"]],
  Venezuela: ["es", "Español", ["en"]],
  Guyana: ["en", "English", []],
  Suriname: ["nl", "Nederlands", ["en"]],
  Ecuador: ["es", "Español", ["en"]],
  Peru: ["es", "Español", ["en"]],
  Brazil: ["pt-BR", "Português", ["en"]],
  Bolivia: ["es", "Español", ["en"]],
  Paraguay: ["es", "Español", ["gn", "en"]],
  Chile: ["es", "Español", ["en"]],
  Argentina: ["es", "Español", ["en"]],
  Uruguay: ["es", "Español", ["en"]],
  "United Kingdom": ["en", "English", []],
  Ireland: ["en", "English", []],
  France: ["fr", "Français", ["en"]],
  Spain: ["es", "Español", ["en"]],
  Portugal: ["pt-PT", "Português", ["en"]],
  Italy: ["it", "Italiano", ["en"]],
  Germany: ["de", "Deutsch", ["en"]],
  Netherlands: ["nl", "Nederlands", ["en"]],
  Belgium: ["nl", "Nederlands", ["fr", "de", "en"]],
  Luxembourg: ["fr", "Français", ["de", "en"]],
  Switzerland: ["de", "Deutsch", ["fr", "it", "en"]],
  Austria: ["de", "Deutsch", ["en"]],
  Denmark: ["da", "Dansk", ["en"]],
  Sweden: ["sv", "Svenska", ["en"]],
  Norway: ["no", "Norsk", ["en"]],
  Finland: ["fi", "Suomi", ["sv", "en"]],
  Iceland: ["is", "Íslenska", ["en"]],
  Poland: ["pl", "Polski", ["en"]],
  Czechia: ["cs", "Čeština", ["en"]],
  Slovakia: ["sk", "Slovenčina", ["en"]],
  Hungary: ["hu", "Magyar", ["en"]],
  Romania: ["ro", "Română", ["en"]],
  Bulgaria: ["bg", "Български", ["en"]],
  Greece: ["el", "Ελληνικά", ["en"]],
  Croatia: ["hr", "Hrvatski", ["en"]],
  Slovenia: ["sl", "Slovenščina", ["en"]],
  Serbia: ["sr", "Српски", ["en"]],
  "Bosnia and Herzegovina": ["bs", "Bosanski", ["hr", "sr", "en"]],
  Montenegro: ["sr", "Crnogorski / Srpski", ["en"]],
  Albania: ["sq", "Shqip", ["en"]],
  "North Macedonia": ["mk", "Македонски", ["en"]],
  Moldova: ["ro", "Română", ["ru", "en"]],
  Ukraine: ["uk", "Українська", ["en"]],
  Lithuania: ["lt", "Lietuvių", ["en"]],
  Latvia: ["lv", "Latviešu", ["en"]],
  Estonia: ["et", "Eesti", ["en"]],
  Cyprus: ["el", "Ελληνικά", ["en"]],
  Malta: ["mt", "Malti", ["en"]],
  Georgia: ["ka", "ქართული", ["en"]],
  Armenia: ["hy", "Հայերեն", ["en", "ru"]],
  Azerbaijan: ["az", "Azərbaycan dili", ["en", "ru"]],
  Kazakhstan: ["kk", "Қазақша", ["ru", "en"]],
  Turkey: ["tr", "Türkçe", ["en"]],
  "United Arab Emirates": ["ar", "العربية", ["en"]],
  "Saudi Arabia": ["ar", "العربية", ["en"]],
  Qatar: ["ar", "العربية", ["en"]],
  Bahrain: ["ar", "العربية", ["en"]],
  Kuwait: ["ar", "العربية", ["en"]],
  Oman: ["ar", "العربية", ["en"]],
  Israel: ["he", "עברית", ["en"]],
  Jordan: ["ar", "العربية", ["en"]],
  Egypt: ["ar", "العربية", ["en"]],
  Morocco: ["ar", "العربية", ["fr", "en"]],
  Tunisia: ["ar", "العربية", ["fr", "en"]],
  Algeria: ["ar", "العربية", ["fr", "en"]],
  "South Africa": ["en", "English", []],
  Nigeria: ["en", "English", []],
  Ghana: ["en", "English", []],
  Kenya: ["en", "English", ["sw"]],
  Ethiopia: ["am", "አማርኛ", ["en"]],
  Tanzania: ["sw", "Kiswahili", ["en"]],
  Uganda: ["en", "English", ["sw"]],
  Rwanda: ["rw", "Kinyarwanda", ["en", "fr"]],
  Senegal: ["fr", "Français", ["en"]],
  "Cote d’Ivoire": ["fr", "Français", ["en"]],
  Cameroon: ["fr", "Français", ["en"]],
  India: ["hi", "हिन्दी", ["en"]],
  Pakistan: ["ur", "اردو", ["en"]],
  Bangladesh: ["bn", "বাংলা", ["en"]],
  "Sri Lanka": ["si", "සිංහල", ["ta", "en"]],
  Nepal: ["ne", "नेपाली", ["en"]],
  Philippines: ["fil", "Filipino", ["en"]],
  Vietnam: ["vi", "Tiếng Việt", ["en"]],
  Thailand: ["th", "ไทย", ["en"]],
  Malaysia: ["ms", "Bahasa Melayu", ["en"]],
  Singapore: ["en", "English", ["zh-CN"]],
  Indonesia: ["id", "Bahasa Indonesia", ["en"]],
  Japan: ["ja", "日本語", ["en"]],
  "South Korea": ["ko", "한국어", ["en"]],
  China: ["zh-CN", "简体中文", ["en"]],
  Mongolia: ["mn", "Монгол", ["en"]],
  Uzbekistan: ["uz", "Oʻzbekcha", ["ru", "en"]],
  Australia: ["en", "English", []],
  "New Zealand": ["en", "English", []],
  Mauritius: ["en", "English", ["fr"]],
};

const localizedSamples: Partial<
  Record<
    (typeof academyExpansionCountries)[number],
    { headline: string; body: string }
  >
> = {
  Vietnam: {
    headline: "Học để làm việc với thị trường quốc tế.",
    body: "Logistics Hoa Kỳ, marketing, sales và vận hành — học trực tuyến, thực hành có giám sát và đánh giá trước khi làm việc với khách hàng thực.",
  },
  Philippines: {
    headline: "Build skills for international business work.",
    body: "Learn U.S. logistics, marketing, sales and operations through online training, supervised practice and human review before real client access.",
  },
  Tajikistan: {
    headline: "Омӯзед, таҷриба кунед ва барои кори байналмилалӣ омода шавед.",
    body: "Логистикаи ИМА, маркетинг, фурӯш ва идоракунии амалиёт — омӯзиши онлайн, таҷрибаи назоратшаванда ва арзёбии инсонӣ пеш аз кори воқеӣ.",
  },
  Morocco: {
    headline: "تعلّم مهارات للعمل مع الأسواق الدولية.",
    body: "اللوجستيات الأمريكية والتسويق والمبيعات وإدارة العمليات عبر تدريب أونلاين وممارسة تحت الإشراف ومراجعة بشرية قبل التعامل مع عملاء حقيقيين.",
  },
  Moldova: {
    headline: "Învață competențe pentru lucru cu piețe internaționale.",
    body: "Logistică din SUA, marketing, vânzări și operațiuni prin instruire online, practică supravegheată și evaluare umană înainte de accesul la clienți reali.",
  },
  Romania: {
    headline: "Dezvoltă competențe pentru lucru cu piețe internaționale.",
    body: "Logistică din SUA, marketing, vânzări și management operațional prin instruire online, practică supravegheată și evaluare umană înainte de lucru cu clienți reali.",
  },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export const academyCountryRegistry: AcademyCountryProfile[] =
  academyExpansionCountries.map((country) => {
    const [primaryLocale, primaryLanguage, secondaryLocales] =
      localeProfiles[country];
    const sample = localizedSamples[country];
    return {
      country,
      slug: slugify(country),
      primaryLocale,
      primaryLanguage,
      secondaryLocales,
      tracks: academyLaunchTracks,
      localizationState: sample ? "sample_ready" : "planned",
      complianceState: "screening_required",
      paymentState: "provider_check_required",
      indexability: "registry_only",
      localizedHeadline: sample?.headline,
      localizedBody: sample?.body,
    };
  });

if (academyCountryRegistry.length !== 110)
  throw new Error(
    `Academy country registry must contain exactly 110 entries; received ${academyCountryRegistry.length}`,
  );
