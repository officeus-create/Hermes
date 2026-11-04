import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const socialImage = "https://hermeslogisticsus.com/images/hermes-live-home-2026.jpg";

for (const path of [
  "functions/businesses/connect/repair-shop/[slug].ts",
  "functions/businesses/connect/company/[slug].ts",
]) {
  const source = read(path);
  assert.match(source, /property="og:image"/, `${path}: og:image must exist`);
  assert.ok(source.includes(socialImage), `${path}: approved Hermes social image must be used`);
  assert.match(source, /name="twitter:image"/, `${path}: twitter:image must exist`);
  assert.match(source, /summary_large_image/, `${path}: Twitter card must support the social preview`);
}

const privacy = read("src/pages/ru/privacy.astro");
assert.match(privacy, /const privacySchema = \{/, "Russian privacy page must define schema");
assert.match(privacy, /"@type": "WebPage"/, "Russian privacy schema must be WebPage");
assert.match(privacy, /inLanguage: "ru"/, "Russian privacy schema must declare ru");
assert.match(privacy, /schema=\{privacySchema\}/, "Russian privacy page must pass schema to BaseLayout");

console.log("catalog social previews + Russian privacy schema contract passed.");
