// Proves that public/_routes.json reaches the build output.
//
// public/_routes.json decides which requests may bypass Pages Functions. If it
// is missing from dist/, Cloudflare falls back to default routing and the
// manifest silently stops describing the deployment. This check runs as part of
// "npm run build", which CI executes before every Pages deploy.
import { readFile } from "node:fs/promises";

let source;
let built;
try {
  source = await readFile(new URL("../public/_routes.json", import.meta.url), "utf8");
  built = await readFile(new URL("../dist/_routes.json", import.meta.url), "utf8");
} catch (error) {
  console.error("Pages routing manifest is missing from the build output.");
  console.error("public/_routes.json must be copied to dist/_routes.json, otherwise Cloudflare silently falls back to default routing.");
  console.error(String(error?.message ?? error));
  process.exit(1);
}

const sourceManifest = JSON.parse(source);
const builtManifest = JSON.parse(built);

if (JSON.stringify(sourceManifest) !== JSON.stringify(builtManifest)) {
  console.error("dist/_routes.json does not match public/_routes.json");
  console.error("source:", JSON.stringify(sourceManifest));
  console.error("built: ", JSON.stringify(builtManifest));
  process.exit(1);
}

console.log("routes manifest verified in build output");
