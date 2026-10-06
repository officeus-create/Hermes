import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=mkdtempSync(join(tmpdir(),'hermes-link-audit-'));
try {
 const put=(name,text)=>{mkdirSync(join(root,name,'..'),{recursive:true});writeFileSync(join(root,name),text);};
 put('scripts/internal-link-audit.test.mjs',readFileSync(new URL('./internal-link-audit.test.mjs',import.meta.url),'utf8'));
 put('dist/sitemap.xml','<urlset><url><loc>https://hermeslogisticsus.com/</loc></url></urlset>');
 put('public/_redirects','/old /target/ 301\n/bad /absent/ 301\n');
 put('functions/businesses/connect/repair-shop/[slug].ts','export const onRequestGet = () => new Response();');
 put('dist/target/index.html','<h1>Target</h1>');put('dist/guide.pdf','synthetic asset');
 const run=(href)=>{put('dist/index.html',`<a href="${href}">Meaningful target</a>`);return spawnSync(process.execPath,[join(root,'scripts/internal-link-audit.test.mjs')],{encoding:'utf8'});};
 const missing=run('/missing-local-route/');
 assert.equal(missing.status,1,'missing same-origin HTML target must fail');
 assert.match(missing.stderr,/missing internal page target.*missing-local-route/);
 for(const href of ['/target/','/target/index.html','/old','/guide.pdf','/businesses/connect/repair-shop/synthetic/','https://example.invalid/remote','mailto:fixture@example.invalid']) {
  const result=run(href);assert.equal(result.status,0,`${href}: ${result.stderr}`);
 }
 for(const href of ['/bad','/businesses/connect/unknown/synthetic/','/businesses/connect/repair-shop/synthetic/extra/']) {
  const result=run(href);assert.equal(result.status,1,`${href} must not be broadly whitelisted`);
 }
 console.log('Internal-link regression PASS: missing page, index alias, exact redirect, existing asset, source-backed dynamic route and negative routes.');
} finally {rmSync(root,{recursive:true,force:true});}
