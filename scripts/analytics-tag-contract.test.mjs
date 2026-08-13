import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const layout = fs.readFileSync(path.join(root, "src/layouts/BaseLayout.astro"), "utf8");
const consent = fs.readFileSync(path.join(root, "src/components/TrackingConsent.astro"), "utf8");
const connectConsent = fs.readFileSync(path.join(root, "public/demos/hermes-connect/connect-analytics-consent.mjs"), "utf8");
const analytics = fs.readFileSync(path.join(root, "src/lib/analytics.ts"), "utf8");
const vendorRegistry = JSON.parse(fs.readFileSync(path.join(root, "docs/compliance/vendor-registry.json"), "utf8"));
const vendorsById = new Map(vendorRegistry.vendors.map((vendor) => [vendor.id, vendor]));
const measurementId = "G-RY26321PVW";
const loaderPattern = new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=`, "g");
const ga4Vendor = vendorsById.get("google-analytics-4");
assert.ok(ga4Vendor); assert.equal(ga4Vendor.status, "approved_analytics_only"); assert.equal(ga4Vendor.measurement_id, measurementId); assert.equal(ga4Vendor.default_state, "denied"); assert.equal(ga4Vendor.advertising_use, false); assert.equal(ga4Vendor.private_form_fields_allowed, false);
for (const blockedId of ["meta-pixel", "google-ads", "google-tag-manager-advertising"]) { const vendor = vendorsById.get(blockedId); assert.ok(vendor); assert.equal(vendor.status, "blocked_pending_review"); assert.equal(vendor.default_state, "denied"); }
assert.equal((layout.match(loaderPattern) ?? []).length, 0); assert.match(layout, /<TrackingConsent\s*\/>/); assert.equal((consent.match(loaderPattern) ?? []).length, 1); assert.equal((connectConsent.match(loaderPattern) ?? []).length, 1);
assert.match(connectConsent, /CONSENT_KEY\s*=\s*"hermes-analytics-consent"/); assert.match(connectConsent, /window\.dataLayer\s*=\s*createDiscardingLayer\(\)/); assert.match(connectConsent, /analytics_storage:\s*"denied"/); assert.match(connectConsent, /analytics_storage:\s*"granted"/); assert.match(connectConsent, /ad_storage:\s*"denied"/); assert.match(connectConsent, /allow_google_signals",\s*false/); assert.match(connectConsent, /allow_ad_personalization_signals",\s*false/); assert.doesNotMatch(connectConsent, /window\.location\.(?:href|search|hash)/);
assert.match(analytics, /localStorage\.getItem\(ANALYTICS_CONSENT_KEY\)\s*===\s*"granted"/);
const allowed = new Set(["event", "page_group", "page_path", "module_id", "platform_id", "category_id"]);
const files = ["public/demos/hermes-connect/app.mjs","public/demos/hermes-connect/load-analyzer/app.mjs","public/demos/hermes-connect/search-opportunity-radar/app.mjs","public/demos/hermes-connect/revenue-dashboard/app.mjs","public/demos/hermes-connect/multi-car-planner/app.mjs","public/demos/hermes-connect/logistics-seo-analyzer/app.mjs"];
for (const f of files) { const source = fs.readFileSync(path.join(root,f),"utf8"); const payloads=[...source.matchAll(/window\.dataLayer\.push\(\{([\s\S]*?)\}\);/g)]; assert.ok(payloads.length>=1); for(const p of payloads){ const body=p[1]; const explicit=[...body.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/gm)].map(m=>m[1]); const keys=new Set([...explicit,...(/^\s*event\s*,/m.test(body)?["event"]:[])]); assert.ok(keys.has("event")); for(const k of keys) assert.ok(allowed.has(k),`${f}: ${k}`); }}
let loaderCount=0,gtm=0,meta=0,ads=0; const sourceFiles=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const a=path.join(d,e.name);if(e.isDirectory())walk(a);else if(/\.(astro|ts|js|mjs)$/i.test(e.name))sourceFiles.push(a)}}; walk(path.join(root,"src")); walk(path.join(root,"public/demos/hermes-connect"));
for(const f of sourceFiles){const c=fs.readFileSync(f,"utf8");loaderCount+=(c.match(loaderPattern)??[]).length;gtm+=(c.match(/GTM-[A-Z0-9]+/g)??[]).length;meta+=(c.match(/(?:connect\.facebook\.net|facebook\.com\/tr|\bfbq\s*\()/gi)??[]).length;ads+=(c.match(/(?:AW-[0-9]+|googleadservices\.com|doubleclick\.net)/gi)??[]).length;}
assert.equal(loaderCount,2);assert.equal(gtm,0);assert.equal(meta,0);assert.equal(ads,0);
console.log("Analytics/vendor consent contract passed: main + Connect GA4 are consent-gated and advertising vendors remain blocked.");
