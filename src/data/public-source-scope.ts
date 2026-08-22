export type SourcePageScope =
  | "public_audit"
  | "public_noindex_audit"
  | "public_connect_truth_audit"
  | "demo_classification"
  | "connect_private_excluded"
  | "non_page_excluded";

const DIRECT_PUBLIC_CONNECT_PAGES = new Set([
  "src/pages/services/hermes-connect/index.astro",
  "src/pages/services/hermes-connect/repair-shops.astro",
  "src/pages/services/hermes-connect/ai-command-center.astro",
  "src/pages/services/hermes-connect/business-automation.astro",
  "src/pages/services/hermes-connect/load-analyzer.astro",
  "src/pages/services/hermes-connect/proposal-builder.astro",
  "src/pages/services/hermes-connect/rate-negotiator.astro",
  "src/pages/services/hermes-connect/roi-calculator.astro",
  "src/pages/services/hermes-connect/unified-inbox.astro",
]);

const PUBLIC_NOINDEX_SOURCE_PAGES = new Set([
  "src/pages/404.astro",
  "src/pages/download.astro",
  "src/pages/thanks.astro",
  "src/pages/logistics/thanks.astro",
]);

export const classifySourcePage = (sourcePath: string): SourcePageScope => {
  const normalized = sourcePath.replaceAll("\\", "/");

  if (!normalized.startsWith("src/pages/") || !normalized.endsWith(".astro")) {
    return "non_page_excluded";
  }

  if (normalized.startsWith("src/pages/api/")) return "non_page_excluded";
  if (normalized.startsWith("src/pages/demos/")) return "demo_classification";

  if (DIRECT_PUBLIC_CONNECT_PAGES.has(normalized)) return "public_connect_truth_audit";

  if (normalized.startsWith("src/pages/services/hermes-connect/")) {
    return "connect_private_excluded";
  }

  if (PUBLIC_NOINDEX_SOURCE_PAGES.has(normalized)) return "public_noindex_audit";

  return "public_audit";
};

export const publicSourceScopePolicy = {
  publicConnectFiles: [...DIRECT_PUBLIC_CONNECT_PAGES],
  noindexFiles: [...PUBLIC_NOINDEX_SOURCE_PAGES],
  rule: "Every Astro source page must resolve to an explicit public, demo, private-Connect, or non-page scope before mutation.",
} as const;
