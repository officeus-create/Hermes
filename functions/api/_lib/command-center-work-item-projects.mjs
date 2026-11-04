// Only Hermes owner projects and the immutable Command Center registry may own a work item.
// Older rows remain unassigned (NULL); never infer a project from a workstream.
import { commandCenterProjectPortfolio } from "./command-center-projects.mjs";
import { ensureOwnerProjectSchema, OWNER_PROJECT_SCOPE } from "./command-center-owner-projects.mjs";

const canonicalIds = new Set(commandCenterProjectPortfolio().map(project=>project.id));
export function normalizeWorkItemProjectId(value) {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const id = value.trim();
  return id && id.length <= 160 && /^[a-zA-Z0-9_-]+$/.test(id) ? id : undefined;
}

export async function validWorkItemProject(db, value) {
  const projectId = normalizeWorkItemProjectId(value);
  if (projectId === undefined) return false;
  if (!projectId || canonicalIds.has(projectId)) return true;
  if (!/^hcpr_[0-9a-f-]{36}$/i.test(projectId)) return false;
  await ensureOwnerProjectSchema(db);
  const ownerProject = await db.prepare("SELECT id FROM hermes_owner_projects WHERE id=? AND organization_scope=? LIMIT 1")
    .bind(projectId, OWNER_PROJECT_SCOPE).first();
  return Boolean(ownerProject);
}
