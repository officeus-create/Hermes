const SHA40 = /^[0-9a-f]{40}$/;
const PROOF_REQUIRED_STATES = new Set(["LIVE_VERIFIED", "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW"]);

function bool(value) {
  return value === true;
}

function proofOk(proof, key) {
  return proof?.[key] === true;
}

export function auditHaeState(snapshot = {}) {
  const findings = [];
  const currentMain = String(snapshot.current_main_sha || "").trim();
  const claimedState = String(snapshot.claimed_state || "UNKNOWN").trim().toUpperCase();
  const phase = String(snapshot.gate_phase || "READ_ONLY_RELIABILITY").trim().toUpperCase();
  const runtime = snapshot.runtime || {};
  const pr = snapshot.pr || {};

  if (!SHA40.test(currentMain)) {
    findings.push({ code: "CURRENT_MAIN_UNKNOWN", severity: "BLOCKER" });
  }

  if (Number.isFinite(Number(pr.behind_by)) && Number(pr.behind_by) > 0) {
    findings.push({ code: "PR_STALE_TO_CURRENT_MAIN", severity: "BLOCKER", value: Number(pr.behind_by) });
  }

  if (pr.exact_scope_verified !== true) {
    findings.push({ code: "PR_SCOPE_UNVERIFIED", severity: "BLOCKER" });
  }

  if (phase === "READ_ONLY_RELIABILITY") {
    if (typeof runtime.publication_enabled !== "boolean") {
      findings.push({ code: "PUBLICATION_GATE_UNKNOWN", severity: "UNKNOWN" });
    } else if (bool(runtime.publication_enabled)) {
      findings.push({ code: "PUBLICATION_GATE_VIOLATION", severity: "BLOCKER" });
    }
  }

  const runtimeSha = String(runtime.source_sha || "").trim();
  if (!runtimeSha) {
    findings.push({ code: "RUNTIME_SOURCE_SHA_UNKNOWN", severity: "UNKNOWN" });
  } else if (!SHA40.test(runtimeSha)) {
    findings.push({ code: "RUNTIME_SOURCE_SHA_INVALID", severity: "BLOCKER" });
  } else if (snapshot.expected_runtime_sha && runtimeSha !== String(snapshot.expected_runtime_sha)) {
    findings.push({
      code: "RUNTIME_SOURCE_DRIFT",
      severity: "BLOCKER",
      expected: String(snapshot.expected_runtime_sha),
      actual: runtimeSha,
    });
  }

  const requiredLiveProof = claimedState === "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW"
    ? [
        "authenticated_deployment",
        "private_health",
        "d1",
        "queue",
        "dlq",
        "cron_heartbeat",
        "read_only_job_receipt",
        "idempotency_replay",
        "dry_run",
        "publication_disabled",
        "independent_qa",
      ]
    : claimedState === "LIVE_VERIFIED"
      ? [
          "authenticated_deployment",
          "private_health",
          "d1",
          "queue",
          "dlq",
          "cron_heartbeat",
          "idempotency_replay",
          "independent_qa",
        ]
      : [];
  const missingLiveProof = requiredLiveProof.filter((key) => !proofOk(runtime.proof, key));

  if (PROOF_REQUIRED_STATES.has(claimedState) && missingLiveProof.length) {
    findings.push({
      code: claimedState === "LIVE_VERIFIED" ? "FALSE_LIVE_CLAIM" : "RUNTIME_PROOF_INCOMPLETE",
      severity: "BLOCKER",
      missing: missingLiveProof,
    });
  }

  if (runtime.metrics_unknown_as_zero === true) {
    findings.push({ code: "UNKNOWN_COERCED_TO_ZERO", severity: "BLOCKER" });
  }

  if (snapshot.plugin?.installed === true && PROOF_REQUIRED_STATES.has(claimedState) && runtime.proof == null) {
    findings.push({ code: "PLUGIN_MISTAKEN_FOR_RUNTIME", severity: "BLOCKER" });
  }

  const blockers = findings.filter((item) => item.severity === "BLOCKER");
  const unknowns = findings.filter((item) => item.severity === "UNKNOWN");

  return {
    status: blockers.length ? "BLOCKED" : unknowns.length ? "UNKNOWN" : "CONSISTENT",
    blockers,
    unknowns,
    findings,
    live_proof_complete: missingLiveProof.length === 0,
    missing_live_proof: missingLiveProof,
  };
}
