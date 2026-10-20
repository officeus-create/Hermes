/**
 * Isolated ThreeUI preview hard-gate, not a production Lighthouse substitute.
 * Prevents a dormant visual experiment from becoming an expensive page load.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = new URL('./dist/', import.meta.url).pathname;
const assets = join(dist, 'assets');
const files = readdirSync(assets);
const entryJs = files.filter(x => /^index-[\w-]+\.js$/.test(x));
const entryCss = files.filter(x => /^index-[\w-]+\.css$/.test(x));
const three = files.filter(x => /^three\.module-[\w-]+\.js$/.test(x));
assert.equal(entryJs.length, 1, 'expected one entry JS');
assert.ok(entryCss.length <= 1, 'expected at most one entry CSS');
assert.equal(three.length, 1, 'heavy Three.js must be one separate lazy chunk');

function report(name) {
  const file = join(assets, name);
  const rawBytes = statSync(file).size;
  const gzipBytes = gzipSync(readFileSync(file)).byteLength;
  console.log(`${name}: ${rawBytes} raw / ${gzipBytes} gzip bytes`);
  return gzipBytes;
}

const entryJsBytes = report(entryJs[0]);
const entryCssBytes = entryCss.reduce((sum, file) => sum + report(file), 0);
const threeBytes = report(three[0]);
const totalInitial = entryJsBytes + entryCssBytes;

// These are lab-specific conservative caps, not invented live Core Web Vitals.
assert.ok(entryJsBytes <= 75_000, `entry JS ${entryJsBytes} > 75 KB`);
assert.ok(entryCssBytes <= 12_000, `entry CSS ${entryCssBytes} > 12 KB`);
assert.ok(totalInitial <= 85_000, `initial JS+CSS ${totalInitial} > 85 KB`);
assert.ok(threeBytes <= 150_000, `deferred Three.js ${threeBytes} > 150 KB`);
const page = readFileSync(join(dist, 'index.html'), 'utf8');
assert.match(page, /noindex,nofollow,noarchive/);
assert.doesNotMatch(page, /three\.module-/i, 'WebGL code should not be directly loaded by HTML');
console.log('PASS: ThreeUI lab initial JS/CSS <= 85 KB gzip, WebGL isolated into deferred chunk.');
