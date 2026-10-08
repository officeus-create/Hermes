import type { CatalogBusinessConcept } from "../data/catalog-business-concepts";
export type CatalogLocale = "en" | "uk";
export type CatalogDisplay = {name:string;primaryIntent:string;address:string;locality:string;region:string;hours:string[];services:string[];factsRequiringOwnerConfirmation:string[]};
type Copy = Partial<CatalogDisplay>;
const translations: Record<string,{en:Copy;uk:Copy}> = {
  "catalog-ua-chayka-store": {
    en:{name:"Chayka Store",address:"21/3 Valerii Lobanovskyi Street",locality:"Chaiky",region:"Kyiv Oblast",hours:["Mon–Sat 10:00–19:00","Sun 10:00–18:30"],factsRequiringOwnerConfirmation:["Exact repair service list","Prices","Repair turnaround","Warranty","Supported device models","Accessory inventory","Tea inventory"]},
    uk:{primaryIntent:"Ремонт телефонів та аксесуари",services:["Інформація про ремонт телефонів","Інформація про аксесуари","Чайний напрям"],factsRequiringOwnerConfirmation:["Точний перелік ремонтних послуг","Ціни","Строки ремонту","Гарантія","Моделі пристроїв","Наявність аксесуарів","Асортимент чаю"]}
  },
  "catalog-ua-mangal-i-kazan": {
    en:{name:"Mangal i Kazan",address:"35 Valerii Lobanovskyi Street, Building 9",locality:"Chaiky",region:"Kyiv Oblast",hours:["Daily 10:00–20:00"],services:["Shashlik","Lula kebab","Plov","Manti","Lagman","Shurpa","Delivery within the Chaiky residential complex"],factsRequiringOwnerConfirmation:["Current full menu","Current prices","Delivery beyond Chaiky residential complex","Official social accounts","Google Business Profile ownership"]},
    uk:{primaryIntent:"Халяльний ресторан і доставка їжі",factsRequiringOwnerConfirmation:["Актуальне повне меню","Актуальні ціни","Доставка за межі ЖК Чайки","Офіційні сторінки в соцмережах","Право власності на Google Business Profile"]}
  },
  "catalog-ua-trimmo-ii-chaiky": {
    en:{name:"TRIMMO II Barbershop",address:"24 Valerii Lobanovskyi Street",locality:"Chaiky",region:"Kyiv Oblast",hours:["Mon–Sat 10:00–21:00","Sunday hours require confirmation"],services:["Men's haircut","Clipper haircut","Beard trim","Scalp camouflage","Beard camouflage"]},
    uk:{primaryIntent:"Барбершоп і чоловічий догляд",factsRequiringOwnerConfirmation:["Години роботи в неділю","Актуальні ціни","Команда майстрів","Посилання для онлайн-запису","Офіційні сторінки в соцмережах"]}
  },
  "catalog-ua-cvit-vyshni-irpin": {
    en:{name:"Tsvit VYSHNI Flower Studio",address:"57A Ukrainska Street",locality:"Irpin",region:"Kyiv Oblast",hours:["Daily 09:00–20:00"],services:["Flowers","Bouquets","Floral studio"]},
    uk:{primaryIntent:"Квіткова крамниця та флористична студія",factsRequiringOwnerConfirmation:["Актуальний асортимент букетів","Зона доставки","Актуальні ціни","Умови індивідуальних замовлень","Офіційний сайт і сторінки в соцмережах"]}
  },
  "catalog-ua-kons-na-bis-bila-tserkva": {
    en:{name:"Kons na Bis",primaryIntent:"Business club and education for small and medium business owners",address:"16/2, 16 Yaroslav Mudryi Street",locality:"Bila Tserkva",region:"Kyiv Oblast",hours:["Online courses and business club · check current schedule on official website"],services:["Managed Business Growth Strategy · 7 weeks","Business club for entrepreneurs","Business audits","Marketing and customer acquisition systems","Sales process development","Hiring and delegation","Educational events and group programs"]},
    uk:{}
  }
};
export function localizedCatalogBusiness(business:CatalogBusinessConcept, locale:CatalogLocale):CatalogDisplay{
  const copy=translations[business.id]?.[locale]??{};
  return {
    name:copy.name??business.name,
    primaryIntent:copy.primaryIntent??(locale==="en"?business.primaryIntentEn??business.primaryIntent:business.primaryIntent),
    address:copy.address??business.address,
    locality:copy.locality??business.locality,
    region:copy.region??business.region,
    hours:copy.hours??(locale==="en"?business.hoursEn??business.hours:business.hours),
    services:copy.services??business.services,
    factsRequiringOwnerConfirmation:copy.factsRequiringOwnerConfirmation??(locale==="en"?business.factsRequiringOwnerConfirmationEn??business.factsRequiringOwnerConfirmation:business.factsRequiringOwnerConfirmation),
  };
}
export function localizedCatalogChannel(label:string,locale:CatalogLocale):string{
  return locale==="uk"?label:label.replaceAll("Конс на Бі$","Kons na Bis").replaceAll("Олександр Морозов","Oleksandr Morozov").replaceAll("Чайка Store","Chayka Store");
}
export function localizedCatalogSearchTerms(business:CatalogBusinessConcept,locale:CatalogLocale):string[]{
  const original=business.semanticCore??[];
  if(locale==="uk")return original;
  if(business.id==="catalog-ua-kons-na-bis-bila-tserkva")return ["Kons na Bis","Kons na Bis business club","Business club for entrepreneurs","Managed Business Growth Strategy","Business course for entrepreneurs","Oleksandr Morozov business club","Business education in Ukraine","Bila Tserkva business club"];
  if(business.id==="catalog-ua-chayka-store")return ["Phone repair in Chaiky","Smartphone repair in Chaiky","Local entity and NAP","Google Business Profile","FAQ and structured data","Ukrainian / English"];
  return original;
}
