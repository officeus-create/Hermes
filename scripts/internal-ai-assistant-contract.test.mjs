import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const page = read("src/pages/services/hermes-connect/internal/ai-assistant/index.astro");
const connectExperience = read("src/components/HermesConnectExperience.astro");
const helper = read("functions/api/_lib/internal-ai.mjs");
const tasks = read("functions/api/internal-ai/tasks.ts");
const item = read("functions/api/internal-ai/tasks/[id].ts");
const claim = read("functions/api/internal-ai/runner/claim.ts");
const runnerTaskEndpoint = read("functions/api/internal-ai/runner/task.ts");
const complete = read("functions/api/internal-ai/runner/complete.ts");
const event = read("functions/api/internal-ai/runner/event.ts");
const runner = read("scripts/ai/hermes-internal-ai-runner.py");
const codexHermes = read("scripts/ai/codex-hermes");
const sanitizerPath = resolve(root, "scripts/ai/hermes-internal-ai-sanitize.py");
const sanitizer = read("scripts/ai/hermes-internal-ai-sanitize.py");
const bootstrap = read("functions/api/internal-ai/bootstrap-owner.ts");
const internalNav = read("src/components/HermesConnectInternalAiNav.astro");
assert.match(page, /robots="noindex,nofollow"/, "internal AI page must stay noindex");
assert.match(page, /<HermesConnectExperience\s*\/>/, "internal AI page must reuse canonical Hermes Connect experience");
assert.match(page, /AI Assistant/, "embedded slice must identify itself as AI Assistant");
assert.doesNotMatch(page, /Owner Control Center|AI Workforce|remote terminal/i, "must not revive a control-center or remote-shell product inside the AI Assistant route");
assert.match(page, /Repair Shop and ordinary Hermes Connect accounts cannot access internal AI tasks/, "customer denial must be explicit");
assert.match(connectExperience, /data-hc-internal-ai-link/, "canonical Connect shell must expose an owner-only native AI Assistant entry");
assert.match(connectExperience, /\/api\/internal-ai\/status/, "cabinet entry must be discovered through the server-side owner gate");
assert.match(connectExperience, /!response\.ok \|\| !payload\?\.success/, "cabinet entry must fail closed for anonymous and customer sessions");
assert.match(helper, /hermes_internal_owner_access/, "internal owner access must be a separate server-side access record");
assert.match(helper, /HERMES_INTERNAL_OWNER/, "capability name must remain explicit");
assert.doesNotMatch(helper, /HERMES_OWNER_EMAIL|email domain/i, "access must not infer a personal/email-domain identity");
assert.match(helper, /organization_scope TEXT NOT NULL CHECK \(organization_scope = 'hermes_internal'\)/, "task storage must be internal tenant scoped");
assert.match(helper, /\[REDACTED_TOKEN\]/, "execution output must be sanitized");
assert.match(helper, /hermes_internal_owner_required/, "task API must fail closed for non-owner sessions");
const publicTaskBody = helper.match(/export function publicTask\(row\) \{[\s\S]*?\n\}/)?.[0] || "";
const runnerTaskBody = helper.match(/export function runnerTask\(row\) \{[\s\S]*?\n\}/)?.[0] || "";
assert.ok(publicTaskBody, "public owner task DTO must exist");
assert.doesNotMatch(publicTaskBody, /prompt\s*:/, "stored prompts must not be serialized into owner-facing browser APIs");
assert.match(runnerTaskBody, /prompt:\s*row\.prompt/, "authenticated runner DTO must retain the task prompt for execution");
assert.match(tasks, /organization_scope = \?/, "task reads must include the internal tenant scope");
assert.match(tasks, /active_task_exists/, "only one active task is allowed");
assert.match(item, /csrf_origin_mismatch/, "task cancellation must reject cross-origin requests");
assert.match(item, /task_not_found/, "task access must not reveal a cross-tenant record");
assert.match(claim, /status = 'queued'/, "runner may only claim queued work");
assert.match(claim, /running_task_requires_reconciliation/, "runner restart must fail closed");
assert.match(claim, /runnerTask\(/, "runner claim may receive the private prompt-bearing DTO");
assert.match(runnerTaskEndpoint, /runnerTask\(/, "runner state polling may receive the private prompt-bearing DTO");
assert.match(complete, /needs_approval/, "real approval state must be represented");
assert.match(complete, /approval_gate_required/, "approval state needs a defined consequential gate");
assert.match(event, /organization_scope, task_id, event_type/, "events must be internal tenant scoped");
assert.match(runner, /subprocess\.Popen\(/, "runner invokes Codex through an argument array");
assert.doesNotMatch(runner, /shell\s*=\s*True/, "runner must never interpolate task text into a shell");
assert.doesNotMatch(runner, /socket\.|listen\(|HTTPServer|Flask|FastAPI/, "runner remains outbound-only with no remote shell");
assert.match(runner, /switch", "-c", branch/, "runner isolates each task branch");
assert.match(runner, /HERMES_INTERNAL_APPROVAL_GATE/, "runner must record an explicit consequential approval stop");
assert.match(runner, /status="needs_approval"/, "runner must surface a documented approval gate instead of treating it as success");
assert.match(runner, /CODEX_AUTONOMOUS_ARGS = \("--sandbox", "workspace-write", "--approve-for-me"\)/, "runner must use official safe autonomous approval inside workspace-write");
assert.match(runner, /\[str\(CODEX_HERMES\), "exec", \*CODEX_AUTONOMOUS_ARGS, guarded_prompt\]/, "runner must pass safe autonomous options to codex exec before the task prompt");
assert.doesNotMatch(runner, /dangerously-bypass-approvals-and-sandbox|--yolo/, "runner must never bypass Codex sandbox or approvals entirely");
assert.match(codexHermes, /unset HERMES_INTERNAL_AI_RUNNER_TOKEN/, "runner transport token must be scrubbed before FCC/Codex starts");
assert.match(codexHermes, /unset HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN/, "one-time owner bootstrap token must never be inherited by FCC/Codex");
assert.match(codexHermes, /RUNNER_SANITIZE=0/, "manual codex-hermes and Internal AI runner execution must remain distinguishable");
assert.match(codexHermes, /HERMES_INTERNAL_AI_RUNNER_TOKEN:-/, "runner sanitizer selection must be derived only from the parent runner context before token scrubbing");
assert.match(codexHermes, /python3 \"\$SANITIZER\"/, "Internal AI runner output must pass through the streaming sanitizer before returning to the runner");
assert.match(codexHermes, /PIPESTATUS/, "wrapper must preserve FCC/Codex and sanitizer exit status separately");
assert.match(codexHermes, /sanitizer failed; refusing to treat output as safe evidence/, "sanitizer failure must fail closed");
assert.match(codexHermes, /exec \"\$FCC_CODEX\" \"\$@\"/, "manual codex-hermes usage must retain the ordinary direct exec path");
assert.match(sanitizer, /REDACTED_PRIVATE_KEY_BLOCK/, "streaming sanitizer must suppress private-key bodies");
assert.match(sanitizer, /GITHUB_TOKEN/, "streaming sanitizer must recognize GitHub token shapes");
assert.match(sanitizer, /OPENAI_STYLE_KEY/, "streaming sanitizer must recognize common API-key shapes");
assert.match(sanitizer, /JWT_TOKEN/, "streaming sanitizer must recognize JWT-shaped output");
assert.match(sanitizer, /BEARER_TOKEN/, "streaming sanitizer must recognize bearer credentials without requiring key-value punctuation");
const sanitizerProbe = [
  "Authorization: Bearer super-secret-bearer-1234567890",
  "token=plain-secret-token-1234567890",
  "https://example.test/?access_token=url-secret-1234567890&ok=1",
  "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  "sk-proj-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature1234567890",
  "-----BEGIN PRIVATE KEY-----",
  "PRIVATEKEYBODYSHOULDNEVERLEAK",
  "-----END PRIVATE KEY-----",
  "HERMES_INTERNAL_APPROVAL_GATE=merge_deploy",
].join("\n");
const sanitizerRun = spawnSync("python3", [sanitizerPath], { input: sanitizerProbe, encoding: "utf8" });
assert.equal(sanitizerRun.status, 0, `sanitizer probe must exit 0: ${sanitizerRun.stderr}`);
assert.doesNotMatch(
  sanitizerRun.stdout,
  /super-secret|plain-secret|url-secret|ghp_|sk-proj-|eyJhbGci|PRIVATEKEYBODYSHOULDNEVERLEAK/,
  "synthetic credential values must not survive the streaming sanitizer",
);
assert.match(sanitizerRun.stdout, /\[REDACTED/, "synthetic credential values must be visibly replaced rather than silently trusted");
assert.match(sanitizerRun.stdout, /HERMES_INTERNAL_APPROVAL_GATE=merge_deploy/, "non-secret governance markers must survive redaction");
assert.match(bootstrap, /getAuthenticatedSpecialist\(request, env\.DB\)/, "owner bootstrap must bind only the current authenticated Hermes session");
assert.match(bootstrap, /HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN/, "bootstrap must require a separate server-side activation secret");
assert.match(bootstrap, /MIN_BOOTSTRAP_SECRET_LENGTH = 32/, "bootstrap secret must meet a strong minimum length");
assert.match(bootstrap, /timingSafeEqualText\(supplied, expected\)/, "bootstrap secret comparison must be timing-safe");
assert.match(bootstrap, /csrf_origin_mismatch/, "owner bootstrap must reject cross-origin mutations");
assert.match(bootstrap, /Cache-Control.*no-store/, "owner bootstrap responses must never be cached");
assert.match(bootstrap, /WHERE specialist_id = \? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER'/, "bootstrap must be idempotent for the current owner");
assert.match(bootstrap, /internal_owner_already_provisioned/, "one-time bootstrap must close after an internal owner exists");
assert.match(bootstrap, /ON CONFLICT\(specialist_id\) DO UPDATE SET active = 1/, "bootstrap may only upsert the authenticated specialist id");
assert.doesNotMatch(bootstrap, /body\.specialist_id|body\.email|body\.role|HERMES_OWNER_EMAIL/, "bootstrap must never select the owner from client identity fields");
assert.match(internalNav, /type="password"/, "activation secret must use a password input");
assert.match(internalNav, /\/api\/internal-ai\/bootstrap-owner/, "AI cabinet activation must call the bounded bootstrap endpoint");
assert.match(internalNav, /method:\s*"POST"/, "activation secret must never be placed in a URL query");
assert.match(internalNav, /input\.value = ""/, "activation UI must clear the one-time secret after success");
console.log("Hermes internal AI Assistant contract: PASS");