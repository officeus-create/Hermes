import {
  COMMAND_CENTER_REVENUE_4M_BACKLOG,
  COMMAND_CENTER_REVENUE_4M_SOURCE,
} from "./command-center-revenue-backlog.generated.mjs";

const clean=(value,max=10000)=>String(value??"").replace(/\u0000/g,"").trim().slice(0,max);
const IMPORT_KEY="revenue_4m_backlog_2026-11-06_v1";

export async function seedRevenue4mBacklog(db){
  if(!db?.prepare)return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_command_center_imports (
    import_key TEXT PRIMARY KEY,
    imported_at TEXT NOT NULL
  )`).run();
  const already=await db.prepare("SELECT import_key FROM hermes_command_center_imports WHERE import_key=? LIMIT 1").bind(IMPORT_KEY).first();
  if(already)return;
  for(const item of COMMAND_CENTER_REVENUE_4M_BACKLOG){
    const acceptance=item.financial_done?"accepted":"not_required";
    const completed=item.financial_done?item.created_at:null;
    const blockedReason=item.status==="blocked"
      ? "Financial outcome is incomplete and this mission currently has an owner/provider/external gate."
      : null;
    await db.prepare(`INSERT OR IGNORE INTO hermes_owner_work_items
      (id,organization_scope,workstream,priority,title,details,source,status,created_by,created_at,updated_at,project_id,
       completed_at,acceptance_status,blocked_reason,source_kind,source_label,source_ref,next_action,
       revenue_gate_usd,actual_revenue_usd,financial_done,estimated_first_win_usd,revenue_rank,revenue_selected_now,
       monetization_lane,monetization_path,system_can_start,hae_ready,source_work_id)
      VALUES (?,'hermes_internal',?,?,?,?,'imported',?,'revenue_4m_import',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(
        item.id,item.workstream,item.priority,clean(item.title,160),
        clean([
          item.business,
          item.department,
          item.monetization_path,
          item.notes,
        ].filter(Boolean).join(" | ")),
        item.status,item.created_at,item.created_at,"revenue-4m",
        completed,acceptance,blockedReason,
        "google_sheet",clean("REVENUE_4M_BACKLOG · "+item.business,240),
        clean(COMMAND_CENTER_REVENUE_4M_SOURCE.spreadsheet_id+"#REVENUE_4M_BACKLOG",1000),
        clean(item.next_revenue_action,2000),
        item.revenue_gate_usd,item.actual_revenue_usd,item.financial_done?1:0,item.est_first_win_usd,
        item.rank,item.selected_now?1:0,clean(item.monetization_lane,240),clean(item.monetization_path,2000),
        clean(item.system_can_start,80),clean(item.hae_ready,40),clean(item.source_work_id,160)
      ).run();
  }
  await db.prepare("INSERT OR IGNORE INTO hermes_command_center_imports (import_key,imported_at) VALUES (?,?)")
    .bind(IMPORT_KEY,"2026-11-06T00:00:00.000Z").run();
}

export function revenueFinancialDone(row){
  const gate=Math.max(1,Number(row?.revenue_gate_usd||1));
  const actual=Math.max(0,Number(row?.actual_revenue_usd||0));
  return actual>=gate && actual>=1;
}
