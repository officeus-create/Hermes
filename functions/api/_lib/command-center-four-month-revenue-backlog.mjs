// Four-month revenue reconciliation overlay for Command Center.
// Canonical planning source: One Brain REVENUE_4M_BACKLOG.
// Includes canonical ledger WORK_IDs plus distinct chat/project revenue missions recovered during the four-month reconciliation.
// Same D1 owner-work queue; no second runtime/task registry.
// Revenue rule: 100% only after verified financial benefit >= $1.
// Superseded source WORK_IDs remain audit-only and can never enter the revenue execution sequence.

export const FOUR_MONTH_REVENUE_BACKLOG = Object.freeze([
  {
    id:"hcwi_rev4m_w_20261026_109", project_id:"revenue-website-progresso", workstream:"sales", priority:"p0",
    title:"[REVENUE] Website Pricing & Sales System — current package line", details:"Revenue reconciliation overlay for W-20261026-109. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 1; source work reference W-20261026-109.",
    status:"ready", created_at:"2026-10-26T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261026-109",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:1,
    revenue_status:"active", revenue_source_work_id:"W-20261026-109",
    
    next_action:"Use the current approved Website Pricing & Sales System to produce one genuine human-qualified quote and drive it to a paid $990 Launch sale; record actual payment/revenue receipt. Do not mark 100% for code/CI/deploy/quote alone."
  },
  {
    id:"hcwi_rev4m_w_20261020_014", project_id:"revenue-logistics", workstream:"logistics", priority:"p1",
    title:"[REVENUE] New-authority Car Hauling carrier discovery 1–30 days", details:"Revenue reconciliation overlay for W-20261020-014. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 2; source work reference W-20261020-014.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261020-014",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:2,
    revenue_status:"queued", revenue_source_work_id:"W-20261020-014",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"After positive verification yield, formalize a reusable verification packet with source timestamps/conflict handling, then promote only deterministic discovery/dedupe to Automation Engineer; outbound remains separately authorized."
  },
  {
    id:"hcwi_rev4m_w_20261028_112", project_id:"revenue-logistics", workstream:"finance", priority:"p1",
    title:"[REVENUE] Pre-credit customer / broker gate before load sale or operational commitment", details:"Revenue reconciliation overlay for W-20261028-112. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 3; source work reference W-20261028-112.",
    status:"blocked", created_at:"2026-10-28T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261028-112",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:3,
    revenue_status:"queued", revenue_source_work_id:"W-20261028-112",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Finance owns credit evidence; Sales/Dispatch cannot promote opportunity to committed/booked when credit=UNKNOWN/FAIL without explicit authorized override. Reuse existing CRM/HAE fields where possible; no new credit vendor purchase without approval."
  },
  {
    id:"hcwi_rev4m_w_20261028_113", project_id:"revenue-logistics", workstream:"finance", priority:"p1",
    title:"[REVENUE] POD/BOL settlement gate and missing-document recovery", details:"Revenue reconciliation overlay for W-20261028-113. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 4; source work reference W-20261028-113.",
    status:"blocked", created_at:"2026-10-28T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261028-113",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:4,
    revenue_status:"queued", revenue_source_work_id:"W-20261028-113",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Dispatch OS owns document lifecycle; Finance owns settlement evidence; HAE may later alert on missing docs but never fabricate/alter POD/BOL or mark cash settled."
  },
  {
    id:"hcwi_rev4m_w_20261028_116", project_id:"revenue-logistics", workstream:"academy", priority:"p1",
    title:"[REVENUE] Enterprise Shipper Procurement & Setup Readiness", details:"Revenue reconciliation overlay for W-20261028-116. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 5; source work reference W-20261028-116.",
    status:"blocked", created_at:"2026-10-28T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261028-116",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:5,
    revenue_status:"queued", revenue_source_work_id:"W-20261028-116",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Sales owns current buyer qualification; Dispatch owns load execution; Finance owns credit/payment; Academy may teach the workflow; HAE later automates deterministic checklist/status transitions only. Do not claim Maersk/FST/Outterra/Universal as Hermes clients."
  },
  {
    id:"hcwi_rev4m_w_20261102_119", project_id:"revenue-website-progresso", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Threads safe automation: provider monitor → draft/prep → owner gate → receipt", details:"Revenue reconciliation overlay for W-20261102-119. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 6; source work reference W-20261102-119.",
    status:"blocked", created_at:"2026-11-02T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261102-119",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:6,
    revenue_status:"queued", revenue_source_work_id:"W-20261102-119",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Command Center must distinguish INSTAGRAM_READ_LIVE from THREADS_DATA_PAUSED_PLAN_LIMIT. Preserve all current connections; no disconnect/upgrade. Publication/reply/DM remains separately gated."
  },
  {
    id:"hcwi_rev4m_w_20261103_122", project_id:"revenue-logistics", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Correct Hermes Logistics Clutch profile to legal/entity-safe public facts", details:"Revenue reconciliation overlay for W-20261103-122. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 7; source work reference W-20261103-122.",
    status:"blocked", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261103-122",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:7,
    revenue_status:"queued", revenue_source_work_id:"W-20261103-122",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Use the existing owner profile only. Apply the already-approved minimum correction packet in Clutch Vendor Dashboard, then perform public readback. If Clutch field constraints force a legal/regulatory wording change, route that wording through Compliance before save."
  },
  {
    id:"hcwi_rev4m_w_20261010_037", project_id:"revenue-logistics", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Prove Car Hauling lead delivery to Sales with protected-dispatcher routing", details:"Revenue reconciliation overlay for W-20261010-037. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 8; source work reference W-20261010-037.",
    status:"blocked", created_at:"2026-10-10T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261010-037",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:8,
    revenue_status:"queued", revenue_source_work_id:"W-20261010-037",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Sales owns customer-side qualification; Dispatch OS owns carrier/equipment intake. Synthetic QA and broker capacity offers remain excluded. No new customer funnel/code justified by a zero bounded mailbox result."
  },
  {
    id:"hcwi_rev4m_w_20261012_028", project_id:"revenue-logistics", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Complete realtime multi-mailbox Gmail -> Load Board runtime proof", details:"Revenue reconciliation overlay for W-20261012-028. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 9; source work reference W-20261012-028.",
    status:"blocked", created_at:"2026-10-12T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261012-028",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:9,
    revenue_status:"queued", revenue_source_work_id:"W-20261012-028",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Preserve existing parser; obtain sanitized true LOAD example and verify its authorized source→dedupe→expiry→D1→user readback. Never duplicate workspace PR."
  },
  {
    id:"hcwi_rev4m_w_20261012_029", project_id:"revenue-logistics", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Dispatch Truck 107 / CarrierBoardAccess real-role acceptance", details:"Revenue reconciliation overlay for W-20261012-029. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 10; source work reference W-20261012-029.",
    status:"blocked", created_at:"2026-10-12T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261012-029",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:10,
    revenue_status:"queued", revenue_source_work_id:"W-20261012-029",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Resolve only missing login/entitlements or per-employee attribution inside existing role flow; log separately any source rights and actual shipment business acceptance."
  },
  {
    id:"hcwi_rev4m_w_20261024_097", project_id:"revenue-repair-shop", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Public discovery layer with protected live transaction data", details:"Revenue reconciliation overlay for W-20261024-097. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $500. Monetization path: Convert one repair-shop/customer workflow into a paid $500 pilot; next expansion target is the known $900/mo base service. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 11; source work reference W-20261024-097.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-097",
    revenue_gate_usd:1, revenue_target_usd:500, revenue_actual_usd:0, revenue_rank:11,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-097",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Route exact code changes to Technology; measure qualified demand separately from page indexing/traffic before scaling public content."
  },
  {
    id:"hcwi_rev4m_w_20261024_099", project_id:"revenue-logistics", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Evidence-ranked shipper/dealer prospecting pilot", details:"Revenue reconciliation overlay for W-20261024-099. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 12; source work reference W-20261024-099.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-099",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:12,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-099",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Maintain 20-group ranked pool. Continue official/public transport-need validation asynchronously only via explicit future task; no outbound. Same-name prospect identity guard v0.1.18 is mandatory."
  },
  {
    id:"hcwi_rev4m_w_20261027_111", project_id:"revenue-logistics", workstream:"logistics", priority:"p1",
    title:"[REVENUE] Full historical learning pass for dispatchtruck3447 mailbox and owned operating corpus", details:"Revenue reconciliation overlay for W-20261027-111. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 13; source work reference W-20261027-111.",
    status:"blocked", created_at:"2026-10-27T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261027-111",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:13,
    revenue_status:"queued", revenue_source_work_id:"W-20261027-111",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Available corpus is complete enough to move to the next mailbox. Preserve HOLD_NATIVE_OAUTH_GAP; when OAuth arrives, run delta audit only. Native browser read has now been verified; next completeness upgrade is direct Gmail connector OAuth for archive delta comparison, not re-reading the already processed 509-message migrated corpus."
  },
  {
    id:"hcwi_rev4m_w_20260928_054", project_id:"revenue-website-progresso", workstream:"sales", priority:"p1",
    title:"[REVENUE] SDR → Senior AE/Closer single-problem diagnostic sales system", details:"Revenue reconciliation overlay for W-20260928-054. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 14; source work reference W-20260928-054.",
    status:"blocked", created_at:"2026-09-28T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260928-054",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:14,
    revenue_status:"queued", revenue_source_work_id:"W-20260928-054",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Coach current ProgressoPro reps with the new diagnostic-close rubric; route qualified handoffs to a Senior AE/Closer role and record real conversion evidence"
  },
  {
    id:"hcwi_rev4m_w_20261004_046", project_id:"revenue-repair-shop", workstream:"operations", priority:"p1",
    title:"[REVENUE] Repair Shops password-reset email Worker production proof", details:"Revenue reconciliation overlay for W-20261004-046. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $500. Monetization path: Convert one repair-shop/customer workflow into a paid $500 pilot; next expansion target is the known $900/mo base service. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 15; source work reference W-20261004-046.",
    status:"blocked", created_at:"2026-10-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261004-046",
    revenue_gate_usd:1, revenue_target_usd:500, revenue_actual_usd:0, revenue_rank:15,
    revenue_status:"queued", revenue_source_work_id:"W-20261004-046",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Do not build another Worker/mail stack. Activate only the existing opt-in account-mail transport with scoped OAuth/secrets, then capture production proof and keep commercial/lead email on the existing EMAIL binding."
  },
  {
    id:"hcwi_rev4m_w_20261005_045", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Organic-first client growth conveyor", details:"Revenue reconciliation overlay for W-20261005-045. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 16; source work reference W-20261005-045.",
    status:"blocked", created_at:"2026-10-05T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261005-045",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:16,
    revenue_status:"queued", revenue_source_work_id:"W-20261005-045",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Run one full cycle, document reusable inputs/outputs/stop rules; if repeatable positive signal emerges, produce HAE automation contract for deterministic collection/reporting steps"
  },
  {
    id:"hcwi_rev4m_w_20261025_108", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Catalog first genuine inquiry → owner claim → client outcome", details:"Revenue reconciliation overlay for W-20261025-108. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 17; source work reference W-20261025-108.",
    status:"blocked", created_at:"2026-10-25T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261025-108",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:17,
    revenue_status:"queued", revenue_source_work_id:"W-20261025-108",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"No synthetic 'real' event, duplicate Catalog/CRM/receiver/email worker/account. HAE may later classify the receipt after it exists; it must not create demand."
  },
  {
    id:"hcwi_rev4m_w_20261102_117", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Weekly HR-tech Radar → Hermes Command Center", details:"Revenue reconciliation overlay for W-20261102-117. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 18; source work reference W-20261102-117.",
    status:"blocked", created_at:"2026-11-02T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261102-117",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:18,
    revenue_status:"queued", revenue_source_work_id:"W-20261102-117",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Sync #2236 to current main faea22626e3d2f8e39686f8ad25025f5664f6be2, rerun exact-head CI, obtain independent APPROVED review, protected merge, exact-merge-SHA HAE dry_run/publication=false acceptance, then wait for/trigger only the normal Monday 10:00 Europe/Kyiv scheduled path and verify one D1 report receipt + authenticated Command Center readback. No second scheduler."
  },
  {
    id:"hcwi_rev4m_w_20261102_118", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Catalog weekly owner report + Monday reminder → Command Center", details:"Revenue reconciliation overlay for W-20261102-118. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 19; source work reference W-20261102-118.",
    status:"blocked", created_at:"2026-11-02T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261102-118",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:19,
    revenue_status:"queued", revenue_source_work_id:"W-20261102-118",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Do not reopen #2210 or duplicate the report. Sync #2236 to current main → exact-head CI → independent APPROVED review → protected merge → exact-merge-SHA HAE acceptance → real Friday/Monday D1 receipts → authenticated Command Center readback. Keep external send disabled for this internal owner report."
  },
  {
    id:"hcwi_rev4m_w_20261104_125", project_id:"revenue-website-progresso", workstream:"academy", priority:"p2",
    title:"[REVENUE] Two specialist sales trainers → one Hermes Command Center delivery and learning loop", details:"Revenue reconciliation overlay for W-20261104-125. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 20; source work reference W-20261104-125.",
    status:"blocked", created_at:"2026-11-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261104-125",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:20,
    revenue_status:"queued", revenue_source_work_id:"W-20261104-125",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Map both provider releases in Coordinator + HAE roster, Sales/Academy owners and Telegram Growth Manager transport. Link #2259 routing/receipt and #2224 project coverage; conduct approved DRAFT_ONLY dry-run -> QA -> source-backed Command Center readback. Resolve #932 security gate before any live Telegram delivery."
  },
  {
    id:"hcwi_rev4m_w_20261018_018", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] GA4 withdrawal and persisted-denial hard stop", details:"Revenue reconciliation overlay for W-20261018-018. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 21; source work reference W-20261018-018.",
    status:"blocked", created_at:"2026-10-18T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261018-018",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:21,
    revenue_status:"queued", revenue_source_work_id:"W-20261018-018",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Existing PR #2284 is code owner; NO duplicate PR. Zero approving reviews presently. Current open work: independent review -> protected merge -> deployment SHA readback -> live authenticated synthetic network smoke on required flows -> subsequent scheduled recurrence PASS. Maintain P0 PARTIAL_RESULT until proof, then independent QA may close #2280 and change ledger. Source/CI green ≠ live."
  },
  {
    id:"hcwi_rev4m_w_20261021_007", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Claude Design → Claude Code Cloud production-grade execution path", details:"Revenue reconciliation overlay for W-20261021-007. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 22; source work reference W-20261021-007.",
    status:"blocked", created_at:"2026-10-21T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261021-007",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:22,
    revenue_status:"queued", revenue_source_work_id:"W-20261021-007",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Finish #2003 and prove one real Claude-authored bounded feature branch from current main"
  },
  {
    id:"hcwi_rev4m_w_20261023_006", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Не бросать идеи до доказательного исхода", details:"Revenue reconciliation overlay for W-20261023-006. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 23; source work reference W-20261023-006.",
    status:"blocked", created_at:"2026-10-23T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261023-006",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:23,
    revenue_status:"queued", revenue_source_work_id:"W-20261023-006",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Автоматизировать статусы/эскалацию после стабилизации ledger"
  },
  {
    id:"hcwi_rev4m_w_20261024_091", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Load source rights & entitlement registry", details:"Revenue reconciliation overlay for W-20261024-091. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 24; source work reference W-20261024-091.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-091",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:24,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-091",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Feed only RIGHTS_VERIFIED + CURRENT_RECORD_VERIFIED sources into the first #1074 automation proof; route higher-risk carrier/dealer/shipper visibility to #2036. Keep #2034 provider access separate until official entitlement."
  },
  {
    id:"hcwi_rev4m_w_20260914_066", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Read-only AI mirror for dispatcher-used OFFICE 374", details:"Revenue reconciliation overlay for W-20260914-066. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 25; source work reference W-20260914-066.",
    status:"blocked", created_at:"2026-09-14T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260914-066",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:25,
    revenue_status:"queued", revenue_source_work_id:"W-20260914-066",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Restore/replace only the read-only mirror path if still needed; hand company-wide financial reconciliation to Finance plugin while Dispatch retains operational source truth"
  },
  {
    id:"hcwi_rev4m_w_20261012_030", project_id:"revenue-logistics", workstream:"finance", priority:"p2",
    title:"[REVENUE] Close invoice -> payment -> reconciliation operating loop", details:"Revenue reconciliation overlay for W-20261012-030. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 26; source work reference W-20261012-030.",
    status:"blocked", created_at:"2026-10-12T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261012-030",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:26,
    revenue_status:"queued", revenue_source_work_id:"W-20261012-030",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Keep existing W-20261012-030 / FIN-008 as owner. On-demand HAE candidate only AFTER real single-invoice finance proof: source Gmail metadata+invoice ID; manual trigger; READ_ONLY auth; idempotency key message-id + invoice-id + revision; bounded 37-message sample; deterministic parse; retry/report UNKNOWN; no outbound, duplicate scheduler, wallet changes or auto-collections."
  },
  {
    id:"hcwi_rev4m_w_20261024_104", project_id:"revenue-logistics", workstream:"finance", priority:"p2",
    title:"[REVENUE] Two-year Car Hauling truck-by-truck gross, fuel, costs and finance model", details:"Revenue reconciliation overlay for W-20261024-104. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 27; source work reference W-20261024-104.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-104",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:27,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-104",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Finance owner maintains historical source/read-only evidence as-is; Investor Relations no public numbers while external approval pending. Continue GitHub/Cloudflare/Drive technical audit and technical stage map now."
  },
  {
    id:"hcwi_rev4m_w_20261004_047", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Growth Bridge: LinkedIn + Meta + Threads + X -> Hermes Connect attribution", details:"Revenue reconciliation overlay for W-20261004-047. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 28; source work reference W-20261004-047.",
    status:"blocked", created_at:"2026-10-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261004-047",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:28,
    revenue_status:"queued", revenue_source_work_id:"W-20261004-047",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Marketing Growth owns content/provider policy; Search Growth owns GSC/Bing/index/SEO; Sales owns qualification; HAE may run only approved idempotent cadence. No second publisher and no merge of reach with qualified lead/revenue."
  },
  {
    id:"hcwi_rev4m_w_20261019_015", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Reconcile and finish the 150-task SEO/GEO program", details:"Revenue reconciliation overlay for W-20261019-015. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 29; source work reference W-20261019-015.",
    status:"blocked", created_at:"2026-10-19T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261019-015",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:29,
    revenue_status:"queued", revenue_source_work_id:"W-20261019-015",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Do not create another SEO scheduler. HAE owns the recurring snapshot; Search Growth owns interpretation and current-money-page actions. Promote only this monitoring sub-lane after a real receipt; keep the broader 150-task reconciliation separate and current-main-first."
  },
  {
    id:"hcwi_rev4m_w_20261023_003", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Hermes Search & Growth", details:"Revenue reconciliation overlay for W-20261023-003. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 30; source work reference W-20261023-003.",
    status:"blocked", created_at:"2026-10-23T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261023-003",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:30,
    revenue_status:"queued", revenue_source_work_id:"W-20261023-003",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Связать с One Brain Search router и доказать первый measurable improvement"
  },
  {
    id:"hcwi_rev4m_w_20261024_103", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Investor product map with VERIFIED/PILOT/CODE/PLAN and source passports", details:"Revenue reconciliation overlay for W-20261024-103. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 31; source work reference W-20261024-103.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-103",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:31,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-103",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Resume directly from C058: 1) Workers AI account-level Free-plan/binding/model assertion -> one PUBLIC/SYNTHETIC cost_usd=0 receipt; 2) Aiven $500 token-pass form/interview; 3) OVHcloud U.S. START form (up to $12k/12mo + 6h engineer) after legal-address/workload declarations; 4) AWS Activate after account/prior-credit/funding facts; 5) Microsoft after identity/legal/IP/billing gates; 6) Akamai commercial-account/workload route. Deepgram/OpenRouter remain conditional. Broad investor proposals remain held until P0 free-benefit lanes are submitted/received or precisely externally gated."
  },
  {
    id:"hcwi_rev4m_w_20261027_110", project_id:"revenue-website-progresso", workstream:"logistics", priority:"p2",
    title:"[REVENUE] 25-market car-hauler city evidence enrichment — KEEP_AND_ENRICH", details:"Revenue reconciliation overlay for W-20261027-110. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 32; source work reference W-20261027-110.",
    status:"blocked", created_at:"2026-10-27T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261027-110",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:32,
    revenue_status:"queued", revenue_source_work_id:"W-20261027-110",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Let PR #2152 run exact-head Search/website/QA checks. If green, independently review public wording/source parity and live pages, then promote evidence level from E1_DIRECTIVE to E2_IMPLEMENTED and scale the same evidence contract to the next city wave. Keep #2151 aligned with KEEP_AND_ENRICH. After Wave 1 #2152 is independently accepted on fresh main, implement Wave 2 as one bounded slice; do not open parallel city writers before that gate."
  },
  {
    id:"hcwi_rev4m_w_20260805_074", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Mobile no-email carrier contracting funnel with survey -> prefilled agreement -> phone signature", details:"Revenue reconciliation overlay for W-20260805-074. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 33; source work reference W-20260805-074.",
    status:"blocked", created_at:"2026-08-05T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260805-074",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:33,
    revenue_status:"queued", revenue_source_work_id:"W-20260805-074",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Use #2252 as the current execution owner. Resolve material differences between historical August terms and the Nov-2 approved agreement; pin the selected immutable PDF/version/SHA and Appendix A contract; run exact-head CI + private synthetic e-sign/delivery/readback without a real customer send."
  },
  {
    id:"hcwi_rev4m_w_20260906_068", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] AI Video Factory: provider-neutral governed video pipeline -> real ROI pilot", details:"Revenue reconciliation overlay for W-20260906-068. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 34; source work reference W-20260906-068.",
    status:"blocked", created_at:"2026-09-06T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260906-068",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:34,
    revenue_status:"queued", revenue_source_work_id:"W-20260906-068",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Run one bounded real provider/render canary and ROI comparison; Technology owns runtime/adapters, Design Hub visual/rights QA, Marketing owns distribution/outcome"
  },
  {
    id:"hcwi_rev4m_w_20261006_043", project_id:"revenue-partnerships", workstream:"sales", priority:"p2",
    title:"[REVENUE] Earned authority and backlink pipeline", details:"Revenue reconciliation overlay for W-20261006-043. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert the relationship into a paid referral, contract, credit/grant value, or other verified financial benefit of at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 35; source work reference W-20261006-043.",
    status:"blocked", created_at:"2026-10-06T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261006-043",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:35,
    revenue_status:"queued", revenue_source_work_id:"W-20261006-043",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Complete one owner-approved authority/corroboration action -> published URL/provider readback -> referral/search/AI entity observation. Keep case/reference proof fail-closed unless rights and publication permission are verified."
  },
  {
    id:"hcwi_rev4m_w_20261006_044", project_id:"revenue-logistics", workstream:"finance", priority:"p2",
    title:"[REVENUE] Candidate company-wide Finance / CFO digital role", details:"Revenue reconciliation overlay for W-20261006-044. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 36; source work reference W-20261006-044.",
    status:"blocked", created_at:"2026-10-06T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261006-044",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:36,
    revenue_status:"queued", revenue_source_work_id:"W-20261006-044",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Build first evidence-backed finance reconciliation pack and measure unmatched count/amount, error rate and close-cycle time before HAE automation"
  },
  {
    id:"hcwi_rev4m_w_20261009_039", project_id:"revenue-website-progresso", workstream:"sales", priority:"p2",
    title:"[REVENUE] International Digital Sales recruiting -> seller -> revenue pipeline", details:"Revenue reconciliation overlay for W-20261009-039. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 37; source work reference W-20261009-039.",
    status:"blocked", created_at:"2026-10-09T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261009-039",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:37,
    revenue_status:"queued", revenue_source_work_id:"W-20261009-039",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Reuse existing HR/Academy/Sales/Marketing roles; identify exact leakage stage and only then automate stable handoffs"
  },
  {
    id:"hcwi_rev4m_w_20261023_005", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Home v3: четыре реальные multi-shot video windows", details:"Revenue reconciliation overlay for W-20261023-005. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 38; source work reference W-20261023-005.",
    status:"blocked", created_at:"2026-10-22T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261023-005",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:38,
    revenue_status:"queued", revenue_source_work_id:"W-20261023-005",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Продолжить canonical #1986 + performance child #1983 без второго visual writer"
  },
  {
    id:"hcwi_rev4m_w_20261024_102", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Hermes Investor Relations EN/RU: public evidence-safe site and SEO/GEO", details:"Revenue reconciliation overlay for W-20261024-102. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 39; source work reference W-20261024-102.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-102",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:39,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-102",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Active execution moves through W-20261024-103 applications/partnerships/readiness. Technology must not merge/deploy #2055 or create a second investor frontend. When release trigger exists, replay only the investor-specific 10-file delta onto current main and independently QA current evidence."
  },
  {
    id:"hcwi_rev4m_w_20261104_126", project_id:"revenue-website-progresso", workstream:"sales", priority:"p2",
    title:"[REVENUE] BrandStride reference → original pricing-page Website Factory capability", details:"Revenue reconciliation overlay for W-20261104-126. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 40; source work reference W-20261104-126.",
    status:"blocked", created_at:"2026-11-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261104-126",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:40,
    revenue_status:"queued", revenue_source_work_id:"W-20261104-126",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Design Hub prepare approved original pricing concept; Technology build smallest isolated preview; independent QA inspect desktop/mobile, CTA→CRM and SEO; request owner visual approval before any live release."
  },
  {
    id:"hcwi_rev4m_w_20261012_032", project_id:"revenue-partnerships", workstream:"sales", priority:"p2",
    title:"[REVENUE] Hermes Connect end-to-end product-to-revenue proof", details:"Revenue reconciliation overlay for W-20261012-032. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert the relationship into a paid referral, contract, credit/grant value, or other verified financial benefit of at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 41; source work reference W-20261012-032.",
    status:"blocked", created_at:"2026-10-12T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261012-032",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:41,
    revenue_status:"queued", revenue_source_work_id:"W-20261012-032",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"No credential resend, no new account, no auth/CRM rebuild, no MRR claim. HAE may later read a sanitized event receipt but cannot create the event."
  },
  {
    id:"hcwi_rev4m_w_20260815_075", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Prove leaked credential invalid and prevent repository secret recurrence", details:"Revenue reconciliation overlay for W-20260815-075. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 42; source work reference W-20260815-075.",
    status:"blocked", created_at:"2026-08-15T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260815-075",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:42,
    revenue_status:"queued", revenue_source_work_id:"W-20260815-075",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Close the exact security gap and add regression proof; do not paste secrets into Ledger/plugins/issues or rotate blindly without dependency/rollback review."
  },
  {
    id:"hcwi_rev4m_w_20261015_024", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Hermes Marketing & Social Growth digital role", details:"Revenue reconciliation overlay for W-20261015-024. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 43; source work reference W-20261015-024.",
    status:"blocked", created_at:"2026-10-15T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261015-024",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:43,
    revenue_status:"queued", revenue_source_work_id:"W-20261015-024",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Use the new role on the next current Marketing/SMM task; measure whether it improves routing and produces a clean HAE-ready experiment contract"
  },
  {
    id:"hcwi_rev4m_w_20261018_017", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Current-main accessibility semantic replay", details:"Revenue reconciliation overlay for W-20261018-017. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 44; source work reference W-20261018-017.",
    status:"blocked", created_at:"2026-10-18T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261018-017",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:44,
    revenue_status:"queued", revenue_source_work_id:"W-20261018-017",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Finish or close #2002 with current-main readback; never merge stale contrast branches wholesale"
  },
  {
    id:"hcwi_rev4m_w_20261024_092", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Ghost-load freshness controller and source-specific TTL", details:"Revenue reconciliation overlay for W-20261024-092. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 45; source work reference W-20261024-092.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-092",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:45,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-092",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If a repeatable low-false-positive rule emerges, implement deterministic recheck/auto-close through the existing Load Board/HAE path. Keep ambiguous records out of trusted-open views and preserve source-specific overrides."
  },
  {
    id:"hcwi_rev4m_w_20261103_120", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Ecosystem Order Program — continuous audit → fix now → backlog → learn", details:"Revenue reconciliation overlay for W-20261103-120. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 46; source work reference W-20261103-120.",
    status:"blocked", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261103-120",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:46,
    revenue_status:"queued", revenue_source_work_id:"W-20261103-120",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Hold all protected release actions. Wait for #2236 exact-head applicable CI to become terminal GREEN + independent current-head APPROVED review. Because #2236 advanced, #2283 is now stale/mergeable=false on old base 3bfdfb777; only after parent stability resync #2283, rerun bridge/HAE tests, then continue #2250 DNS/TLS signed canary. Keep source collectors running and security P0 gates separate."
  },
  {
    id:"hcwi_rev4m_w_20261103_121", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Drive provenance dedupe — classify remaining duplicated Search/Website/Design sources without destroying history", details:"Revenue reconciliation overlay for W-20261103-121. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 47; source work reference W-20261103-121.",
    status:"blocked", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261103-121",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:47,
    revenue_status:"queued", revenue_source_work_id:"W-20261103-121",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Record canonical IDs in source register / ledger; rename confirmed noncanonical copies SOURCE_ONLY with date; HOLD any non-identical ambiguous pair for owner/domain review."
  },
  {
    id:"hcwi_rev4m_w_20261021_008", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] HAE runtime acceptance -> self-learning closed loop", details:"Revenue reconciliation overlay for W-20261021-008. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 48; source work reference W-20261021-008.",
    status:"blocked", created_at:"2026-10-21T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261021-008",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:48,
    revenue_status:"queued", revenue_source_work_id:"W-20261021-008",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Do not merge/deploy/activate before independent review. Unattended startup remains ADMIN_ELEVATION_GATE because the safe S4U probe returned Access denied in the current remote session. Run the prepared elevated S4U bootstrap only from an administrator session, then require logout/reboot proof. Separately, after #2250 release, run one real READ_ONLY D1 canary and independent QA before HAE_CONNECTED."
  },
  {
    id:"hcwi_rev4m_w_20261103_124", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Officeus Gmail deterministic auto-triage → existing HAE / Command Center", details:"Revenue reconciliation overlay for W-20261103-124. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 49; source work reference W-20261103-124.",
    status:"blocked", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261103-124",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:49,
    revenue_status:"queued", revenue_source_work_id:"W-20261103-124",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Implement only through existing HAE Queue/D1 and Gmail scopes after exact-current release gates. Route critical classes owner-visible; auto-archive only deterministic noncritical classes after independent QA. Preserve personal/tina mailboxes out of scope. Command Center consumes receipts, not a second mail database."
  },
  {
    id:"hcwi_rev4m_w_20261104_128", project_id:"revenue-academy", workstream:"academy", priority:"p2",
    title:"[REVENUE] Recruiting Growth Loop -> canonical Hermes Connect HR + truthful vacancy lifecycle", details:"Revenue reconciliation overlay for W-20261104-128. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert one learner/candidate/company into a paid Academy or recruiting-related outcome; minimum accepted financial proof is $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 50; source work reference W-20261104-128.",
    status:"blocked", created_at:"2026-08-14T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261104-128",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:50,
    revenue_status:"queued", revenue_source_work_id:"W-20261104-128",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Keep #513 as the current owner. Reconcile public role state -> current submission persistence/receipt -> HR reviewer -> Academy/direct route -> human readiness -> handoff/outcome. Do not revive #381, old Work.ua, 100Hires seed data or create a parallel ATS/runtime."
  },
  {
    id:"hcwi_rev4m_w_20260919_056", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Rotate/revoke historical Telegram credential and prove old secret invalid", details:"Revenue reconciliation overlay for W-20260919-056. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 51; source work reference W-20260919-056.",
    status:"blocked", created_at:"2026-09-19T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260919-056",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:51,
    revenue_status:"queued", revenue_source_work_id:"W-20260919-056",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Complete #932 with sanitized evidence only; then verify current Telegram runtime/transport without reviving closed #1321"
  },
  {
    id:"hcwi_rev4m_w_20261001_053", project_id:"revenue-website-progresso", workstream:"sales", priority:"p2",
    title:"[REVENUE] Website inquiry -> Request ID -> Sales qualification -> opportunity/revenue", details:"Revenue reconciliation overlay for W-20261001-053. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 52; source work reference W-20261001-053.",
    status:"blocked", created_at:"2026-10-01T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261001-053",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:52,
    revenue_status:"queued", revenue_source_work_id:"W-20261001-053",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Sales must classify BUYER vs VENDOR/CANDIDATE vs ACADEMY/RECRUITING before opportunity counting. #1598 stays closed/merged; no new intake stack. Never use form wording alone as buyer proof when the human reply clarifies intent."
  },
  {
    id:"hcwi_rev4m_w_20261020_009", project_id:"revenue-website-progresso", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Постоянный Wisconsin Owner-Operator recruiting", details:"Revenue reconciliation overlay for W-20261020-009. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 53; source work reference W-20261020-009.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261020-009",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:53,
    revenue_status:"queued", revenue_source_work_id:"W-20261020-009",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Resolve current-main delta, then measure GSC/qualified inquiry path"
  },
  {
    id:"hcwi_rev4m_w_20261028_115", project_id:"revenue-partnerships", workstream:"sales", priority:"p2",
    title:"[REVENUE] Cross-mailbox Email Intelligence Audit — business evidence, plugin learning and HAE queue", details:"Revenue reconciliation overlay for W-20261028-115. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert the relationship into a paid referral, contract, credit/grant value, or other verified financial benefit of at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 54; source work reference W-20261028-115.",
    status:"blocked", created_at:"2026-10-28T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261028-115",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:54,
    revenue_status:"queued", revenue_source_work_id:"W-20261028-115",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Knowledge Curator maintains mailbox provenance and ranges; domain plugins consume only routed lessons. Do not claim exhaustive line-by-line archive completion, do not infer unconnected mailboxes, and do not publish PII/private contracts. Re-run mailbox delta only for new dates or unresolved source class."
  },
  {
    id:"hcwi_rev4m_w_20260917_060", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] ECG finished-vehicle logistics pilot", details:"Revenue reconciliation overlay for W-20260917-060. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 55; source work reference W-20260917-060.",
    status:"blocked", created_at:"2026-09-17T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260917-060",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:55,
    revenue_status:"queued", revenue_source_work_id:"W-20260917-060",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Partnerships/Sales retains existing thread. Update stale Contacts next-action only when the Contacts owner is active; do not create a new opportunity record. Investment priority below the direct TMS buyer because no current concrete use case is waiting."
  },
  {
    id:"hcwi_rev4m_w_20260918_058", project_id:"revenue-logistics", workstream:"academy", priority:"p2",
    title:"[REVENUE] Findcourses partnership for U.S. Logistics Operations Academy demand", details:"Revenue reconciliation overlay for W-20260918-058. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 56; source work reference W-20260918-058.",
    status:"blocked", created_at:"2026-09-18T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260918-058",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:56,
    revenue_status:"queued", revenue_source_work_id:"W-20260918-058",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Mark follow-up as DUE_FOR_OWNER_REVIEW, not failed. Do not book a meeting or send automatically. If owner chooses not to pursue, record explicit supersession/negative rationale instead of silently dropping."
  },
  {
    id:"hcwi_rev4m_w_20261007_042", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Verify Hermes USDOT/FMCSA status before any Motus filing", details:"Revenue reconciliation overlay for W-20261007-042. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 57; source work reference W-20261007-042.",
    status:"blocked", created_at:"2026-10-07T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261007-042",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:57,
    revenue_status:"queued", revenue_source_work_id:"W-20261007-042",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Compliance owns current USDOT/FMCSA/entity evidence and filing gate; Dispatch supplies operational need. If status already satisfies the business need mark SUPERSEDED/NO_ACTION; otherwise prepare owner-approved filing checklist only."
  },
  {
    id:"hcwi_rev4m_w_20261011_035", project_id:"revenue-academy", workstream:"academy", priority:"p2",
    title:"[REVENUE] KNB Academy Business CRM -> real client completion", details:"Revenue reconciliation overlay for W-20261011-035. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert one learner/candidate/company into a paid Academy or recruiting-related outcome; minimum accepted financial proof is $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 58; source work reference W-20261011-035.",
    status:"blocked", created_at:"2026-10-11T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261011-035",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:58,
    revenue_status:"queued", revenue_source_work_id:"W-20261011-035",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Academy owns learning/business semantics; Connect operator reuses shared Company/Workspace; QA distinguishes 401 boundary and merged APIs from AUTHENTICATED_TENANT_READBACK/REAL_LEARNER_USE. Commercial Telegram/payment evidence later."
  },
  {
    id:"hcwi_rev4m_w_20261012_031", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Confirm Central Dispatch entitlement and lawful integration path", details:"Revenue reconciliation overlay for W-20261012-031. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 59; source work reference W-20261012-031.",
    status:"blocked", created_at:"2026-10-12T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261012-031",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:59,
    revenue_status:"queued", revenue_source_work_id:"W-20261012-031",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Sales/Technology keep one thread/one opportunity. Provider entitlement stays #2034. Do not create another draft, connector, CRM record or claim won revenue."
  },
  {
    id:"hcwi_rev4m_w_20261012_101", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Validate DriverCore as a driver/logistics sourcing partner", details:"Revenue reconciliation overlay for W-20261012-101. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 60; source work reference W-20261012-101.",
    status:"blocked", created_at:"2026-10-12T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261012-101",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:60,
    revenue_status:"queued", revenue_source_work_id:"W-20261012-101",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"No reply/send yet. If evidence clears the vendor-fit gate, prepare owner-review partnership questions; otherwise mark NEGATIVE_TESTED/REJECTED_BY_EVIDENCE with reason."
  },
  {
    id:"hcwi_rev4m_w_20261019_016", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Claude Local Exit & Salvage → atomic One Brain reconciliation", details:"Revenue reconciliation overlay for W-20261019-016. Original four-month source status: TASK_READY. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 61; source work reference W-20261019-016.",
    status:"blocked", created_at:"2026-10-19T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261019-016",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:61,
    revenue_status:"queued", revenue_source_work_id:"W-20261019-016",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Do this after ChatGPT/Codex archive phases per current source order; preserve provenance and privacy"
  },
  {
    id:"hcwi_rev4m_w_20261023_004", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Единый Execution & Ideas Ledger", details:"Revenue reconciliation overlay for W-20261023-004. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 62; source work reference W-20261023-004.",
    status:"blocked", created_at:"2026-10-23T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261023-004",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:62,
    revenue_status:"queued", revenue_source_work_id:"W-20261023-004",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Для каждого нового источника dedupe → classify → add/update row"
  },
  {
    id:"hcwi_rev4m_w_20261024_093", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Canonical ELD event adapter benchmark", details:"Revenue reconciliation overlay for W-20261024-093. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 63; source work reference W-20261024-093.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-093",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:63,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-093",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"After one provider read-only proof, standardize normalized vehicle/location event schema and security/revocation contract; Dispatch remains business owner."
  },
  {
    id:"hcwi_rev4m_w_20261024_100", project_id:"revenue-logistics", workstream:"finance", priority:"p2",
    title:"[REVENUE] Broker authority + payment-risk pre-acceptance checklist", details:"Revenue reconciliation overlay for W-20261024-100. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 64; source work reference W-20261024-100.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-100",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:64,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-100",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If historical losses/exceptions show material value, evaluate one authorized credit source with ROI and provider terms; keep risk score advisory and human load-acceptance decision."
  },
  {
    id:"hcwi_rev4m_w_20261011_034", project_id:"revenue-repair-shop", workstream:"operations", priority:"p2",
    title:"[REVENUE] Repair Shop / Truck Repair Partner beta -> real client outcome", details:"Revenue reconciliation overlay for W-20261011-034. Original four-month source status: POSITIVE_SIGNAL. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $500. Monetization path: Convert one repair-shop/customer workflow into a paid $500 pilot; next expansion target is the known $900/mo base service. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 65; source work reference W-20261011-034.",
    status:"blocked", created_at:"2026-10-11T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261011-034",
    revenue_gate_usd:1, revenue_target_usd:500, revenue_actual_usd:0, revenue_rank:65,
    revenue_status:"queued", revenue_source_work_id:"W-20261011-034",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Keep First-5 funnel stages explicit: PROVISIONED -> CLIENT_INVITED -> OWNER_ACK -> LOGIN/USE -> BOOKING/PROCESSING -> REPEAT/FEEDBACK -> COMMERCIAL_DECISION."
  },
  {
    id:"hcwi_rev4m_w_20261024_094", project_id:"revenue-repair-shop", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Secure inbound-email-to-load ingestion pilot", details:"Revenue reconciliation overlay for W-20261024-094. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $500. Monetization path: Convert one repair-shop/customer workflow into a paid $500 pilot; next expansion target is the known $900/mo base service. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 66; source work reference W-20261024-094.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-094",
    revenue_gate_usd:1, revenue_target_usd:500, revenue_actual_usd:0, revenue_rank:66,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-094",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If accuracy and safety are repeatable, hand deterministic parse/dedupe stage to Technology/HAE; no outbound email or booking side effects."
  },
  {
    id:"hcwi_rev4m_w_20261024_096", project_id:"revenue-repair-shop", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Authorized private-to-public load routing pilot", details:"Revenue reconciliation overlay for W-20261024-096. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $500. Monetization path: Convert one repair-shop/customer workflow into a paid $500 pilot; next expansion target is the known $900/mo base service. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 67; source work reference W-20261024-096.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-096",
    revenue_gate_usd:1, revenue_target_usd:500, revenue_actual_usd:0, revenue_rank:67,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-096",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Only after provider-authorized positive signal define a bounded production pilot; booking/contract/payment actions remain separately gated."
  },
  {
    id:"hcwi_rev4m_w_20261024_105", project_id:"revenue-partnerships", workstream:"sales", priority:"p2",
    title:"[REVENUE] Private invite-only investor accounts with per-investor document scope", details:"Revenue reconciliation overlay for W-20261024-105. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert the relationship into a paid referral, contract, credit/grant value, or other verified financial benefit of at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 68; source work reference W-20261024-105.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-105",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:68,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-105",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Investor Relations owns track-specific checklist; domain owners supply metadata/current refs only. Finance/Legal/Security approvals precede room release. Do not ask for every sensitive document for every investor."
  },
  {
    id:"hcwi_rev4m_w_20260831_069", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Clean multi-engine AI visibility baseline with real observations", details:"Revenue reconciliation overlay for W-20260831-069. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 69; source work reference W-20260831-069.",
    status:"blocked", created_at:"2026-08-31T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260831-069",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:69,
    revenue_status:"queued", revenue_source_work_id:"W-20260831-069",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Store current observations under the existing GEO/Search evidence contract; no fixed 240 quota and no new scorecard runtime. Promote only reproduced entity/citation gaps into current owners."
  },
  {
    id:"hcwi_rev4m_w_20260831_072", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Close the chain from search/CTA telemetry to qualified disposition and revenue", details:"Revenue reconciliation overlay for W-20260831-072. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 70; source work reference W-20260831-072.",
    status:"blocked", created_at:"2026-08-31T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260831-072",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:70,
    revenue_status:"queued", revenue_source_work_id:"W-20260831-072",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Execute/read back one end-to-end current slice under W-20260831-072 using #960/CRM/Sales/Finance evidence (and #1018 only for a social-attributed source), then record stage-by-stage counts and the stop reason. No new analytics property or duplicate attribution store."
  },
  {
    id:"hcwi_rev4m_w_20260914_065", project_id:"revenue-website-progresso", workstream:"sales", priority:"p2",
    title:"[REVENUE] 3–5 member association pilot playbook before paid partnership", details:"Revenue reconciliation overlay for W-20260914-065. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 71; source work reference W-20260914-065.",
    status:"blocked", created_at:"2026-09-14T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260914-065",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:71,
    revenue_status:"queued", revenue_source_work_id:"W-20260914-065",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Sales/Partnerships owns relationship state. EAEA: EVENT_WAIT after Nov3 reply; no duplicate follow-up while contact is OOO. If EAEA responds, draft one MoU discovery scope aligned to adult education/European context and obtain approval before publishing names/logos or implying partnership. Continue other association lanes separately by their actual rules; no universal 3–5 pilot and no auto-outbound."
  },
  {
    id:"hcwi_rev4m_w_20260915_063", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] TechRound measurable authority/acquisition pilot", details:"Revenue reconciliation overlay for W-20260915-063. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 72; source work reference W-20260915-063.",
    status:"blocked", created_at:"2026-09-15T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260915-063",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:72,
    revenue_status:"queued", revenue_source_work_id:"W-20260915-063",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If still strategically useful, submit one owner-approved bounded acquisition experiment with UTM/source attribution; otherwise reject by evidence"
  },
  {
    id:"hcwi_rev4m_w_20261003_051", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Candidate cross-brand CMO / Marketing Strategy digital role", details:"Revenue reconciliation overlay for W-20261003-051. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 73; source work reference W-20261003-051.",
    status:"blocked", created_at:"2026-10-03T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261003-051",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:73,
    revenue_status:"queued", revenue_source_work_id:"W-20261003-051",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If repeated distinct scope persists, produce ROLE_REQUISITION for HR→COO→CEO; otherwise TRAIN_EXISTING/COO coordination"
  },
  {
    id:"hcwi_rev4m_w_20261024_095", project_id:"revenue-website-progresso", workstream:"logistics", priority:"p2",
    title:"[REVENUE] D1 geospatial query benchmark for Load Board proximity", details:"Revenue reconciliation overlay for W-20261024-095. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 74; source work reference W-20261024-095.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-095",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:74,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-095",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Select simplest method meeting latency/cost/correctness target; document D1 limit assumptions and recheck current plan before production."
  },
  {
    id:"hcwi_rev4m_w_20261011_033", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Delegated company membership + RBAC real production acceptance", details:"Revenue reconciliation overlay for W-20261011-033. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 75; source work reference W-20261011-033.",
    status:"blocked", created_at:"2026-10-11T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261011-033",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:75,
    revenue_status:"queued", revenue_source_work_id:"W-20261011-033",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Fix only current acceptance defects under #1620; do not build a second membership/RBAC layer"
  },
  {
    id:"hcwi_rev4m_w_20261014_026", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] HR candidate replay/idempotency completion", details:"Revenue reconciliation overlay for W-20261014-026. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 76; source work reference W-20261014-026.",
    status:"blocked", created_at:"2026-10-14T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261014-026",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:76,
    revenue_status:"queued", revenue_source_work_id:"W-20261014-026",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Under #513, merge the still-applicable fix and close/supersede any obsolete PR only after current-main readback"
  },
  {
    id:"hcwi_rev4m_w_20261023_001", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Полный разбор истории и инфраструктуры для обучения цифровых сотрудников", details:"Revenue reconciliation overlay for W-20261023-001. Original four-month source status: EXECUTING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 77; source work reference W-20261023-001.",
    status:"blocked", created_at:"2026-10-23T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261023-001",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:77,
    revenue_status:"queued", revenue_source_work_id:"W-20261023-001",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"2026-11-04: Resume newest-first 2026-10-24..11-04 archive gap from actual readable message/source evidence; reconcile against 58 curator batches + 152 chat INDEX entries + 125 existing WORK_IDs, dedupe by objective and re-verify GitHub/Drive/runtime, classify why blocked and missed. Update current canonical Ledger and reviewed domain skills, then obtain independent QA + release/HAE receipt if applicable; do not open a second backlog or imply native full-export coverage."
  },
  {
    id:"hcwi_rev4m_w_20261004_048", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] CEO registrations ledger + real-time new-user alerts", details:"Revenue reconciliation overlay for W-20261004-048. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 78; source work reference W-20261004-048.",
    status:"blocked", created_at:"2026-10-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261004-048",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:78,
    revenue_status:"queued", revenue_source_work_id:"W-20261004-048",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Stabilize deterministic event/dedupe/readback first; after HAE reliability gate, consider recurring alert/exception automation"
  },
  {
    id:"hcwi_rev4m_w_20261008_041", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] AI -> Identity -> Company -> Catalog/CRM authenticated customer gateway", details:"Revenue reconciliation overlay for W-20261008-041. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 79; source work reference W-20261008-041.",
    status:"blocked", created_at:"2026-10-08T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261008-041",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:79,
    revenue_status:"queued", revenue_source_work_id:"W-20261008-041",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Prove one end-to-end gateway journey before expanding platform list; route business outcome to Sales/CRM and keep discoverability separate"
  },
  {
    id:"hcwi_rev4m_w_20261028_114", project_id:"revenue-academy", workstream:"academy", priority:"p2",
    title:"[REVENUE] Email candidate triage: real applicant vs alert vs QA vs vendor/internal", details:"Revenue reconciliation overlay for W-20261028-114. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert one learner/candidate/company into a paid Academy or recruiting-related outcome; minimum accepted financial proof is $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 80; source work reference W-20261028-114.",
    status:"blocked", created_at:"2026-10-28T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261028-114",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:80,
    revenue_status:"queued", revenue_source_work_id:"W-20261028-114",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Hermes Recruiter owns candidate-message classification; HR owns qualification/hiring. HAE may automate only READ_ONLY message-type triage after independent QA threshold, with low-confidence => UNKNOWN/HUMAN_REVIEW and zero candidate eligibility/hire/reject/compensation decisions."
  },
  {
    id:"hcwi_rev4m_w_20260814_073", project_id:"revenue-ai-operations", workstream:"finance", priority:"p2",
    title:"[REVENUE] Detect and contain unexpected AI/cloud spend before it repeats", details:"Revenue reconciliation overlay for W-20260814-073. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 81; source work reference W-20260814-073.",
    status:"blocked", created_at:"2026-08-14T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260814-073",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:81,
    revenue_status:"queued", revenue_source_work_id:"W-20260814-073",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Read current Google Cloud billing/usage export or console evidence for hermes-connect-ai-dev and Aug-14 window; map cost to service/usage/workload/identity. Compare current budget/alerts/quotas and present cost. Preserve UNKNOWN if billing access is unavailable."
  },
  {
    id:"hcwi_rev4m_w_20260918_059", project_id:"revenue-website-progresso", workstream:"academy", priority:"p2",
    title:"[REVENUE] Telegram communities -> attributable Academy/contracts/revenue growth loop", details:"Revenue reconciliation overlay for W-20260918-059. Original four-month source status: POSITIVE_SIGNAL. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 82; source work reference W-20260918-059.",
    status:"blocked", created_at:"2026-09-18T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260918-059",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:82,
    revenue_status:"queued", revenue_source_work_id:"W-20260918-059",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Preserve content/delivery positive signal; restore safe runtime only through existing gateway; scale community experiments only with qualified-outcome attribution"
  },
  {
    id:"hcwi_rev4m_w_20261020_013", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Восстановить и сверить реестр 150 уникальных задач", details:"Revenue reconciliation overlay for W-20261020-013. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 83; source work reference W-20261020-013.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261020-013",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:83,
    revenue_status:"queued", revenue_source_work_id:"W-20261020-013",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Process inventory in bounded batches and update ledger only after current-state check"
  },
  {
    id:"hcwi_rev4m_w_20261104_127", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] MZM local-search growth case -> reusable local-service SEO/GEO playbook", details:"Revenue reconciliation overlay for W-20261104-127. Original four-month source status: POSITIVE_SIGNAL. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 84; source work reference W-20261104-127.",
    status:"blocked", created_at:"2026-11-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261104-127",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:84,
    revenue_status:"queued", revenue_source_work_id:"W-20261104-127",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Route local-service website projects through the new Search/SEO/GEO/Website Auditor lessons; capture baseline before edits and 28/56/84-day evidence after release. No MZM production change or external action without a separate explicit request."
  },
  {
    id:"hcwi_rev4m_w_20260927_055", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Permissioned business profile activation before client share", details:"Revenue reconciliation overlay for W-20260927-055. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 85; source work reference W-20260927-055.",
    status:"blocked", created_at:"2026-09-27T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260927-055",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:85,
    revenue_status:"queued", revenue_source_work_id:"W-20260927-055",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Formalize completeness checklist in current Catalog/Connect flow and test one real permissioned activation without unsolicited contact"
  },
  {
    id:"hcwi_rev4m_w_20261011_036", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Finish Mac local corpus salvage before final retirement/delete-readiness", details:"Revenue reconciliation overlay for W-20261011-036. Original four-month source status: PARTIAL_RESULT. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 86; source work reference W-20261011-036.",
    status:"blocked", created_at:"2026-10-11T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261011-036",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:86,
    revenue_status:"queued", revenue_source_work_id:"W-20261011-036",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Finish salvage before any destructive local cleanup; dedupe only after provenance/readback"
  },
  {
    id:"hcwi_rev4m_w_20261016_021", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Cloudflare Pages intermittent 1102 resource-limit incident", details:"Revenue reconciliation overlay for W-20261016-021. Original four-month source status: MEASURED_WIN. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 87; source work reference W-20261016-021.",
    status:"blocked", created_at:"2026-10-16T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261016-021",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:87,
    revenue_status:"queued", revenue_source_work_id:"W-20261016-021",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Keep existing monitor; do not create new incident work without fresh recurrence evidence"
  },
  {
    id:"hcwi_rev4m_w_20261023_002", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Кадровый конвейер цифровых сотрудников", details:"Revenue reconciliation overlay for W-20261023-002. Original four-month source status: POSITIVE_SIGNAL. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 88; source work reference W-20261023-002.",
    status:"blocked", created_at:"2026-10-23T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261023-002",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:88,
    revenue_status:"queued", revenue_source_work_id:"W-20261023-002",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Сделать staffing council кандидатом на HAE после стабильного повторяемого цикла"
  },
  {
    id:"hcwi_rev4m_w_20261024_106", project_id:"revenue-partnerships", workstream:"sales", priority:"p2",
    title:"[REVENUE] Weekly evidence-approved growth report via existing One Brain → HAE", details:"Revenue reconciliation overlay for W-20261024-106. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert the relationship into a paid referral, contract, credit/grant value, or other verified financial benefit of at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 89; source work reference W-20261024-106.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-106",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:89,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-106",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Keep weekly investor report MANUAL/REVIEWED until Finance+QA+Legal+CEO approval and investor-room entitlements exist. HAE remains single runtime owner."
  },
  {
    id:"hcwi_rev4m_w_20260918_057", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] International low-cost talent-hub pilot before local office/housing", details:"Revenue reconciliation overlay for W-20260918-057. Original four-month source status: IDEA_EVIDENCE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 90; source work reference W-20260918-057.",
    status:"blocked", created_at:"2026-09-18T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260918-057",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:90,
    revenue_status:"queued", revenue_source_work_id:"W-20260918-057",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Run a bounded recruiting-market pilot before any housing/office/fixed infrastructure; HR human gate remains final"
  },
  {
    id:"hcwi_rev4m_w_20260916_061", project_id:"revenue-repair-shop", workstream:"operations", priority:"p2",
    title:"[REVENUE] Hermes Connect Lite low-price international pilot", details:"Revenue reconciliation overlay for W-20260916-061. Original four-month source status: IDEA_EVIDENCE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $500. Monetization path: Convert one repair-shop/customer workflow into a paid $500 pilot; next expansion target is the known $900/mo base service. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 91; source work reference W-20260916-061.",
    status:"blocked", created_at:"2026-09-16T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260916-061",
    revenue_gate_usd:1, revenue_target_usd:500, revenue_actual_usd:0, revenue_rank:91,
    revenue_status:"queued", revenue_source_work_id:"W-20260916-061",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Run one bounded current market validation; build only smallest missing product/localization/billing capability after positive signal"
  },
  {
    id:"hcwi_rev4m_w_20261004_050", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Verify Cloudflare admin MFA and active-session security state", details:"Revenue reconciliation overlay for W-20261004-050. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 92; source work reference W-20261004-050.",
    status:"blocked", created_at:"2026-10-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261004-050",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:92,
    revenue_status:"queued", revenue_source_work_id:"W-20261004-050",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If a gap exists, owner/admin performs the minimal remediation and verifies re-login; if already compliant, mark MEASURED/verified and close"
  },
  {
    id:"hcwi_rev4m_w_20260829_071", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Activate AI Connect only through verified owner identity and scoped runner", details:"Revenue reconciliation overlay for W-20260829-071. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 93; source work reference W-20260829-071.",
    status:"blocked", created_at:"2026-08-26T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260829-071",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:93,
    revenue_status:"queued", revenue_source_work_id:"W-20260829-071",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Close only the remaining current acceptance gap or mark SUPERSEDED by newer delegated-access/control-plane work with evidence."
  },
  {
    id:"hcwi_rev4m_w_20260916_064", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] SE Ranking affiliate revenue experiment", details:"Revenue reconciliation overlay for W-20260916-064. Original four-month source status: IDEA_EVIDENCE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 94; source work reference W-20260916-064.",
    status:"blocked", created_at:"2026-09-16T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260916-064",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:94,
    revenue_status:"queued", revenue_source_work_id:"W-20260916-064",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Only if evidence supports it, prepare an owner-approved small affiliate content test with disclosure and attribution; otherwise mark rejected/superseded"
  },
  {
    id:"hcwi_rev4m_w_20261017_019", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Optional local FreeLLMAPI inference adapter", details:"Revenue reconciliation overlay for W-20261017-019. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 95; source work reference W-20261017-019.",
    status:"blocked", created_at:"2026-10-17T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261017-019",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:95,
    revenue_status:"queued", revenue_source_work_id:"W-20261017-019",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Keep default OFF; complete #1938 host/provider gates before any departmental opt-in"
  },
  {
    id:"hcwi_rev4m_w_20261017_020", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] OpenClaw read-only capability probe for existing HAE", details:"Revenue reconciliation overlay for W-20261017-020. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 96; source work reference W-20261017-020.",
    status:"blocked", created_at:"2026-10-17T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261017-020",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:96,
    revenue_status:"queued", revenue_source_work_id:"W-20261017-020",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Either close #1940 as unnecessary or keep a strictly read-only bounded probe; any 24/7 agent host is a separate gated experiment"
  },
  {
    id:"hcwi_rev4m_w_20261020_012", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] ThreeUI Community motion patterns for Website Factory", details:"Revenue reconciliation overlay for W-20261020-012. Original four-month source status: IDEA_EVIDENCE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 97; source work reference W-20261020-012.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261020-012",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:97,
    revenue_status:"queued", revenue_source_work_id:"W-20261020-012",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Run one bounded visual experiment; if weak again, NEGATIVE_TESTED for that use case"
  },
  {
    id:"hcwi_rev4m_w_20261024_098", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Benchmark LobeHub agent-harness patterns against Hermes Coordinator + HAE", details:"Revenue reconciliation overlay for W-20261024-098. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 98; source work reference W-20261024-098.",
    status:"blocked", created_at:"2026-10-24T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261024-098",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:98,
    revenue_status:"queued", revenue_source_work_id:"W-20261024-098",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If no meaningful gap, close NEGATIVE_TESTED/SUPERSEDED. If a bounded gap exists, add it to the existing HAE/Coordinator rather than adopting a second control plane."
  },
  {
    id:"hcwi_rev4m_w_20260916_062", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Hermes Connect Connector SDK / Marketplace after proven adapters", details:"Revenue reconciliation overlay for W-20260916-062. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 99; source work reference W-20260916-062.",
    status:"blocked", created_at:"2026-09-16T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260916-062",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:99,
    revenue_status:"queued", revenue_source_work_id:"W-20260916-062",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Use Technology v0.1.37 connector-build-vs-wrap gate; only promote Marketplace after stable multi-adapter evidence"
  },
  {
    id:"hcwi_rev4m_w_20261103_123", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Retire or explicitly archive unused Google Cloud project possible-surf-505218-h5", details:"Revenue reconciliation overlay for W-20261103-123. Original four-month source status: VALIDATING. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 100; source work reference W-20261103-123.",
    status:"blocked", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261103-123",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:100,
    revenue_status:"queued", revenue_source_work_id:"W-20261103-123",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If still empty/unbilled/unreferenced, prepare owner-approved delete/archive; otherwise classify RETAIN with current purpose and move all Hermes development references to the canonical project. Never delete from historical August evidence alone."
  },
  {
    id:"hcwi_rev4m_w_20260729_077", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Productize Hermes AI logistics capabilities one module at a time", details:"Revenue reconciliation overlay for W-20260729-077. Original four-month source status: SUPERSEDED. This source is superseded and retained for audit only. Never revive or auto-unlock it. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 101; source work reference W-20260729-077.",
    status:"cancelled", created_at:"2026-07-29T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260729-077",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:101,
    revenue_status:"superseded", revenue_source_work_id:"W-20260729-077",
    
    next_action:"Do not execute; follow the current canonical successor work item."
  },
  {
    id:"hcwi_rev4m_w_20261020_011", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Paperclip private digital-workforce task bridge", details:"Revenue reconciliation overlay for W-20261020-011. Original four-month source status: POSITIVE_SIGNAL. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 102; source work reference W-20261020-011.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261020-011",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:102,
    revenue_status:"queued", revenue_source_work_id:"W-20261020-011",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Scale only the isolated pilot; compare value against existing HAE/One Brain before any permanent adoption"
  },
  {
    id:"hcwi_rev4m_w_20260725_078", project_id:"revenue-academy", workstream:"academy", priority:"p2",
    title:"[REVENUE] Evaluate 100Hires integration only if it improves the canonical Hermes recruiting pipeline", details:"Revenue reconciliation overlay for W-20260725-078. Original four-month source status: SUPERSEDED. This source is superseded and retained for audit only. Never revive or auto-unlock it. Estimated first-win target: $1. Monetization path: Convert one learner/candidate/company into a paid Academy or recruiting-related outcome; minimum accepted financial proof is $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 103; source work reference W-20260725-078.",
    status:"cancelled", created_at:"2026-07-25T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260725-078",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:103,
    revenue_status:"superseded", revenue_source_work_id:"W-20260725-078",
    
    next_action:"Do not execute; follow the current canonical successor work item."
  },
  {
    id:"hcwi_rev4m_w_20260910_067", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Configurable Massage/Wellness vertical on shared Hermes Connect core", details:"Revenue reconciliation overlay for W-20260910-067. Original four-month source status: IDEA_EVIDENCE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 104; source work reference W-20260910-067.",
    status:"blocked", created_at:"2026-09-10T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260910-067",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:104,
    revenue_status:"queued", revenue_source_work_id:"W-20260910-067",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Build no dedicated Massage backend; if current core already supports it, mark capability proven with one safe test profile and owner review"
  },
  {
    id:"hcwi_rev4m_w_20261008_040", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] I am cross-border life execution network — Italy/Tax Free MVP", details:"Revenue reconciliation overlay for W-20261008-040. Original four-month source status: IDEA_EVIDENCE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 105; source work reference W-20261008-040.",
    status:"blocked", created_at:"2026-10-08T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261008-040",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:105,
    revenue_status:"queued", revenue_source_work_id:"W-20261008-040",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Validate provider/legal feasibility first; then run one bounded MVP. Scale only on task-completion/context-reuse/verified-outcome evidence."
  },
  {
    id:"hcwi_rev4m_w_20261020_010", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Opt-in Carrier Sales D1 intake with zero automatic outbound", details:"Revenue reconciliation overlay for W-20261020-010. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 106; source work reference W-20261020-010.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261020-010",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:106,
    revenue_status:"queued", revenue_source_work_id:"W-20261020-010",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"No outbound automation. A no-response is not an engineering defect. HAE may later detect thread-state only; it cannot qualify missing facts or contact prospect."
  },
  {
    id:"hcwi_rev4m_w_20260829_070", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Owner Control Center for bounded AI execution and evidence", details:"Revenue reconciliation overlay for W-20260829-070. Original four-month source status: SUPERSEDED. This source is superseded and retained for audit only. Never revive or auto-unlock it. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 107; source work reference W-20260829-070.",
    status:"cancelled", created_at:"2026-08-29T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260829-070",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:107,
    revenue_status:"superseded", revenue_source_work_id:"W-20260829-070",
    
    next_action:"Do not execute; follow the current canonical successor work item."
  },
  {
    id:"hcwi_rev4m_w_20261023_025", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] HAE post-gate reliability hardening — historical parent", details:"Revenue reconciliation overlay for W-20261023-025. Original four-month source status: SUPERSEDED. This source is superseded and retained for audit only. Never revive or auto-unlock it. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 108; source work reference W-20261023-025.",
    status:"cancelled", created_at:"2026-10-23T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261023-025",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:108,
    revenue_status:"superseded", revenue_source_work_id:"W-20261023-025",
    
    next_action:"Do not execute; follow the current canonical successor work item."
  },
  {
    id:"hcwi_rev4m_w_20261016_022", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Hermes business telephony integration", details:"Revenue reconciliation overlay for W-20261016-022. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Produce one real paid logistics outcome. Conservative first-win reference: 5% margin on a $750 load = $37.50; financial gate itself is minimum $1 settled. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 109; source work reference W-20261016-022.",
    status:"blocked", created_at:"2026-10-16T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261016-022",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:109,
    revenue_status:"queued", revenue_source_work_id:"W-20261016-022",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Preserve missed-call/SLA requirements; resume provider/current-state evaluation only after explicit owner instruction"
  },
  {
    id:"hcwi_rev4m_w_20260816_076", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] One evidence-driven customer path engine across Hermes directions", details:"Revenue reconciliation overlay for W-20260816-076. Original four-month source status: SUPERSEDED. This source is superseded and retained for audit only. Never revive or auto-unlock it. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 110; source work reference W-20260816-076.",
    status:"cancelled", created_at:"2026-08-16T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20260816-076",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:110,
    revenue_status:"superseded", revenue_source_work_id:"W-20260816-076",
    
    next_action:"Do not execute; follow the current canonical successor work item."
  },
  {
    id:"hcwi_rev4m_w_20261002_052", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Owner-authorized Repair Meta + website update sync with failure alerts", details:"Revenue reconciliation overlay for W-20261002-052. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 111; source work reference W-20261002-052.",
    status:"blocked", created_at:"2026-10-02T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261002-052",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:111,
    revenue_status:"queued", revenue_source_work_id:"W-20261002-052",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Do not work around missing Meta access. Preserve sync OFF until OAuth/provider ownership proof; route public publishing separately through approved owner flow"
  },
  {
    id:"hcwi_rev4m_w_20261010_038", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Reconcile Work.ua / Staff.am employer facts from canonical evidence", details:"Revenue reconciliation overlay for W-20261010-038. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert one qualified business into the $990 Launch website offer (or the next approved higher package); record payment, not only quote/lead. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 112; source work reference W-20261010-038.",
    status:"blocked", created_at:"2026-10-10T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261010-038",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:112,
    revenue_status:"queued", revenue_source_work_id:"W-20261010-038",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Use authenticated HR owner to correct only confirmed discrepancies; route SEO entity corroboration proof back to #204 lineage without reopening closed implementation or inventing employee counts."
  },
  {
    id:"hcwi_rev4m_w_20261025_107", project_id:"revenue-academy", workstream:"academy", priority:"p2",
    title:"[REVENUE] Academy real applicant → reviewed enrollment → learner evidence", details:"Revenue reconciliation overlay for W-20261025-107. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert one learner/candidate/company into a paid Academy or recruiting-related outcome; minimum accepted financial proof is $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 113; source work reference W-20261025-107.",
    status:"blocked", created_at:"2026-10-25T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261025-107",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:113,
    revenue_status:"queued", revenue_source_work_id:"W-20261025-107",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"OWNER_ACTION remains human reviewer assignment. In parallel, Technology/HR must route employment-intent GENERAL form submissions to HR review/dedupe rather than Sales; prove one exact-once ATS/canonical candidate receipt before claiming live intake."
  },
  {
    id:"hcwi_rev4m_w_20261015_023", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Remove legacy anonymous writer from AI_COMMAND_CENTER", details:"Revenue reconciliation overlay for W-20261015-023. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 114; source work reference W-20261015-023.",
    status:"blocked", created_at:"2026-10-15T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261015-023",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:114,
    revenue_status:"queued", revenue_source_work_id:"W-20261015-023",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"OWNER_ADMIN_PERMISSION_REMOVAL_GATE: remove the anonymous writer at AI_COMMAND_CENTER through owner/admin sharing surface, then re-read parent + descendants and require NO_ANONYMOUS_WRITER. Connector lane can verify but cannot remove the folder permission safely."
  },
  {
    id:"hcwi_rev4m_w_20261013_027", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Rotate/revoke exposed Twilio credential/identifier and verify consumer", details:"Revenue reconciliation overlay for W-20261013-027. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use this task only as an enabler for a commercial lane; count success only when a linked paid outcome produces at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 115; source work reference W-20261013-027.",
    status:"blocked", created_at:"2026-10-13T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261013-027",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:115,
    revenue_status:"queued", revenue_source_work_id:"W-20261013-027",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"If still active rotate/revoke immediately, replace consumer secret, sanitize current source/artifacts where authorized, rerun affected workflow and record history risk separately"
  },
  {
    id:"hcwi_rev4m_w_20261004_049", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Preserve atomic pre-send safety gateway without enabling autonomous sends", details:"Revenue reconciliation overlay for W-20261004-049. Original four-month source status: BLOCKED. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Use automation to remove the blocker for a direct revenue mission; technical success is not DONE until a linked paid outcome reaches $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 116; source work reference W-20261004-049.",
    status:"blocked", created_at:"2026-10-04T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"W-20261004-049",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:116,
    revenue_status:"queued", revenue_source_work_id:"W-20261004-049",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Preserve deterministic eligibility engine as safety infrastructure; outbound execution remains disabled until explicit future CEO policy and transport/auth proofs"
  },
  {
    id:"hcwi_rev4m_rev4m_20260910_cand6", project_id:"revenue-ai-operations", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Reactivate 6 historical candidates into real Logistics or Marketing/IT work", details:"Revenue reconciliation overlay for REV4M-20260910-CAND6. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Turn at least one reactivated candidate into a real revenue-producing assignment; count 100% only after linked paid outcome >= $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 117; source work reference REV4M-20260910-CAND6.",
    status:"blocked", created_at:"2026-09-10T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260910-CAND6",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:117,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260910-CAND6",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Analyze six candidates, activity/timezone and prior context; prepare role-fit offer, qualification, first assignment and measurable revenue attribution. External send remains owner-gated."
  },
  {
    id:"hcwi_rev4m_rev4m_20260910_sales_train", project_id:"revenue-logistics", workstream:"academy", priority:"p2",
    title:"[REVENUE] Finish Logistics sales training: carrier email/outreach + Hermes Load Board integrations", details:"Revenue reconciliation overlay for REV4M-20260910-SALES-TRAIN. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Training is complete only when a trained seller contributes to a settled logistics margin >= $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 118; source work reference REV4M-20260910-SALES-TRAIN.",
    status:"blocked", created_at:"2026-09-10T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260910-SALES-TRAIN",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:118,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260910-SALES-TRAIN",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Finish the two required training modules, test retention, assign live bounded sales work, and attribute first paid outcome."
  },
  {
    id:"hcwi_rev4m_rev4m_20260911_trainee", project_id:"revenue-academy", workstream:"academy", priority:"p2",
    title:"[REVENUE] Trainee Card + 2-week history analysis + hourly training plan", details:"Revenue reconciliation overlay for REV4M-20260911-TRAINEE. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: System is complete only after a trainee produces or supports a paid business result >= $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 119; source work reference REV4M-20260911-TRAINEE.",
    status:"blocked", created_at:"2026-09-11T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260911-TRAINEE",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:119,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260911-TRAINEE",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Build/finish canonical Trainee Card, completed/not-completed evidence, skills, schedule and first revenue-linked assignment."
  },
  {
    id:"hcwi_rev4m_rev4m_20260902_global_acq", project_id:"revenue-website-progresso", workstream:"academy", priority:"p2",
    title:"[REVENUE] Multilingual RU/UA + English B1+ acquisition across approved international markets", details:"Revenue reconciliation overlay for REV4M-20260902-GLOBAL-ACQ. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Convert international organic/distribution demand into at least one paid Hermes/ProgressoPro engagement; first reference $990 Launch website. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 120; source work reference REV4M-20260902-GLOBAL-ACQ.",
    status:"blocked", created_at:"2026-09-02T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260902-GLOBAL-ACQ",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:120,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260902-GLOBAL-ACQ",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Reconcile approved countries/languages, truthful vacancy/academy/investor pages, forms and 24h SLA; measure lead→qualified→paid."
  },
  {
    id:"hcwi_rev4m_rev4m_20260921_citations", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Business Profiles / Citations / Directories revenue system", details:"Revenue reconciliation overlay for REV4M-20260921-CITATIONS. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $690. Monetization path: Turn quality profile/citation work into one paid Local SEO engagement; reference $690/mo. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 121; source work reference REV4M-20260921-CITATIONS.",
    status:"blocked", created_at:"2026-09-21T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260921-CITATIONS",
    revenue_gate_usd:1, revenue_target_usd:690, revenue_actual_usd:0, revenue_rank:121,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260921-CITATIONS",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Build quality-only registry, map each profile to business direction + UTM + money page, measure inquiry→payment; no mass spam."
  },
  {
    id:"hcwi_rev4m_rev4m_20260814_repair_outreach", project_id:"revenue-website-progresso", workstream:"sales", priority:"p2",
    title:"[REVENUE] Repair-center outreach → brief → second conversation → paid website/SEO/SMM engagement", details:"Revenue reconciliation overlay for REV4M-20260814-REPAIR-OUTREACH. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $990. Monetization path: Close one repair-center/hotshot/truck service business into at least the $990 Launch website or another paid approved service. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 122; source work reference REV4M-20260814-REPAIR-OUTREACH.",
    status:"blocked", created_at:"2026-08-14T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260814-REPAIR-OUTREACH",
    revenue_gate_usd:1, revenue_target_usd:990, revenue_actual_usd:0, revenue_rank:122,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260814-REPAIR-OUTREACH",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Build ranked repair-center list, hook/probing/solution/CTA, collect permissioned email, brief, review and quote; external outreach owner-gated."
  },
  {
    id:"hcwi_rev4m_rev4m_20261005_opportunities", project_id:"revenue-partnerships", workstream:"sales", priority:"p2",
    title:"[REVENUE] Opportunities → Work With Hermes: careers, owner-operators, agencies, referrals, white-label, strategic partners, investors", details:"Revenue reconciliation overlay for REV4M-20261005-OPPORTUNITIES. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $500. Monetization path: Produce at least one paid/referral/partner outcome >= $1; working reference $500 first commercial pilot. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 123; source work reference REV4M-20261005-OPPORTUNITIES.",
    status:"blocked", created_at:"2026-10-05T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20261005-OPPORTUNITIES",
    revenue_gate_usd:1, revenue_target_usd:500, revenue_actual_usd:0, revenue_rank:123,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20261005-OPPORTUNITIES",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Finish evidence-safe intent pages and cross-division routing, then measure qualified inquiry→commercial outcome instead of page count."
  },
  {
    id:"hcwi_rev4m_rev4m_20261003_cha_ads", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Car Hauling dispatch ad funnel: real form delivery → qualified carrier → paid dispatch margin", details:"Revenue reconciliation overlay for REV4M-20261003-CHA-ADS. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: One real carrier from the funnel must produce settled margin >= $1; conservative reference $37.50. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 124; source work reference REV4M-20261003-CHA-ADS.",
    status:"blocked", created_at:"2026-10-03T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20261003-CHA-ADS",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:124,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20261003-CHA-ADS",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Fix/verify real lead persistence/delivery, then run bounded traffic only after end-to-end receipt exists; attribute carrier→load→margin."
  },
  {
    id:"hcwi_rev4m_rev4m_20261011_dealercenter", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] DealerCenter → real transport order → settled 5%/8% margin", details:"Revenue reconciliation overlay for REV4M-20261011-DEALERCENTER. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Complete one real DealerCenter-origin transport order and settle margin >= $1; 5% of $750 = $37.50 reference. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 125; source work reference REV4M-20261011-DEALERCENTER.",
    status:"blocked", created_at:"2026-10-11T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20261011-DEALERCENTER",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:125,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20261011-DEALERCENTER",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Reconcile calculator economics, qualify real dealer opportunity, move order through dispatch and payment; 8% only when carrier agreement supports it."
  },
  {
    id:"hcwi_rev4m_rev4m_20260814_carrier_sign", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Carrier presentation → intake → Review & Sign Agreement → dispatched paid load", details:"Revenue reconciliation overlay for REV4M-20260814-CARRIER-SIGN. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $60. Monetization path: One signed 8% carrier agreement must progress to a settled load; 8% of $750 = $60 reference. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 126; source work reference REV4M-20260814-CARRIER-SIGN.",
    status:"blocked", created_at:"2026-08-14T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260814-CARRIER-SIGN",
    revenue_gate_usd:1, revenue_target_usd:60, revenue_actual_usd:0, revenue_rank:126,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260814-CARRIER-SIGN",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Connect current presentation/intake to final agreement review/signing and onboarding; then dispatch first paid load with receipt."
  },
  {
    id:"hcwi_rev4m_rev4m_20260729_loadsync", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Completed-trip history → route intelligence + authorized Load Board synchronization", details:"Revenue reconciliation overlay for REV4M-20260729-LOADSYNC. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $37.5. Monetization path: Use synchronized authorized load intelligence to produce a settled logistics margin >= $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 127; source work reference REV4M-20260729-LOADSYNC.",
    status:"blocked", created_at:"2026-07-29T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260729-LOADSYNC",
    revenue_gate_usd:1, revenue_target_usd:37.5, revenue_actual_usd:0, revenue_rank:127,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260729-LOADSYNC",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Use completed-trip history as route source, dedupe/normalize authorized loads into Hermes, then prove one load→dispatch→payment outcome."
  },
  {
    id:"hcwi_rev4m_rev4m_20260929_social", project_id:"revenue-website-progresso", workstream:"marketing", priority:"p2",
    title:"[REVENUE] Threads/Instagram autonomous content + timing test → attributable inquiry → paid outcome", details:"Revenue reconciliation overlay for REV4M-20260929-SOCIAL. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $690. Monetization path: Turn autonomous social distribution into one attributable paid engagement; $690/mo reference for Local SEO/SMM-adjacent recurring value. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 128; source work reference REV4M-20260929-SOCIAL.",
    status:"blocked", created_at:"2026-09-29T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260929-SOCIAL",
    revenue_gate_usd:1, revenue_target_usd:690, revenue_actual_usd:0, revenue_rank:128,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260929-SOCIAL",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Run approved one-week timing/content experiment, collect platform analytics and attribution, optimize only on real qualified inquiries/revenue; external engagement remains policy-bounded."
  },
  {
    id:"hcwi_rev4m_rev4m_20260707_carrier_crm_templates", project_id:"revenue-logistics", workstream:"logistics", priority:"p2",
    title:"[REVENUE] Carrier CRM templates → sellable operational setup", details:"Revenue reconciliation overlay for REV4M-20260707-CARRIER-CRM-TEMPLATES. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Package the existing carrier CRM templates into a usable paid carrier-operations setup; no approved historical package price is assumed, so the financial proof gate starts at $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 129; source work reference REV4M-20260707-CARRIER-CRM-TEMPLATES.",
    status:"blocked", created_at:"2026-07-07T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260707-CARRIER-CRM-TEMPLATES",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:129,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260707-CARRIER-CRM-TEMPLATES",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Reconcile the existing carrier CRM templates, validate one real carrier workflow, prepare the smallest sellable setup and record the first verified paid use; technical template completion alone is not 100%."
  },
  {
    id:"hcwi_rev4m_rev4m_20260811_fr_leadgen", project_id:"revenue-website-progresso", workstream:"academy", priority:"p2",
    title:"[REVENUE] French-language social lead-generation funnel → paid course / web-app / SEO outcome", details:"Revenue reconciliation overlay for REV4M-20260811-FR-LEADGEN. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Convert French-market Threads/Instagram/Facebook/LinkedIn demand into at least one verified paid Hermes/ProgressoPro outcome; mixed offers mean no unsupported package price is assumed. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 130; source work reference REV4M-20260811-FR-LEADGEN.",
    status:"blocked", created_at:"2026-08-11T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260811-FR-LEADGEN",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:130,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260811-FR-LEADGEN",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Build the French-language channel/script/evidence plan, qualify real demand and prepare the smallest owner-approved outreach/offer path; measure qualified conversation → paid outcome."
  },
  {
    id:"hcwi_rev4m_rev4m_20260813_competitive_intel", project_id:"revenue-ai-operations", workstream:"technology", priority:"p2",
    title:"[REVENUE] Hermes competitive intelligence → commercial decision → paid outcome", details:"Revenue reconciliation overlay for REV4M-20260813-COMPETITIVE-INTEL. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Competitive research is not complete when a report exists; it must change a commercial offer, targeting or sales decision that produces a verified financial benefit of at least $1. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 131; source work reference REV4M-20260813-COMPETITIVE-INTEL.",
    status:"blocked", created_at:"2026-08-13T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260813-COMPETITIVE-INTEL",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:131,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260813-COMPETITIVE-INTEL",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Consolidate the existing competitive-intelligence project into one current decision packet tied to an active revenue mission, then measure whether the resulting offer/targeting change contributes to paid revenue."
  },
  {
    id:"hcwi_rev4m_rev4m_20260825_media_partnerships", project_id:"revenue-partnerships", workstream:"sales", priority:"p2",
    title:"[REVENUE] Hermes media partnerships → referral / registration / paid business outcome", details:"Revenue reconciliation overlay for REV4M-20260825-MEDIA-PARTNERSHIPS. Original four-month source status: NOT_FINANCIAL_DONE. CEO rule: 100% requires verified actual revenue/financial benefit >= $1; code, CI, deploy, lead, quote, training, research or technical acceptance alone are not completion. Estimated first-win target: $1. Monetization path: Turn a real media/partner relationship into a verified referral, repair-shop registration that progresses commercially, or another paid financial benefit of at least $1; partnership activity alone is not 100%. Canonical planning source is One Brain REVENUE_4M_BACKLOG row 132; source work reference REV4M-20260825-MEDIA-PARTNERSHIPS.",
    status:"blocked", created_at:"2026-08-25T00:00:00.000Z",
    source_kind:"one_brain_revenue_4m", source_label:"REVENUE_4M_BACKLOG", source_ref:"REV4M-20260825-MEDIA-PARTNERSHIPS",
    revenue_gate_usd:1, revenue_target_usd:1, revenue_actual_usd:0, revenue_rank:132,
    revenue_status:"queued", revenue_source_work_id:"REV4M-20260825-MEDIA-PARTNERSHIPS",
    blocked_reason:"REVENUE_SEQUENCE_WAIT: active=W-20261026-109; unlock only after verified $1+ receipt on the active mission or explicit owner reprioritization.",
    next_action:"Use the existing Partnerships identity and async/resource-first approach to prepare one evidence-safe partnership path; record the attributable commercial outcome before marking complete."
  }
]);

const IMPORT_KEY="owner_revenue_backlog_2026-11-06_v4";
function clean(value,max=10000){return typeof value==="string"?value.replace(/\u0000/g,"").trim().slice(0,max):"";}

export async function seedFourMonthRevenueBacklog(db){
  if(!db?.prepare)return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_command_center_imports (
    import_key TEXT PRIMARY KEY,
    imported_at TEXT NOT NULL
  )`).run();
  const already=await db.prepare("SELECT import_key FROM hermes_command_center_imports WHERE import_key=? LIMIT 1").bind(IMPORT_KEY).first();
  if(already)return;
  for(const item of FOUR_MONTH_REVENUE_BACKLOG){
    await db.prepare(`INSERT OR IGNORE INTO hermes_owner_work_items
      (id,organization_scope,workstream,priority,title,details,source,status,created_by,created_at,updated_at,project_id,
       completed_at,acceptance_status,blocked_reason,source_kind,source_label,source_ref,next_action,
       revenue_gate_usd,revenue_target_usd,revenue_actual_usd,revenue_rank,revenue_status,revenue_source_work_id)
      VALUES (?,'hermes_internal',?,?,?,?,'imported',?,'revenue_4m_import',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(
        item.id,item.workstream,item.priority,clean(item.title,160),clean(item.details),item.status,
        item.created_at,item.created_at,item.project_id??null,item.status==="cancelled"?item.created_at:null,
        item.status==="cancelled"?"accepted":"not_required",item.blocked_reason??null,
        item.source_kind,clean(item.source_label,240),clean(item.source_ref,1000),clean(item.next_action,2000),
        item.revenue_gate_usd,item.revenue_target_usd,item.revenue_actual_usd,item.revenue_rank,item.revenue_status,item.revenue_source_work_id
      ).run();
  }
  await db.prepare("INSERT OR IGNORE INTO hermes_command_center_imports (import_key,imported_at) VALUES (?,?)")
    .bind(IMPORT_KEY,"2026-11-06T00:00:00.000Z").run();
}
