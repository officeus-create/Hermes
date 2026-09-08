import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");

// Advisory review thresholds only. They never block CI or release.
// The site is expected to grow as useful SEO/GEO and product pages are added.
const reviewThresholds = {
  html: 500_000,
  css: 350_000,
  javascript: 400_000,
  image: 1_500_000,
  imageOptimization: 250_000,
  htmlDuplicationReview: 200_000,
  siteGrowthCheckpoint: 25_000_000,
};

async function collectFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextRelative = join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(join(directory, entry.name), nextRelative));
    else files.push(nextRelative);
  }
  return files;
}

const files = await collectFiles(dist);
const warnings = [];
let totalBytes = 0;
let htmlCount = 0;
let imageCount = 0;

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

for (const relativePath of files) {
  const absolutePath = join(dist, relativePath);
  const info = await stat(absolutePath);
  totalBytes += info.size;
  const extension = extname(relativePath).toLowerCase();

  if (extension === ".html") {
    htmlCount += 1;
    if (info.size > reviewThresholds.html) {
      warnings.push(`${relativePath}: HTML is ${info.size} bytes; review repeated markup, inline scripts/styles, and page-specific payloads`);
    } else if (info.size > reviewThresholds.htmlDuplicationReview) {
      warnings.push(`${relativePath}: HTML is ${info.size} bytes; consider a duplication/inline-payload review when convenient`);
    }

    const html = await readFile(absolutePath, "utf8");
    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = match[0];
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "unknown";
      const width = tag.match(/\bwidth=["'](\d+)["']/i)?.[1];
      const height = tag.match(/\bheight=["'](\d+)["']/i)?.[1];
      const hasExplicitDimensions = Boolean(width && height);
      const isSmallDecorativeIcon = hasExplicitDimensions
        && Number(width) <= 64
        && Number(height) <= 64
        && /\baria-hidden=["']true["']/i.test(tag);

      if (!hasExplicitDimensions) {
        warnings.push(`${relativePath}: image ${src} is missing explicit width and height`);
      }
      if (!/\bloading=["'](?:lazy|eager)["']/i.test(tag) && !isSmallDecorativeIcon) {
        warnings.push(`${relativePath}: image ${src} has no explicit loading policy`);
      }
    }
  } else if (extension === ".css") {
    if (info.size > reviewThresholds.css) {
      warnings.push(`${relativePath}: CSS is ${info.size} bytes; review unused selectors, duplicate rules, and route-specific styles`);
    }
  } else if ([".js", ".mjs"].includes(extension)) {
    if (info.size > reviewThresholds.javascript) {
      warnings.push(`${relativePath}: JavaScript is ${info.size} bytes; review route scope, duplication, and unused code`);
    }
  } else if (imageExtensions.has(extension)) {
    imageCount += 1;
    if (info.size > reviewThresholds.image) {
      warnings.push(`${relativePath}: image is ${info.size} bytes; review dimensions, compression, and modern-format variants`);
    } else if (info.size > reviewThresholds.imageOptimization) {
      warnings.push(`${relativePath}: image is ${info.size} bytes; consider responsive modern-format variants`);
    }
  }
}

const checkpoint = reviewThresholds.siteGrowthCheckpoint;
const crossedCheckpoint = Math.floor(totalBytes / checkpoint) * checkpoint;
const nextCheckpoint = crossedCheckpoint + checkpoint;
if (crossedCheckpoint >= checkpoint) {
  warnings.push(
    `Generated site is ${totalBytes} bytes and has crossed the ${crossedCheckpoint}-byte growth checkpoint. This is advisory only: review size analytics, identify duplicate or stale generated/public assets, inspect old demos/reports/artifacts, and remove confirmed unused material. Do not delete useful revenue/SEO pages or rewrite Git history just to reduce size. Next review checkpoint: ${nextCheckpoint} bytes.`,
  );
}

const uniqueWarnings = [...new Set(warnings)];
for (const warning of uniqueWarnings) console.warn(`Performance advisory — ${warning}`);

console.log(
  `Performance advisory completed (non-blocking): ${files.length} files, ${htmlCount} HTML pages, ${imageCount} images, ${totalBytes} total bytes, ${uniqueWarnings.length} unique review recommendation(s).`,
);
