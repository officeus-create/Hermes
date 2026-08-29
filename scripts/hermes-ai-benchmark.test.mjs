import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classifyEvidenceScope } from "./ai/hermes-ai-benchmark.mjs";

const root = new URL("..", import.meta.url).pathname;
const tempDir = await mkdtemp(join(tmpdir(), "hermes-ai-benchmark-"));
const repositoryTempDir = await mkdtemp(join(root, ".hermes-ai-benchmark-"));
try {
  const result = spawnSync(process.execPath, ["scripts/ai/hermes-ai-benchmark.mjs", "--case", "current-state", "--output-dir", tempDir, "--dry-run"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.runners.length, 2);
  assert.equal(payload.runners[0].command, "codex");
  assert.match(payload.runners[1].command, /scripts\/ai\/codex-hermes$/);
  assert.match(payload.runners[0].args.join(" "), /--sandbox read-only/);
  assert.match(payload.promptHash, /^[a-f0-9]{64}$/);
  const repositoryPrompt = spawnSync(process.execPath, ["scripts/ai/hermes-ai-benchmark.mjs", "--prompt-file", "docs/HERMES_AI_BENCHMARK.md", "--output-dir", tempDir, "--dry-run"], { cwd: root, encoding: "utf8" });
  assert.equal(repositoryPrompt.status, 0, repositoryPrompt.stderr);
  const externalPrompt = spawnSync(process.execPath, ["scripts/ai/hermes-ai-benchmark.mjs", "--prompt-file", tempDir, "--output-dir", tempDir, "--dry-run"], { cwd: root, encoding: "utf8" });
  assert.notEqual(externalPrompt.status, 0);
  assert.match(externalPrompt.stderr, /--prompt-file must resolve to a file inside this repository/);
  const externalPromptFile = join(tempDir, "external-prompt.txt");
  const symlinkedPrompt = join(repositoryTempDir, "external-prompt.txt");
  await writeFile(externalPromptFile, "Read AGENTS.md only.");
  await symlink(externalPromptFile, symlinkedPrompt);
  const symlinkedExternalPrompt = spawnSync(process.execPath, ["scripts/ai/hermes-ai-benchmark.mjs", "--prompt-file", symlinkedPrompt, "--output-dir", tempDir, "--dry-run"], { cwd: root, encoding: "utf8" });
  assert.notEqual(symlinkedExternalPrompt.status, 0);
  assert.match(symlinkedExternalPrompt.stderr, /--prompt-file must resolve to a file inside this repository/);
  assert.equal(classifyEvidenceScope("Read /Users/progressopro/Hermes/docs/AI_START_HERE.md").status, "REPOSITORY_ONLY_OBSERVED");
  assert.deepEqual(classifyEvidenceScope("Read /Users/progressopro/.codex/memories/MEMORY.md"), {
    status: "REVIEW_REQUIRED_OUTSIDE_REPOSITORY_READ",
    outsideRepositoryReadCount: 1,
  });
  assert.deepEqual(classifyEvidenceScope("I inspected ~/.codex/memories before answering"), {
    status: "REVIEW_REQUIRED_OUTSIDE_REPOSITORY_READ",
    outsideRepositoryReadCount: 0,
  });
  const benchmarkSource = await readFile(new URL("./ai/hermes-ai-benchmark.mjs", import.meta.url), "utf8");
  assert.match(benchmarkSource, /Repository-only execution protocol:/);
  assert.match(benchmarkSource, /git worktree list/);
  assert.match(benchmarkSource, /repository-relative sources you actually read/);
  console.log("Hermes AI benchmark contract passed: matched prompts, read-only runners, repository-only protocol, and local ledger contract.");
} finally {
  await rm(tempDir, { recursive: true, force: true });
  await rm(repositoryTempDir, { recursive: true, force: true });
}
