export const siteLocales = ["en", "uk", "ru", "es", "it", "fr"] as const;

export type SiteLocale = (typeof siteLocales)[number];

export const localeConfig: Record<SiteLocale, { name: string; path: string; ogLocale: string }> = {
  en: { name: "English", path: "/", ogLocale: "en_US" },
  uk: { name: "Українська", path: "/ua/", ogLocale: "uk_UA" },
  ru: { name: "Русский", path: "/ru/", ogLocale: "ru_RU" },
  es: { name: "Español", path: "/es/", ogLocale: "es_ES" },
  it: { name: "Italiano", path: "/it/", ogLocale: "it_IT" },
  fr: { name: "Français", path: "/fr/", ogLocale: "fr_FR" },
};

export const languageAlternates = [
  ...siteLocales.map((lang) => ({ lang, href: localeConfig[lang].path })),
  { lang: "x-default", href: "/" },
];
