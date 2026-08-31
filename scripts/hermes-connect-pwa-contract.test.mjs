import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const baseDir = path.resolve('public/demos/hermes-connect');
const manifestPath = path.join(baseDir, 'manifest.webmanifest');
const swPath = path.join(baseDir, 'sw.js');
const workspaceHtmlPath = path.join(baseDir, 'workspace.html');
const workspaceEnhancementsPath = path.join(baseDir, 'workspace-enhancements.css');
const option02MarkPath = path.join(baseDir, 'mark-option02.svg');

console.log('Running Hermes Connect canonical PWA contract audit...');

assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest must exist in canonical Connect tree');
const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
let manifest;
try {
  manifest = JSON.parse(manifestRaw);
} catch (err) {
  assert.fail(`manifest.webmanifest is invalid JSON: ${err.message}`);
}

assert.strictEqual(manifest.id, 'hermes-connect', 'manifest must use canonical Hermes Connect id');
assert.ok(manifest.name, 'manifest must have a name');
assert.ok(manifest.short_name, 'manifest must have a short_name');
assert.strictEqual(manifest.display, 'standalone', 'manifest display must be standalone');
assert.strictEqual(manifest.start_url, './workspace.html', 'manifest must start the canonical responsive workspace');
assert.strictEqual(manifest.scope, './', 'manifest scope must stay inside the canonical Connect tree');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'manifest icons array must not be empty');

for (const icon of manifest.icons) {
  assert.ok(icon.src, 'icon entry must have src');
  const iconFileName = icon.src.replace(/^\.\//, '');
  const iconPath = path.join(baseDir, iconFileName);
  assert.ok(fs.existsSync(iconPath), `Icon file referenced in manifest does not exist: ${iconFileName}`);
  const stats = fs.statSync(iconPath);
  assert.ok(stats.size > 0, `Icon file must not be zero bytes: ${iconFileName}`);
}

const requiredInstallIcons = [
  { src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: './apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
  { src: './icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
];

const iconsBySrc = new Map(manifest.icons.map((icon) => [icon.src, icon]));
for (const requiredIcon of requiredInstallIcons) {
  const actualIcon = iconsBySrc.get(requiredIcon.src);
  assert.ok(actualIcon, `manifest must retain required install icon: ${requiredIcon.src}`);
  assert.strictEqual(actualIcon.sizes, requiredIcon.sizes, `${requiredIcon.src} must retain ${requiredIcon.sizes} sizing`);
  assert.strictEqual(actualIcon.type, requiredIcon.type, `${requiredIcon.src} must retain ${requiredIcon.type} MIME type`);
  assert.strictEqual(actualIcon.purpose, requiredIcon.purpose, `${requiredIcon.src} must retain ${requiredIcon.purpose} purpose`);
}

const appleTouchIconPng = path.join(baseDir, 'apple-touch-icon.png');
assert.ok(fs.existsSync(appleTouchIconPng), 'apple-touch-icon.png must exist for WebKit/iOS compatibility');
assert.ok(fs.statSync(appleTouchIconPng).size > 100, 'apple-touch-icon.png must be a valid non-empty PNG');

assert.ok(fs.existsSync(swPath), 'sw.js Service Worker file must exist');
const swContent = fs.readFileSync(swPath, 'utf8');
assert.match(swContent, /caches\.open/, 'Service Worker must open cache');
assert.match(swContent, /addEventListener\(['"]install['"]/, 'Service Worker must handle install event');
assert.match(swContent, /addEventListener\(['"]activate['"]/, 'Service Worker must handle activate event');
assert.match(swContent, /addEventListener\(['"]fetch['"]/, 'Service Worker must handle fetch event');
assert.match(swContent, /workspace-enhancements\.css/, 'Service Worker must cache canonical enhancement CSS');
assert.match(swContent, /workspace-enhancements\.js/, 'Service Worker must cache canonical enhancement JS');
assert.doesNotMatch(swContent, /hermes-connect-brand-v1|workspace-v2|mobile\.html|workspace-launch-v2/, 'Service Worker must not depend on retired duplicate surfaces');

assert.ok(fs.existsSync(workspaceHtmlPath), 'workspace.html must exist');
const workspaceHtml = fs.readFileSync(workspaceHtmlPath, 'utf8');
assert.match(workspaceHtml, /<link rel="manifest" href="\.\/manifest\.webmanifest">/, 'workspace.html must link to manifest.webmanifest');
assert.match(workspaceHtml, /<link rel="apple-touch-icon" href="\.\/apple-touch-icon\.png">/, 'workspace.html must link to apple-touch-icon.png');
assert.match(workspaceHtml, /<meta name="apple-mobile-web-app-capable" content="yes">/, 'workspace.html must specify apple-mobile-web-app-capable=yes');
assert.match(workspaceHtml, /<title>.*<\/title>/, 'workspace.html must retain a valid title');
assert.match(workspaceHtml, /<meta name="description" content="[^"]+">/, 'workspace.html must retain a valid description');
assert.match(workspaceHtml, /<meta name="theme-color" content="[^"]+"/, 'workspace.html must retain a valid theme-color');
assert.match(workspaceHtml, /workspace-enhancements\.css/, 'workspace.html must load canonical enhancement CSS');
assert.match(workspaceHtml, /workspace-enhancements\.js/, 'workspace.html must load canonical enhancement JS');
assert.doesNotMatch(workspaceHtml, /hermes-connect-brand-v1|workspace-v2|workspace-launch-v2/, 'workspace.html must not reference retired duplicate surfaces');

assert.ok(fs.existsSync(option02MarkPath), 'approved Option 02 mark must exist in the canonical Connect tree');
assert.ok(fs.existsSync(workspaceEnhancementsPath), 'workspace enhancement CSS must exist');
const workspaceEnhancementsCss = fs.readFileSync(workspaceEnhancementsPath, 'utf8');
assert.match(workspaceEnhancementsCss, /\.brand-mark\{[^}]*mark-option02\.svg/, 'workspace desktop/mobile brand mark must render approved Option 02');
assert.match(workspaceEnhancementsCss, /\.brand-mark path\{display:none!important\}/, 'legacy inline workspace mark must be visually retired');

console.log('Hermes Connect canonical PWA contract passed: manifest, service worker, PNG/SVG install icons, Option 02 workspace chrome, and responsive workspace are aligned.');
