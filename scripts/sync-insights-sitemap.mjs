#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
const registry = JSON.parse(await readFile(new URL("../src/data/insights.generated.json", import.meta.url), "utf8"));
const entries = [
  { loc: "https://hermeslogisticsus.com/insights/", lastmod: registry.map((p) => p.dateModified).sort().at(-1) || "2026-09-14", changefreq: "daily", priority: "0.78" },
  ...registry.filter((p) => p.contentTier === "standalone").map((p) => ({ loc: `https://hermeslogisticsus.com/insights/${p.direction}/${p.slug}/`, lastmod: p.dateModified, changefreq: "weekly", priority: "0.72" })),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((e) => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`).join("\n")}\n</urlset>\n`;
await writeFile(new URL("../public/sitemap-insights.xml", import.meta.url), xml);
console.log(`sitemap-insights.xml synced: ${entries.length} URL(s)`);
