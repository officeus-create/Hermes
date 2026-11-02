import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const targetPaths = [
  "src/pages/services/hermes-connect/repair-shops/appointments.astro",
  "src/pages/services/hermes-connect/repair-shops/availability.astro",
  "src/pages/services/hermes-connect/repair-shops/booking.astro",
  "src/pages/services/hermes-connect/repair-shops/dashboard.astro",
  "src/pages/services/hermes-connect/repair-shops/vehicles.astro",
  "src/pages/services/hermes-connect/repair-shops/auth.astro",
  "src/pages/services/hermes-connect/repair-shops/customers.astro",
  "src/pages/services/hermes-connect/internal/ai-connect/index.astro",
  "src/pages/services/hermes-connect/internal/ai-connect/activity/index.astro",
  "src/pages/services/hermes-connect/internal/registrations/index.astro"
];
const baseLayout = await readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
assert.match(baseLayout, /href="#main-content"/, "Skip link must keep its canonical target");

for (const path of targetPaths) {
  const source = await readFile(new URL("../" + path, import.meta.url), "utf8");
  const main = [...source.matchAll(/<main\\b[^>]*>/g)].map(x => x[0]);
  assert.equal(main.length, 1, path + ": must have exactly one main landmark");
  assert.match(main[0], /\\bid="main-content"/, path + ": skip-to-content target is missing");
  assert.match(main[0], /\\btabindex="-1"/, path + ": programmatic keyboard focus target is missing");
}
console.log("Private workspace skip links: " + targetPaths.length + " source landmarks verified.");
