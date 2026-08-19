import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const registryPath = join(root, "data", "marketing", "seo-four-direction-market-registry.json");
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const errors = [];

const expectedDirections = ["logistics", "marketing", "academy", "it_hermes_connect"];
const allowedStatuses = new Set(registry?.candidate_schema?.allowed_statuses ?? []);
const requiredResearch = registry?.candidate_schema?.required_for_research ?? [];
const requiredBuild = registry?.candidate_schema?.required_for_approved_for_build ?? [];

if (registry?.scope !== "Google/Bing SEO market research and publication control") {
  errors.push("registry scope must remain Google/Bing SEO only; GEO/AI visibility is a separate workstream");
}

for (const direction of expectedDirections) {
  if (!registry?.directions?.[direction]) errors.push(`missing required SEO direction: ${direction}`);
}

const academy = registry?.directions?.academy;
if (!Array.isArray(academy?.excluded_markets) || !academy.excluded_markets.includes("Russia")) {
  errors.push("Academy registry must explicitly exclude Russia");
}
if (academy?.additional_exclusions_source !== "owner_or_compliance_approved_list_required") {
  errors.push("additional Academy exclusions must come from an owner/compliance-approved list");
}

const verticals = new Map((registry?.directions?.it_hermes_connect?.vertical_priority ?? []).map((item) => [item.vertical, item.state]));
for (const requiredVertical of ["repair_shops", "beauty", "fitness", "education_courses"]) {
  if (!verticals.has(requiredVertical)) errors.push(`missing Hermes Connect priority vertical: ${requiredVertical}`);
}
if (verticals.get("repair_shops") !== "existing_first_vertical") {
  errors.push("Repair Shops must remain identified as the first existing Hermes Connect vertical until product-market evidence changes the baseline");
}

for (const [directionName, direction] of Object.entries(registry?.directions ?? {})) {
  for (const candidate of direction.candidates ?? []) {
    for (const field of requiredResearch) {
      if (candidate[field] === undefined || candidate[field] === null || candidate[field] === "") {
        errors.push(`${directionName}/${candidate.id ?? "unknown"}: missing research field ${field}`);
      }
    }

    if (!allowedStatuses.has(candidate.status)) {
      errors.push(`${directionName}/${candidate.id ?? "unknown"}: invalid candidate status ${candidate.status}`);
    }

    if (candidate.direction !== directionName) {
      errors.push(`${directionName}/${candidate.id ?? "unknown"}: candidate direction does not match registry section`);
    }

    const marketText = String(candidate.market ?? "").toLocaleLowerCase("en-US");
    if (directionName === "academy" && /\brussia\b|\brussian federation\b/i.test(marketText)) {
      errors.push(`${directionName}/${candidate.id ?? "unknown"}: Russia is excluded from Academy acquisition markets`);
    }

    if (["approved_for_build", "published", "measurement_active"].includes(candidate.status)) {
      for (const field of requiredBuild) {
        const value = candidate[field];
        const missing = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
        if (missing) errors.push(`${directionName}/${candidate.id ?? "unknown"}: ${candidate.status} requires ${field}`);
      }
    }
  }
}

const guardedResearchRoutes = [
  ["Texas state owner", "logistics", "texas-vehicle-transport", "index.html"],
  ["Dallas / DFW owner", "logistics", "dallas-tx-vehicle-transport", "index.html"],
  ["Houston owner", "logistics", "houston-tx-vehicle-transport", "index.html"],
  ["Florida state owner", "logistics", "florida-vehicle-transport", "index.html"],
  ["California state owner", "logistics", "california-vehicle-transport", "index.html"],
];

for (const [label, ...segments] of guardedResearchRoutes) {
  try {
    await access(join(root, "dist", ...segments));
    errors.push(`${label} is research-only but a built public route exists; move the candidate through approved_for_build before publication`);
  } catch {
    // Expected while the candidate remains research-only.
  }
}

if (errors.length) {
  throw new Error(`Four-direction SEO market registry failed with ${errors.length} error(s):\n${errors.map((item) => `- ${item}`).join("\n")}`);
}

console.log("Four-direction SEO market registry passed: research candidates cannot silently become publishable combinatoric pages, and held Texas/Florida/California routes remain absent.");
