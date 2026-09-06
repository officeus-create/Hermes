import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = resolve(root, "node_modules/gsap/dist/gsap.min.js");
const targetDir = resolve(root, "vendor");
await mkdir(targetDir, { recursive: true });
await copyFile(source, resolve(targetDir, "gsap.min.js"));
console.log("Prepared pinned GSAP vendor asset.");
