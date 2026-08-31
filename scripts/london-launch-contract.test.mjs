import { readFile, access } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const origin = "https://hermeslogisticsus.com";
const errors = [];

const commercialSlugs = [
  "social-media-management","meta-ads","website-development","seo-services","local-seo","google-business-profile","landing-page-development","crm-automation","content-reels-scripts","marketing-audit",
  "auto-repair-marketing","beauty-salon-marketing","dental-clinic-marketing","restaurant-marketing","contractor-marketing","logistics-company-marketing","car-detailing-marketing","cleaning-company-marketing","home-services-marketing","professional-services-marketing",
];
const academyTracks = ["us-logistics-course","freight-dispatcher-training","load-planner-training","carrier-sales-training","shipper-dealer-sales-training","english-readiness","how-training-works","apply","faq"];
const courseTracks = new Set(["us-logistics-course","freight-dispatcher-training","load-planner-training","carrier-sales-training","shipper-dealer-sales-training","english-readiness"]);
const guideSlugs = ["digital-growth-system","small-business-website-guide","local-seo-london","meta-ads-expectations","social-media-strategy","website-seo-funnel","us-logistics-roles","dispatcher-vs-load-planner","b2-english-us-logistics","training-curriculum"];

const coreRoutes = ["/gb/london/","/gb/london/marketing/","/gb/london/it-web-development/","/gb/london/us-logistics-training/"];
const commercialRoutes = commercialSlugs.map((slug)=>`/gb/london/${slug}/`);
const academyRoutes = ["/gb/london/academy/",...academyTracks.map((track)=>`/gb/london/academy/${track}/`)];
const guideRoutes = guideSlugs.map((slug)=>`/gb/london/guides/${slug}/`);
const localizedRoutes = ["ru","ua"].flatMap((locale)=>["", "marketing/", "it-web-development/", "us-logistics-training/"].map((suffix)=>`/${locale}/gb/london/${suffix}`));
const expectedRoutes = [...coreRoutes,...commercialRoutes,...academyRoutes,...guideRoutes,...localizedRoutes];

const htmlPath = (route)=>join(dist, route.slice(1), "index.html");
const tagAttr = (tag,name)=>tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`,`i`))?.[1] ?? "";
const collectTypes = (value, set=new Set())=>{
  if(Array.isArray(value)){value.forEach((item)=>collectTypes(item,set));return set;}
  if(!value || typeof value!=="object") return set;
  const type=value["@type"];
  if(Array.isArray(type)) type.forEach((item)=>set.add(item)); else if(typeof type==="string") set.add(type);
  Object.values(value).forEach((child)=>collectTypes(child,set));
  return set;
};
const parseSchemas = (html,route)=>{
  const result=[];
  for(const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{result.push(JSON.parse(match[1]));}catch(error){errors.push(`${route}: invalid JSON-LD: ${error.message}`);}
  }
  return result;
};
const requireTypes=(types,required,route)=>required.forEach((type)=>{if(!types.has(type)) errors.push(`${route}: missing ${type} schema`);});

const sitemap = await readFile(join(dist,"sitemap-london.xml"),"utf8");
const robots = await readFile(join(dist,"robots.txt"),"utf8");
if(!robots.includes(`${origin}/sitemap-london.xml`)) errors.push("robots.txt: London sitemap declaration missing");
if(sitemap.includes("/uk/london/")) errors.push("sitemap-london.xml: obsolete /uk/london/ route detected");

for(const route of expectedRoutes){
  const absolute=`${origin}${route}`;
  if(!sitemap.includes(`<loc>${absolute}</loc>`)) errors.push(`${route}: missing from sitemap-london.xml`);
  let html;
  try{html=await readFile(htmlPath(route),"utf8");}catch{errors.push(`${route}: generated HTML missing`);continue;}

  const canonicalTags=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)].map((m)=>m[0]);
  if(canonicalTags.length!==1) errors.push(`${route}: expected one canonical, found ${canonicalTags.length}`);
  else if(tagAttr(canonicalTags[0],"href")!==absolute) errors.push(`${route}: canonical mismatch`);

  const h1Count=(html.match(/<h1\b/gi)??[]).length;
  if(h1Count!==1) errors.push(`${route}: expected one H1, found ${h1Count}`);

  for(const imageMatch of html.matchAll(/<img\b[^>]*>/gi)){
    const alt=tagAttr(imageMatch[0],"alt").trim();
    if(!alt) errors.push(`${route}: image without non-empty alt text`);
  }

  const types=collectTypes(parseSchemas(html,route));
  if(route==="/gb/london/" || route==="/gb/london/academy/" || route==="/ru/gb/london/" || route==="/ua/gb/london/") requireTypes(types,["CollectionPage","BreadcrumbList"],route);
  else if(route==="/gb/london/marketing/" || route==="/gb/london/it-web-development/" || commercialRoutes.includes(route)) requireTypes(types,["Service","BreadcrumbList","FAQPage"],route);
  else if(route==="/gb/london/us-logistics-training/") requireTypes(types,["Course","BreadcrumbList"],route);
  else if(guideRoutes.includes(route)) requireTypes(types,["Article","BreadcrumbList"],route);
  else if(academyRoutes.includes(route)){
    const track=route.split("/").filter(Boolean).at(-1);
    requireTypes(types,[courseTracks.has(track)?"Course":"WebPage","BreadcrumbList"],route);
  } else if(localizedRoutes.includes(route)) requireTypes(types,["WebPage","BreadcrumbList"],route);

  if(/our london office|visit our office in london|london office address/i.test(html)) errors.push(`${route}: unsupported London physical-office claim detected`);
}

for(const locale of ["ru","ua"]){
  const hubRoute=`/${locale}/gb/london/`;
  const hubHtml=await readFile(htmlPath(hubRoute),"utf8");
  for(const section of ["marketing","it-web-development","us-logistics-training"]){
    const sectionRoute=`/${locale}/gb/london/${section}/`;
    if(!hubHtml.includes(`href=\"${sectionRoute}\"`) && !hubHtml.includes(`href='${sectionRoute}'`)) errors.push(`${hubRoute}: missing locale-safe link to ${sectionRoute}`);
    const sectionHtml=await readFile(htmlPath(sectionRoute),"utf8");
    if(!sectionHtml.includes(`href=\"${hubRoute}\"`) && !sectionHtml.includes(`href='${hubRoute}'`)) errors.push(`${sectionRoute}: missing locale-safe return link to ${hubRoute}`);
  }
}

const primaryLeadPages = ["/gb/london/","/gb/london/marketing/","/gb/london/it-web-development/","/gb/london/us-logistics-training/","/gb/london/academy/"];
for(const route of primaryLeadPages){
  const html=await readFile(htmlPath(route),"utf8");
  if(!html.includes("utm_source=london")) errors.push(`${route}: standard London UTM source missing from primary CTA`);
  if(!/class=["'][^"']*button-primary/.test(html)) errors.push(`${route}: primary CTA class missing`);
}

const londonSources = [
  "src/pages/gb/london/index.astro","src/pages/gb/london/marketing/index.astro","src/pages/gb/london/it-web-development/index.astro","src/pages/gb/london/us-logistics-training/index.astro","src/pages/gb/london/[slug].astro","src/pages/gb/london/academy/index.astro","src/pages/gb/london/academy/[track].astro",
];
for(const relative of londonSources){
  const source=await readFile(join(root,relative),"utf8");
  if(source.includes("?source=")) errors.push(`${relative}: legacy source= attribution detected; use UTM contract`);
}

const analytics=await readFile(join(root,"src/components/LondonAnalytics.astro"),"utf8");
for(const required of ["trackEvent","/gb/london/","/ru/gb/london/","/ua/gb/london/","london_page_view","london_cta_clicked"]){
  if(!analytics.includes(required)) errors.push(`LondonAnalytics: missing ${required}`);
}
if(/email|phone|message|name\s*:/i.test(analytics.replace(/london_contact_clicked/g,""))) errors.push("LondonAnalytics: possible PII field detected");

const campaignPrefill=await readFile(join(root,"src/components/CampaignLeadPrefill.astro"),"utf8");
for(const required of ["trackEvent","utm_source","london_business_inquiry_submitted","service_intent","campaign","content"]){
  if(!campaignPrefill.includes(required)) errors.push(`CampaignLeadPrefill: missing London conversion contract ${required}`);
}

const academyAnalytics=await readFile(join(root,"src/components/AcademyApplicationAnalytics.astro"),"utf8");
for(const required of ["trackEvent","London attribution:","requestedTrack","london_academy_application_handoff_ready","track_intent","academy_program"]){
  if(!academyAnalytics.includes(required)) errors.push(`AcademyApplicationAnalytics: missing London attribution/conversion contract ${required}`);
}
if(/name\s*:|email\s*:|phone\s*:|message\s*:/i.test(academyAnalytics)) errors.push("AcademyApplicationAnalytics: possible PII field detected");

for(const relative of [
  "docs/london/LONDON_SPRINT2_OFFERS_ACADEMY_2026-08-31.md",
  "docs/london/LONDON_SPRINT2_LEADS_SALES_CONTENT_2026-08-31.md",
  "docs/london/LONDON_SPRINT2_PROSPECTING_MEASUREMENT_2026-08-31.md",
  "docs/london/LONDON_SPRINT2_GOVERNANCE_LAUNCH_2026-08-31.md",
]){
  try{await access(join(root,relative));}catch{errors.push(`${relative}: Sprint 2 operating artifact missing`);}
}

if(expectedRoutes.length!==52) errors.push(`route inventory invariant changed unexpectedly: ${expectedRoutes.length}`);
if(errors.length) throw new Error(`London launch contract failed with ${errors.length} error(s):\n${errors.map((e)=>`- ${e}`).join("\n")}`);
console.log(`London launch contract passed: ${expectedRoutes.length} routes, sitemap/canonical/schema/CTA/locale/image/attribution/analytics/artifact checks green.`);
