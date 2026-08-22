import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const homepage = await readFile(join(dist, "index.html"), "utf8");
const organizationId = "https://hermeslogisticsus.com/#organization";
const websiteId = "https://hermeslogisticsus.com/#website";
const progressoproProfile = "https://www.instagram.com/progressopro/";
const heldHermesLogisticsProfiles = new Set([
  "https://www.instagram.com/hermes.logistics/",
  "https://www.threads.com/@hermes.logistics",
]);
const expectedSameAs = new Set();
const parseEntities = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => JSON.parse(match[1]))
  .flatMap((block) => Array.isArray(block) ? block : [block]);

const entities = parseEntities(homepage);
const organization = entities.find((entity) => entity?.["@type"] === "Organization" && entity?.["@id"] === organizationId);
const website = entities.find((entity) => entity?.["@type"] === "WebSite" && entity?.["@id"] === websiteId);
const errors = [];

if (!organization) errors.push(`Homepage Organization with @id ${organizationId} is missing`);
if (!website) errors.push(`Homepage WebSite with @id ${websiteId} is missing`);

if (organization) {
  if (organization.name !== "Hermes") errors.push("Organization name must be Hermes");
  if (organization.url !== "https://hermeslogisticsus.com/") errors.push("Organization URL must use the canonical HTTPS homepage");
  if (organization.email !== "officeus@hermeslogisticsus.com") errors.push("Organization email does not match the approved general contact");
  if (organization.logo?.url !== "https://hermeslogisticsus.com/favicon.svg") errors.push("Organization logo URL is missing or not canonical");
  if (organization.contactPoint?.telephone !== "+1-262-302-3626") errors.push("Organization Logistics Sales phone is missing or unapproved");
  if (organization.contactPoint?.email !== "officeus@hermeslogisticsus.com") errors.push("Organization Logistics Sales email is missing or unapproved");

  const sameAs = new Set(Array.isArray(organization.sameAs) ? organization.sameAs : []);
  for (const url of expectedSameAs) if (!sameAs.has(url)) errors.push(`Organization sameAs is missing approved same-entity profile ${url}`);
  for (const url of sameAs) if (!expectedSameAs.has(url)) errors.push(`Organization sameAs contains an unapproved or unresolved profile: ${url}`);
  for (const url of heldHermesLogisticsProfiles) {
    if (sameAs.has(url)) errors.push(`Organization sameAs must not publish unresolved root-vs-Logistics profile ${url}`);
  }
  if (sameAs.has(progressoproProfile)) errors.push("ProgressoPro must not be represented as the same Organization entity as Hermes");
}

if (website) {
  if (website.name !== "Hermes") errors.push("WebSite name must be Hermes");
  if (website.alternateName !== "Hermes Ecosystem") errors.push("WebSite alternateName must be Hermes Ecosystem");
  if (website.url !== "https://hermeslogisticsus.com/") errors.push("WebSite URL must use the canonical HTTPS homepage");
  if (website.publisher?.["@id"] !== organizationId) errors.push("WebSite publisher must reference the stable Organization @id");
  const languages = new Set(Array.isArray(website.inLanguage) ? website.inLanguage : []);
  for (const language of ["en", "uk", "ru", "es", "it", "fr"]) {
    if (!languages.has(language)) errors.push(`WebSite inLanguage is missing ${language}`);
  }
}

const ids = entities.map((entity) => entity?.["@id"]).filter(Boolean);
if (new Set(ids).size !== ids.length) errors.push("Duplicate JSON-LD @id values found on the homepage");

const marketingHtml = await readFile(join(dist, "paths/marketing/index.html"), "utf8");
const marketingEntities = parseEntities(marketingHtml);
for (const entity of marketingEntities) {
  const sameAs = Array.isArray(entity?.sameAs) ? entity.sameAs : [];
  if (sameAs.includes(progressoproProfile)) {
    errors.push("Marketing page must not publish ProgressoPro sameAs until the brand relationship and entity owner are approved");
  }
}

const localizedPages = [
  { path: "ua/index.html", route: "/ua/", language: "uk" },
  { path: "ru/index.html", route: "/ru/", language: "ru" },
  { path: "es/index.html", route: "/es/", language: "es" },
  { path: "it/index.html", route: "/it/", language: "it" },
  { path: "fr/index.html", route: "/fr/", language: "fr" },
];
for (const localized of localizedPages) {
  const html = await readFile(join(dist, localized.path), "utf8");
  const pageEntities = parseEntities(html);
  if (pageEntities.some((entity) => entity?.["@type"] === "Organization" && entity?.["@id"] !== organizationId)) {
    errors.push(`${localized.route}: localized page must not create a competing Organization entity`);
  }
  const webPage = pageEntities.find((entity) => entity?.["@type"] === "WebPage");
  const canonicalUrl = `https://hermeslogisticsus.com${localized.route}`;
  if (!webPage) errors.push(`${localized.route}: WebPage entity is missing`);
  else {
    if (webPage?.["@id"] !== `${canonicalUrl}#webpage`) errors.push(`${localized.route}: WebPage @id is incorrect`);
    if (webPage.url !== canonicalUrl) errors.push(`${localized.route}: WebPage URL is incorrect`);
    if (webPage.inLanguage !== localized.language) errors.push(`${localized.route}: WebPage language is incorrect`);
    if (webPage.isPartOf?.["@id"] !== websiteId) errors.push(`${localized.route}: WebPage must reference the stable WebSite @id`);
    if (webPage.about?.["@id"] !== organizationId) errors.push(`${localized.route}: WebPage must reference the stable Organization @id`);
    if (webPage.publisher?.["@id"] !== organizationId) errors.push(`${localized.route}: publisher must reference the stable Organization @id`);
  }
}

if (errors.length) {
  throw new Error(`Entity schema audit failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

console.log("Entity schema audit passed: stable Hermes Organization and WebSite references, unresolved social profiles held out of root sameAs, and no premature ProgressoPro relationship.");
