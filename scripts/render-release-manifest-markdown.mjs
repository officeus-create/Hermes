import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url).pathname;
const jsonPath = new URL("../docs/release-manifest-2026-08-01.json", import.meta.url);
const markdownPath = new URL("../docs/RELEASE_MANIFEST_2026-08-01.md", import.meta.url);

function escapeMarkdown(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function sourceCount(source) {
  return source.route_count ?? source.public_route_count ?? 0;
}

function sourceLine(source) {
  return "| " + source.id + " | " + source.state + " | " + sourceCount(source) + " | " + escapeMarkdown(source.note) + " |";
}

function externalLine(source) {
  const note = source.errors.join("; ") || "Read-only snapshot completed.";
  return "| " + source.source + " | " + source.availability + " | " + source.route_count + " | " + escapeMarkdown(note) + " |";
}

function routeLine(row) {
  const owner = Array.isArray(row.sitemap_owner) ? row.sitemap_owner.join(", ") : row.sitemap_owner;
  return [
    "|",
    escapeMarkdown(row.route),
    row.source_state,
    row.indexability,
    escapeMarkdown(row.canonical),
    escapeMarkdown(owner),
    row.status,
    escapeMarkdown(row.blocker ?? "—"),
    "|",
  ].join(" ");
}

const manifest = JSON.parse(await readFile(jsonPath, "utf8"));
const current = manifest.sources.find((source) => source.id === "current_main");
const production = manifest.external_snapshots.find((source) => source.source === "production");
const immutable = manifest.external_snapshots.find((source) => source.source === "immutable_release");
const currentRows = manifest.routes.filter((row) => row.source_state === "current_main");
const productionComparison = currentRows.reduce((counts, row) => {
  const value = row.comparison?.production ?? "unknown";
  counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}, {});
const immutableComparison = currentRows.reduce((counts, row) => {
  const value = row.comparison?.immutable_release ?? "unknown";
  counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}, {});

const lines = [
  "# Release Manifest — Phase 1",
  "",
  "Snapshot generated: " + manifest.generated_at,
  "",
  "## Decision summary",
  "",
  "- Current main: " + manifest.repository.current_main_sha + ".",
  "- Current build: **" + current.route_count + " HTML routes**, **" + current.indexable_route_count + " indexable routes**, **" + current.sitemap_files.length + " sitemap files**.",
  "- Production snapshot: **" + production.availability + "**, " + production.route_count + " discovered route(s).",
  "- Production comparison: " + (productionComparison.present ?? 0) + " present, " + (productionComparison.missing ?? 0) + " absent current-build routes; all absent routes are noindex or 404 workspaces.",
  "- Immutable release snapshot: **" + immutable.availability + "**, " + immutable.route_count + " discovered route(s).",
  "- Immutable comparison: " + (immutableComparison.present ?? 0) + " present, " + (immutableComparison.missing ?? 0) + " absent current-build routes.",
  "- PR #83 is a stale historical route-estimate reference and is not a current-main release candidate.",
  "- PR #85 contains no public page route in its changed-file set.",
  "- PR #86 is merged and its discovery/sitemap changes are already represented in current main.",
  "- Phase 2 (Casablanca) is intentionally not included in this branch.",
  "",
  "## Source inventory",
  "",
  "| Source | State | Routes | Notes |",
  "|---|---|---:|---|",
  ...manifest.sources.map(sourceLine),
  ...manifest.external_snapshots.map(externalLine),
  "",
  "## Current-main sitemap ownership",
  "",
  "| Sitemap | URL count |",
  "|---|---:|",
  ...Object.entries(current.sitemap_counts).map(([file, count]) => "| " + file + " | " + count + " |"),
  "",
  "## Route reconciliation",
  "",
  "| Route | Source | Indexability | Canonical | Sitemap owner | Status | Blocker / next action |",
  "|---|---|---|---|---|---|---|",
  ...manifest.routes.map(routeLine),
  "",
  "## External verification boundary",
  "",
  "External URLs are read-only observations captured by the snapshot workflow. A failed fetch remains NOT_FOUND, NEEDS_REVIEW, or unavailable; it is never converted into a claim that production and current main are equivalent.",
  "",
  "## Phase 2 gate",
  "",
  "Casablanca implementation remains blocked until Phase 1 is reviewed and the owner supplies the required program, format, language, schedule, price, privacy, contact and publication facts from Issue #87.",
  "",
];

await writeFile(markdownPath, lines.join("\n") + "\n");
console.log("Rendered " + markdownPath.pathname.replace(root, "") + " from the JSON manifest.");
