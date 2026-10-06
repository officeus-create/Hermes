#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const insightsLoc = 'https://hermeslogisticsus.com/sitemap-insights.xml';
const indexPath = 'public/sitemapindex.xml';
const childPath = 'public/sitemap-insights.xml';
const generatedPaths = new Set([
  'src/data/insights.generated.json',
  childPath,
  'docs/release-manifest-deltas/2026-09-14-hermes-insights-blog.json',
]);

function date(value) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, 'Insights lastmod must be YYYY-MM-DD');
  const parsed = new Date(`${value}T00:00:00Z`);
  assert.ok(Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, 'Invalid Insights lastmod');
  return value;
}

export function newestChildLastmod(xml) {
  const urls = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)];
  assert.ok(urls.length > 0, 'Insights child sitemap must contain URL entries');
  return urls.map(([entry]) => {
    const values = [...entry.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)];
    assert.equal(values.length, 1, 'Each Insights URL must have exactly one lastmod');
    return date(values[0][1]);
  }).sort().at(-1);
}

// Preserve every byte except the one Insights parent's date value.
export function syncInsightsParent(index, child) {
  const entries = [...index.matchAll(/<sitemap>[\s\S]*?<\/sitemap>/g)]
    .filter(([entry]) => [...entry.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].some(([, loc]) => loc === insightsLoc));
  assert.equal(entries.length, 1, 'Sitemap index must have exactly one Insights parent');
  const [entry] = entries[0];
  assert.equal([...entry.matchAll(/<loc>/g)].length, 1, 'Insights parent must have exactly one loc');
  const mods = [...entry.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)];
  assert.equal(mods.length, 1, 'Insights parent must have exactly one lastmod');
  date(mods[0][1]);
  const updated = entry.replace(/(<lastmod>)[^<]*(<\/lastmod>)/, `$1${newestChildLastmod(child)}$2`);
  return index.slice(0, entries[0].index) + updated + index.slice(entries[0].index + entry.length);
}

export function validateContentScope(changed, baseIndex, headIndex, headChild) {
  for (const file of changed) {
    assert.ok(generatedPaths.has(file) || file === indexPath, `Blocked automation change outside generated Insights scope: ${file}`);
  }
  if (changed.includes(indexPath) || changed.includes(childPath)) {
    assert.equal(headIndex, syncInsightsParent(baseIndex, headChild),
      'Blocked sitemap index change: only the Insights parent lastmod may match newest actual child; all other bytes must be unchanged');
  }
}

// The workflow executes this standalone checker from origin/main, never from
// the content branch. No dependencies or content-branch executable imports.
export function checkGitScope(baseRef, headRef, cwd = process.cwd()) {
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8' });
  const base = git(['merge-base', baseRef, headRef]).trim();
  const head = git(['rev-parse', `${headRef}^{commit}`]).trim();
  const changed = git(['diff', '--name-only', '-z', base, head]).split('\0').filter(Boolean);
  for (const file of changed) {
    assert.ok(generatedPaths.has(file) || file === indexPath, `Blocked automation change outside generated Insights scope: ${file}`);
    assert.match(git(['ls-tree', head, '--', file]), /^100644 blob /, `Generated content must remain a regular file: ${file}`);
  }
  const show = (ref, file) => git(['show', `${ref}:${file}`]);
  if (changed.includes(indexPath) || changed.includes(childPath)) {
    assert.match(git(['ls-tree', head, '--', indexPath]), /^100644 blob /, 'Sitemap index must remain a regular file');
    assert.match(git(['ls-tree', head, '--', childPath]), /^100644 blob /, 'Insights child must remain a regular file');
    validateContentScope(changed, show(base, indexPath), show(head, indexPath), show(head, childPath));
  }
  return changed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const [base, head] = process.argv.slice(2);
  assert.ok(base && head, 'Usage: insights-content-scope.mjs BASE_REF HEAD_REF');
  const changed = checkGitScope(base, head);
  console.log(changed.length ? `Insights content scope passed: ${changed.join(', ')}` : 'No unpublished Insights delta');
}
