#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "../..");
const defaultOutputDir = resolve(process.env.HERMES_AI_HOME || `${process.env.HOME}/.hermes-ai`, "benchmarks");

export const CASES = {
  "current-state": `Read AGENTS.md, docs/AI_START_HERE.md, ai-collaboration/00_READ_FIRST/CURRENT_STATE.md and ai-collaboration/00_READ_FIRST/HERMES_OPERATING_STACK.md.

Do not modify files or make external requests.

Find the three highest-value tasks that can be executed safely right now. For each give: evidence, expected business impact, exact next action, blockers, and confidence. Do not invent missing evidence.`,
  "bug-triage": `Read AGENTS.md, docs/ERROR_REGISTER.md and the relevant current-state documents. Do not modify files or make external requests.

Identify one active, repository-verifiable problem whose smallest safe next step is local-only. Give exact evidence, affected files or commands, a bounded fix hypothesis, risks, and the tests that would prove it. Do not invent missing evidence.`,
  "code-review": `Read AGENTS.md and inspect the current working tree without modifying files or making external requests.

Review the smallest changed or recently added Hermes runtime-related implementation you can verify. Report only actionable findings with severity, exact evidence, likely impact, and a minimal repair. If there are no verified findings, say so plainly.`,
  "seo-planning": `Read AGENTS.md, docs/ai-project-state.json, docs/ERROR_REGISTER.md and ai-collaboration/02_SEO/CURRENT_STATE.md. Do not modify files or make external requests.

Propose one evidence-gated SEO action for the existing canonical commercial owners. State the verified baseline, expected business impact, exact next action, blockers, and confidence. Do not propose new doorway pages or fabricate performance data.`,
};

const WORKSPACE_BOUNDARY = `

Repository-only execution protocol:
- Treat the current working directory as the only readable workspace. Use only repository-relative file paths and commands executed from that directory.
- Read only the files named in this task and any repository-relative file directly needed to verify a claim. Do not browse for other projects, worktrees, branches, user memories, or historical transcripts.
- Do not inspect or mention ~/.codex, ~/.codex-hermes, ~/.hermes-ai, $HOME, /Users, /private, /tmp, environment variables, configuration files outside this repository, external sources, or any other location.
- Do not run broad discovery commands outside the repository (including find .., rg outside the repository, git worktree list, or commands that enumerate other branches or directories).
- If repository sources are insufficient, state that limitation instead of searching elsewhere. In the final response, list only the repository-relative sources you actually read.`;

function usage() {
  return `Usage: scripts/ai/hermes-ai-benchmark.mjs [--case <name>] [--prompt-file <path>] [--output-dir <path>] [--timeout-seconds <n>] [--dry-run]\n\nCases: ${Object.keys(CASES).join(", ")}`;
}

function parseArgs(argv) {
  const options = { caseName: "current-state", outputDir: defaultOutputDir, timeoutSeconds: 300, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--case") options.caseName = argv[++index];
    else if (arg === "--prompt-file") options.promptFile = argv[++index];
    else if (arg === "--output-dir") options.outputDir = resolve(argv[++index]);
    else if (arg === "--timeout-seconds") options.timeoutSeconds = Number(argv[++index]);
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isFinite(options.timeoutSeconds) || options.timeoutSeconds < 15 || options.timeoutSeconds > 1800) {
    throw new Error("--timeout-seconds must be between 15 and 1800");
  }
  return options;
}

function run(command, args, { cwd, timeoutSeconds }) {
  return new Promise((resolveRun) => {
    const startedAt = new Date();
    const child = spawn(command, args, { cwd, env: { ...process.env, NO_COLOR: "1" }, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutSeconds * 1000);
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolveRun({ command, args, exitCode, signal, timedOut, startedAt: startedAt.toISOString(), finishedAt: new Date().toISOString(), durationMs: Date.now() - startedAt.getTime(), stdout, stderr });
    });
  });
}

function modelFrom(output) {
  return output.match(/^model:\s*(.+)$/m)?.[1]?.trim() || "NOT_REPORTED";
}

function isPathWithin(candidate, directory) {
  const pathFromDirectory = relative(directory, candidate);
  return pathFromDirectory === "" || (!pathFromDirectory.startsWith(`..${sep}`) && pathFromDirectory !== ".." && !isAbsolute(pathFromDirectory));
}

async function repositoryPromptFile(promptFile) {
  const [repositoryPath, promptPath] = await Promise.all([
    realpath(repoRoot),
    realpath(resolve(promptFile)),
  ]);
  if (!isPathWithin(promptPath, repositoryPath)) {
    throw new Error("--prompt-file must resolve to a file inside this repository");
  }
  return promptPath;
}

export function classifyEvidenceScope(output) {
  const repositoryPath = repoRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Keep this intentionally conservative across macOS and Linux. The evidence
  // gate must not certify a run merely because an external path uses a home
  // directory prefix that was absent from a local developer fixture.
  const candidatePaths = output.match(/\/(?:Users|home|private|var|tmp|opt|etc|usr|Volumes|System)\/[^\s'"`)<>{},;]+/g) || [];
  const outsideRepositoryReads = [...new Set(candidatePaths.filter((path) => !new RegExp(`^${repositoryPath}(?:/|$)`).test(path)))];
  const forbiddenLocationMentions = /(?:~\/(?:\.codex(?:-hermes)?|\.hermes-ai)|\$(?:HOME|USERPROFILE))/i.test(output);
  return {
    status: outsideRepositoryReads.length || forbiddenLocationMentions ? "REVIEW_REQUIRED_OUTSIDE_REPOSITORY_READ" : "REPOSITORY_ONLY_OBSERVED",
    outsideRepositoryReadCount: outsideRepositoryReads.length,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return console.log(usage());
  const basePrompt = options.promptFile ? await readFile(await repositoryPromptFile(options.promptFile), "utf8") : CASES[options.caseName];
  const prompt = basePrompt && `${basePrompt.trim()}${WORKSPACE_BOUNDARY}`;
  if (!prompt) throw new Error(`Unknown case '${options.caseName}'. ${usage()}`);

  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${options.caseName}`;
  const outputDir = resolve(options.outputDir, runId);
  const sharedArgs = ["exec", "--sandbox", "read-only", "--ephemeral", prompt];
  const runners = [
    { id: "direct", command: "codex", args: sharedArgs },
    { id: "hermes", command: resolve(repoRoot, "scripts/ai/codex-hermes"), args: sharedArgs },
  ];

  if (options.dryRun) {
    console.log(JSON.stringify({ runId, outputDir, promptHash: createHash("sha256").update(prompt).digest("hex"), runners }, null, 2));
    return;
  }

  await mkdir(outputDir, { recursive: true, mode: 0o700 });
  const results = [];
  for (const runner of runners) {
    const result = await run(runner.command, runner.args, { cwd: repoRoot, timeoutSeconds: options.timeoutSeconds });
    const transcriptPath = resolve(outputDir, `${runner.id}.log`);
    await writeFile(transcriptPath, `${result.stdout}${result.stderr}`, { mode: 0o600 });
    const output = `${result.stdout}\n${result.stderr}`;
    results.push({
      runner: runner.id,
      success: result.exitCode === 0 && !result.timedOut,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      durationMs: result.durationMs,
      modelUsed: modelFrom(output),
      evidenceScope: classifyEvidenceScope(output),
      transcript: basename(transcriptPath),
      review: { factualErrors: "NOT_REVIEWED", evidenceQuality: "NOT_REVIEWED", codeQuality: "NOT_APPLICABLE", ownerInterventions: "NOT_REVIEWED", finalScore: "NOT_REVIEWED" },
    });
  }
  const ledger = {
    schemaVersion: 1,
    runId,
    case: options.promptFile ? "custom" : options.caseName,
    repository: repoRoot,
    promptHash: createHash("sha256").update(prompt).digest("hex"),
    safety: "Both runners use Codex read-only sandbox and ephemeral sessions. No external action is requested by the benchmark prompt.",
    results,
    reviewerInstructions: "Review transcripts side by side. A pair is comparable only when both evidenceScope statuses are REPOSITORY_ONLY_OBSERVED. Do not infer factual accuracy, quality, or fallback use from a successful exit code alone.",
  };
  await writeFile(resolve(outputDir, "ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ outputDir, ledger: "ledger.json", results: results.map(({ stdout, stderr, ...safe }) => safe) }, null, 2));
}

if (process.argv[1] === scriptPath) {
  main().catch((error) => {
    console.error(`[hermes-ai-benchmark] ${error.message}`);
    process.exitCode = 1;
  });
}
