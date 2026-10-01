import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {ensureHermesCompanyProfilesSchema} from '../functions/api/_lib/hermes-company-profiles.mjs';
import {provisionKnbCompany} from '../functions/api/_lib/client-company-provisioning.mjs';
const repoRequire=createRequire(new URL('../package.json',import.meta.url));
const {build}=repoRequire('esbuild');const {Miniflare}=await import('./helpers/knb-sqlite-d1.mjs');
const entry=new URL('../functions/api/catalog/companies.ts',import.meta.url).pathname;
const out=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'existing-model-fixture-boundaries',setup(b){b.onResolve({filter:/\/(session|hermes-company-profiles|repair-shop-schema|service-context)\.mjs$/},args=>({path:args.path,namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},({path})=>({contents:path.includes('session')?'export const jsonResponse=(status,body,headers={})=>new Response(JSON.stringify(body),{status,headers})':path.includes('hermes-company-profiles')?'export const ensureHermesCompanyProfilesSchema=async()=>{}':path.includes('repair-shop-schema')?'export const ensureRepairShopProfileSchema=async()=>{}':'export const ensureServiceContextSchema=async()=>{};export const listServicesForContext=async()=>[]',loader:'js'}));}}]});
const api=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
test('canonical D1 → public API: opt-out excluded, explicit fixture opt-in projects UA facts, reopen reflects updates, private fields never leave',async()=>{
 const mf=new Miniflare({modules:true,script:'export default {}',compatibilityDate:'2026-07-30',d1Databases:{DB:'synthetic-knb-projection'},d1Persist:false});
 try{
  const db=await mf.getD1Database('DB');await ensureHermesCompanyProfilesSchema(db);await db.prepare('CREATE TABLE specialists(id TEXT PRIMARY KEY)').run();await db.prepare("INSERT INTO specialists(id) VALUES('synthetic-client')").run();
  await db.prepare('CREATE TABLE repair_shops(id TEXT,owner_specialist_id TEXT,name TEXT,slug TEXT,city TEXT,state TEXT,region TEXT,country_code TEXT,website TEXT,catalog_published_at TEXT,seo_geo_started_at TEXT,next_seo_report_at TEXT,created_at TEXT,updated_at TEXT,catalog_opt_in INTEGER)').run();
  const made=await provisionKnbCompany(db,'synthetic-operator',{client_owner_id:'synthetic-client',client_identity_confirmed:true,companyName:'Конс на Бі$',companyType:'business_club',countryCode:'UA',city:'Synthetic city',region:'Synthetic region',website:'https://biznes-club-knb.com/'});assert.equal(made.status,201);
  let body=await (await api.onRequestGet({env:{DB:db}})).json();assert.equal(body.count,0);
  // Explicit synthetic local opt-in fixture only; production opt-in is not authorized.
  await db.prepare("UPDATE hermes_company_profiles SET catalog_opt_in=1,phone='private-phone',authority_number='private-authority' WHERE id=?").bind(made.body.company_id).run();
  body=await (await api.onRequestGet({env:{DB:db}})).json();assert.equal(body.count,1);assert.equal(body.companies[0].id,made.body.company_id);assert.equal(body.companies[0].companyType,'business_club');assert.equal(body.companies[0].countryCode,'UA');assert.equal(body.companies[0].profileUrl,null);assert.equal('owner_specialist_id' in body.companies[0],false);assert.doesNotMatch(JSON.stringify(body),/private-phone|private-authority|synthetic-client/);
  await db.prepare("UPDATE hermes_company_profiles SET city='Changed canonical city' WHERE id=?").bind(made.body.company_id).run();body=await (await api.onRequestGet({env:{DB:db}})).json();assert.equal(body.companies[0].city,'Changed canonical city');
 }finally{await mf.dispose();}
});
