import { access, readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const indexPath = join(dist, "index.html");
const assets = [
  "images/hermes-hero.jpg",
  "images/path-logistics.jpg",
  "images/path-marketing.jpg",
  "images/path-academy.jpg",
];

await access(indexPath);
const html = await readFile(indexPath, "utf8");

const required = [
  "Hermes. One ecosystem. Three ways forward.",
  "Hermes Logistics",
  "ProgressoPro",
  "Hermes Business Academy",
  "Prototype only. Your information was not sent or stored.",
];

for (const text of required) {
  if (!html.includes(text)) throw new Error(`Missing required content: ${text}`);
}

const forbidden = [
  "guaranteed income",
  "guaranteed employment",
  "10,000+ students",
  "4,400+ trucks",
  "operating in all 48 states",
];

for (const claim of forbidden) {
  if (html.toLowerCase().includes(claim)) throw new Error(`Unsupported claim found: ${claim}`);
}

if (/<form[^>]+action=/i.test(html)) throw new Error("Prototype form must not have an action endpoint");
if (!html.includes('id="main-content"')) throw new Error("Skip-link target is missing");
const cssFiles = (await readdir(join(dist, "_astro"))).filter((file) => file.endsWith(".css"));
const css = (await Promise.all(cssFiles.map((file) => readFile(join(dist, "_astro", file), "utf8")))).join("\n");
if (!css.includes("prefers-reduced-motion")) throw new Error("Reduced-motion stylesheet was not emitted");

for (const asset of assets) {
  const path = join(dist, asset);
  await access(path);
  const info = await stat(path);
  if (info.size === 0) throw new Error(`Empty image asset: ${asset}`);
  if (info.size > 1_500_000) throw new Error(`Image exceeds prototype budget: ${asset}`);
}

await access(join(dist, "_headers"));

console.log(`Validated static prototype: ${required.length} content checks, ${assets.length} image assets, no external form action.`);
