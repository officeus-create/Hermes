import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/demos/hermes-connect/hr.html', import.meta.url), 'utf8');
const locale = await readFile(new URL('../public/demos/hermes-connect/hr-shell-locale.mjs', import.meta.url), 'utf8');
const account = await readFile(new URL('../functions/api/hermes-connect/account.ts', import.meta.url), 'utf8');
const hrLib = await readFile(new URL('../functions/api/_lib/hr.mjs', import.meta.url), 'utf8');
const switcher = await readFile(new URL('../src/components/HermesConnectAccountSwitcher.astro', import.meta.url), 'utf8');

assert.match(html, /meta name="robots" content="noindex,nofollow"/, 'candidate interview must remain private/noindex');
assert.match(html, /hr-shell-locale\.mjs/, 'static candidate shell must load the bounded locale layer');
assert.match(html, /class="btn primary" href="#intake">Start interview<\/a>/, 'candidate must retain one dominant start action');
assert.equal((html.match(/class="btn primary" href="#intake"/g) || []).length, 1, 'hero must expose exactly one primary start CTA');
assert.doesNotMatch(html, /href="\.\/hr-admin\.html"/, 'candidate surface must never expose reviewer/admin navigation');
assert.doesNotMatch(html, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/, 'candidate shell must not claim automated consequential decisions');

for (const language of ['ru', 'uk']) {
  assert.match(locale, new RegExp(`${language}:\\s*\\{`), `${language} shell copy must exist`);
}
assert.match(locale, /new URLSearchParams\(location\.search\)\.get\('lang'\)/, 'locale must use the same route query parameter');
assert.match(locale, /history\.replaceState/, 'language changes should remain same-route query localization');
assert.doesNotMatch(locale, /location\.(?:assign|replace)|window\.open/, 'locale layer must not create a new route family');
for (const phrase of [
  'Начать интервью', 'Почати інтерв’ю',
  'Выберите направление', 'Оберіть напрям',
  'Я понимаю, что ответы помогают проверке человеком',
  'Я розумію, що відповіді допомагають перевірці людиною',
]) assert.match(locale, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

assert.match(account, /getHrReviewerAccess/, 'shared portfolio must derive HR visibility from backend authorization');
assert.match(account, /key:\s*"hr"/, 'authorized HR reviewer workspace must be represented in the shared account portfolio');
assert.match(account, /hr_review:\s*Boolean\(hrReviewerAccess\)/, 'HR review capability must reflect backend authorization');
assert.doesNotMatch(account, /email.*hr|role.*hr|current\s*===\s*["']hr["']/i, 'account API must not infer HR access from client identity text');
assert.match(hrLib, /FROM hr_reviewer_access[\s\S]*active = 1/, 'explicit reviewer authorization must be active');
assert.match(hrLib, /HERMES_INTERNAL_OWNER/, 'internal owner capability may authorize reviewer access through the existing server-owned capability');

assert.match(switcher, /data-workspace-hr data-hc-workspace-link="hr" hidden/, 'shared account switcher must keep HR hidden by default');
assert.match(switcher, /item\?\.key === "hr" && item\?\.available !== false/, 'shared account switcher must consume backend-authorized HR workspace only');
assert.match(switcher, /if \(hrWorkspace && hr\) \{[\s\S]*?hr\.hidden = false;/, 'authorized backend HR workspace may reveal the HR link');
assert.doesNotMatch(switcher, /else if \(current === "hr"\)[\s\S]{0,180}?hidden = false/, 'current route must never bypass backend HR authorization');
assert.match(switcher, /hr:\s*"HR-проверка"/, 'Russian account portfolio must localize HR workspace copy');
assert.match(switcher, /hr:\s*"HR-перевірка"/, 'Ukrainian account portfolio must localize HR workspace copy');
console.log('Hermes Connect HR Design 4 replay + private SEO boundary contract: PASS');
