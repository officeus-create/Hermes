import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const homepageHtml = await readFile(join(root, "dist", "index.html"), "utf8");
const academyHtml = await readFile(join(root, "dist", "paths", "academy", "index.html"), "utf8");

const visibleHtml = (html) => html.replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "");
const homepage = visibleHtml(homepageHtml);
const academy = visibleHtml(academyHtml);

for (const text of [
  "U.S. Logistics Operations",
  "Marketing for U.S. and international service businesses",
  "Separate paid cohort and free practice models",
]) {
  assert.ok(homepage.includes(text), `Homepage Academy card is missing: ${text}`);
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

for (const retiredText of [
  "COO / Operational Director",
  "Three programs. Different responsibilities.",
  "former COO",
]) {
  assert.ok(!academy.includes(retiredText), `Retired Academy wording remains visible: ${retiredText}`);
}

for (const blockedPrice of ["$999", "$400/month", "$600/month"]) {
  assert.ok(!academy.includes(blockedPrice), `Unapproved Academy price is visible: ${blockedPrice}`);
}

console.log("Academy public contract checks passed: two programs, separate participation models, no retired track, and no blocked prices.");
