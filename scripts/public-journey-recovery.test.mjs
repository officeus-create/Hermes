import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const read = (path) => readFile(join(root, path), 'utf8');
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => entry.isDirectory()
    ? htmlFiles(join(dir, entry.name))
    : entry.name.endsWith('.html') ? [join(dir, entry.name)] : []))).flat();
}

// A shared navigation action must work from server-rendered HTML, without a JS repair.
for (const file of await htmlFiles(join(root, 'dist'))) {
  const html = await readFile(file, 'utf8');
  for (const link of html.matchAll(/<a\b[^>]*class="header-cta"[^>]*href="([^"]+)"[^>]*>/g)) {
    const href = link[1];
    if (href.startsWith('#')) {
      assert.ok(html.includes(`id="${href.slice(1)}"`), `${file}: primary contact anchor must exist`);
    } else {
      const target = new URL(href, 'https://hermeslogisticsus.com');
      assert.equal(target.origin, 'https://hermeslogisticsus.com');
      const targetFile = join(root, 'dist', target.pathname, 'index.html');
      await access(targetFile);
    }
  }
}

const technology = await read('dist/paths/technology/index.html');
const marketing = await read('dist/paths/marketing/index.html');
for (const html of [technology, marketing]) {
  const nav = html.match(/<nav\b[^>]*class="[^"]*direction-product-nav[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav, 'direction product navigation must be rendered');
  assert.ok(nav.includes('/services/website-development/'), 'general website navigation must reach the national owner');
  assert.equal(nav.includes('/gb/london/website-development/'), false, 'global visitors must not be silently routed to London');
}
assert.ok(technology.includes('Explore the current Repair Shop product'));
assert.equal(technology.includes('Open the Hermes Connect preview'), false);

const academy = await read('dist/paths/academy/index.html');
for (const track of ['it', 'sales', 'operations']) {
  assert.ok(academy.includes(`id="academy-${track}"`), `Academy ${track} must have a real public anchor`);
  assert.ok(academy.includes(`data-academy-entry-track="${track}"`));
  assert.equal(academy.includes(`/academy/apply/?program=${track}`), false, 'do not imply application support for a learning direction that is not an enrollment program');
}

for (const route of ['index.html', 'paths/technology/index.html', 'paths/marketing/index.html', 'paths/academy/index.html']) {
  assert.equal((await read(`dist/${route}`)).includes('src="/repair-owner-runtime-fixes.js"'), false, `${route}: owner-only JS must not load on public pages`);
}
assert.ok((await read('dist/services/hermes-connect/repair-shops/dashboard/index.html')).includes('src="/repair-owner-runtime-fixes.js"'), 'Repair owner runtime must remain on its existing workspace');
console.log('Public contact, national service navigation, Academy deep links and owner-runtime isolation passed.');
