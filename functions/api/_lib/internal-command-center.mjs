import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso } from "./internal-ai.mjs";
import { seedHistoricalCommandCenterBacklog } from "./command-center-history-backlog.mjs";
import { seedFourMonthRevenueBacklog } from "./command-center-four-month-revenue-backlog.mjs";
import { pluginRuntimeRegistrySnapshot } from "../../../workers/automation-engine/src/plugin-runtime-registry.mjs";
import { ensureOnce, schemaReady } from "./request-cost-guard.mjs";

// Per-isolate bootstrap. The schema bootstrap also runs the canonical backlog
// seeders (history + four-month revenue), so calling it on every request cost
// roughly 190 statements per call and exhausted the Workers CPU limit: every
// private Command Center route answered Cloudflare 1102 while the public site
// stayed healthy (production incident, 2026-11-06).
export function ensureCommandCenterSchemaOnce(db, options = {}) {
  return ensureOnce(db, "command-center-schema", () => ensureCommandCenterSchema(db), options);
}

export const COMMAND_CENTER_SCOPE = INTERNAL_AI_ORGANIZATION_SCOPE;
const WORKSTREAMS = new Set(["marketing","logistics","sales","technology","academy","finance","operations"]);
const PRIORITIES = new Set(["p0","p1","p2","p3"]);
const WORK_ITEM_STATES = new Set(["planned","ready","in_progress","blocked","done","cancelled"]);
const SOURCES = new Set(["text","voice","imported"]);
const MAX_TITLE = 160;
const MAX_DETAILS = 10000;

const OWNER_WORK_ITEM_COLUMNS = Object.freeze([
    ["acceptance_status","TEXT NOT NULL DEFAULT 'not_required' CHECK (acceptance_status IN ('not_required','awaiting','accepted'))"],
    ["accepted_by","TEXT"],
    ["accepted_at","TEXT"],
    ["project_id","TEXT"],
    ["plugin_route_json","TEXT"],
    ["hae_job_id","TEXT"],
    ["hae_plan_job_id","TEXT"],
    ["hae_execution_job_id","TEXT"],
    ["hae_dispatch_state","TEXT"],
    ["hae_dispatch_result_json","TEXT"],
    ["source_kind","TEXT"],
    ["source_label","TEXT"],
    ["source_ref","TEXT"],
    ["next_action","TEXT"],
    ["revenue_gate_usd","REAL"],
    ["revenue_target_usd","REAL"],
    ["revenue_actual_usd","REAL"],
    ["revenue_rank","INTEGER"],
    ["revenue_status","TEXT"],
    ["revenue_source_work_id","TEXT"],
    ["revenue_evidence_ref","TEXT"],
    ["revenue_recorded_at","TEXT"],
]);
const COMMAND_CENTER_SCHEMA_TABLES = Object.freeze([
  "hermes_owner_work_items",
  "hermes_internal_owner_access_audit",
]);
const COMMAND_CENTER_SCHEMA_INDEXES = Object.freeze([
  "idx_owner_work_items_scope_state_priority",
  "idx_owner_work_items_scope_project",
  "idx_owner_work_items_revenue_queue",
]);

export async function ensureCommandCenterSchema(db) {
  // DDL takes the write lock of the shared database that the HAE cron writes
  // every five minutes. Verify the schema with reads first, so a cold isolate
  // does not serialise against the cron on every request.
  if (await schemaReady(db, {
    tables: COMMAND_CENTER_SCHEMA_TABLES,
    indexes: COMMAND_CENTER_SCHEMA_INDEXES,
    tableColumns: { hermes_owner_work_items: OWNER_WORK_ITEM_COLUMNS.map(([name]) => name) },
  })) {
    await seedHistoricalCommandCenterBacklog(db);
    await seedFourMonthRevenueBacklog(db);
    return;
  }
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
    hae_job_id TEXT,
    hae_plan_job_id TEXT,
    hae_execution_job_id TEXT,
    hae_dispatch_state TEXT,
    hae_dispatch_result_json TEXT,
    completed_at TEXT,
    acceptance_status TEXT NOT NULL DEFAULT 'not_required' CHECK (acceptance_status IN ('not_required','awaiting','accepted')),
    accepted_by TEXT,
    accepted_at TEXT,
    blocked_reason TEXT,
    source_kind TEXT,
    source_label TEXT,
    source_ref TEXT,
    next_action TEXT,
    revenue_gate_usd REAL,
    revenue_target_usd REAL,
    revenue_actual_usd REAL,
    revenue_rank INTEGER,
    revenue_status TEXT,
    revenue_source_work_id TEXT,
    revenue_evidence_ref TEXT,
    revenue_recorded_at TEXT
  )`).run();
  const columns=await db.prepare("PRAGMA table_info(hermes_owner_work_items)").all();
  const names=new Set((columns?.results||[]).map((column)=>String(column.name)));
  for(const [name,definition] of OWNER_WORK_ITEM_COLUMNS) if(!names.has(name)) {
    try { await db.prepare(`ALTER TABLE hermes_owner_work_items ADD COLUMN ${name} ${definition}`).run(); }
    catch(error) {
      const current=await db.prepare("PRAGMA table_info(hermes_owner_work_items)").all();
      if(!(current?.results||[]).some((column)=>String(column.name)===name)) throw error;
    }
  }
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_owner_work_items_scope_state_priority ON hermes_owner_work_items(organization_scope,status,priority,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_owner_work_items_scope_project ON hermes_owner_work_items(organization_scope,project_id)").run();
  await seedHistoricalCommandCenterBacklog(db);
  await seedFourMonthRevenueBacklog(db);
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_owner_work_items_revenue_queue ON hermes_owner_work_items(organization_scope,revenue_status,revenue_rank)").run();
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
    id:String(row.id), workstream:String(row.workstream), priority:String(row.priority), title:String(row.title), details:String(row.details), project_id:row.project_id||null, plugin_route:readWorkItemPluginRoute(row), hae_job_id:row.hae_job_id||null,
    hae_plan_job_id:row.hae_plan_job_id||null, hae_execution_job_id:row.hae_execution_job_id||null,
    hae_dispatch_state:row.hae_dispatch_state||null, hae_dispatch_result:row.hae_dispatch_result_json?JSON.parse(String(row.hae_dispatch_result_json)):null,
    source:String(row.source||"text"), status, acceptance_status:String(row.acceptance_status||"not_required"), created_at:row.created_at||null, updated_at:row.updated_at||null,
    linked_task_id:row.linked_task_id||null, completed_at:row.completed_at||null,
    accepted_by:row.accepted_by||null, accepted_at:row.accepted_at||null, blocked_reason:row.blocked_reason||null,
    source_kind:row.source_kind||null, source_label:row.source_label||null, source_ref:row.source_ref||null, next_action:row.next_action||null,
    revenue_gate_usd:row.revenue_gate_usd==null?null:Number(row.revenue_gate_usd),
    revenue_target_usd:row.revenue_target_usd==null?null:Number(row.revenue_target_usd),
    revenue_actual_usd:row.revenue_actual_usd==null?null:Number(row.revenue_actual_usd),
    revenue_rank:row.revenue_rank==null?null:Number(row.revenue_rank),
    revenue_status:row.revenue_status||null, revenue_source_work_id:row.revenue_source_work_id||null,
    revenue_evidence_ref:row.revenue_evidence_ref||null, revenue_recorded_at:row.revenue_recorded_at||null,
    financial_done:row.revenue_gate_usd==null?null:Number(row.revenue_actual_usd||0)>=Number(row.revenue_gate_usd||1),
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
// Writes stay off the hot read path without changing the contract: reconcile first
// probes whether any row actually needs a transition, and only then writes. The
// previous unconditional UPDATE pair ran on every request and contributed to the
// 1102 private-surface incident on 2026-11-06.
export async function reconcileWorkItems(db) {
  const now=nowIso();
  const awaiting=await db.prepare(`SELECT 1 AS hit FROM hermes_owner_work_items
    WHERE organization_scope = 'hermes_internal' AND status = 'in_progress' AND acceptance_status != 'awaiting' AND linked_task_id IN (
      SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope = 'hermes_internal' AND status = 'completed'
    ) LIMIT 1`).first();
  if(awaiting) await db.prepare(`UPDATE hermes_owner_work_items
    SET acceptance_status = 'awaiting', completed_at = NULL, accepted_by = NULL, accepted_at = NULL, updated_at = ?
    WHERE organization_scope = 'hermes_internal' AND status = 'in_progress' AND acceptance_status != 'awaiting' AND linked_task_id IN (
      SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope = 'hermes_internal' AND status = 'completed'
    )`).bind(now).run();
  const failed=await db.prepare(`SELECT 1 AS hit FROM hermes_owner_work_items
    WHERE organization_scope = 'hermes_internal' AND status = 'in_progress' AND linked_task_id IN (
      SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope = 'hermes_internal' AND status IN ('failed','cancelled')
    ) LIMIT 1`).first();
  if(failed) await db.prepare(`UPDATE hermes_owner_work_items
    SET status = 'blocked', blocked_reason = COALESCE(blocked_reason, 'Linked AI task ended without completion; review evidence.'), updated_at = ?
    WHERE organization_scope = 'hermes_internal' AND status = 'in_progress' AND linked_task_id IN (
      SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope = 'hermes_internal' AND status IN ('failed','cancelled')
    )`).bind(now).run();
}
