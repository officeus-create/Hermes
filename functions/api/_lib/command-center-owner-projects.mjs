// Owner-created projects extend the ONE Hermes Command Center D1; canonical snapshot projects stay immutable.
export const OWNER_PROJECT_SCOPE = "hermes_internal";
const DEPARTMENTS = new Set(["marketing","logistics","sales","technology","academy","finance","operations"]);
const STATES = new Set(["planned","in_progress","blocked","done"]);

export async function ensureOwnerProjectSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_owner_projects (
    id TEXT PRIMARY KEY,
    organization_scope TEXT NOT NULL CHECK(organization_scope = 'hermes_internal'),
    title TEXT NOT NULL,
    department TEXT NOT NULL CHECK(department IN ('marketing','logistics','sales','technology','academy','finance','operations')),
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','in_progress','blocked','done')),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hermes_owner_projects_scope_updated ON hermes_owner_projects(organization_scope,updated_at)").run();
}

export function normalizeOwnerProjectFields(value) {
  const title=typeof value?.title==="string"?value.title.replace(/\u0000/g,"").replace(/\s+/g," ").trim():"";
  const purpose=typeof value?.purpose==="string"?value.purpose.replace(/\u0000/g,"").trim():"";
  const department=typeof value?.department==="string"?value.department.toLowerCase().trim():"";
  if(!title||title.length>160||!purpose||purpose.length>2000||!DEPARTMENTS.has(department))return null;
  return {title,purpose,department};
}

export function normalizeOwnerProjectStatus(value) {
  const status=typeof value==="string"?value.trim().toLowerCase():"";
  return STATES.has(status)?status:null;
}

export function publicOwnerProject(row) {
  return {
    id:String(row.id),title:String(row.title),department:String(row.department),purpose:String(row.purpose),
    status:String(row.status),owner_role:"Hermes owner",agent_role:"Not assigned",plugin_roles:[],
    parent_id:null,dependency_ids:[],related_ids:[],started_at:row.created_at||null,target_at:null,
    blockers:[],evidence_level:"OWNER_MANAGED_UNVERIFIED",links:[],milestones:[],
    progress:{completed:0,total:0,percent:null},eta:null,eta_label:"UNKNOWN",
    eta_basis:"Owner-maintained project. No independently accepted milestones or duration evidence.",
    editable:true,created_at:row.created_at||null,updated_at:row.updated_at||null
  };
}
