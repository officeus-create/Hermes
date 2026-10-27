import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { executeBoundedRepair } from "./hae-bounded-repair-executor.mjs";

function run(cwd, command, args, env = process.env) {
  const r = spawnSync(command, args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(command + " failed: " + r.stderr);
  return r.stdout.trim();
}
function fixture({ passing = false, unsafe = false } = {}) {
  const repo = mkdtempSync(path.join(os.tmpdir(), "hae-repair-fixture-"));
  mkdirSync(path.join(repo, "scripts"), { recursive: true });
  run(repo, "git", ["init", "-b", "main"]);
  run(repo, "git", ["config", "user.email", "hae-fixture@example.invalid"]);
  run(repo, "git", ["config", "user.name", "HAE Fixture"]);
  const rel = "scripts/hae-executor-fixture.test.mjs";
  const initial = [
    'import assert from "node:assert/strict";',
    'assert.equal(process.env.GH_TOKEN, undefined);',
    ...(unsafe ? ['fetch("https://example.com");'] : []),
    passing ? "assert.equal(1, 1);" : "assert.equal(0, 1);",
  ].join("\n") + "\n";
  writeFileSync(path.join(repo, rel), initial);
  run(repo, "git", ["add", rel]);
  run(repo, "git", ["commit", "-m", "fixture"]);
  const base = run(repo, "git", ["rev-parse", "HEAD"]);
  return { repo, rel, base, initial };
}
function candidate(f) {
  const old = "assert.equal(0, 1);";
  const replacement = "assert.equal(1, 1);";
  const lines = f.initial.trimEnd().split("\n");
  const lineNo = lines.indexOf(old) + 1;
  assert.ok(lineNo > 0);
  const body = [
    "diff --git a/" + f.rel + " b/" + f.rel,
    "--- a/" + f.rel,
    "+++ b/" + f.rel,
    "@@ -" + lineNo + " +"+ lineNo + " @@",
    "-" + old,
    "+" + replacement,
    "",
  ].join("\n");
  return {
    job_type: "hae.self.repair.packet",
    work_id: "HAE-SELF:EXECUTOR_FIXTURE",
    finding_id: "EXECUTOR_FIXTURE",
    source_status: "HOLD_REPAIR",
    source_coverage_complete: true,
    finding_verified: true,
    writer_state_verified: true,
    writer_active: false,
    base_sha: f.base,
    observed_base_sha: f.base,
    artifact_key: f.rel,
    allowed_paths: [f.rel],
    diff: body,
    writer_role: "hermes-automatic-engineer",
    independent_verifier_role: "hermes-qa-evidence-auditor",
    defect_evidence_ref: "HAE-EVIDENCE:EXECUTOR_FIXTURE",
  };
}

const f = fixture();
try {
  process.env.GH_TOKEN = "MUST_NOT_LEAK_TO_PATCH_TEST";
  process.env.CLOUDFLARE_HAE_RELEASE_TOKEN = "MUST_NOT_LEAK_EITHER";
  const result = executeBoundedRepair({ repoRoot: f.repo, input: candidate(f) });
  assert.equal(result.candidate_status, "HOLD_INDEPENDENT_QA");
  assert.equal(result.execution_state, "PATCH_EXECUTED_IN_EPHEMERAL_DETACHED_WORKTREE");
  assert.equal(result.pre_patch_test.attempts, 2);
  assert.equal(result.post_patch_test.attempts, 2);
  assert.ok(result.pre_patch_test.runs.every((r) => r.exit_code !== 0));
  assert.ok(result.post_patch_test.runs.every((r) => r.exit_code === 0));
  assert.equal(result.node_permission_mode.filesystem_write_allowed, false);
  assert.equal(result.automatic_git_provider_write, false);
  assert.equal(result.automatic_d1_or_queue_write, false);
  assert.equal(result.automatic_merge, false);
  assert.equal(result.automatic_deploy, false);
  assert.equal(result.paid_ai_cost_usd, 0);
  assert.match(result.patch_sha256, /^sha256:[a-f0-9]{64}$/);
  assert.match(result.patched_file_sha256, /^sha256:[a-f0-9]{64}$/);
  assert.equal(readFileSync(path.join(f.repo, f.rel), "utf8"), f.initial, "primary worktree must remain unchanged");
  assert.equal(run(f.repo, "git", ["status", "--porcelain"]), "");
  assert.equal(run(f.repo, "git", ["branch", "--format=%(refname:short)"]), "main");
} finally {
  delete process.env.GH_TOKEN;
  delete process.env.CLOUDFLARE_HAE_RELEASE_TOKEN;
  rmSync(f.repo, { recursive: true, force: true });
}

const alreadyPassing = fixture({ passing: true });
try {
  const input = candidate({
    ...alreadyPassing,
    initial: alreadyPassing.initial.replace("assert.equal(1, 1);", "assert.equal(0, 1);"),
  });
  input.diff = input.diff.replace("-assert.equal(0, 1);", "-assert.equal(1, 1);").replace("+assert.equal(1, 1);", "+assert.equal(2, 2);");
  assert.throws(
    () => executeBoundedRepair({ repoRoot: alreadyPassing.repo, input }),
    /hae_repair_executor_blocked:repair_not_reproduced/,
  );
} finally {
  rmSync(alreadyPassing.repo, { recursive: true, force: true });
}

const notFixed = fixture();
try {
  const input = candidate(notFixed);
  input.diff = input.diff.replace("+assert.equal(1, 1);", "+assert.equal(0, 2);");
  assert.throws(
    () => executeBoundedRepair({ repoRoot: notFixed.repo, input }),
    /hae_repair_executor_blocked:repair_not_fixed/,
  );
  assert.equal(run(notFixed.repo, "git", ["status", "--porcelain"]), "");
} finally {
  rmSync(notFixed.repo, { recursive: true, force: true });
}

const unsafe = fixture({ unsafe: true });
try {
  assert.throws(
    () => executeBoundedRepair({ repoRoot: unsafe.repo, input: candidate(unsafe) }),
    /hae_repair_executor_blocked:unsafe_base_test_source/,
  );
} finally {
  rmSync(unsafe.repo, { recursive: true, force: true });
}

// Regression: passing by terminating Node is not a repaired assertion.
for (const [label, replacement] of [
  ["process_alias", "const p = process;\n+p.exit(0);"],
  ["process_destructure", "const { exit } = process;\n+exit(0);"],
  ["global_alias", "const g = globalThis;\n+g.process.exit(0);"],
]) {
  const aliasFixture = fixture();
  try {
    const input = candidate(aliasFixture);
    input.diff = input.diff.replace("@@ -3 +3 @@", "@@ -3 +3,2 @@")
      .replace("+assert.equal(1, 1);", "+" + replacement);
    assert.throws(
      () => executeBoundedRepair({ repoRoot: aliasFixture.repo, input }),
      /(?:hae_repair_blocked:unsafe_added_code|hae_repair_executor_blocked:unsafe_base_test_source)/,
      label,
    );
    assert.equal(run(aliasFixture.repo, "git", ["status", "--porcelain"]), "");
  } finally {
    rmSync(aliasFixture.repo, { recursive: true, force: true });
  }
}

const missingBase = fixture();
try {
  const input = candidate(missingBase);
  input.base_sha = "f".repeat(40);
  input.observed_base_sha = input.base_sha;
  assert.throws(
    () => executeBoundedRepair({ repoRoot: missingBase.repo, input }),
    /hae_repair_executor_blocked:base_sha_not_found/,
  );
} finally {
  rmSync(missingBase.repo, { recursive: true, force: true });
}

console.log("HAE_BOUNDED_REPAIR_EXECUTOR_PASS", JSON.stringify({
  patch_only: true,
  deterministic_pre_and_post_attempts: 2,
  provider_writes: 0,
  git_branches_or_commits: 0,
  d1_queue_writes: 0,
  deploys: 0,
  paid_ai_cost_usd: 0,
}));
