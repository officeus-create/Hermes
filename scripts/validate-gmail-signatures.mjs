import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../docs/email-signatures/html/", import.meta.url));
const expectedDepartmentFiles = ["partnerships.html", "logistics.html", "marketing.html", "academy.html", "technology-it.html", "hermes-connect.html", "hr-recruiting.html", "general-office.html"];
const registrationUrl = "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/auth/?mode=register";
const websiteUrl = "https://hermeslogisticsus.com/";
const forbidden = [/<script\b/i, /\bon\w+\s*=/i, /data:image\//i, /<form\b/i, /<iframe\b/i, /<input\b/i, /<button\b/i, /<img\b/i, /utm_/i, /pixel/i];

const files = (await readdir(directory)).filter((file) => file.endsWith(".html")).sort();
for (const file of ["master-compact.html", "personal-template.html", "generic-template.html", ...expectedDepartmentFiles]) assert(files.includes(file), `Missing required signature file: ${file}`);

for (const file of files) {
  const html = await readFile(join(directory, file), "utf8");
  assert(html.length < 5_000, `${file}: signature must stay compact`);
  assert(/<table\b/i.test(html), `${file}: Gmail-safe table layout is required`);
  assert(!/<style\b/i.test(html), `${file}: external/style-block CSS is not Gmail-safe for this package`);
  assert(html.includes(websiteUrl), `${file}: missing Hermes website link`);
  assert(html.includes(registrationUrl), `${file}: missing exact Repair Shop registration CTA link`);
  for (const pattern of forbidden) assert(!pattern.test(html), `${file}: forbidden email markup/pattern ${pattern}`);
  for (const href of html.matchAll(/href="([^"]+)"/g)) assert(/^https:\/\/|^mailto:|^tel:/.test(href[1]), `${file}: unsupported link ${href[1]}`);
}

const partnerships = await readFile(join(directory, "partnerships.html"), "utf8");
assert(partnerships.includes("partnership@hermeslogisticsus.com"), "Partnerships: confirmed mailbox missing");
assert(partnerships.includes("+1 (682) 777-5337"), "Partnerships: confirmed phone missing");
console.log(`Gmail signature package passed: ${files.length} compact HTML files; no JS, images, tracking, base64, or unsupported interactive markup.`);
