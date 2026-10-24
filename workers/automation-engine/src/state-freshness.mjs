const SHA40 = /^[0-9a-f]{40}$/;
const PROOF_REQUIRED_STATES = new Set(["LIVE_VERIFIED", "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW"]);
const KNOWN_GATE_PHASES = new Set(["READ_ONLY_RELIABILITY", "PROVIDER_LIVE"]);

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
  const rawPhase = String(snapshot.gate_phase || "").trim().toUpperCase();
  const phase = rawPhase || "READ_ONLY_RELIABILITY";
  const runtime = snapshot.runtime || {};
  const pr = snapshot.pr || {};
  const proofRequired = PROOF_REQUIRED_STATES.has(claimedState);

  if (!KNOWN_GATE_PHASES.has(phase)) {
    findings.push({ code: "GATE_PHASE_UNKNOWN", severity: proofRequired ? "BLOCKER" : "UNKNOWN", value: rawPhase });
  }

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

  const expectedRuntimeSha = String(snapshot.expected_runtime_sha || "").trim();
  if (proofRequired && !expectedRuntimeSha) {
    findings.push({ code: "EXPECTED_RUNTIME_SHA_UNKNOWN", severity: "BLOCKER" });
  } else if (proofRequired && !SHA40.test(expectedRuntimeSha)) {
    findings.push({ code: "EXPECTED_RUNTIME_SHA_INVALID", severity: "BLOCKER" });
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

  if (proofRequired && missingLiveProof.length) {
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
    live_proof_complete: proofRequired
      && KNOWN_GATE_PHASES.has(phase)
      && SHA40.test(expectedRuntimeSha)
      && runtimeSha === expectedRuntimeSha
      && missingLiveProof.length === 0,
    missing_live_proof: proofRequired ? missingLiveProof : null,
  };
}
