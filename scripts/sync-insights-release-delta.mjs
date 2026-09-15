#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const registry = JSON.parse(await readFile(new URL("../src/data/insights.generated.json", import.meta.url), "utf8"));
const standalone = registry.filter((post) => post.contentTier === "standalone");
const newest = registry.map((post) => post.dateModified).sort().at(-1) || "2026-09-14";
const route = (post) => `/insights/${post.direction}/${post.slug}/`;

const additions = [
  {
    route: "/insights/", source_state: "current_main", indexability: "indexable",
    robots: "index,follow,max-image-preview:large", canonical: "https://hermeslogisticsus.com/insights/",
    sitemap_owner: "public/sitemap-insights.xml", source_file: "src/pages/insights/index.astro",
    status: "COMPLETE", blocker: null, response_status: 200,
    comparison: { production: "pending_deployment", immutable_release: "missing" },
  },
  ...standalone.map((post) => ({
    route: route(post), source_state: "current_main", indexability: "indexable",
    robots: "index,follow,max-image-preview:large",
    canonical: `https://hermeslogisticsus.com${route(post)}`,
    sitemap_owner: "public/sitemap-insights.xml", source_file: "src/pages/insights/[direction]/[slug].astro",
    status: "COMPLETE", blocker: null, response_status: 200,
    comparison: { production: "pending_deployment", immutable_release: "missing" },
  })),
];
const delta = {
  schema_version: 1,
  base_manifest: "docs/release-manifest-2026-08-01.json",
  release_delta: "2026-09-14-hermes-insights-blog",
  generated_at: `${newest}T12:00:00+00:00`,
  status: "PENDING_PRODUCTION_DEPLOYMENT",
  additions,
  acceptance: {
    route_count_added: additions.length,
    indexable_route_count_added: additions.length,
    requires_green_current_head_ci: true,
    requires_production_snapshot_reconciliation_after_deploy: true,
  },
};

await writeFile(
  new URL("../docs/release-manifest-deltas/2026-09-14-hermes-insights-blog.json", import.meta.url),
  JSON.stringify(delta, null, 2) + "\n",
);
console.log(`Insights release delta synced: ${additions.length} indexable route(s)`);
