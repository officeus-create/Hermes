/** Fixed repair attribution only; never copy arbitrary query values into analytics. */
export function repairSourceContext(path: string): Record<string, string> {
  if (path === "/services/auto-repair-website-design/") {
    return { source_path: path, vertical: "auto_repair", service_group: "auto_repair_website" };
  }
  if (path === "/services/seo-for-auto-repair-shops/") {
    return { source_path: path, vertical: "auto_repair", service_group: "auto_repair_seo" };
  }
  return {};
}

export function repairIntakeContext(path: string, params: URLSearchParams): Record<string, string> {
  // Reject duplicate controls and require the opposite mode key to be absent.
  // Derive the group from the exact source/destination pair; never trust query classification.
  if (["vertical", "source_path", "project", "service"].some((key) => params.getAll(key).length > 1)) return {};
  if (params.get("vertical") !== "auto_repair") return {};
  if (path === "/paths/technology/" && !params.has("service") && params.get("project") === "website_development"
    && params.get("source_path") === "/services/auto-repair-website-design/") {
    return repairSourceContext("/services/auto-repair-website-design/");
  }
  if (path === "/paths/marketing/" && !params.has("project") && params.get("service") === "seo"
    && params.get("source_path") === "/services/seo-for-auto-repair-shops/") {
    return repairSourceContext("/services/seo-for-auto-repair-shops/");
  }
  return {};
}
