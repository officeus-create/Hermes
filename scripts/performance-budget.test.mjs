import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");

const budgets = {
  html: 500_000,
  css: 350_000,
  javascript: 400_000,
  image: 1_500_000,
  total: 25_000_000,
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
const errors = [];
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
    if (info.size > budgets.html) errors.push(`${relativePath}: HTML is ${info.size} bytes; budget is ${budgets.html}`);
    else if (info.size > 200_000) warnings.push(`${relativePath}: HTML is ${info.size} bytes; review repeated markup and inline payloads`);

    const html = await readFile(absolutePath, "utf8");
    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = match[0];
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "unknown";
      if (!/\bwidth=["'][^"']+["']/i.test(tag) || !/\bheight=["'][^"']+["']/i.test(tag)) {
        warnings.push(`${relativePath}: image ${src} is missing explicit width and height`);
      }
      if (!/\bloading=["'](?:lazy|eager)["']/i.test(tag)) {
        warnings.push(`${relativePath}: image ${src} has no explicit loading policy`);
      }
    }
  } else if (extension === ".css") {
    if (info.size > budgets.css) errors.push(`${relativePath}: CSS is ${info.size} bytes; budget is ${budgets.css}`);
  } else if ([".js", ".mjs"].includes(extension)) {
    if (info.size > budgets.javascript) errors.push(`${relativePath}: JavaScript is ${info.size} bytes; budget is ${budgets.javascript}`);
  } else if (imageExtensions.has(extension)) {
    imageCount += 1;
    if (info.size > budgets.image) errors.push(`${relativePath}: image is ${info.size} bytes; budget is ${budgets.image}`);
    else if (info.size > 250_000) warnings.push(`${relativePath}: image is ${info.size} bytes; create responsive modern-format variants`);
  }
}

if (totalBytes > budgets.total) errors.push(`Generated site is ${totalBytes} bytes; total budget is ${budgets.total}`);

const uniqueWarnings = [...new Set(warnings)];
for (const warning of uniqueWarnings) console.warn(`Performance warning — ${warning}`);
if (errors.length) {
  throw new Error(`Performance budget failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

console.log(
  `Performance budget passed: ${files.length} files, ${htmlCount} HTML pages, ${imageCount} images, ${totalBytes} total bytes, ${uniqueWarnings.length} unique review warning(s).`,
);
