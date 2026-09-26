import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CATALOG_LIFECYCLE_STATES, buildBusinessOwnerFreeLeadNotification, buildCatalogLeadContext,
  buildCatalogSchema, canTransitionCatalogState, catalogClaimHref, catalogConceptPath,
  catalogConceptPreviewGate, catalogPublicationQa, catalogRouteRegistry, catalogSeoReadiness,
  ethicalCatalogAttributionLink, normalizeConceptReferences, normalizeConceptSourceImports,
} from "../src/lib/catalog-concept-factory.mjs";
import {
  normalizeWebsiteFactoryPayload, transitionWebsiteFactorySourceImport,
  websiteFactoryCatalogPublicationGate, websiteFactoryToCatalogConceptDraft,
} from "../functions/api/_lib/website-factory.mjs";

const root=resolve(import.meta.dirname,"..");
const read=(p)=>readFileSync(resolve(root,p),"utf8");
const fixture={id:"catalog-fixture",slug:"fixture",countrySlug:"ukraine",localitySlug:"chaiky",name:"Fixture",lifecycleState:"REVIEWED",schemaType:"LocalBusiness",primaryIntent:"Phone repair",phone:"+380000",address:"Example",locality:"Chaiky",region:"Kyiv region",postalCode:"00000",countryCode:"UA",channels:[],sourceRef:"FIXTURE",sourceImports:[{url:"https://example.com",type:"website",status:"verified"}],factsRequiringOwnerConfirmation:[],semanticCore:["phone repair Chaiky"],localIntents:["phone repair near Chaiky"],copy:{uk:{},en:{}},ownerApproval:{required:true},faq:[{question:"Q?",answer:"A."}]};

assert.equal(CATALOG_LIFECYCLE_STATES.length,8);
assert.equal(canTransitionCatalogState("DISCOVERED","RESEARCHED"),true);
assert.equal(canTransitionCatalogState("DISCOVERED","CLIENT"),false);
assert.equal(catalogConceptPath(fixture),"/businesses/ukraine/chaiky/fixture/");
assert.equal(catalogRouteRegistry([fixture])[0].localities[0].businesses.length,1);
const schema=buildCatalogSchema(fixture,"https://hermeslogisticsus.com/businesses/ukraine/chaiky/fixture/");
assert.equal(schema[0]["@type"],"LocalBusiness");
assert.equal(schema.some((x)=>x["@type"]==="AutoRepair"),false);
assert.equal(schema.some((x)=>x["@type"]==="FAQPage"),true);
const lead=buildCatalogLeadContext({business:fixture,profileUrl:"https://hermeslogisticsus.com/businesses/ukraine/chaiky/fixture/",source:"catalog",utm:{utm_content:"hero",utm_term:"repair"}});
assert.equal(lead.business_id,"catalog-fixture"); assert.equal(lead.utm_content,"hero"); assert.equal(lead.utm_term,"repair");
assert.match(catalogClaimHref(fixture,lead.profile),/business_id=catalog-fixture/);
assert.match(buildBusinessOwnerFreeLeadNotification({business:fixture,profileUrl:lead.profile,request:{}}),/optional and separate decisions/i);
assert.equal(normalizeConceptSourceImports([{url:"https://example.com"}])[0].status,"pending");
assert.equal(normalizeConceptReferences([{role:"structure",url:"https://example.com"}])[0].role,"structure-conversion");
assert.equal(catalogSeoReadiness(fixture).ready,true);
assert.equal(catalogConceptPreviewGate({...fixture,lifecycleState:"CONCEPT_DRAFT"}).indexable,false);
assert.equal(catalogPublicationQa(fixture,{ownerApproved:true,canonical:"/businesses/ukraine/chaiky/fixture/",sitemapIncluded:true,mobileChecked:true,ctaChecked:true}).ready,true);
assert.equal(ethicalCatalogAttributionLink({href:"https://example.com",label:"Source"}).reciprocalRequired,false);

const payload=normalizeWebsiteFactoryPayload({sources:[{url:"https://example.com/business"}],facts:{business_name:"Example Garage",city:"London",country:"UK",services:["MOT"]},goals:{primary:"Qualified enquiries",semantic_core:["MOT London"],local_intents:["garage London"]},brief:{text:"Build a clear local service website."},references:[{role:"visual",url:"https://example.com/v"},{role:"functionality",url:"https://example.com/f"},{role:"structure",url:"https://example.com/s"}]});
assert.equal(payload.sources[0].status,"pending");
assert.deepEqual(payload.references.map((x)=>x.role),["visual","functionality","structure-conversion"]);
const draft=websiteFactoryToCatalogConceptDraft(payload,{draftId:"wf-1",title:"Example Garage"});
assert.equal(draft.lifecycleState,"CONCEPT_DRAFT"); assert.equal(draft.publication.indexable,false);
assert.equal(websiteFactoryCatalogPublicationGate(draft,{ownerApproved:false}).ready,false);
const verified={...draft,sourceImports:draft.sourceImports.map((x)=>transitionWebsiteFactorySourceImport(x,"verified"))};
assert.equal(websiteFactoryCatalogPublicationGate(verified,{ownerApproved:true}).ready,true);

const sources=["src/data/catalog-business-concepts.ts","src/components/CatalogWebsiteConcept.astro","src/pages/businesses/ukraine/chaiky/chayka-store.astro","src/pages/businesses/[state]/index.astro","src/pages/businesses/[state]/[city]/index.astro","src/pages/businesses/request/index.astro","functions/api/business-lead.ts"].map(read).join("\n");
for(const marker of ["lifecycleState","schemaType","verifiedFacts","proposedConcepts","ownerApproval","semanticCore","localIntents","data-fact-state=\"verified\"","CatalogWebsiteConcept","isUsMarket","catalog-business-request","business_id","utm_content","Catalog context:"]) assert.ok(sources.includes(marker),marker);
console.log("Catalog Website Factory 12-30 contract: PASS");
