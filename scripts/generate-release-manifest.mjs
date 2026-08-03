import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const publicDir = join(root, "public");
const docsDir = join(root, "docs");
const jsonPath = join(docsDir, "release-manifest-2026-08-01.json");
const markdownPath = join(docsDir, "RELEASE_MANIFEST_2026-08-01.md");
const writeOutput = process.argv.includes("--write");
const fetchExternal = process.argv.includes("--external");
const snapshotAt = process.env.RELEASE_MANIFEST_SNAPSHOT_AT || new Date().toISOString();
const currentMainSha = process.env.RELEASE_MANIFEST_CURRENT_MAIN_SHA || "2a1004b92e5aeb5bd01317174d8d6e497b31e7cb";
const canonicalOrigin = "https://hermeslogisticsus.com";

const externalSources = [
  { id: "production", baseUrl: "https://hermeslogisticsus.com" },
  { id: "immutable_release", baseUrl: "https://655e4425.hermes-eu4.pages.dev" },
];

const knownSitemapPaths = [
  "/sitemap.xml",
  "/sitemap-local.xml",
  "/sitemap-services.xml",
  "/sitemap-digital-services.xml",
  "/sitemap-cases.xml",
  "/sitemap-trust.xml",
  "/sitemap-academy.xml",
];

const prStates = [
  {
    id: "pr_83",
    number: 83,
    title: "Add feature-gated Google Routes planning estimate",
    head_sha: "880cf7058aa276b28fb50a7c863d4c98eb4c178a",
    state: "open_draft_stale",
    public_route_count: 1,
    note: "Changes the existing /load-board/ route and adds a non-public API endpoint. It is a historical reference, not a current-main release candidate.",
  },
  {
    id: "pr_85",
    number: 85,
    title: "Codex: harden Shipment History lifecycle, dates, privacy and provenance",
    head_sha: "eadf69427525ecc73127390ef1dafd5819868e6e",
    state: "open_draft_stale",
    public_route_count: 0,
    note: "Its changed-file set contains no public src/pages route, so no public URL is credited to this PR.",
  },
  {
    id: "merged_pr_86",
    number: 86,
    title: "SEO: reduce crawl depth for 72-hour logistics discovery",
    head_sha: "7684bf925c31745eb13025290686ccddab33aad4",
    merge_sha: "79ab8a477042802881bc308ce69ebf8b9c9e979d",
    state: "merged_into_current_main",
    public_route_count: 5,
    note: "Discovery and sitemap changes are already represented in current main and are not pending release work.",
  },
];

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
}

function normalizeRoute(value) {
  const url = new URL(value, canonicalOrigin);
  let route = url.pathname || "/";
  if (!route.endsWith("/") && !route.includes(".")) route += "/";
  return route;
}

function routeFromHtmlPath(absolutePath) {
  const outputPath = relative(dist, absolutePath).split(sep).join("/");
  if (outputPath === "index.html") return "/";
  if (outputPath === "404.html") return "/404.html";
  if (outputPath.endsWith("/index.html")) return "/" + outputPath.slice(0, -"index.html".length);
  return "/" + outputPath;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else files.push(absolute);
  }
  return files;
}

function parseRobots(html) {
  return html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i)?.[1]
    ?? "index,follow";
}

function parseCanonical(html, fallbackUrl) {
  const href = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1]
    ?? fallbackUrl;
  try {
    return new URL(href, fallbackUrl).toString();
  } catch {
    return fallbackUrl;
  }
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function inferSourceFile(route) {
  if (route === "/404.html") return "src/pages/404.astro";
  if (route === "/") return "src/pages/index.astro";
  const trimmed = route.replace(/^\//, "").replace(/\/$/, "");
  const candidates = [
    "src/pages/" + trimmed + "/index.astro",
    "src/pages/" + trimmed + ".astro",
  ];
  if (route.startsWith("/paths/logistics/") && !["/paths/logistics/", "/paths/logistics/find-your-path/"].includes(route)) {
    candidates.push("src/pages/paths/logistics/[...result].astro");
  }
  for (const candidate of candidates) {
    if (await pathExists(join(root, candidate))) return candidate;
  }
  return null;
}

async function loadSitemapOwnership() {
  const filenames = (await readdir(publicDir))
    .filter((name) => /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(name))
    .sort();
  const owners = new Map();
  const counts = {};
  for (const filename of filenames) {
    const xml = await readFile(join(publicDir, filename), "utf8");
    const routes = extractLocs(xml).map(normalizeRoute);
    counts[filename] = routes.length;
    for (const route of routes) {
      const list = owners.get(route) ?? [];
      list.push("public/" + filename);
      owners.set(route, list);
    }
  }
  return { filenames, owners, counts };
}

async function loadCurrentMain() {
  const sitemap = await loadSitemapOwnership();
  const htmlFiles = (await collectFiles(dist)).filter((path) => path.endsWith(".html"));
  const rows = [];
  for (const htmlFile of htmlFiles) {
    const route = routeFromHtmlPath(htmlFile);
    const html = await readFile(htmlFile, "utf8");
    const robots = parseRobots(html);
    const indexable = !/\bnoindex\b/i.test(robots) && route !== "/404.html";
    const owners = sitemap.owners.get(route) ?? [];
    let status = "COMPLETE";
    let blocker = null;
    if (indexable && owners.length !== 1) {
      status = owners.length === 0 ? "NOT_FOUND" : "CONFLICT";
      blocker = owners.length === 0
        ? "Indexable route is absent from every declared sitemap."
        : "Indexable route belongs to more than one sitemap.";
    } else if (!indexable && owners.length > 0) {
      status = "CONFLICT";
      blocker = "Noindex route is present in a sitemap.";
    }
    rows.push({
      route,
      source_state: "current_main",
      indexability: indexable ? "indexable" : "noindex",
      robots,
      canonical: parseCanonical(html, canonicalOrigin + route),
      sitemap_owner: owners.length === 1 ? owners[0] : owners,
      source_file: await inferSourceFile(route),
      status,
      blocker,
      response_status: 200,
    });
  }
  rows.sort((a, b) => a.route.localeCompare(b.route));
  return {
    rows,
    sitemap_files: sitemap.filenames,
    sitemap_counts: sitemap.counts,
  };
}

async function fetchText(url, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "HermesReleaseManifest/1.0" },
    });
    return {
      ok: response.ok,
      status: response.status,
      final_url: response.url,
      text: await response.text(),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      final_url: url,
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mapConcurrent(items, limit, task) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, Math.max(1, items.length)) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function discoverExternal(source, currentRoutes) {
  if (!fetchExternal) {
    return {
      source: source.id,
      base_url: source.baseUrl,
      availability: "NOT_CHECKED",
      sitemap_files: [],
      route_count: 0,
      errors: ["External snapshot disabled; run with --external in an approved read-only environment."],
      rows: [],
    };
  }

  const errors = [];
  const sitemapMap = new Map();
  const robots = await fetchText(source.baseUrl + "/robots.txt");
  const declared = robots.ok
    ? [...robots.text.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)].map((match) => match[1])
    : [];
  if (!robots.ok) errors.push("robots.txt: " + (robots.status ?? robots.error ?? "unavailable"));

  const queue = [...new Set([...declared, ...knownSitemapPaths.map((path) => source.baseUrl + path)])];
  const visited = new Set();
  while (queue.length) {
    const sitemapUrl = queue.shift();
    if (!sitemapUrl || visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);
    const result = await fetchText(sitemapUrl);
    if (!result.ok || !/<(?:urlset|sitemapindex)\b/i.test(result.text)) {
      if (declared.includes(sitemapUrl) || sitemapUrl.endsWith("/sitemap.xml")) {
        errors.push(sitemapUrl + ": " + (result.status ?? result.error ?? "not an XML sitemap"));
      }
      continue;
    }
    const locs = extractLocs(result.text);
    if (/<sitemapindex\b/i.test(result.text)) {
      queue.push(...locs.filter((loc) => /\.xml(?:\?|$)/i.test(loc)));
    } else {
      sitemapMap.set(new URL(result.final_url).pathname, locs.filter((loc) => !/\.xml(?:\?|$)/i.test(loc)));
    }
  }

  const routeOwners = new Map();
  for (const [sitemapPath, urls] of sitemapMap) {
    for (const url of urls) {
      const route = normalizeRoute(url);
      const owners = routeOwners.get(route) ?? [];
      owners.push(sitemapPath);
      routeOwners.set(route, owners);
    }
  }

  const homepage = await fetchText(source.baseUrl + "/");
  if (!homepage.ok) errors.push("homepage: " + (homepage.status ?? homepage.error ?? "unavailable"));
  if (homepage.ok && !routeOwners.has("/")) routeOwners.set("/", []);

  const routes = [...routeOwners.keys()].sort();
  const rows = await mapConcurrent(routes, 6, async (route) => {
    const result = route === "/" ? homepage : await fetchText(source.baseUrl + route);
    const owners = routeOwners.get(route) ?? [];
    if (!result.ok) {
      return {
        route,
        source_state: source.id,
        indexability: "unknown",
        robots: null,
        canonical: null,
        sitemap_owner: owners.length === 1 ? owners[0] : owners,
        source_file: null,
        status: "NOT_FOUND",
        blocker: "External route fetch failed: " + (result.status ?? result.error ?? "unknown"),
        response_status: result.status,
      };
    }
    const robotsValue = parseRobots(result.text);
    const indexable = !/\bnoindex\b/i.test(robotsValue);
    let status = currentRoutes.has(route) ? "COMPLETE" : "STALE";
    let blocker = currentRoutes.has(route) ? null : "External route is absent from current main.";
    if (indexable && owners.length !== 1) {
      status = owners.length === 0 ? "NEEDS_REVIEW" : "CONFLICT";
      blocker = owners.length === 0
        ? "Indexable route was discovered outside a sitemap."
        : "Route belongs to more than one external sitemap.";
    }
    return {
      route,
      source_state: source.id,
      indexability: indexable ? "indexable" : "noindex",
      robots: robotsValue,
      canonical: parseCanonical(result.text, result.final_url || source.baseUrl + route),
      sitemap_owner: owners.length === 1 ? owners[0] : owners,
      source_file: null,
      status,
      blocker,
      response_status: result.status,
    };
  });

  return {
    source: source.id,
    base_url: source.baseUrl,
    availability: routes.length ? "AVAILABLE" : "NOT_FOUND",
    sitemap_files: [...sitemapMap.keys()].sort(),
    route_count: routes.length,
    errors: [...new Set(errors)],
    rows,
  };
}

function createPrRows(currentRows) {
  const byRoute = new Map(currentRows.map((row) => [row.route, row]));
  const clone = (route, sourceState, status, blocker, sourceFile = null) => {
    const current = byRoute.get(route);
    return {
      route,
      source_state: sourceState,
      indexability: current?.indexability ?? "unknown",
      robots: current?.robots ?? null,
      canonical: current?.canonical ?? canonicalOrigin + route,
      sitemap_owner: current?.sitemap_owner ?? null,
      source_file: sourceFile ?? current?.source_file ?? null,
      status,
      blocker,
      response_status: null,
    };
  };
  return [
    clone(
      "/load-board/",
      "pr_83",
      "STALE",
      "PR #83 changes an existing route from a stale, non-mergeable branch and must be rebuilt from current main if prioritized.",
      "src/pages/load-board.astro",
    ),
    clone("/", "merged_pr_86", "COMPLETE", null, "src/pages/index.astro"),
    clone("/paths/logistics/", "merged_pr_86", "COMPLETE", null, "src/pages/paths/logistics/index.astro"),
    clone("/logistics/appleton-wi-vehicle-transport/", "merged_pr_86", "COMPLETE", null),
    clone("/logistics/resources/auction-vehicle-pickup-checklist/", "merged_pr_86", "COMPLETE", null),
    clone("/logistics/resources/car-hauler-capacity-checklist/", "merged_pr_86", "COMPLETE", null),
  ];
}

function summarize(rows) {
  const byStatus = {};
  const bySource = {};
  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    bySource[row.source_state] = (bySource[row.source_state] ?? 0) + 1;
  }
  return { total: rows.length, by_status: byStatus, by_source: bySource };
}

function escapeMarkdown(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function sourceLine(source) {
  return "| " + source.id + " | " + source.state + " | " + source.route_count + " | " + escapeMarkdown(source.note) + " |";
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

function renderMarkdown(manifest) {
  const current = manifest.sources.find((source) => source.id === "current_main");
  const production = manifest.external_snapshots.find((source) => source.source === "production");
  const immutable = manifest.external_snapshots.find((source) => source.source === "immutable_release");
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
    "- Immutable release snapshot: **" + immutable.availability + "**, " + immutable.route_count + " discovered route(s).",
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
  return lines.join("\n") + "\n";
}

await stat(dist).catch(() => {
  throw new Error("dist is missing. Run npm run build before generating the release manifest.");
});

const currentMain = await loadCurrentMain();
const currentRouteSet = new Set(currentMain.rows.map((row) => row.route));
const externalSnapshots = [];
for (const source of externalSources) externalSnapshots.push(await discoverExternal(source, currentRouteSet));

for (const row of currentMain.rows) {
  row.comparison = {};
  for (const snapshot of externalSnapshots) {
    row.comparison[snapshot.source] = snapshot.availability !== "AVAILABLE"
      ? "unavailable"
      : snapshot.rows.some((externalRow) => externalRow.route === row.route && externalRow.response_status < 400)
        ? "present"
        : "missing";
  }
}

const routes = [
  ...currentMain.rows,
  ...externalSnapshots.flatMap((snapshot) => snapshot.rows),
  ...createPrRows(currentMain.rows),
].sort((a, b) => a.route.localeCompare(b.route) || a.source_state.localeCompare(b.source_state));

const indexableCurrent = currentMain.rows.filter((row) => row.indexability === "indexable");
const manifest = {
  schema_version: 1,
  issue: 87,
  phase: 1,
  generated_at: snapshotAt,
  repository: {
    full_name: "officeus-create/Hermes",
    current_main_sha: currentMainSha,
    canonical_origin: canonicalOrigin,
  },
  sources: [
    {
      id: "current_main",
      state: "complete_build_inventory",
      route_count: currentMain.rows.length,
      indexable_route_count: indexableCurrent.length,
      sitemap_files: currentMain.sitemap_files.map((file) => "public/" + file),
      sitemap_counts: currentMain.sitemap_counts,
      note: "Generated from current build output and committed sitemap files.",
    },
    ...prStates,
  ],
  external_snapshots: externalSnapshots.map(({ rows: _rows, ...snapshot }) => snapshot),
  summary: summarize(routes),
  routes,
  phase_2: {
    status: "BLOCKED_PENDING_REVIEW_AND_OWNER_FACTS",
    route: "/paths/academy/casablanca/",
    included_in_this_release: false,
  },
};

const json = JSON.stringify(manifest, null, 2) + "\n";
const markdown = renderMarkdown(manifest);

if (writeOutput) {
  await mkdir(docsDir, { recursive: true });
  await writeFile(jsonPath, json);
  await writeFile(markdownPath, markdown);
  console.log("Wrote " + relative(root, jsonPath) + " and " + relative(root, markdownPath) + ".");
} else {
  console.log(json);
}

const invalidCurrent = currentMain.rows.filter((row) => row.status !== "COMPLETE");
if (invalidCurrent.length) {
  const details = invalidCurrent.map((row) => "- " + row.route + ": " + row.status).join("\n");
  throw new Error("Current-main release inventory has " + invalidCurrent.length + " invalid route(s):\n" + details);
}

console.log(
  "Release manifest snapshot passed: "
  + currentMain.rows.length
  + " current HTML routes, "
  + indexableCurrent.length
  + " indexable routes, "
  + currentMain.sitemap_files.length
  + " sitemap files.",
);
