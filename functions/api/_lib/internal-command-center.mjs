import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso } from "./internal-ai.mjs";

export const COMMAND_CENTER_SCOPE = INTERNAL_AI_ORGANIZATION_SCOPE;
const WORKSTREAMS = new Set(["marketing","logistics","sales","technology","academy","finance","operations"]);
const PRIORITIES = new Set(["p0","p1","p2","p3"]);
const WORK_ITEM_STATES = new Set(["planned","ready","in_progress","blocked","done","cancelled"]);
const SOURCES = new Set(["text","voice","imported"]);
const MAX_TITLE = 160;
const MAX_DETAILS = 12000;

export async function ensureCommandCenterSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_owner_work_items (
    id TEXT PRIMARY KEY,
    organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
    workstream TEXT NOT NULL CHECK (workstream IN ('marketing','logistics','sales','technology','academy','finance','operations')),
    priority TEXT NOT NULL DEFAULT 'p2' CHECK (priority IN ('p0','p1','p2','p3')),
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'text' CHECK (source IN ('text','voice','imported')),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','ready','in_progress','blocked','done','cancelled')),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    linked_task_id TEXT,
    completed_at TEXT,
    blocked_reason TEXT
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_owner_work_items_scope_state_priority ON hermes_owner_work_items(organization_scope,status,priority,created_at)").run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_owner_access_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
    actor_specialist_id TEXT NOT NULL,
    target_specialist_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('grant','revoke')),
    created_at TEXT NOT NULL
  )`).run();
}

export function normalizeWorkstream(value) { const v=String(value||"").trim().toLowerCase(); return WORKSTREAMS.has(v)?v:null; }
export function normalizePriority(value) { const v=String(value||"").trim().toLowerCase(); return PRIORITIES.has(v)?v:null; }
export function normalizeWorkItemState(value) { const v=String(value||"").trim().toLowerCase(); return WORK_ITEM_STATES.has(v)?v:null; }
export function normalizeWorkItemSource(value) { const v=String(value||"").trim().toLowerCase(); return SOURCES.has(v)?v:"text"; }
export function normalizeWorkItemTitle(value) { const v=String(value||"").replace(/\u0000/g,"").replace(/\s+/g," ").trim(); return v && v.length<=MAX_TITLE?v:null; }
export function normalizeWorkItemDetails(value) { const v=String(value||"").replace(/\u0000/g,"").trim(); return v && v.length<=MAX_DETAILS?v:null; }
export function newWorkItemId(){ return `hcwi_${crypto.randomUUID()}`; }
export function publicWorkItem(row){
  if(!row)return null;
  return {
    id:String(row.id), workstream:String(row.workstream), priority:String(row.priority), title:String(row.title), details:String(row.details),
    source:String(row.source||"text"), status:String(row.status), created_at:row.created_at||null, updated_at:row.updated_at||null,
    linked_task_id:row.linked_task_id||null, completed_at:row.completed_at||null, blocked_reason:row.blocked_reason||null,
    linked_task_status:row.linked_task_status||null, linked_task_updated_at:row.linked_task_updated_at||null,
    linked_task_pr_url:row.linked_task_pr_url||null, linked_task_output_summary:row.linked_task_output_summary||null,
  };
}
export function workItemPrompt(item){
  return [
    "HERMES OWNER WORK ITEM",
    `Work item: ${item.id}`,
    `Direction: ${item.workstream}`,
    `Priority: ${item.priority}`,
    `Title: ${item.title}`,
    "", item.details, "",
    "Execution rules:",
    "- Reuse current Hermes architecture and canonical sources of truth; do not create a second CRM, scheduler, brain, or data owner.",
    "- Preserve existing approval gates. External communications, merge/deploy, credentials, billing, legal/commercial commitments, and destructive changes require the existing owner approval flow.",
    "- Return inspectable evidence and keep the work item/task linkage intact.",
  ].join("\n");
}
export const commandCenterNow=nowIso;