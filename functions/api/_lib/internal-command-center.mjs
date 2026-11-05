import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso } from "./internal-ai.mjs";
import { pluginRuntimeRegistrySnapshot } from "../../../workers/automation-engine/src/plugin-runtime-registry.mjs";

export const COMMAND_CENTER_SCOPE = INTERNAL_AI_ORGANIZATION_SCOPE;
const WORKSTREAMS = new Set(["marketing","logistics","sales","technology","academy","finance","operations"]);
const PRIORITIES = new Set(["p0","p1","p2","p3"]);
const WORK_ITEM_STATES = new Set(["planned","ready","in_progress","blocked","done","cancelled"]);
const SOURCES = new Set(["text","voice","imported"]);
const MAX_TITLE = 160;
const MAX_DETAILS = 10000;

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
    project_id TEXT,
    plugin_route_json TEXT,
    completed_at TEXT,
    acceptance_status TEXT NOT NULL DEFAULT 'not_required' CHECK (acceptance_status IN ('not_required','awaiting','accepted')),
    accepted_by TEXT,
    accepted_at TEXT,
    blocked_reason TEXT
  )`).run();
  const columns=await db.prepare("PRAGMA table_info(hermes_owner_work_items)").all();
  const names=new Set((columns?.results||[]).map((column)=>String(column.name)));
  for(const [name,definition] of [
    ["acceptance_status","TEXT NOT NULL DEFAULT 'not_required' CHECK (acceptance_status IN ('not_required','awaiting','accepted'))"],
    ["accepted_by","TEXT"],
    ["accepted_at","TEXT"],
    ["project_id","TEXT"],
    ["plugin_route_json","TEXT"],
  ]) if(!names.has(name)) {
    try { await db.prepare(`ALTER TABLE hermes_owner_work_items ADD COLUMN ${name} ${definition}`).run(); }
    catch(error) {
      const current=await db.prepare("PRAGMA table_info(hermes_owner_work_items)").all();
      if(!(current?.results||[]).some((column)=>String(column.name)===name)) throw error;
    }
  }
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_owner_work_items_scope_state_priority ON hermes_owner_work_items(organization_scope,status,priority,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_owner_work_items_scope_project ON hermes_owner_work_items(organization_scope,project_id)").run();
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
// Selection is evidence of routing policy, never of plugin execution.
const ROUTE_POLICY_VERSION = "command-center-route-v1";
const ROUTE_OWNERS = Object.freeze({ marketing:"hermes-marketing-growth", logistics:"hermes-dispatch-os", sales:"hermes-agent-coordinator", technology:"hermes-technology-developer", academy:"hermes-academy", finance:"hermes-agent-coordinator", operations:"hermes-automatic-engineer" });
export function selectWorkItemPluginRoute(item){
  const registry=pluginRuntimeRegistrySnapshot();
  const versions=new Map(registry.entries.map(entry=>[entry.role_id,entry.plugin_version]));
  const workstream=normalizeWorkstream(item?.workstream);
  if(!workstream) throw new Error("invalid_workstream_plugin_route");
  const context=String(item.title||"")+" "+String(item.details||"");
  const searchIntent=workstream==="marketing"&&/\b(seo|geo|aeo|llmo|indexation|canonical|bing|indexing)\b/i.test(context);
  const connectIntent=workstream==="technology"&&/\b(command center|hermes connect|crm|admin|workspace|catalog|client|customer)\b/i.test(context);
  const ownerId=searchIntent?"hermes-search-growth":ROUTE_OWNERS[workstream];
  const role=id=>{const version=versions.get(id);if(!version)throw new Error("plugin_route_release_unverified");return {role_id:id,plugin_version:version}};
  const helperIds=["hermes-agent-coordinator",...(connectIntent?["hermes-connect-operator"]:[]),"hermes-qa-evidence-auditor"];
  return {policy_version:ROUTE_POLICY_VERSION,state:"PLUGIN_SELECTED_NOT_EXECUTED",source_class:registry.source_class,registry_observed_at:registry.observed_at,basis:searchIntent?"marketing_search_intent":connectIntent?"technology_connect_intent":"workstream:"+workstream,owner:role(ownerId),helpers:helperIds.filter((id,index)=>id!==ownerId&&helperIds.indexOf(id)===index).map(role)};
}
export function readWorkItemPluginRoute(row){
  try {const value=JSON.parse(String(row?.plugin_route_json||"null"));return value?.policy_version===ROUTE_POLICY_VERSION&&value?.owner?.role_id&&value?.state==="PLUGIN_SELECTED_NOT_EXECUTED"?value:null}
  catch {return null}
}
export function publicWorkItem(row){
  if(!row)return null;
  const status=String(row.status)==="in_progress"&&String(row.acceptance_status)==="awaiting"?"awaiting_acceptance":String(row.status);
  return {
    id:String(row.id), workstream:String(row.workstream), priority:String(row.priority), title:String(row.title), details:String(row.details), project_id:row.project_id||null, plugin_route:readWorkItemPluginRoute(row),
    source:String(row.source||"text"), status, acceptance_status:String(row.acceptance_status||"not_required"), created_at:row.created_at||null, updated_at:row.updated_at||null,
    linked_task_id:row.linked_task_id||null, completed_at:row.completed_at||null,
    accepted_by:row.accepted_by||null, accepted_at:row.accepted_at||null, blocked_reason:row.blocked_reason||null,
    linked_task_status:row.linked_task_status||null, linked_task_started_at:row.linked_task_started_at||null,
    linked_task_completed_at:row.linked_task_completed_at||null, linked_task_updated_at:row.linked_task_updated_at||null,
    linked_task_pr_url:row.linked_task_pr_url||null, linked_task_output_summary:row.linked_task_output_summary||null,
  };
}
export function workItemPrompt(item){
  const route=readWorkItemPluginRoute(item)||selectWorkItemPluginRoute(item);
  return [
    "HERMES OWNER WORK ITEM",
    `Work item: ${item.id}`,
    `Direction: ${item.workstream}`,
    `Priority: ${item.priority}`,
    ...(item.project_id ? [`Project ID: ${item.project_id}`] : []),
    `Title: ${item.title}`,
    "Plugin route policy: "+route.policy_version,
    "Selected owner capability: "+route.owner.role_id+"@"+route.owner.plugin_version,
    "Eligible helpers: "+route.helpers.map(x=>x.role_id+"@"+x.plugin_version).join(", "),
    "Route basis: "+route.basis,
    "PLUGIN_SELECTED_NOT_EXECUTED — do not claim this capability was executed without a separate HAE provider receipt.",
    "", item.details, "",
    "Execution rules:",
    "- Reuse current Hermes architecture and canonical sources of truth; do not create a second CRM, scheduler, brain, or data owner.",
    "- Preserve existing approval gates. External communications, merge/deploy, credentials, billing, legal/commercial commitments, and destructive changes require the existing owner approval flow.",
    "- Return inspectable evidence and keep the work item/task linkage intact.",
  ].join("\n");
}
export const commandCenterNow=nowIso;
export async function reconcileWorkItems(db) {
  const now=nowIso();
  await db.prepare(`UPDATE hermes_owner_work_items
    SET acceptance_status = 'awaiting', completed_at = NULL, accepted_by = NULL, accepted_at = NULL, updated_at = ?
    WHERE organization_scope = 'hermes_internal' AND status = 'in_progress' AND acceptance_status != 'awaiting' AND linked_task_id IN (
      SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope = 'hermes_internal' AND status = 'completed'
    )`).bind(now).run();
  await db.prepare(`UPDATE hermes_owner_work_items
    SET status = 'blocked', blocked_reason = COALESCE(blocked_reason, 'Linked AI task ended without completion; review evidence.'), updated_at = ?
    WHERE organization_scope = 'hermes_internal' AND status = 'in_progress' AND linked_task_id IN (
      SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope = 'hermes_internal' AND status IN ('failed','cancelled')
    )`).bind(now).run();
}
