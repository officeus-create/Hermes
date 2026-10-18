import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const vendorDir = resolve(root, "vendor");

await mkdir(vendorDir, { recursive: true });
await copyFile(
  resolve(root, "node_modules/gsap/dist/gsap.min.js"),
  resolve(vendorDir, "gsap.min.js"),
);

console.log("Prepared pinned GSAP runtime for Home Logistics cinematic render.");
