import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const host = "hermeslogisticsus.com";
const key = "8e3c1f6a9d4b72c5e0a8f31d67b2c94e";
const keyLocation = `https://${host}/${key}.txt`;
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));

const defaultUrls = [
  `https://${host}/`,
  `https://${host}/paths/logistics/`,
  `https://${host}/logistics/appleton-wi-vehicle-transport/`,
  `https://${host}/logistics/resources/auction-vehicle-pickup-checklist/`,
  `https://${host}/logistics/resources/car-hauler-capacity-checklist/`,
];

function parseUrls(input) {
  if (!input?.trim()) return defaultUrls;

  return input
    .split(/[\n,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function urlsFromSitemaps() {
  const files = (await readdir(publicDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(entry.name) && entry.name !== "sitemap-index.xml")
    .map((entry) => entry.name)
    .sort();

  const values = [];
  for (const file of files) {
    const xml = await readFile(new URL(`../public/${file}`, import.meta.url), "utf8");
    for (const match of xml.matchAll(/<loc>\s*(https:\/\/[^<\s]+)\s*<\/loc>/gi)) {
      const value = match[1].replaceAll("&amp;", "&").trim();
      if (!value.endsWith(".xml")) values.push(value);
    }
  }

  if (!values.length) throw new Error("No public page URLs were found in sitemap files");
  return values;
}

function validateUrls(values) {
  const unique = [];
  const seen = new Set();

  for (const value of values) {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error(`IndexNow URL must use HTTPS: ${value}`);
    if (url.hostname !== host) throw new Error(`IndexNow URL must belong to ${host}: ${value}`);
    if (url.hash) throw new Error(`IndexNow URL must not contain a fragment: ${value}`);
    url.search = "";
    const normalized = url.toString();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(normalized);
    }
  }

  if (!unique.length) throw new Error("At least one valid IndexNow URL is required");
  if (unique.length > 10000) throw new Error("IndexNow supports at most 10,000 URLs per request");
  return unique;
}

const useSitemaps = ["1", "true", "yes"].includes(String(process.env.INDEXNOW_USE_SITEMAPS || "").toLowerCase());
const requestedUrls = useSitemaps ? await urlsFromSitemaps() : parseUrls(process.env.INDEXNOW_URLS);
const urlList = validateUrls(requestedUrls);
const payload = { host, key, keyLocation, urlList };

if (process.env.INDEXNOW_DRY_RUN === "1") {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

if (response.status !== 200 && response.status !== 202) {
  const body = (await response.text()).slice(0, 500);
  throw new Error(`IndexNow submission failed with HTTP ${response.status}: ${body}`);
}

console.log(`IndexNow accepted ${urlList.length} URL(s) with HTTP ${response.status}.`);
