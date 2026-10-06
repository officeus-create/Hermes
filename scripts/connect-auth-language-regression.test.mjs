import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

const pages = ['access', 'academy/auth', 'academy/business/auth'];
// Execute the actual page's language initialization, not a duplicate resolver.
for (const page of pages) {
  const source = readFileSync(`src/pages/services/hermes-connect/${page}/index.astro`, 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
  const start = script.indexOf('  const params =');
  const end = script.indexOf('\n  const ', script.indexOf('let lang:'));
  const initialization = stripTypeScriptTypes(script.slice(start, end), { mode: 'strip' });
  for (const [search, stored, expected] of [['', null, 'en'], ['', 'en', 'en'], ['', 'uk', 'uk'], ['?lang=en', 'uk', 'en'], ['?lang=uk', 'en', 'uk'], ['?lang=invalid', 'uk', 'en']]) {
    test(`${page}: ${search || 'no query'} / stored ${stored} resolves ${expected}`, () => {
      const localStorage = { getItem: () => stored };
      const location = { search };
      const actual = runInNewContext(`${initialization}; lang`, { URLSearchParams, location, localStorage, window: { location, localStorage } });
      assert.equal(actual, expected);
    });
  }
  test(`${page}: unavailable storage safely defaults to English`, () => {
    const location = { search: '' };
    const localStorage = { getItem() { throw new Error('storage unavailable'); } };
    assert.equal(runInNewContext(`${initialization}; lang`, { URLSearchParams, location, localStorage, window: { location, localStorage } }), 'en');
  });
  test(`${page}: uses the existing header language selector without duplicate page buttons`, () => {
    assert.match(source, /<SiteHeader\b/);
    assert.doesNotMatch(source, /<button[^>]*data-lang=/);
  });
}
