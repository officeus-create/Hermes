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
  {
    slug:"iron-nation-services", stateSlug:"wyoming", citySlug:"glenrock", businessName:"Iron Nation Services LLC", category:"Mobile Truck Repair",
    city:"Glenrock", state:"WY", region:"Wyoming", country:"US", phone:"(307) 315-1439",
    serviceArea:["Glenrock, Wyoming","Converse County, Wyoming","Wyoming mobile service area"],
    services:["Mobile truck repair","Mobile auto repair","Auto repair","Diesel engine service"],
    claimState:"unclaimed", hermesCustomer:false, bookingEnabled:false, googleBusinessStatus:"not_confirmed",
    verificationNote:"BBB directory evidence supports the business name, Glenrock street address, phone, mobile-truck-repair category, and a broad Wyoming service area. Wyoming Secretary of State records independently show an Iron Nation Services LLC charter in Glenrock. A current Google Business Profile was not independently confirmed in this bounded research; that is not proof that no Google profile exists.",
    verifiedAt:"2026-09-10", sourceRef:"PUBLIC-WEB-IRON-NATION-WY-20260910",
    seoSummary:"Unclaimed public-source directory profile for a Glenrock, Wyoming mobile truck-repair business serving commercial and vehicle repair demand across parts of the state. The listing is not presented as a Hermes customer.",
    sources:[
      {label:"Better Business Bureau",url:"https://www.bbb.org/us/wy/category/mobile-truck-repair",observed:"Lists Iron Nation Services LLC as Mobile Truck Repair in Glenrock, WY; phone (307) 315-1439 and 541 S. 6th St, Glenrock, WY 82637."},
      {label:"Wyoming Secretary of State",url:"https://sos.wyo.gov/Business/docs/22Q4Domestic.pdf",observed:"Domestic entity charter list includes Iron Nation Services LLC, filing ID 2022-001180225, with Glenrock mailing address."},
    ],
  },
  {
    slug:"gold-standard-diesel-and-fleet", stateSlug:"alaska", citySlug:"palmer", businessName:"Gold Standard Diesel and Fleet LLC", category:"Mobile Diesel & Fleet Repair",
    city:"Palmer", state:"AK", region:"Alaska", country:"US", phone:"(907) 229-5401",
    serviceArea:["Palmer, Alaska","Anchorage, Alaska","Mat-Su Valley, Alaska","Statewide Alaska mobile service"],
    services:["Mobile diesel repair","Fleet maintenance","Electrical diagnostics","Fuel system service","Preventive maintenance","Emergency breakdown service","Truck and equipment upfitting","Welding repair and fabrication","DOT inspections"],
    claimState:"unclaimed", hermesCustomer:false, bookingEnabled:false, googleBusinessStatus:"not_confirmed",
    verificationNote:"The business website supports the mobile diesel and fleet-repair offering, phone number, service categories, and statewide Alaska coverage. FMCSA SAFER independently confirms the legal name, Palmer physical address, phone number, and an active USDOT record. A current Google Business Profile was not independently confirmed in this bounded research; this must not be interpreted as proof of absence.",
    verifiedAt:"2026-09-10", sourceRef:"PUBLIC-WEB-GSDF-ALASKA-20260910",
    seoSummary:"Unclaimed public-source profile for a Palmer-based mobile diesel and fleet repair provider serving commercial vehicles and equipment across Alaska. The business is not presented as a Hermes customer.",
    sources:[
      {label:"Gold Standard Diesel and Fleet",url:"https://gsdfalaska.com/",observed:"Official website lists mobile diesel repair, fleet maintenance, diagnostics, emergency service, upfitting, fabrication, DOT inspections, phone (907) 229-5401, and statewide Alaska coverage."},
      {label:"FMCSA SAFER",url:"https://safer.fmcsa.dot.gov/query.asp?query_param=USDOT&query_string=4454175&query_type=queryCarrierSnapshot&searchtype=ANY",observed:"Federal snapshot lists GOLD STANDARD DIESEL AND FLEET LLC, USDOT 4454175, physical address 825 S Iris Cir, Palmer, AK 99645, and phone (907) 229-5401."},
    ],
  },
];

export const directoryStates = [...new Map(repairShopDirectory.map((entry)=>[entry.stateSlug,{slug:entry.stateSlug,name:entry.region}])).values()];
export const directoryCities = [...new Map(repairShopDirectory.map((entry)=>[`${entry.stateSlug}/${entry.citySlug}`,{stateSlug:entry.stateSlug,citySlug:entry.citySlug,city:entry.city,state:entry.state,region:entry.region}])).values()];
