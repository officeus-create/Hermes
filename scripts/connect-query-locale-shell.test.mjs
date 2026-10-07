import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const layout=readFileSync('src/layouts/BaseLayout.astro','utf8');
const experience=readFileSync('src/components/HermesConnectExperience.astro','utf8');
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
}
console.log('Connect query-locale shell normalization and clean English owner contract PASS.');
