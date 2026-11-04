import {
  ensureHaeProcessSchema,
  haeProcessEventStatement,
  haeProcessTemplate,
} from "../../../src/lib/hae-process-control.mjs";

const SCOPE = "hermes_internal";

function addHoursIso(value, hours) {
  return new Date(new Date(value).getTime() + Number(hours) * 60 * 60 * 1000).toISOString();
}

function safeErrorClass(error) {
  const value = String(error?.message || "owner_process_dispatch_failed").trim();
  return /^[a-z][a-z0-9_]{2,79}$/.test(value) ? value : "owner_process_dispatch_failed";
}

export async function ownerManagedJobTypes(db) {
  await ensureHaeProcessSchema(db);
  const result = await db.prepare(
    "SELECT job_type FROM hermes_automation_processes WHERE organization_scope=?",
  ).bind(SCOPE).all();
  return new Set((result?.results || []).map((row) => String(row.job_type)));
}

export async function enqueueDueOwnerProcesses(env, scheduledAt, {
  createJob,
  buildPayload,
  contractForJobType,
  accountKey,
}) {
  if (!env?.DB || !env?.AUTOMATION_QUEUE) return 0;
  await ensureHaeProcessSchema(env.DB);
  const scheduledIso = scheduledAt.toISOString();
  const due = await env.DB.prepare(`SELECT * FROM hermes_automation_processes
    WHERE organization_scope=? AND status='active' AND next_run_at IS NOT NULL AND next_run_at<=?
      AND (lease_until IS NULL OR lease_until<=?)
    ORDER BY next_run_at ASC LIMIT 20`).bind(SCOPE, scheduledIso, scheduledIso).all();
  let dispatched = 0;

  for (const process of due?.results || []) {
    const processId = String(process.process_id || "");
    const dueAt = String(process.next_run_at || "");
    const leaseUntil = addHoursIso(scheduledIso, 1);
    const claimed = await env.DB.prepare(`UPDATE hermes_automation_processes
      SET lease_until=?,updated_at=?
      WHERE process_id=? AND organization_scope=? AND status='active' AND next_run_at=?
        AND (lease_until IS NULL OR lease_until<=?)`).bind(
      leaseUntil,
      scheduledIso,
      processId,
      SCOPE,
      dueAt,
      scheduledIso,
    ).run();
    if (Number(claimed?.meta?.changes || 0) !== 1) continue;

    try {
      const template = haeProcessTemplate(process.job_type);
      const contract = contractForJobType(process.job_type);
      if (!template || !contract || contract.semantic_required || contract.permission_class !== "READ_ONLY") {
        throw new Error("owner_process_contract_not_allowed");
      }
      if (String(contract.role_id) !== String(process.role_id)
        || String(contract.business_lane) !== String(process.business_lane)) {
        throw new Error("owner_process_contract_drift");
      }
      const payload = await buildPayload(env, contract, scheduledAt);
      const result = await createJob(env, {
        job_type: contract.job_type,
        business_lane: contract.business_lane,
        account_key: accountKey,
        project_key: `hae-process:${processId}`,
        priority: 50,
        max_attempts: 3,
        internal_submission: true,
        idempotency_key: `hae:process:${processId}:${dueAt}`,
        policy_version: "hae-owner-process-v1",
        payload: {
          ...payload,
          trigger_type: "owner_process",
          process_id: processId,
          scheduled_at: scheduledIso,
          due_at: dueAt,
        },
      });
      const jobId = String(result?.job?.job_id || "");
      if (!jobId) throw new Error("owner_process_job_missing");
      const nextRunAt = addHoursIso(scheduledIso, Number(process.cadence_hours));
      await env.DB.batch([
        env.DB.prepare(`UPDATE hermes_automation_processes
          SET lease_until=NULL,last_run_at=?,last_job_id=?,last_error_class=NULL,next_run_at=?,updated_at=?
          WHERE process_id=? AND organization_scope=? AND lease_until=?`).bind(
          scheduledIso,
          jobId,
          nextRunAt,
          scheduledIso,
          processId,
          SCOPE,
          leaseUntil,
        ),
        haeProcessEventStatement(env.DB, {
          processId,
          eventType: "process.dispatched",
          fromStatus: "active",
          toStatus: "active",
          jobId,
          createdAt: scheduledIso,
        }),
      ]);
      dispatched += 1;
    } catch (error) {
      const errorClass = safeErrorClass(error);
      const blocked = ["owner_process_contract_not_allowed", "owner_process_contract_drift"].includes(errorClass);
      await env.DB.batch([
        env.DB.prepare(`UPDATE hermes_automation_processes
          SET status=?,lease_until=NULL,last_error_class=?,updated_at=?
          WHERE process_id=? AND organization_scope=? AND lease_until=?`).bind(
          blocked ? "blocked" : "active",
          errorClass,
          scheduledIso,
          processId,
          SCOPE,
          leaseUntil,
        ),
        haeProcessEventStatement(env.DB, {
          processId,
          eventType: blocked ? "process.blocked" : "process.dispatch_failed",
          fromStatus: "active",
          toStatus: blocked ? "blocked" : "active",
          errorClass,
          createdAt: scheduledIso,
        }),
      ]);
    }
  }
  return dispatched;
}
