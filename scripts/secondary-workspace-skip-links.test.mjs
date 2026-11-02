import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const paths = ["src/components/BusinessSocialConnectionsWorkspace.astro","src/components/HermesConnectVerticalPreview.astro","src/pages/services/hermes-connect/demos/chayka-store.astro","src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro","src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro","src/pages/services/hermes-connect/internal/prospects/index.astro","src/pages/services/hermes-connect/repair-shops/catalog.astro"];
for (const path of paths) {
  const source = await readFile(new URL("../" + path, import.meta.url), "utf8");
  const main = [...source.matchAll(/<main\b[^>]*>/g)].map(match => match[0]);
  assert.equal(main.length, 1, path + ": expected exactly one main landmark");
  assert.match(main[0], /\bid="main-content"/, path + ": no skip anchor target");
  assert.match(main[0], /\btabindex="-1"/, path + ": focus destination missing");
}
console.log("7 shared/secondary Hermes skip targets verified: social, demos, AI projects, prospects, Catalog setup");
