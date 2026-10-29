import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { commandCenterProjectPortfolio, validateCommandCenterProjects } from "../_lib/command-center-projects.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  const projects = commandCenterProjectPortfolio();
  const errors = validateCommandCenterProjects(projects);
  if (errors.length) return jsonResponse(503, { success: false, error: "project_registry_invalid" }, headers);
  return jsonResponse(200, {
    success: true,
    registry_owner: "hermes-business-command-center",
    source_class: "BOUNDED_CANONICAL_SNAPSHOT",
    checked_at: "2026-10-28T15:30:00+02:00",
    progress_method: "completed milestones divided by total declared milestones",
    eta_policy: "ETA is UNKNOWN until deterministic or historical duration evidence exists.",
    projects,
  }, headers);
}

