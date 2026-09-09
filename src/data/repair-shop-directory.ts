export type RepairShopDirectorySource = { label: string; url: string; observed: string };
export type RepairShopDirectoryEntry = {
  slug:string; stateSlug:string; citySlug:string; businessName:string; category:string; city:string; state:string; region:string; country:string; phone:string;
  serviceArea:string[]; services:string[]; claimState:"unclaimed"|"claimed"; hermesCustomer:boolean; bookingEnabled:boolean; googleBusinessStatus:"not_confirmed"|"confirmed";
  verificationNote:string; verifiedAt:string; sourceRef:string; sources:RepairShopDirectorySource[]; seoSummary:string;
};

export const repairShopDirectory: RepairShopDirectoryEntry[] = [
  {
    slug:"seans-autopro-mobile", stateSlug:"arkansas", citySlug:"sherwood", businessName:"Sean's AutoPro Mobile", category:"Mobile Auto Repair",
    city:"Sherwood", state:"AR", region:"Arkansas", country:"US", phone:"(904) 864-6183",
    serviceArea:["Sherwood, Arkansas","Little Rock, Arkansas","Central Arkansas"],
    services:["Mobile auto repair","Engine rebuilds and replacements","Transmission replacement","Electrical diagnostics and repair","Brake repair","Suspension repair","Custom automotive installations"],
    claimState:"unclaimed", hermesCustomer:false, bookingEnabled:false, googleBusinessStatus:"not_confirmed",
    verificationNote:"Independent business listings support the business name, phone, Sherwood/Little Rock area, mobile-repair positioning, and service descriptions. A current Google Business Profile was not confirmed in a bounded exact-name search; this must not be read as proof that no Google profile exists.",
    verifiedAt:"2026-09-09", sourceRef:"PUBLIC-WEB-SEANS-AUTOPRO-20260909",
    seoSummary:"Independent directory profile for a mobile auto-repair business serving Sherwood, Little Rock, and surrounding Arkansas areas. Profile is unclaimed and is not presented as a Hermes customer.",
    sources:[
      {label:"Better Business Bureau",url:"https://www.bbb.org/us/ar/sherwood/profile/auto-repair/seans-autopro-mobile-0935-90394435",observed:"Auto repair business profile in Sherwood; phone (904) 864-6183."},
      {label:"Manta",url:"https://www.manta.com/mb_55_B1225000_OWG/automotive_services_nec/sherwood_ar",observed:"Sherwood listing describes a full-service auto shop and mobile auto repair."},
      {label:"HireRush",url:"https://www.hirerush.com/service/sean-s-autopro-mobile-mechanic_i69461",observed:"Little Rock service-area profile describes mobile repair plus engine, transmission, electrical, brake, and suspension work."},
      {label:"WhoDoYou",url:"https://www.whodoyou.com/biz/1014558/seans-autopro-mobile-sherwood-ar",observed:"Historical Sherwood listing and Facebook referral evidence; address shown there should be owner-confirmed before being treated as current."},
    ],
  },
];

export const directoryStates = [...new Map(repairShopDirectory.map((entry)=>[entry.stateSlug,{slug:entry.stateSlug,name:entry.region}])).values()];
export const directoryCities = [...new Map(repairShopDirectory.map((entry)=>[`${entry.stateSlug}/${entry.citySlug}`,{stateSlug:entry.stateSlug,citySlug:entry.citySlug,city:entry.city,state:entry.state,region:entry.region}])).values()];
