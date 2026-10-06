import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { newestChildLastmod, syncInsightsParent, validateContentScope, checkGitScope } from './insights-content-scope.mjs';

const index = '<?xml version="1.0"?>\n<sitemapindex>\n<sitemap><loc>https://hermeslogisticsus.com/sitemap.xml</loc><lastmod>2026-09-22</lastmod></sitemap>\n<sitemap><loc>https://hermeslogisticsus.com/sitemap-insights.xml</loc><lastmod>2026-09-22</lastmod></sitemap>\n</sitemapindex>\n';
const child = '<urlset><url><loc>https://hermeslogisticsus.com/insights/</loc><lastmod>2026-10-01</lastmod></url><url><loc>https://hermeslogisticsus.com/insights/marketing/fixture/</loc><lastmod>2026-09-30</lastmod></url></urlset>';
const expected = index.replace('sitemap-insights.xml</loc><lastmod>2026-09-22', 'sitemap-insights.xml</loc><lastmod>2026-10-01');
assert.equal(newestChildLastmod(child), '2026-10-01');
assert.equal(syncInsightsParent(index, child), expected);
assert.equal(syncInsightsParent(expected, child), expected);
assert.throws(() => newestChildLastmod(child.replace('2026-10-01', '2026-02-30')), /Invalid/);
assert.throws(() => newestChildLastmod('<urlset/>'), /URL entries/);
assert.throws(() => syncInsightsParent(index.replace('sitemap-insights.xml', 'sitemap-other.xml'), child), /exactly one Insights parent/);
assert.throws(() => syncInsightsParent(index.replace('</sitemapindex>', index.match(/<sitemap><loc>https:\/\/hermeslogisticsus.com\/sitemap-insights.xml[\s\S]*?<\/sitemap>/)[0] + '</sitemapindex>'), child), /exactly one Insights parent/);
validateContentScope(['public/sitemapindex.xml', 'public/sitemap-insights.xml'], index, expected, child);
for (const bad of [expected.replace('sitemap.xml</loc><lastmod>2026-09-22', 'sitemap.xml</loc><lastmod>2026-10-01'), expected + '\n', expected.replace('sitemap.xml', 'arbitrary.xml'), expected.replace('2026-10-01', '2026-10-02'), index]) {
  assert.throws(() => validateContentScope(['public/sitemapindex.xml'], index, bad, child), /only the Insights parent/);
}
assert.throws(() => validateContentScope(['.github/workflows/insights-content-pr.yml'], index, expected, child), /outside generated Insights scope/);
assert.throws(() => validateContentScope(['scripts/sync-insights-sitemap.mjs'], index, expected, child), /outside generated Insights scope/);

const workflow = readFileSync(new URL('../.github/workflows/insights-content-pr.yml', import.meta.url), 'utf8');
const scopeBlock = workflow.split('      - name: Enforce generated-content-only scope')[1].split('      - name: Set up Node.js')[0].split('        run: |\n')[1].split('\n').map(line => line.replace(/^          /, '')).join('\n');
const root = mkdtempSync(join(tmpdir(), 'hermes-insights-maintenance-'));
try {
  const cwd = join(root, 'git'); mkdirSync(cwd);
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const put = (path, contents) => { mkdirSync(join(cwd, path, '..'), { recursive: true }); writeFileSync(join(cwd, path), contents); };
  git(['init', '-q']); git(['config', 'user.name', 'Synthetic test']); git(['config', 'user.email', 'synthetic@example.invalid']);
  put('public/sitemapindex.xml', index); put('public/sitemap-insights.xml', child.replace('2026-10-01', '2026-09-22').replace('2026-09-30', '2026-09-22'));
  put('src/data/insights.generated.json', '[]\n');
  put('scripts/insights-content-scope.mjs', readFileSync(new URL('./insights-content-scope.mjs', import.meta.url), 'utf8'));
  git(['add', '.']); git(['commit', '-qm', 'synthetic base']); const base = git(['rev-parse', 'HEAD']).trim();
  git(['update-ref', 'refs/remotes/origin/main', base]);
  const runnerTemp = join(root, 'runner'); mkdirSync(runnerTemp);
  const output = join(root, 'output');
  const runWorkflowScope = () => {
    writeFileSync(output, '');
    return spawnSync('bash', ['-c', scopeBlock], { cwd, encoding: 'utf8', env: { ...process.env, RUNNER_TEMP: runnerTemp, GITHUB_OUTPUT: output } });
  };
  const reset = () => git(['reset', '--hard', base]);
  const commit = () => { git(['add', '-A']); git(['commit', '-qm', 'synthetic delta']); };
  put('public/sitemap-insights.xml', child); put('public/sitemapindex.xml', expected); commit();
  assert.deepEqual(checkGitScope(base, 'HEAD', cwd), ['public/sitemap-insights.xml', 'public/sitemapindex.xml']);
  const trusted = fileURLToPath(new URL('./insights-content-scope.mjs', import.meta.url));
  assert.equal(spawnSync(process.execPath, [trusted, base, 'HEAD'], { cwd }).status, 0);
  assert.equal(runWorkflowScope().status, 0);
  assert.equal(readFileSync(output, 'utf8'), 'has_changes=true\n');
  reset(); put('public/sitemap-insights.xml', child); commit();
  assert.throws(() => checkGitScope(base, 'HEAD', cwd), /only the Insights parent/);
  reset(); put('public/sitemapindex.xml', expected.replace('sitemap.xml', 'other.xml')); put('public/sitemap-insights.xml', child); commit();
  assert.throws(() => checkGitScope(base, 'HEAD', cwd), /only the Insights parent/);
  reset(); put('scripts/insights-content-scope.mjs', 'process.exit(0)'); commit();
  assert.notEqual(spawnSync(process.execPath, [trusted, base, 'HEAD'], { cwd }).status, 0);
  { const result = runWorkflowScope(); assert.notEqual(result.status, 0, result.stdout + result.stderr); }
  assert.equal(readFileSync(output, 'utf8'), '');
  reset(); rmSync(join(cwd, 'public/sitemapindex.xml')); symlinkSync('/tmp/arbitrary', join(cwd, 'public/sitemapindex.xml')); commit();
  assert.throws(() => checkGitScope(base, 'HEAD', cwd), /regular file/);
  reset(); assert.deepEqual(checkGitScope(base, 'HEAD', cwd), []);
  assert.equal(runWorkflowScope().status, 0);
  assert.equal(readFileSync(output, 'utf8'), 'has_changes=false\n');
  put('.github/workflows/insights-content-pr.yml', 'arbitrary workflow edit'); commit();
  assert.notEqual(runWorkflowScope().status, 0);
  assert.equal(readFileSync(output, 'utf8'), '');

  // Execute the actual generator in an isolated repository-shaped fixture.
  const generated = join(root, 'generator'); mkdirSync(join(generated, 'scripts'), { recursive: true });
  for (const name of ['sync-insights-sitemap.mjs', 'insights-content-scope.mjs']) cpSync(fileURLToPath(new URL(name, import.meta.url)), join(generated, 'scripts', name));
  mkdirSync(join(generated, 'public')); mkdirSync(join(generated, 'src/data'), { recursive: true });
  writeFileSync(join(generated, 'public/sitemapindex.xml'), index);
  writeFileSync(join(generated, 'src/data/insights.generated.json'), JSON.stringify([
    { contentTier: 'standalone', direction: 'marketing', slug: 'fixture', dateModified: '2026-09-30' },
    { contentTier: 'digest', dateModified: '2026-10-01' },
  ]));
  execFileSync(process.execPath, [join(generated, 'scripts/sync-insights-sitemap.mjs')]);
  assert.equal(readFileSync(join(generated, 'public/sitemapindex.xml'), 'utf8'), expected);
  const actualChild = readFileSync(join(generated, 'public/sitemap-insights.xml'), 'utf8');
  assert.equal(newestChildLastmod(actualChild), '2026-10-01');
  assert.equal((actualChild.match(/<url>/g) || []).length, 2);
  execFileSync(process.execPath, [join(generated, 'scripts/sync-insights-sitemap.mjs')]);
  assert.equal(readFileSync(join(generated, 'public/sitemapindex.xml'), 'utf8'), expected);
} finally { rmSync(root, { recursive: true, force: true }); }

assert.match(workflow, /git show origin\/main:scripts\/insights-content-scope\.mjs/);
assert.match(workflow, /node "\$RUNNER_TEMP\/insights-content-scope\.mjs" origin\/main HEAD/);
assert.match(workflow, /production-seo-hygiene-contract\.test\.mjs/);
assert.match(workflow, /internal-link-audit\.test\.mjs/);
console.log('Insights sitemap maintenance PASS: actual generator, constrained parent delta, trusted-main scope CLI, unrelated/code/symlink/stale rejection, idempotency');
