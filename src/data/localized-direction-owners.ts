import type { SiteLocale } from "./locales";

export type DirectionId = "logistics" | "marketing" | "academy" | "technology";
export type LocalizedSiteLocale = Exclude<SiteLocale, "en">;

export const directionOwnerRoutes: Record<SiteLocale, Record<DirectionId, string>> = {
  en: {
    logistics: "/paths/logistics/",
    marketing: "/paths/marketing/",
    academy: "/paths/academy/",
    technology: "/paths/technology/",
  },
  uk: {
    logistics: "/ua/logistics/",
    marketing: "/ua/marketing/",
    academy: "/ua/academy/",
    technology: "/ua/technology/",
  },
  ru: {
    logistics: "/ru/logistics/",
    marketing: "/ru/marketing/",
    academy: "/ru/academy/",
    technology: "/ru/technology/",
  },
  es: {
    logistics: "/es/logistica/",
    marketing: "/es/marketing/",
    academy: "/es/academia/",
    technology: "/es/tecnologia/",
  },
  it: {
    logistics: "/it/logistica/",
    marketing: "/it/marketing/",
    academy: "/it/academy/",
    technology: "/it/tecnologia/",
  },
  fr: {
    logistics: "/fr/logistique/",
    marketing: "/fr/marketing/",
    academy: "/fr/academie/",
    technology: "/fr/technologie/",
  },
};

export const academyLogisticsOwnerRoutes: Record<SiteLocale, string> = {
  en: "/academy/us-logistics-operations/",
  uk: "/ua/academy/us-logistics-operations/",
  ru: "/ru/academy/us-logistics-operations/",
  es: "/es/academy/us-logistics-operations/",
  it: "/it/academy/us-logistics-operations/",
  fr: "/fr/academy/us-logistics-operations/",
};

export const getDirectionAlternates = (direction: DirectionId) => [
  ...(["en", "uk", "ru", "es", "it", "fr"] as const).map((lang) => ({ lang, href: directionOwnerRoutes[lang][direction] })),
  { lang: "x-default", href: directionOwnerRoutes.en[direction] },
];

export const academyLogisticsAlternates = [
  ...(["en", "uk", "ru", "es", "it", "fr"] as const).map((lang) => ({ lang, href: academyLogisticsOwnerRoutes[lang] })),
  { lang: "x-default", href: academyLogisticsOwnerRoutes.en },
];

export const directionForOwnerPath = (pathname: string): DirectionId | undefined => {
  for (const locale of Object.keys(directionOwnerRoutes) as SiteLocale[]) {
    for (const direction of Object.keys(directionOwnerRoutes[locale]) as DirectionId[]) {
      if (directionOwnerRoutes[locale][direction] === pathname) return direction;
    }
  }
  return undefined;
};

export const isAcademyLogisticsOwnerPath = (pathname: string) =>
  Object.values(academyLogisticsOwnerRoutes).includes(pathname);
