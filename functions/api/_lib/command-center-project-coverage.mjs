export const PROJECT_COVERAGE_SNAPSHOT_ID = "command-center-project-coverage-2026-11-01";

const snapshot = Object.freeze({
  schema_version: 1,
  snapshot_id: PROJECT_COVERAGE_SNAPSHOT_ID,
  coverage_status: "PARTIAL",
  coverage_reason: "Current canonical sources are identified and sampled, but production Command Center has no safe live Drive connector and active WORK_ID counts are not yet independently accepted per family.",
  source_method: "REVIEWED_STATIC_SNAPSHOT_FROM_CURRENT_ONE_BRAIN",
  ledger_row_count_observed: 116,
  sources: Object.freeze([
    Object.freeze({source_class:"ONE_BRAIN_CONTROL_LOOP",title:"ONE BRAIN CONTROL LOOP — DEPARTMENT + AI REPORTING PROTOCOL — 2026-09-02",drive_id:"1-F1QU6EKQEdoK0jQucIEabqJ_PUsVIQ5zWiws-BgAQc",observed_at:"2026-11-01T18:54:50.937Z",authority:"CURRENT"}),
    Object.freeze({source_class:"AI_MASTER_OPERATING_BOARD",title:"AI MASTER OPERATING BOARD — HERMES — CANONICAL — CURRENT",drive_id:"1zblFM0EGsWqetFxTtDcKq0UFI-Pu8rdUgwrk5Kx-pIg",observed_at:"2026-10-25T12:28:23.954Z",authority:"CURRENT"}),
    Object.freeze({source_class:"EXECUTION_IDEAS_LEDGER",title:"HERMES EXECUTION & IDEAS LEDGER — CANONICAL — CURRENT",drive_id:"1Ya2fgHZVISV3XHd_w9JHSJBrizCy-LeKczD9H_qJErc",observed_at:"2026-11-01T19:07:03.830Z",authority:"CURRENT"}),
  ]),
  families: Object.freeze([
    ["website-web","Hermes Website / WEB","technology",["W-20261023-005","W-20261018-017","W-20261018-018","W-20261026-109"],"NO"],
    ["search-seo-geo","Search / SEO / GEO / AI Visibility","marketing",["W-20261019-015","W-20261027-110"],"SOURCE_POLICY_REQUIRED"],
    ["sales-carrier-acquisition","Sales / Carrier acquisition","sales",["W-20261020-010","W-20261028-116","W-20261026-109"],"NO"],
    ["hr-recruiting","HR / Recruiting","operations",["W-20261028-114","W-20261014-026","W-20260423-084"],"NO"],
    ["hermes-connect","Hermes Connect","technology",["W-20261012-032","W-20261011-034","W-20261011-033"],"MEMBERSHIP_SCOPED_ONLY"],
    ["catalog","Hermes Catalog","operations",["W-20261025-108","W-20260927-055"],"MEMBERSHIP_SCOPED_ONLY"],
    ["load-board-network","Load Board / Dealer-Shipper-Load Network","logistics",["W-20261012-028","W-20261012-029","W-20261024-091","W-20261024-092","W-20261024-096"],"SOURCE_POLICY_REQUIRED"],
    ["cloudflare-release","Cloudflare / release infrastructure","technology",["W-20261004-050"],"NO"],
    ["social-distribution","Social / Threads / Meta distribution","marketing",["W-20261004-047","W-20261015-024","W-20260228-087","W-20261002-052"],"NO"],
    ["telegram-messaging","Telegram / messaging integrations","marketing",["W-20260919-056","W-20260918-059"],"NO"],
    ["academy","Academy","academy",["W-20261025-107","W-20261011-035","W-20260918-058"],"MEMBERSHIP_SCOPED_ONLY"],
    ["progressopro-marketing","ProgressoPro / Marketing growth","marketing",["W-20261004-047","W-20261015-024","W-20261005-045","W-20261001-053"],"NO"],
    ["completion-governance","Completion / execution governance","operations",["W-20261023-001","W-20261021-008","W-20261024-106"],"NO"],
    ["finance-investor","Finance / Investor","finance",["W-20261024-103","W-20261028-112","W-20261012-030","W-20261024-104"],"NO"],
    ["hae-command-center","HAE / Command Center / Hermes AI","technology",["W-20261021-008","W-20261023-001"],"NO"],
  ].map(([id,label,department,representative_work_ids,client_exposure])=>Object.freeze({
    id,label,department,
    source_state:"CURRENT_SOURCE_IDENTIFIED",
    representative_work_ids:Object.freeze(representative_work_ids),
    representative_work_id_count:representative_work_ids.length,
    active_work_id_count:null,
    count_state:"UNKNOWN_NOT_EXHAUSTIVELY_MAPPED",
    client_exposure,
  }))),
  rules: Object.freeze({
    historical_chat_name_is_current_project:false,
    old_master_task_registry_is_current_authority:false,
    infer_progress_from_issue_or_message_count:false,
    infer_eta_without_duration_evidence:false,
    infer_business_result_from_ci:false,
    active_work_id_count_is_complete:false,
  }),
});

export function commandCenterProjectCoverageSnapshot(){
  return snapshot;
}
