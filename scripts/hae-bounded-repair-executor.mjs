import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { preflightHaeRepairCandidate } from "../workers/automation-engine/src/hae-bounded-repair-preflight.mjs";

const RECEIPT_VERSION = "hae-bounded-repair-executor-v1";
const TEST_TIMEOUT_MS = 30_000;
const LOCAL_GIT_COMMANDS = new Set(["rev-parse", "cat-file", "worktree", "status", "apply", "diff"]);
const SAFE_TEST_SOURCE_BLOCKLIST = [
  /\bchild_process\b/i,
  /\b(?:fetch|WebSocket|EventSource)\s*\(/,
  /\b(?:http|https|net|tls|dns|dgram)\s*(?:\.|\[)/,
  /(?:from\s+|import\s*\(|require\s*\()\s*["'](?:node:)?(?:http|https|net|tls|dns|dgram|child_process)/,
  /https?:\/\//i,
  /\bprocess\s*\.\s*(?:kill|exit|abort)\s*\(/,
  /\b(?:eval|Function)\s*\(/,
];

function hash(value) {
  return "sha256:" + createHash("sha256").update(value).digest("hex");
}
function blocked(reason) {
  const error = new Error("hae_repair_executor_blocked:" + reason);
  error.code = "HAE_REPAIR_EXECUTOR_BLOCKED";
  throw error;
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    input: options.input,
    encoding: "utf8",
    timeout: options.timeout ?? 20_000,
    maxBuffer: 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.error) {
    if (result.error.code === "ETIMEDOUT") blocked("command_timeout");
    blocked("command_execution_error");
  }
  return {
    status: Number.isInteger(result.status) ? result.status : 255,
    signal: result.signal || null,
    stdout: String(result.stdout || ""),
    stderr: String(result.stderr || ""),
  };
}
function git(repoRoot, args, options = {}) {
  if (!Array.isArray(args) || !LOCAL_GIT_COMMANDS.has(args[0])) blocked("git_command_not_allowlisted");
  return run("git", ["-c", "credential.helper=", "-c", "core.hooksPath=/dev/null", ...args], {
    cwd: repoRoot,
    env: {
      PATH: process.env.PATH || "/usr/bin:/bin",
      HOME: options.home || os.tmpdir(),
      GIT_TERMINAL_PROMPT: "0",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_OPTIONAL_LOCKS: "0",
      LANG: "C",
      LC_ALL: "C",
    },
    input: options.input,
    timeout: options.timeout,
  });
}
function assertSafeTestSource(source) {
  if (typeof source !== "string" || source.length > 250_000) blocked("invalid_test_source");
  for (const pattern of SAFE_TEST_SOURCE_BLOCKLIST) {
    if (pattern.test(source)) blocked("unsafe_base_test_source");
  }
}
function summarizeRun(result) {
  return Object.freeze({
    exit_code: result.status,
    signal: result.signal,
    stdout_bytes: Buffer.byteLength(result.stdout),
    stderr_bytes: Buffer.byteLength(result.stderr),
    stdout_sha256: hash(result.stdout),
    stderr_sha256: hash(result.stderr),
  });
}
function runIsolatedTest(workspace, artifactKey, homeDir) {
  const env = {
    PATH: process.env.PATH || "/usr/bin:/bin",
    HOME: homeDir,
    CI: "1",
    TZ: "UTC",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    HERMES_HAE_PATCH_ONLY: "1",
  };
  const result = run(process.execPath, [
    "--permission",
    "--allow-fs-read=" + workspace,
    path.join(workspace, artifactKey),
  ], {
    cwd: workspace,
    env,
    timeout: TEST_TIMEOUT_MS,
  });
  return summarizeRun(result);
}
function ensureSameOutcome(runs, expectedZero) {
  if (!Array.isArray(runs) || runs.length !== 2) blocked("invalid_test_attempt_count");
  const zeroes = runs.map((item) => item.exit_code === 0);
  if (zeroes[0] !== zeroes[1]) blocked("nondeterministic_test_outcome");
  if (expectedZero && !zeroes[0]) blocked("repair_not_fixed");
  if (!expectedZero && zeroes[0]) blocked("repair_not_reproduced");
}
function exactChangedPath(workspace, artifactKey, homeDir) {
  const status = git(workspace, ["status", "--porcelain=v1", "--untracked-files=no"], { home: homeDir });
  if (status.status !== 0) blocked("git_status_failed");
  const lines = status.stdout.trimEnd().split("\n").filter(Boolean);
  if (lines.length !== 1) blocked("unexpected_workspace_changes");
  const changedPath = lines[0].slice(3).trim();
  if (changedPath !== artifactKey) blocked("unexpected_workspace_path");
}
function safeRemoveWorktree(repoRoot, workspace, homeDir) {
  const remove = git(repoRoot, ["worktree", "remove", "--force", workspace], { home: homeDir, timeout: 20_000 });
  if (remove.status !== 0) {
    try { fs.rmSync(workspace, { recursive: true, force: true }); } catch {}
  }
  git(repoRoot, ["worktree", "prune"], { home: homeDir });
}

export function executeBoundedRepair({ repoRoot, input }) {
  const candidate = preflightHaeRepairCandidate(input);
  const requestedRepo = path.resolve(String(repoRoot || ""));
  if (!fs.existsSync(path.join(requestedRepo, ".git"))) blocked("repo_root_not_git_worktree");
  const absoluteRepo = fs.realpathSync(requestedRepo);

  const rootCheck = git(absoluteRepo, ["rev-parse", "--show-toplevel"]);
  if (rootCheck.status !== 0) blocked("repo_root_mismatch");
  const canonicalGitRoot = fs.realpathSync(rootCheck.stdout.trim());
  if (canonicalGitRoot !== absoluteRepo) blocked("repo_root_mismatch");

  const baseCheck = git(absoluteRepo, ["cat-file", "-e", candidate.base_sha + "^{commit}"]);
  if (baseCheck.status !== 0) blocked("base_sha_not_found");

  const tempRoot = fs.mkdtempSync(path.join(path.dirname(absoluteRepo), ".hae-repair-exec-"));
  const workspace = path.join(tempRoot, "worktree");
  const isolatedHome = path.join(tempRoot, "home");
  fs.mkdirSync(isolatedHome, { mode: 0o700 });

  let receipt = null;
  let cleanupPerformed = false;
  try {
    const add = git(absoluteRepo, ["worktree", "add", "--detach", workspace, candidate.base_sha], {
      home: isolatedHome,
      timeout: 30_000,
    });
    if (add.status !== 0) blocked("detached_worktree_create_failed");

    const head = git(workspace, ["rev-parse", "HEAD"], { home: isolatedHome });
    if (head.status !== 0 || head.stdout.trim() !== candidate.base_sha) blocked("detached_head_mismatch");

    const artifactPath = path.join(workspace, candidate.artifact_key);
    if (!fs.existsSync(artifactPath)) blocked("artifact_not_found_at_base");
    const artifactStat = fs.lstatSync(artifactPath);
    if (!artifactStat.isFile() || artifactStat.isSymbolicLink()) blocked("artifact_not_regular_file");
    assertSafeTestSource(fs.readFileSync(artifactPath, "utf8"));

    const preRuns = [
      runIsolatedTest(workspace, candidate.artifact_key, isolatedHome),
      runIsolatedTest(workspace, candidate.artifact_key, isolatedHome),
    ];
    ensureSameOutcome(preRuns, false);

    const check = git(workspace, ["apply", "--check", "--whitespace=error-all", "-"], {
      home: isolatedHome,
      input: input.diff,
    });
    if (check.status !== 0) blocked("git_apply_check_failed");
    const apply = git(workspace, ["apply", "--whitespace=nowarn", "-"], {
      home: isolatedHome,
      input: input.diff,
    });
    if (apply.status !== 0) blocked("git_apply_failed");

    exactChangedPath(workspace, candidate.artifact_key, isolatedHome);
    const diffCheck = git(workspace, ["diff", "--check", "--", candidate.artifact_key], { home: isolatedHome });
    if (diffCheck.status !== 0 || diffCheck.stdout.trim() || diffCheck.stderr.trim()) blocked("patched_diff_check_failed");

    const patchedSource = fs.readFileSync(artifactPath, "utf8");
    assertSafeTestSource(patchedSource);
    const postRuns = [
      runIsolatedTest(workspace, candidate.artifact_key, isolatedHome),
      runIsolatedTest(workspace, candidate.artifact_key, isolatedHome),
    ];
    ensureSameOutcome(postRuns, true);

    const changed = git(workspace, ["diff", "--numstat", "--", candidate.artifact_key], { home: isolatedHome });
    if (changed.status !== 0 || changed.stdout.trim().split("\n").filter(Boolean).length !== 1) blocked("unexpected_diff_summary");

    receipt = Object.freeze({
      receipt_version: RECEIPT_VERSION,
      work_id: candidate.work_id,
      finding_id: candidate.finding_id,
      artifact_key: candidate.artifact_key,
      base_sha: candidate.base_sha,
      patch_sha256: candidate.patch_sha256,
      patched_file_sha256: hash(patchedSource),
      defect_evidence_ref: candidate.defect_evidence_ref,
      writer_role: input.writer_role,
      required_independent_verifier: candidate.required_independent_verifier,
      execution_state: "PATCH_EXECUTED_IN_EPHEMERAL_DETACHED_WORKTREE",
      candidate_status: "HOLD_INDEPENDENT_QA",
      pre_patch_test: Object.freeze({ attempts: 2, runs: Object.freeze(preRuns) }),
      post_patch_test: Object.freeze({ attempts: 2, runs: Object.freeze(postRuns) }),
      node_permission_mode: Object.freeze({
        enabled: true,
        filesystem_read_scope: "EPHEMERAL_WORKTREE_ONLY",
        filesystem_write_allowed: false,
        child_process_allowed: false,
        addons_allowed: false,
      }),
      environment_policy: "MINIMAL_ALLOWLIST_NO_GITHUB_OR_PROVIDER_TOKENS",
      automatic_branch_creation: false,
      automatic_commit: false,
      automatic_git_provider_write: false,
      automatic_d1_or_queue_write: false,
      automatic_merge: false,
      automatic_deploy: false,
      knowledge_auto_promotion: false,
      production_change_performed: false,
      paid_ai_cost_usd: 0,
      next_action: "INDEPENDENT_QA_BIND_RECEIPT_THEN_HOLD_RELEASE",
    });
  } finally {
    safeRemoveWorktree(absoluteRepo, workspace, isolatedHome);
    try { fs.rmSync(tempRoot, { recursive: true, force: true }); cleanupPerformed = true; } catch {}
  }
  if (!cleanupPerformed) blocked("ephemeral_workspace_cleanup_failed");
  return receipt;
}
