import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../src/styles/hermes-connect-safe-polish.css', import.meta.url), 'utf8');

test('signed-in header account chip keeps Hermes dark-glass contrast on light headers', () => {
  assert.match(css, /\.site-header \.header-actions \.hc-account-menu > summary \{/);
  assert.match(css, /linear-gradient\(135deg, rgba\(28, 34, 48, \.98\), rgba\(11, 13, 18, \.98\)\) !important/);
  assert.match(css, /\.hc-account-menu > summary \.hc-account-menu-copy strong \{\s*color: #fff !important;/);
  assert.match(css, /\.hc-account-menu > summary:focus-visible \{/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
