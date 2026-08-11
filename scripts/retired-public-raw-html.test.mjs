import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const retiredStrings = [
  "freight_301@hermeslogisticsus.com",
  "USA · Europe · International email coordination",
  "Contact submission pending connection",
];
const rawHtmlPaths = [
  "index.html",
  "about/index.html",
  "logistics/appleton-wi-vehicle-transport/index.html",
];

for (const relativePath of rawHtmlPaths) {
  const html = await readFile(join(root, "dist", relativePath), "utf8");
  for (const retired of retiredStrings) {
    assert.equal(
      html.includes(retired),
      false,
      `${relativePath} must not ship retired public string in raw HTML: ${retired}`,
    );
  }
}

console.log(`Retired raw-public HTML contract passed for ${rawHtmlPaths.length} representative pages.`);
