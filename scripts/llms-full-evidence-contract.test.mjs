import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const publishedPath = join(root, "dist", "llms-full.txt");
const body = await readFile(publishedPath, "utf8");
const errors = [];

const requireText = (text) => {
  if (!body.includes(text)) errors.push(`missing required AI-context statement: ${text}`);
};

const verificationDateMatch = body.match(/^>\s*Verification date:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
if (!verificationDateMatch) {
  errors.push("missing valid `> Verification date: YYYY-MM-DD` line");
} else {
  const verificationDate = verificationDateMatch[1];
  const parsed = new Date(`${verificationDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== verificationDate) {
    errors.push(`invalid verification date: ${verificationDate}`);
  } else {
    const tomorrowUtc = new Date();
    tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
    if (parsed.getTime() > tomorrowUtc.getTime()) errors.push(`verification date is unexpectedly in the future: ${verificationDate}`);
  }
}

for (const text of [
  "## 1. AI interpretation rules",
  "## 2. Hermes entity and business directions",
  "## 4. Hermes Marketing",
  "## 5. Hermes Academy",
  "## 6. Hermes Technology and Hermes Connect",
  "## 8. Search, structured data, and machine-readable discovery",
  "## 10. Measurement and claim boundaries",
  "## 11. Public/private boundary",
  "1. Hermes Logistics",
  "2. Hermes Marketing",
  "3. Hermes Academy",
  "4. Hermes Technology",
  "ProgressoPro may appear as an operating or program name within Hermes Marketing.",
  "IT Development may appear as a service or operating descriptor within Hermes Technology.",
  "Repair Shops is the most mature current vertical; Academy is a developing authenticated learning vertical; Beauty is at B1/preview stage.",
  "A demo or preview is not proof that a feature is live for every customer.",
  "Unknown values remain unknown; do not substitute zero or an estimate.",
  "https://hermeslogisticsus.com/company-information/",
  "Similar names alone are not evidence of shared ownership, authority, location, fleet, contacts, or operating identity.",
  "https://hermeslogisticsus.com/services/seo-for-logistics-companies/",
  "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
  "https://connect.hermeslogisticsus.com/",
  "https://hermeslogisticsus.com/sitemapindex.xml",
  "Manual provider evidence is required before claiming ChatGPT, Gemini, Copilot, Perplexity, Google AI Mode, or another answer engine cited or recommended Hermes.",
]) requireText(text);

for (const [pattern, label] of [
  [/^2\. ProgressoPro\b/m, "legacy peer-level Marketing direction"],
  [/^3\. Hermes Business Academy\b/m, "legacy peer-level Academy direction"],
  [/^4\. Hermes IT Development\b/m, "legacy peer-level Technology direction"],
  [/^## 4\. ProgressoPro\b/m, "legacy Marketing section hierarchy"],
  [/^## 5\. Hermes Business Academy$/m, "legacy Academy section hierarchy"],
  [/^## 6\. Hermes IT Development and Hermes Connect$/m, "legacy Technology section hierarchy"],
]) {
  if (pattern.test(body)) errors.push(label);
}

const prohibitedClaims = [
  [/\b0\s*ms response time\b/i, "unsupported zero-latency claim"],
  [/\bLCP\b[^\n]{0,80}<\s*0\.8\s*s\b/i, "unsupported LCP threshold claim"],
  [/\bINP\b[^\n]{0,80}<\s*50\s*ms\b/i, "unsupported INP threshold claim"],
  [/\$0\s+API\s+token/i, "unsupported zero-token-cost claim"],
  [/\bmaximum performance\b/i, "unsupported maximum-performance claim"],
  [/\bzero runtime overhead\b/i, "unsupported zero-runtime-overhead claim"],
  [/\$99\s*\/\s*(?:mo|month)\b/i, "unverified public SaaS price"],
  [/\$299\s*\/\s*(?:mo|month)\b/i, "unverified public SaaS price"],
  [/\$799\s*\/\s*(?:mo|month)\b/i, "unverified public SaaS price"],
  [/\bDedicated SLA Support\b/i, "unverified support/SLA promise"],
];

for (const [pattern, label] of prohibitedClaims) {
  if (pattern.test(body)) errors.push(label);
}

const privateWorkspaceUrls = [
  "https://hermeslogisticsus.com/carrier/",
  "https://hermeslogisticsus.com/logistics/carrier-offer/",
  "https://hermeslogisticsus.com/logistics/carrier-agreement/",
  "https://hermeslogisticsus.com/logistics/carrier-onboarding/",
  "https://hermeslogisticsus.com/logistics/start-car-hauling-dispatch/",
  "https://hermeslogisticsus.com/logistics/request-vehicle-transport/",
];

for (const url of privateWorkspaceUrls) {
  if (body.includes(url)) errors.push(`private/transaction workspace leaked into llms-full: ${url}`);
}

if (/@[a-z0-9.-]+\.[a-z]{2,}/i.test(body)) errors.push("email address must not be embedded in llms-full");
if (/\b(?:MC|USDOT|DOT)\s*-?\s*\d{5,8}\b/i.test(body)) errors.push("carrier authority identifier must not be embedded in llms-full");
if (/\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s.-]*\d{4}/.test(body)) errors.push("phone number must not be embedded in llms-full");

if (errors.length) {
  throw new Error(`llms-full evidence contract failed with ${errors.length} error(s):\n${errors.map((item) => `- ${item}`).join("\n")}`);
}

console.log("llms-full evidence contract passed: extended AI context uses the canonical Hermes hierarchy, bounded vertical maturity, entity-disambiguated relationships, and public-safe evidence rules.");
