import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

function listFiles(directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];

  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(relative) : [relative];
  });
}

// A root Worker configuration would let a dashboard or CLI integration infer a
// generic Worker deployment for the whole website. The reviewed repository
// contract keeps only examples until authenticated activation is intentional.
assert.equal(exists("wrangler.jsonc"), false, "Active root wrangler.jsonc must not be committed.");
assert.equal(exists("wrangler.toml"), false, "Active root wrangler.toml must not be committed.");

const pagesExample = JSON.parse(read("wrangler.jsonc.example"));
assert.equal(pagesExample.name, "hermes");
assert.equal(pagesExample.pages_build_output_dir, "dist");
assert.equal("main" in pagesExample, false, "The root example must remain Pages-oriented, not a Worker entrypoint.");

const emailWorkerExample = JSON.parse(read("workers/lead-email/wrangler.jsonc.example"));
assert.equal(emailWorkerExample.name, "hermes-lead-email");
assert.equal(emailWorkerExample.main, "src/index.mjs");
assert.equal(emailWorkerExample.workers_dev, false);
assert.equal(emailWorkerExample.preview_urls, false);
assert.equal("routes" in emailWorkerExample, false, "The private email Worker must not gain a public route by default.");

const productionWorkflow = read(".github/workflows/cloudflare-pages-production-v2.yml");
assert.match(
  productionWorkflow,
  /pages deploy dist --project-name=hermes --branch=main/,
  "The controlled production workflow must deploy the reviewed dist output to Pages project hermes.",
);

for (const workflowPath of listFiles(".github/workflows").filter((file) => /\.ya?ml$/i.test(file))) {
  const workflow = read(workflowPath);
  assert.doesNotMatch(
    workflow,
    /\b(?:npx\s+)?wrangler\s+deploy\b/i,
    `${workflowPath} introduces a generic Worker deployment. Use an explicitly reviewed service-specific workflow instead.`,
  );
  assert.doesNotMatch(
    workflow,
    /^\s*command:\s*deploy(?:\s|$)/im,
    `${workflowPath} invokes a generic wrangler-action deploy command. Pages releases must use pages deploy.`,
  );
}

console.log("Cloudflare deployment ownership contract passed.");
