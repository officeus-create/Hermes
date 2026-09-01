import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const MASTER_PATH = "M35 18C15 18 15 62 35 62C55 62 65 18 85 18C105 18 105 62 85 62C65 62 55 18 35 18Z";
const asset = (name) => new URL(`../public/demos/hermes-connect/${name}`, import.meta.url);

const [mark, monoDark, monoLight, icon192, icon512, icon, maskable] = await Promise.all([
  readFile(asset("mark.svg"), "utf8"),
  readFile(asset("mark-mono-dark.svg"), "utf8"),
  readFile(asset("mark-mono-light.svg"), "utf8"),
  readFile(asset("icon-192.svg"), "utf8"),
  readFile(asset("icon-512.svg"), "utf8"),
  readFile(asset("icon.svg"), "utf8"),
  readFile(asset("icon-maskable.svg"), "utf8"),
]);

for (const [name, source] of Object.entries({ mark, monoDark, monoLight, icon192, icon512, icon, maskable })) {
  assert.match(source, new RegExp(MASTER_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${name} must preserve the approved Option 02 master geometry`);
}

for (const [name, source] of Object.entries({ mark, monoDark, monoLight })) {
  assert.match(source, /viewBox="0 0 120 80"/, `${name} must use the shared transparent export frame`);
  assert.doesNotMatch(source, /<rect\b/, `${name} must stay transparent and must not grow an app-tile background`);
}

assert.match(mark, /linearGradient id="hcMark02"/, "master transparent mark must preserve the approved gradient treatment");
assert.match(mark, /M28 23C20 30 20 49 29 57C37 64 45 57 51 47/, "master transparent mark must preserve the restrained highlight treatment");
assert.doesNotMatch(monoDark, /linearGradient|filter|radialGradient/, "dark mono export must remain true monochrome");
assert.doesNotMatch(monoLight, /linearGradient|filter|radialGradient/, "light mono export must remain true monochrome");
assert.match(monoDark, /stroke="#11161F"/, "dark mono export must use canonical dark ink");
assert.match(monoLight, /stroke="#FFFFFF"/, "light mono export must use white inverse ink");

console.log("Hermes Connect Option 02 mark contract: PASS — app icons and transparent/mono exports share one geometry.");
