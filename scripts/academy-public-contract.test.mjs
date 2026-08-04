import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const homepageHtml = await readFile(join(root, "dist", "index.html"), "utf8");
const academyHtml = await readFile(join(root, "dist", "paths", "academy", "index.html"), "utf8");
const applicationHtml = await readFile(join(root, "dist", "academy", "apply", "index.html"), "utf8");

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

for (const text of [
  "U.S. Logistics Operations",
  "Marketing for U.S. and international service businesses",
  "Separate paid cohort and free practice models",
]) {
  assert.ok(homepage.includes(text), `Homepage Academy card is missing: ${text}`);
}

for (const text of [
  "Academy structure",
  "2 programs",
  "paid cohort and free practice are separate models",
]) {
  assert.ok(homepageText.includes(text), `Homepage Academy trust signal is missing: ${text}`);
}

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

console.log("Academy public contract checks passed: two programs, separate participation models, human application review clarity, crawler-safe retired-copy boundary, and no blocked prices.");
