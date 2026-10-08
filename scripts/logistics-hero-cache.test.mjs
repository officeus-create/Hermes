import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const original = await readFile(new URL('public/images/path-logistics-system.jpg', root));
const bundled = await readFile(new URL('src/assets/path-logistics-system.jpg', root));
assert.deepEqual(bundled, original, 'Bundled hero must preserve the approved optimized image');
assert.equal(bundled.length, 90337);
const digest = createHash('sha256').update(bundled).digest('hex');
for (const route of ['dealer-vehicle-transportation', 'car-hauling-dispatch']) {
  const html = await readFile(new URL(`dist/logistics/${route}/index.html`, root), 'utf8');
  const src = html.match(/<img[^>]*src="([^\"]*path-logistics-system[^\"]+)"/)?.[1];
  assert.match(src ?? '', /^\/_astro\/path-logistics-system\.[\w-]+\.jpg$/);
  assert.ok(html.includes(`href="${src}"`), 'Preload and displayed hero must use the same hashed asset');
  assert.ok(html.includes(`https://hermeslogisticsus.com${src}`), 'Schema/social image must match');
  const emitted = await readFile(new URL(`dist${src}`, root));
  assert.equal(createHash('sha256').update(emitted).digest('hex'), digest);
  assert.ok(!html.includes('src="/images/path-logistics-system.jpg"'));
  assert.ok(html.includes('data-commercial-primary-cta') || route === 'car-hauling-dispatch');
}
console.log('PASS: approved 90,337-byte hero, content-hashed URL, preload/schema parity, CTA preserved');
