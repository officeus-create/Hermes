#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = new URL("../", import.meta.url);
const registryUrl = new URL("../src/data/insights.generated.json", import.meta.url);
const directions = new Set(["logistics", "marketing", "academy", "technology"]);
const tiers = new Set(["standalone", "digest", "brief"]);
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const input = arg("--input");
if (!input) throw new Error("Usage: node scripts/publish-insight.mjs --input /path/to/insight.json");

const post = JSON.parse(await readFile(resolve(input), "utf8"));
const errors = [];
const requiredStrings = ["id","direction","slug","title","description","eyebrow","h1","conciseAnswer","sourceLabel","sourceUrl","sourcePublishedAt","datePublished","dateModified","authorName","contentTier"];
for (const key of requiredStrings) if (typeof post[key] !== "string" || !post[key].trim()) errors.push(`${key} is required`);
if (!directions.has(post.direction)) errors.push("direction is invalid");
if (!tiers.has(post.contentTier)) errors.push("contentTier is invalid");
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug ?? "")) errors.push("slug must be lowercase kebab-case");
try { const u = new URL(post.sourceUrl); if (u.protocol !== "https:") errors.push("sourceUrl must use https"); } catch { errors.push("sourceUrl must be a valid URL"); }
for (const key of ["sourcePublishedAt","datePublished","dateModified"]) if (!/^\d{4}-\d{2}-\d{2}$/.test(post[key] ?? "")) errors.push(`${key} must be YYYY-MM-DD`);
const analysisLength = Array.isArray(post.explanation) ? post.explanation.join(" ").length : 0;
if (post.contentTier === "standalone" && analysisLength < 650) errors.push("standalone explanation must add at least ~650 characters of original analysis");
if (post.contentTier !== "standalone" && analysisLength < 120) errors.push("brief/digest explanation must add at least ~120 characters of Hermes context");
if (!Array.isArray(post.takeaways) || post.takeaways.length < (post.contentTier === "standalone" ? 3 : 1)) errors.push("takeaways are insufficient for the selected content tier");
if (!Array.isArray(post.faq) || (post.contentTier === "standalone" && post.faq.length < 3)) errors.push("standalone insight requires at least 3 FAQ items");
if (!Array.isArray(post.related) || post.related.length < (post.contentTier === "standalone" ? 2 : 1) || post.related.some((item) => !String(item.href ?? "").startsWith("/"))) errors.push("internal related links are insufficient for the selected content tier");
for (const key of ["primaryAction","secondaryAction"]) if (!post[key] || !String(post[key].href ?? "").startsWith("/")) errors.push(`${key} must use an internal href`);
if (!Array.isArray(post.keywords) || post.keywords.length < (post.contentTier === "standalone" ? 3 : 2)) errors.push("keywords are insufficient for the selected content tier");
if (post.currentMarketClaim && !post.sourcePublishedAt) errors.push("current-market claims require a dated source");
if (post.contentTier === "standalone" && (post.conciseAnswer.length < 140 || post.description.length < 90)) errors.push("standalone insight is too thin");
if (errors.length) { console.error(errors.map((e) => `- ${e}`).join("\n")); process.exit(1); }

const registry = JSON.parse(await readFile(registryUrl, "utf8"));
const duplicate = registry.find((item) => item.id === post.id || (item.direction === post.direction && item.slug === post.slug) || item.sourceUrl === post.sourceUrl);
if (duplicate) {
  if (duplicate.id !== post.id) throw new Error(`Duplicate source or route already exists as ${duplicate.id}`);
  Object.assign(duplicate, post);
} else registry.push(post);
registry.sort((a,b) => b.datePublished.localeCompare(a.datePublished) || a.slug.localeCompare(b.slug));
await writeFile(registryUrl, JSON.stringify(registry, null, 2) + "\n");
console.log(`Insight registry updated: ${post.id} -> /insights/${post.direction}/${post.slug}/`);
