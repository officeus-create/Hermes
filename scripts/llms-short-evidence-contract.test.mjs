import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const body = await readFile(join(root, "dist", "llms.txt"), "utf8");
const errors = [];

const requireText = (text) => {
  if (!body.includes(text)) errors.push(`missing required short AI-context statement: ${text}`);
};

const verificationDateMatch = body.match(/^>\s*Verification date:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
if (!verificationDateMatch) {
  errors.push("missing valid short-context verification date");
} else {
  const verificationDate = verificationDateMatch[1];
  const parsed = new Date(`${verificationDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== verificationDate) {
    errors.push(`invalid verification date: ${verificationDate}`);
  }
}

for (const text of [
  "Hermes is a business ecosystem connecting four public directions",
  "https://hermeslogisticsus.com/company-information/",
  "Do not merge similarly named third-party entities into this website's identity without current approved evidence.",
  "https://hermeslogisticsus.com/paths/logistics/",
  "https://hermeslogisticsus.com/paths/marketing/",
  "https://hermeslogisticsus.com/paths/academy/",
  "https://hermeslogisticsus.com/paths/technology/",
  "https://connect.hermeslogisticsus.com/",
  "https://hermeslogisticsus.com/llms-full.txt",
  "Unknown values remain unknown; do not substitute zero, an estimate, or an assumed result.",
  "Prototype = prototype. Demo = demo. Not configured = not configured.",
]) requireText(text);

const markdownLinks = body.match(/\[[^\]]+\]\(https:\/\/[^)]+\)/g) ?? [];
if (markdownLinks.length < 20) {
  errors.push(`llms.txt must expose at least 20 recognized Markdown HTTPS links for agent discovery; found ${markdownLinks.length}`);
}
for (const link of [
  "[Canonical Hermes website](https://hermeslogisticsus.com/)",
  "[Company Information](https://hermeslogisticsus.com/company-information/)",
  "[Sitemap index](https://hermeslogisticsus.com/sitemapindex.xml)",
  "[Extended AI context](https://hermeslogisticsus.com/llms-full.txt)",
]) requireText(link);

const prohibitedClaims = [
  [/\b0\s*ms response time\b/i, "unsupported zero-latency claim"],
  [/\bLCP\b[^\n]{0,80}<\s*0\.8\s*s\b/i, "unsupported LCP claim"],
  [/\bINP\b[^\n]{0,80}<\s*50\s*ms\b/i, "unsupported INP claim"],
  [/\$0\s+API\s+token/i, "unsupported zero-token-cost claim"],
  [/\$99\s*\/\s*(?:mo|month)\b/i, "unverified SaaS price"],
  [/\$299\s*\/\s*(?:mo|month)\b/i, "unverified SaaS price"],
  [/\$799\s*\/\s*(?:mo|month)\b/i, "unverified SaaS price"],
  [/\bDedicated SLA Support\b/i, "unverified SLA promise"],
  [/\bfull suite of connected web applications\b/i, "overbroad product-readiness claim"],
  [/\brevenue management\b/i, "unverified product capability claim"],
];

for (const [pattern, label] of prohibitedClaims) {
  if (pattern.test(body)) errors.push(label);
}

if (/@[a-z0-9.-]+\.[a-z]{2,}/i.test(body)) errors.push("email address must not be embedded in llms.txt");
if (/\b(?:MC|USDOT|DOT)\s*-?\s*\d{5,8}\b/i.test(body)) errors.push("carrier authority identifier must not be embedded in llms.txt");
if (/\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s.-]*\d{4}/.test(body)) errors.push("phone number must not be embedded in llms.txt");

if (errors.length) {
  throw new Error(`llms.txt evidence contract failed with ${errors.length} error(s):\n${errors.map((item) => `- ${item}`).join("\n")}`);
}

console.log("llms.txt evidence contract passed: short AI context is aligned, evidence-bounded, entity-disambiguated, Markdown-linked for agent discovery, and public-safe.");
