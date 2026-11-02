import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const [path, label] of [
  ["src/components/AcademyCountryPage.astro", "localized Academy country profile"],
  ["src/components/InternationalBusinessProfile.astro", "Hermes Catalog international profile"],
]) {
  const source = await readFile(new URL("../" + path, import.meta.url), "utf8");
  const main = [...source.matchAll(/<main\b[^>]*>/g)].map((match) => match[0]);
  assert.equal(main.length, 1, label + ": expected one main landmark");
  assert.match(main[0], /\bid="main-content"/, label + ": skip link target missing");
  assert.match(main[0], /\btabindex="-1"/, label + ": main target not programmatically focusable");
}
const layout = await readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
assert.match(layout, /href="#main-content"/);
console.log("Public Academy and Catalog template skip-link preservation OK");
