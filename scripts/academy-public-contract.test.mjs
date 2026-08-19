import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const homepageHtml = await readFile(join(root, "dist", "index.html"), "utf8");
const academyHtml = await readFile(join(root, "dist", "paths", "academy", "index.html"), "utf8");
const applicationHtml = await readFile(join(root, "dist", "academy", "apply", "index.html"), "utf8");
const logisticsProgramHtml = await readFile(join(root, "dist", "academy", "us-logistics-operations", "index.html"), "utf8");
const marketingProgramHtml = await readFile(join(root, "dist", "academy", "marketing", "index.html"), "utf8");
const ukrainianLogisticsProgramHtml = await readFile(join(root, "dist", "ua", "academy", "us-logistics-operations", "index.html"), "utf8");

const visibleHtml = (html) => html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
const extractedText = (html) => visibleHtml(html)
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const homepage = visibleHtml(homepageHtml);
const academy = visibleHtml(academyHtml);
const application = visibleHtml(applicationHtml);
const homepageText = extractedText(homepageHtml);
const academyText = extractedText(academyHtml);
const applicationText = extractedText(applicationHtml);
const logisticsProgramText = extractedText(logisticsProgramHtml);
const marketingProgramText = extractedText(marketingProgramHtml);
const ukrainianLogisticsProgramText = extractedText(ukrainianLogisticsProgramHtml);

// Home is deliberately an entrance: it must expose Academy as one of four direct
// directions, while program structure and participation models live on Academy itself.
assert.ok(homepage.includes('href="/paths/academy/"'), "Homepage must link directly to the Academy direction");
assert.ok(homepageText.includes("Hermes Academy"), "Homepage must visibly identify the Academy direction");

const publicTabs = [...academy.matchAll(/\brole=["']tab["']/gi)];
assert.equal(publicTabs.length, 2, "Academy must expose exactly two public program tabs");

for (const text of [
  "U.S. Logistics Operations",
  "Marketing",
  "Paid cohort",
  "Free practice opportunity",
  "not a third Academy program",
]) {
  assert.ok(academy.includes(text), `Academy public page is missing: ${text}`);
}

for (const text of [
  "The application moves through human review.",
  "Application context",
  "Clarification when needed",
  "Current format review",
  "Separate decision",
  "What happens after I choose a contact handoff?",
  "No response time, admission, seat, mentor, account, operational access, employment, income, or future paid work is guaranteed.",
]) {
  assert.ok(application.includes(text), `Academy application page is missing review clarity: ${text}`);
}

// Program-specific eligibility must remain explicit and job-relevant.
assert.ok(logisticsProgramText.includes("B2 level or higher"), "U.S. Logistics program must state the B2+ English requirement for communication-heavy tracks");
assert.ok(ukrainianLogisticsProgramText.includes("B2 або вище"), "Ukrainian Logistics program must state the B2+ English requirement");
for (const text of ["Russian or Ukrainian", "Italian", "Spanish", "French", "German", "B2 level or higher"]) {
  assert.ok(marketingProgramText.includes(text), `Marketing program is missing language-profile guidance: ${text}`);
}
for (const [label, text] of [
  ["English Logistics", logisticsProgramText],
  ["Marketing", marketingProgramText],
  ["Ukrainian Logistics", ukrainianLogisticsProgramText],
]) {
  assert.ok(/sanctions|санкц/i.test(text), `${label} must visibly disclose sanctions/compliance eligibility`);
  assert.ok(/nationality alone is not an automatic exclusion criterion|громадянство не є автоматичною причиною відмови/i.test(text), `${label} must not turn nationality itself into the exclusion rule`);
}

for (const retiredText of [
  "COO / Operational Director",
  "Three programs. Different responsibilities.",
  "3 tracks",
  "3 × 6",
  "former COO",
]) {
  assert.ok(!homepageText.includes(retiredText), `Retired Academy wording remains extractable on the homepage: ${retiredText}`);
  assert.ok(!academyText.includes(retiredText), `Retired Academy wording remains extractable on the Academy page: ${retiredText}`);
  assert.ok(!applicationText.includes(retiredText), `Retired Academy wording remains extractable on the Academy application page: ${retiredText}`);
}

for (const sourceHtml of [homepageHtml, academyHtml, applicationHtml]) {
  const templates = [...sourceHtml.matchAll(/<template\b[^>]*data-static-validator-compat[^>]*>([\s\S]*?)<\/template>/gi)];
  for (const template of templates) {
    assert.equal(template[1].trim(), "", "Static-validator compatibility template must contain no text node");
  }
}

for (const blockedPrice of ["$999", "$400/month", "$600/month"]) {
  assert.ok(!academy.includes(blockedPrice), `Unapproved Academy price is visible: ${blockedPrice}`);
  assert.ok(!application.includes(blockedPrice), `Unapproved Academy price is visible on the application page: ${blockedPrice}`);
}

console.log("Academy public contract checks passed: Home routes to Academy, Academy owns two-program detail and participation models, language/compliance eligibility remains explicit, application review clarity remains explicit, and no blocked prices are visible.");
