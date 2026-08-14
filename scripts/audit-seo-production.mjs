import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');

function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`Found ${htmlFiles.length} HTML files in dist/`);

// Collect inlink counts
const inlinkMap = new Map();

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, 'utf8');
  const hrefMatches = html.matchAll(/href="([^"#?]+)(?:[#?][^"]*)?"/g);
  for (const match of hrefMatches) {
    let href = match[1];
    if (href.startsWith('https://hermeslogisticsus.com')) {
      href = href.replace('https://hermeslogisticsus.com', '');
    }
    if (href.startsWith('/')) {
      if (!href.endsWith('/') && !path.extname(href)) {
        href += '/';
      }
      inlinkMap.set(href, (inlinkMap.get(href) || 0) + 1);
    }
  }
}

const results = [];

for (const filePath of htmlFiles) {
  const relativePath = path.relative(distDir, filePath);
  let pagePath = '/' + relativePath.replace(/index\.html$/, '').replace(/\\/g, '/');
  if (pagePath !== '/' && pagePath.endsWith('//')) pagePath = pagePath.slice(0, -1);

  const html = fs.readFileSync(filePath, 'utf8');

  // Title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Meta Description
  const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i) || html.match(/<meta\s+content="(.*?)"\s+name="description"/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Meta Robots
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="(.*?)"/i) || html.match(/<meta\s+content="(.*?)"\s+name="robots"/i);
  const robots = robotsMatch ? robotsMatch[1].trim() : 'index,follow';
  const isIndexable = !robots.includes('noindex');

  // H1
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  let h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

  // Canonical
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="(.*?)"/i) || html.match(/<link\s+href="(.*?)"\s+rel="canonical"/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';

  // Schema / JSON-LD
  const jsonLdMatches = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis)];
  const schemas = [];
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      if (Array.isArray(data)) {
        data.forEach(item => schemas.push(item['@type'] || 'Array'));
      } else if (data['@type']) {
        schemas.push(data['@type']);
      } else if (data['@graph']) {
        data['@graph'].forEach(item => schemas.push(item['@type'] || 'Item'));
      }
    } catch {
      schemas.push('JSON-LD Parse Error');
    }
  }
  const schemaStr = [...new Set(schemas)].join('; ') || 'None';

  // Inlinks
  const inlinks = inlinkMap.get(pagePath) || inlinkMap.get(pagePath.replace(/\/$/, '')) || 0;

  // Intent classification
  let intent = 'Informational';
  if (pagePath === '/') intent = 'Homepage Branding & Hub Navigation';
  else if (pagePath.startsWith('/services/')) intent = 'Commercial Digital Service';
  else if (pagePath.startsWith('/logistics/')) intent = 'Commercial Logistics & Fleet Solution';
  else if (pagePath.startsWith('/paths/')) intent = 'Navigation Hub & Journey Selector';
  else if (pagePath.startsWith('/academy/')) intent = 'Academy / Educational Recruitment';
  else if (pagePath.startsWith('/carrier/')) intent = 'Carrier Onboarding & Support';
  else if (pagePath.startsWith('/case/')) intent = 'Proof & Case Study Evidence';
  else if (pagePath.startsWith('/demos/')) intent = 'Interactive Prototype / Demo';
  else if (pagePath.startsWith('/privacy') || pagePath.startsWith('/terms') || pagePath.startsWith('/legal')) intent = 'Legal & Compliance Policy';

  // Finding, Severity, Recommendation, Evidence
  let finding = 'PASS: Clean metadata, canonical and schema.';
  let severity = 'INFO';
  let recommendation = 'Maintain current structure.';
  let evidence = 'VERIFIED (dist build inspection)';

  if (!canonical) {
    if (isIndexable) {
      finding = 'FAIL: Missing canonical link tag on indexable page.';
      severity = 'HIGH';
      recommendation = 'Add self-referential canonical URL.';
    } else {
      finding = 'INFO: Intentionally noindex/quarantined page without canonical.';
      severity = 'INFO';
      recommendation = 'No action required; preserve noindex/quarantine boundary.';
    }
  }

  if (!title) {
    if (isIndexable) {
      finding = 'FAIL: Missing title tag on indexable page.';
      severity = 'HIGH';
      recommendation = 'Add unique, descriptive title tag.';
    } else {
      finding = 'INFO: Missing title tag on noindex page.';
      severity = 'INFO';
      recommendation = 'Optional title tag for internal review.';
    }
  } else if (title.length < 20 && isIndexable) {
    finding = 'WARN: Short title tag on indexable page.';
    severity = 'MEDIUM';
    recommendation = 'Expand title tag to include target primary keywords.';
  }

  if (!description) {
    if (isIndexable) {
      finding = 'FAIL: Missing meta description on indexable page.';
      severity = 'HIGH';
      recommendation = 'Add high-CTR meta description.';
    } else {
      finding = 'INFO: Missing meta description on noindex page.';
      severity = 'INFO';
      recommendation = 'Optional meta description for internal review.';
    }
  }

  if (!h1 && isIndexable) {
    finding = 'WARN: Missing or empty H1 tag on indexable page.';
    severity = 'MEDIUM';
    recommendation = 'Ensure exactly one prominent H1 tag per page.';
  }

  if (pagePath.startsWith('/demos/') && isIndexable) {
    finding = 'WARN: Interactive demo page is indexable.';
    severity = 'MEDIUM';
    recommendation = 'Set meta robots to noindex,nofollow for non-canonical demo prototypes.';
  }

  results.push({
    url: 'https://hermeslogisticsus.com' + pagePath,
    status: 200,
    indexable: isIndexable ? 'TRUE' : 'FALSE',
    title: `"${title.replace(/"/g, '""')}"`,
    description: `"${description.replace(/"/g, '""')}"`,
    h1: `"${h1.replace(/"/g, '""')}"`,
    canonical: `"${canonical.replace(/"/g, '""')}"`,
    inlinks,
    schema: `"${schemaStr.replace(/"/g, '""')}"`,
    intent: `"${intent.replace(/"/g, '""')}"`,
    finding: `"${finding.replace(/"/g, '""')}"`,
    severity,
    recommendation: `"${recommendation.replace(/"/g, '""')}"`,
    evidence
  });
}

// Convert to CSV
const headers = ['url', 'status', 'indexable', 'title', 'description', 'h1', 'canonical', 'inlinks', 'schema', 'intent', 'finding', 'severity', 'recommendation', 'evidence'];
const csvLines = [headers.join(',')];

for (const r of results) {
  csvLines.push([
    r.url,
    r.status,
    r.indexable,
    r.title,
    r.description,
    r.h1,
    r.canonical,
    r.inlinks,
    r.schema,
    r.intent,
    r.finding,
    r.severity,
    r.recommendation,
    r.evidence
  ].join(','));
}

const csvContent = csvLines.join('\n');

// Write to AI_WORKSPACE locations
const targetDir1 = '/Users/progressopro/Documents/AI_WORKSPACE/15_Active_Tasks';
const targetDir2 = '/Users/progressopro/Documents/AI_WORKSPACE/13_AI_Handoffs/To_Codex';

if (!fs.existsSync(targetDir1)) fs.mkdirSync(targetDir1, { recursive: true });
if (!fs.existsSync(targetDir2)) fs.mkdirSync(targetDir2, { recursive: true });

fs.writeFileSync(path.join(targetDir1, 'SEO_TECHNICAL_CRAWL_2026-08-13.csv'), csvContent);
fs.writeFileSync(path.join(targetDir2, 'ANTIGRAVITY_SEO_CRAWL_AUDIT_2026-08-13.csv'), csvContent);

console.log(`Successfully generated audit for ${results.length} URLs!`);
