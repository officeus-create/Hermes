import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const homepage = await readFile(join(root, "dist", "index.html"), "utf8");

for (const anchor of ["main-content", "paths", "journey", "about", "contact"]) {
  assert.ok(
    homepage.includes(`id="${anchor}"`),
    `Frozen #${anchor} anchor is missing from the homepage`,
  );
}

console.log("Frozen homepage anchor checks passed: #main-content, #paths, #journey, #about, and #contact.");
