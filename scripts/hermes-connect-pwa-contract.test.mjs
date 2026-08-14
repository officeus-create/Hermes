import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const baseDir = path.resolve('public/demos/hermes-connect-brand-v1');
const manifestPath = path.join(baseDir, 'manifest.webmanifest');
const swPath = path.join(baseDir, 'sw.js');
const indexHtmlPath = path.join(baseDir, 'index.html');
const workspaceHtmlPath = path.join(baseDir, 'workspace.html');

console.log('🧪 Running Hermes Connect PWA Contract Audit...');

// 1. Verify manifest.webmanifest exists & is valid JSON
assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');
const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
let manifest;
try {
  manifest = JSON.parse(manifestRaw);
} catch (err) {
  assert.fail(`manifest.webmanifest is invalid JSON: ${err.message}`);
}

assert.ok(manifest.name, 'manifest must have a name');
assert.ok(manifest.short_name, 'manifest must have a short_name');
assert.strictEqual(manifest.display, 'standalone', 'manifest display must be standalone');
assert.ok(manifest.start_url, 'manifest must specify start_url');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'manifest icons array must not be empty');

// 2. Verify all icon files referenced in manifest exist on disk
for (const icon of manifest.icons) {
  assert.ok(icon.src, 'icon entry must have src');
  const iconFileName = icon.src.replace(/^\.\//, '');
  const iconPath = path.join(baseDir, iconFileName);
  assert.ok(fs.existsSync(iconPath), `Icon file referenced in manifest does not exist: ${iconFileName}`);
  const stats = fs.statSync(iconPath);
  assert.ok(stats.size > 0, `Icon file must not be zero bytes: ${iconFileName}`);
}

// 3. Verify Apple Touch PNG Icon specifically exists
const appleTouchIconPng = path.join(baseDir, 'apple-touch-icon.png');
assert.ok(fs.existsSync(appleTouchIconPng), 'apple-touch-icon.png must exist for WebKit/iOS compatibility');
assert.ok(fs.statSync(appleTouchIconPng).size > 100, 'apple-touch-icon.png must be a valid non-empty PNG');

// 4. Verify sw.js exists and has core PWA offline logic
assert.ok(fs.existsSync(swPath), 'sw.js Service Worker file must exist');
const swContent = fs.readFileSync(swPath, 'utf8');
assert.match(swContent, /caches\.open/, 'Service Worker must open cache');
assert.match(swContent, /addEventListener\(['"]install['"]/, 'Service Worker must handle install event');
assert.match(swContent, /addEventListener\(['"]activate['"]/, 'Service Worker must handle activate event');
assert.match(swContent, /addEventListener\(['"]fetch['"]/, 'Service Worker must handle fetch event');

// 5. Verify HTML entrypoints retain required PWA & metadata contract
const htmlFiles = [
  { name: 'index.html', path: indexHtmlPath },
  { name: 'workspace.html', path: workspaceHtmlPath }
];

for (const { name, path: filePath } of htmlFiles) {
  assert.ok(fs.existsSync(filePath), `${name} must exist`);
  const html = fs.readFileSync(filePath, 'utf8');

  // Verify PWA tags
  assert.match(html, /<link rel="manifest" href="\.\/manifest\.webmanifest">/, `${name} must link to manifest.webmanifest`);
  assert.match(html, /<link rel="apple-touch-icon" href="\.\/apple-touch-icon\.png">/, `${name} must link to apple-touch-icon.png`);
  assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes">/, `${name} must specify apple-mobile-web-app-capable=yes`);

  // Verify Meta & SEO Hygiene (Title, Description, Theme-Color)
  assert.match(html, /<title>.*<\/title>/, `${name} must retain a valid <title> tag`);
  assert.match(html, /<meta name="description" content="[^"]+">/, `${name} must retain a valid <meta name="description"> tag`);
  assert.match(html, /<meta name="theme-color" content="[^"]+"/, `${name} must retain a valid <meta name="theme-color"> tag`);
}

console.log('✅ Hermes Connect PWA Contract Audit passed! (100% verified manifest, SW, Apple PNG icon & Meta HTML contract)');
