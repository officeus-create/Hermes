import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const pages = [
  { route: "/ua/", path: "ua/index.html", lang: "uk" },
  { route: "/ru/", path: "ru/index.html", lang: "ru" },
  { route: "/es/", path: "es/index.html", lang: "es" },
  { route: "/it/", path: "it/index.html", lang: "it" },
  { route: "/fr/", path: "fr/index.html", lang: "fr" },
];

const knownEnglishLeakage = [
  "Four directions. One way forward.",
  "Four paths. One ecosystem.",
  "Choose your direction.",
  "Start with a conversation",
  "The direction",
  "A practical starting point.",
  "What we build",
  "How it works",
  "Reach the right logistics team.",
  "Ask about the right Academy path.",
  "Discuss the system you want to build.",
  "Return to Hermes",
  "Page not found",
];
const allowedIndustryTerms = [
  "Hermes",
  "ProgressoPro",
  "AI",
  "CRM",
  "SEO",
  "SMM",
  "IT",
  "MC",
  "DOT",
  "USDOT",
  "BOL",
  "POD",
  "Load Board",
];
const errors = [];
const titles = new Map();
const descriptions = new Map();

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();
const getTagText = (html, tagName) => decode(html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))?.[1] ?? "");
const getMetaDescription = (html) => {
  const tag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] ?? "";
  return decode(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "");
};

for (const page of pages) {
  const html = await readFile(join(dist, page.path), "utf8");
  const visible = decode(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " "),
  );

  for (const phrase of knownEnglishLeakage) {
    if (visible.includes(phrase)) errors.push(`${page.route}: untranslated English phrase found: ${phrase}`);
  }

  const title = getTagText(html, "title");
  const description = getMetaDescription(html);
  if (!title) errors.push(`${page.route}: localized title is missing`);
  if (!description) errors.push(`${page.route}: localized meta description is missing`);
  if (titles.has(title)) errors.push(`${page.route}: localized title duplicates ${titles.get(title)}: ${title}`);
  else titles.set(title, page.route);
  if (descriptions.has(description)) errors.push(`${page.route}: localized meta description duplicates ${descriptions.get(description)}`);
  else descriptions.set(description, page.route);

  const htmlLang = html.match(/<html\b[^>]*lang=["']([^"']+)["']/i)?.[1] ?? "";
  if (htmlLang !== page.lang) errors.push(`${page.route}: expected html lang=${page.lang}, received ${htmlLang || "missing"}`);

  if (/<a\b[^>]*>\s*(Learn more|Read more|Contact us|Get started)\s*<\/a>/i.test(html)) {
    errors.push(`${page.route}: untranslated generic English CTA found`);
  }

  for (const term of allowedIndustryTerms) {
    if (visible.includes(term)) continue;
  }
}

if (errors.length) {
  throw new Error(`Localization content audit failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

console.log(`Localization content audit passed: ${pages.length} localized pages have unique metadata and no known English UI leakage.`);
