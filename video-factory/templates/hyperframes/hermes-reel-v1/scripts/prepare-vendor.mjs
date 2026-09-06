import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const repoRoot = resolve(root, "../../../..");
const vendorDir = resolve(root, "vendor");
const fontDir = resolve(vendorDir, "fonts");

await mkdir(fontDir, { recursive: true });

await copyFile(
  resolve(root, "node_modules/gsap/dist/gsap.min.js"),
  resolve(vendorDir, "gsap.min.js"),
);

const fonts = [
  "manrope-latin.woff2",
  "source-sans-3-latin.woff2",
  "ibm-plex-mono-500-latin.woff2",
];

for (const font of fonts) {
  await copyFile(resolve(repoRoot, "public/fonts", font), resolve(fontDir, font));
}

console.log("Prepared pinned GSAP and canonical Hermes font assets.");
