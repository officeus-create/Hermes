import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const layout=readFileSync('src/layouts/BaseLayout.astro','utf8');
const experience=readFileSync('src/components/HermesConnectExperience.astro','utf8');
const domReady=readFileSync('src/components/HermesConnectDomReady.astro','utf8');
const domReadySetup=domReady.slice(domReady.indexOf('      const SUPPORTED'),domReady.indexOf('      // Preserve the current product route'));
const shell=layout.match(/<script is:inline>\s*(\(\(\) => \{\s*if \(!window\.location\.pathname\.startsWith\("\/services\/hermes-connect"\)[\s\S]*?\}\)\(\);)\s*<\/script>/)[1];
const experienceStart=experience.slice(experience.indexOf('    const SUPPORTED',experience.indexOf('{!loadBoardContext')));
const languageSetup=experienceStart.slice(0,experienceStart.indexOf('    document.documentElement.classList.add'));
for(const [query,expected] of [['?lang=UK','uk'],['?lang=unsupported','en'],['','en']]) {
  const document={documentElement:{lang:''},addEventListener:()=>{}};
  const window={location:{pathname:'/services/hermes-connect/',search:query},localStorage:{getItem:()=> 'ru',setItem:()=>{}}};
  vm.runInNewContext(shell,{window,document,URLSearchParams,URL});
  assert.equal(document.documentElement.lang,expected,`layout locale for ${query}`);
  vm.runInNewContext(languageSetup,{window,document,URLSearchParams});
  assert.equal(document.documentElement.lang,expected,`experience locale for ${query}`);
  vm.runInNewContext(domReadySetup,{window,document,URLSearchParams,URL});
  assert.equal(document.documentElement.lang,expected,`DOM-ready final locale for ${query}`);
}
console.log('Connect query-locale shell normalization and clean English owner contract PASS.');

const hub=readFileSync('public/hermes-connect-hub-i18n.js','utf8');
const routing=hub.slice(hub.indexOf('  document.querySelectorAll("a[href]")'),hub.lastIndexOf('})();'));
class Anchor {
  constructor(href,language=null){this.attrs={href};if(language)this.attrs.lang=language;}
  getAttribute(name){return this.attrs[name]??null;}
  hasAttribute(name){return Object.hasOwn(this.attrs,name);}
  setAttribute(name,value){this.attrs[name]=value;}
}
for(const locale of ['en','uk','ru','es','it','fr']){
  const languages=['en','uk','ru','es','it','fr'].map(language=>new Anchor('/services/hermes-connect/'+(language==='en'?'':'?lang='+language),language));
  const original=languages.map(a=>a.getAttribute('href'));
  const ordinary=new Anchor('/services/hermes-connect/access/?source=hub#choose');
  const external=new Anchor('https://example.com/?lang=fr');
  const document={querySelectorAll:()=>[...languages,ordinary,external]};
  const window={location:{href:'https://hermeslogisticsus.com/services/hermes-connect/?lang='+locale,origin:'https://hermeslogisticsus.com'}};
  vm.runInNewContext(routing,{document,window,locale,HTMLAnchorElement:Anchor,URL});
  assert.deepEqual(languages.map(a=>a.getAttribute('href')),original,'language choices must remain distinct for '+locale);
  const result=new URL(ordinary.getAttribute('href'),window.location.origin);
  assert.equal(result.searchParams.get('lang'),locale==='en'?null:locale);
  assert.equal(result.searchParams.get('source'),'hub');
  assert.equal(result.hash,'#choose');
  assert.equal(external.getAttribute('href'),'https://example.com/?lang=fr');
}
console.log('Connect language-choice hrefs and contextual links PASS (6 locales).');
