import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const publishedPath = join(root, "dist", "llms-full.txt");
const body = await readFile(publishedPath, "utf8");
const errors = [];

const requireText = (text) => {
  if (!body.includes(text)) errors.push(`missing required AI-context statement: ${text}`);
};

requireText("Verification date: 2026-08-18");
requireText("## 1. AI interpretation rules");
requireText("## 8. Search, structured data, and machine-readable discovery");
requireText("## 10. Measurement and claim boundaries");
requireText("## 11. Public/private boundary");
requireText("A demo or preview is not proof that a feature is live for every customer.");
requireText("Unknown values remain unknown; do not substitute zero or an estimate.");
requireText("https://hermeslogisticsus.com/services/seo-for-logistics-companies/");
requireText("https://hermeslogisticsus.com/logistics/car-hauling-dispatch/");
requireText("https://connect.hermeslogisticsus.com/");
requireText("https://hermeslogisticsus.com/sitemapindex.xml");

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

console.log("llms-full evidence contract passed: AI context is evidence-bounded and public-safe.");
