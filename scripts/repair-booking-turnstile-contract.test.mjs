import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { verifyTurnstileToken } from "../functions/api/_lib/turnstile.mjs";
import { verifyGithubActionsOidcToken } from "../functions/api/_lib/github-actions-oidc.mjs";

const api = fs.readFileSync("functions/api/public/repair-booking.ts", "utf8");
const page = fs.readFileSync("src/pages/services/hermes-connect/repair-shops/booking.astro", "utf8");
const headers = fs.readFileSync("public/_headers", "utf8");
const baseline = JSON.parse(fs.readFileSync("config/cloudflare-pages-runtime-baseline.json", "utf8"));

const expectedOwners = [
  "repair-booking-production-smoke@hermesconnect.app",
  "repair-customer-crm-production-smoke@hermesconnect.app",
  "repair-cancel-rebook-production-smoke@hermesconnect.app",
];

assert.match(api, /TURNSTILE_REPAIR_BOOKING_SECRET/);
assert.match(api, /turnstile_token/);
assert.match(api, /verifyTurnstileToken/);
assert.match(api, /TURNSTILE_ACTION = "repair_booking"/);
assert.match(api, /TURNSTILE_HOSTNAMES = \["hermeslogisticsus\.com", "www\.hermeslogisticsus\.com"\]/);
for (const email of expectedOwners) assert.ok(api.includes(email), `Missing bounded synthetic owner ${email}`);
const postStart = api.indexOf("export async function onRequestPost");
const gateIndex = api.indexOf("verifyTurnstileToken({", postStart);
const serviceIndex = api.indexOf("const service = await getPublicService", postStart);
assert.ok(
  postStart >= 0 && gateIndex > postStart && serviceIndex > gateIndex,
  "Turnstile must run before real-shop service/availability/mutation work.",
);
const oidcIndex = api.indexOf("verifyGithubActionsOidcToken({", postStart);
assert.ok(oidcIndex > postStart && oidcIndex < gateIndex, "Synthetic bypass must validate GitHub Actions OIDC before Turnstile.");
assert.ok(api.includes("syntheticSmokeOwner &&"), "Synthetic email alone must never bypass Turnstile.");
assert.ok(api.includes('request.headers.get("X-Hermes-GitHub-OIDC")'), "Synthetic bypass must require the bounded OIDC header.");

assert.ok(page.includes('TURNSTILE_SITE_KEY="0x4AAAAAAE7nKOTna7wSyJem"'));
assert.ok(page.includes('TURNSTILE_ACTION="repair_booking"'));
assert.ok(page.includes("turnstile_token:turnstileToken"));
assert.ok(page.includes("render=explicit"));
assert.ok(page.includes('"expired-callback"'));
assert.ok(page.includes('"error-callback"'));
assert.doesNotMatch(page, /\\.innerHTML\\s*=/, "Repair booking runtime must not use innerHTML sinks");
assert.ok(headers.includes("script-src 'self' 'unsafe-inline' https://accounts.google.com https://challenges.cloudflare.com"));
assert.ok(headers.includes("connect-src 'self' https://accounts.google.com https://challenges.cloudflare.com"));
assert.ok(headers.includes("frame-src 'self' https://accounts.google.com https://challenges.cloudflare.com"));

assert.ok(baseline.production.secret_names.includes("TURNSTILE_REPAIR_BOOKING_SECRET"));
assert.ok(!baseline.preview.secret_names.includes("TURNSTILE_REPAIR_BOOKING_SECRET"));

const request = new Request("https://hermeslogisticsus.com/api/public/repair-booking", {
  method: "POST",
  headers: { "CF-Connecting-IP": "203.0.113.10" },
});
let requestBody = null;
const success = await verifyTurnstileToken({
  secret: "server-secret",
  token: "browser-token",
  request,
  expectedAction: "repair_booking",
  expectedHostnames: ["hermeslogisticsus.com", "www.hermeslogisticsus.com"],
  fetchImpl: async (_url, options) => {
    requestBody = JSON.parse(String(options.body));
    return new Response(
      JSON.stringify({ success: true, hostname: "hermeslogisticsus.com", action: "repair_booking" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
});
assert.equal(success.ok, true);
assert.equal(requestBody.response, "browser-token");
assert.equal(requestBody.remoteip, "203.0.113.10");
assert.equal(typeof requestBody.idempotency_key, "string");
assert.ok(requestBody.idempotency_key.length > 10);

const missingSecret = await verifyTurnstileToken({
  secret: "",
  token: "browser-token",
  request,
  expectedAction: "repair_booking",
  expectedHostnames: ["hermeslogisticsus.com"],
});
assert.deepEqual(missingSecret, { ok: false, status: 503, error: "verification_not_configured" });
const missingToken = await verifyTurnstileToken({
  secret: "server-secret",
  token: "",
  request,
  expectedAction: "repair_booking",
  expectedHostnames: ["hermeslogisticsus.com"],
});
assert.deepEqual(missingToken, { ok: false, status: 400, error: "verification_required" });

for (const payload of [
  { success: true, hostname: "hermeslogisticsus.com", action: "login" },
  { success: true, hostname: "evil.example", action: "repair_booking" },
]) {
  const failed = await verifyTurnstileToken({
    secret: "server-secret",
    token: "browser-token",
    request,
    expectedAction: "repair_booking",
    expectedHostnames: ["hermeslogisticsus.com"],
    fetchImpl: async () =>
      new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } }),
  });
  assert.deepEqual(failed, { ok: false, status: 403, error: "verification_failed" });
}

const providerFailure = await verifyTurnstileToken({
  secret: "server-secret",
  token: "browser-token",
  request,
  expectedAction: "repair_booking",
  expectedHostnames: ["hermeslogisticsus.com"],
  fetchImpl: async () => new Response("upstream error", { status: 503 }),
});
assert.deepEqual(providerFailure, { ok: false, status: 503, error: "verification_unavailable" });

const workflowPaths = [
  ".github/workflows/repair-booking-production-smoke.yml",
  ".github/workflows/repair-booking-concurrency-production-smoke.yml",
  ".github/workflows/repair-capacity-production-smoke.yml",
  ".github/workflows/repair-customer-crm-production-smoke.yml",
  ".github/workflows/repair-operations-production-smoke.yml",
  ".github/workflows/repair-cancel-rebook-production-smoke.yml",
  ".github/workflows/repair-p0-production-closure-command.yml",
  ".github/workflows/repair-p0-production-proof-v2-command.yml",
];
for (const path of workflowPaths) {
  const workflow = fs.readFileSync(path, "utf8");
  assert.ok(workflow.includes("id-token: write"), `Missing id-token permission: ${path}`);
}
const bookingProductionSmokeWorkflow = fs.readFileSync(".github/workflows/repair-booking-production-smoke.yml", "utf8");
const capacityProductionSmokeWorkflow = fs.readFileSync(".github/workflows/repair-capacity-production-smoke.yml", "utf8");
assert.ok(bookingProductionSmokeWorkflow.includes("randomBytes(24)"), "booking smoke password must be generated ephemerally at runtime");
assert.doesNotMatch(bookingProductionSmokeWorkflow, /PASSWORD=.*TEST_ID/, "booking smoke password must not be derived from the test id template");
assert.doesNotMatch(
  bookingProductionSmokeWorkflow,
  /REPAIR_ACCESS_STATE_PRODUCTION_WRITE=SKIPPED_CLOSED_REGISTRATION_WINDOW/,
  "Current free setup access must fail closed instead of treating a retired deadline gate as success.",
);
assert.match(
  bookingProductionSmokeWorkflow,
  /scripts\/lib\/repair-shop-rollout\.sh/,
  "Changes to the rollout retry policy must trigger the production booking smoke.",
);
const bookingProductionSmoke = fs.readFileSync("scripts/repair-booking-production-smoke.sh", "utf8");
assert.match(bookingProductionSmoke, /PAGES_HEAD_SHA/);
assert.match(bookingProductionSmoke, /PAGES_DEPLOYMENT_ID/);
assert.match(bookingProductionSmoke, /EXACT_DEPLOYED_SHA_CONFIRMED=true/);
assert.match(bookingProductionSmoke, /trap cleanup_smoke EXIT/);
assert.ok(
  bookingProductionSmoke.indexOf("trap cleanup_smoke EXIT") < bookingProductionSmoke.indexOf('REGISTER="'),
  "Fail-safe cleanup must be active before the first synthetic account write.",
);
assert.equal(
  (bookingProductionSmoke.match(/hermes_should_retry_repair_shop_rollout/g) || []).length,
  2,
  "Only registration and idempotent profile setup may retry the retired rollout gate.",
);
assert.doesNotMatch(bookingProductionSmoke, /REPAIR_BOOKING_PRODUCTION_WRITE=SKIPPED_SETUP_ACCESS_CLOSED/);

assert.match(capacityProductionSmokeWorkflow, /workflow_dispatch:/, "Capacity smoke must expose the bounded recovery dispatch.");
assert.match(
  capacityProductionSmokeWorkflow,
  /approved_main_guard:[\s\S]*if \[\[ "\$RELEASE_REF" != "refs\/heads\/main" \]\]; then[\s\S]*exit 1[\s\S]*smoke:[\s\S]*needs: approved_main_guard/,
  "A non-main capacity dispatch must fail before the production smoke job can start.",
);
assert.match(
  capacityProductionSmokeWorkflow,
  /push:\n\s+branches: \[main\][\s\S]*paths:[\s\S]*scripts\/repair-capacity-production-smoke\.sh/,
  "The existing path-filtered push-to-main capacity trigger must remain intact.",
);
assert.match(
  capacityProductionSmokeWorkflow,
  /concurrency:\n\s+group: repair-shop-capacity-production\n\s+cancel-in-progress: false/,
  "Capacity runs must remain serialized instead of cancelling an in-flight synthetic cleanup.",
);

const guardStep = capacityProductionSmokeWorkflow.match(
  /- name: Require the approved main ref[\s\S]*?\n\s{8}run: \|\n((?:\s{10}.*(?:\n|$))+)/,
);
assert.ok(guardStep, "Capacity smoke approved-main guard script must be extractable for behavior testing.");
const guardScript = guardStep[1]
  .split("\n")
  .map((line) => line.replace(/^\s{10}/, ""))
  .join("\n");
const runGuard = (ref) =>
  spawnSync("bash", ["-c", guardScript], {
    encoding: "utf8",
    env: { ...process.env, RELEASE_REF: ref, RELEASE_EVENT: "workflow_dispatch" },
  });
const acceptedMain = runGuard("refs/heads/main");
assert.equal(acceptedMain.status, 0, acceptedMain.stderr);
assert.match(acceptedMain.stdout, /Approved main ref accepted/);
const rejectedFeature = runGuard("refs/heads/feature/capacity-check");
assert.notEqual(rejectedFeature.status, 0, "Feature refs must be rejected before the production smoke starts.");
assert.match(rejectedFeature.stderr, /may run only from refs\/heads\/main/);

const capacityProductionSmoke = fs.readFileSync("scripts/repair-capacity-production-smoke.sh", "utf8");
assert.match(
  capacityProductionSmoke,
  /actions\/runs\?head_sha=\$\{GITHUB_SHA\}&event=push/,
  "Capacity serialization must bind the prerequisite booking proof to the exact checked-out SHA.",
);
assert.match(
  capacityProductionSmoke,
  /if \[\[ -z "\$\{GITHUB_SHA:-\}" \|\| -z "\$\{GITHUB_REPOSITORY:-\}" \|\| -z "\$\{GITHUB_TOKEN:-\}" \]\]; then[\s\S]*refusing an ungated production capacity smoke/,
  "Capacity smoke must fail closed when exact deployment metadata is unavailable.",
);

for (const scriptPath of ["scripts/lib/repair-shop-rollout.sh", "scripts/repair-booking-production-smoke.sh"]) {
  const syntax = spawnSync("bash", ["-n", scriptPath], { encoding: "utf8" });
  assert.equal(syntax.status, 0, `${scriptPath}: ${syntax.stderr}`);
}

const rolloutHelper = "scripts/lib/repair-shop-rollout.sh";
const shouldRetry = (...args) =>
  spawnSync(
    "bash",
    [
      "-c",
      'source "$1"; hermes_should_retry_repair_shop_rollout "$2" "$3" "$4" "$5" "$6"',
      "bash",
      rolloutHelper,
      ...args.map(String),
    ],
    { encoding: "utf8" },
  ).status === 0;
assert.equal(shouldRetry(true, 403, "repair_shop_free_registration_ended", 1, 6), true);
assert.equal(shouldRetry(false, 403, "repair_shop_free_registration_ended", 1, 6), false);
assert.equal(shouldRetry(true, 403, "repair_shop_setup_access_closed", 1, 6), false);
assert.equal(shouldRetry(true, 401, "repair_shop_free_registration_ended", 1, 6), false);
assert.equal(shouldRetry(true, 403, "repair_shop_free_registration_ended", 6, 6), false);
for (const path of [
  "scripts/repair-booking-production-smoke.sh",
  "scripts/repair-booking-concurrency-production-smoke.sh",
  "scripts/repair-capacity-production-smoke.sh",
  "scripts/repair-customer-crm-production-smoke.sh",
  "scripts/repair-operations-production-smoke.sh",
]) {
  const smoke = fs.readFileSync(path, "utf8");
  assert.ok(smoke.includes("github-actions-oidc.sh"), `Missing OIDC helper: ${path}`);
  assert.ok(smoke.includes("X-Hermes-GitHub-OIDC: $BOOKING_OIDC_TOKEN"), `Missing booking OIDC header: ${path}`);
}
const cancelWorkflow = fs.readFileSync(".github/workflows/repair-cancel-rebook-production-smoke.yml", "utf8");
assert.ok(cancelWorkflow.includes("source scripts/lib/github-actions-oidc.sh"));
assert.ok(cancelWorkflow.includes("BOOKING_OIDC_TOKEN=\"$(hermes_booking_oidc_token)\""));
assert.ok(cancelWorkflow.includes("X-Hermes-GitHub-OIDC: $BOOKING_OIDC_TOKEN"));
const p0Proof = fs.readFileSync("scripts/repair-p0-production-proof-v2.mjs", "utf8");
assert.ok(p0Proof.includes('headers["X-Hermes-GitHub-OIDC"] = await bookingOidcToken()'));

const nowSeconds = Math.floor(Date.now() / 1000);
const workflowRef = "officeus-create/Hermes/.github/workflows/repair-booking-production-smoke.yml@refs/heads/main";
const oidcAudience = "https://hermeslogisticsus.com/api/public/repair-booking";
const keyPair = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true,
  ["sign", "verify"],
);
const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
Object.assign(publicJwk, { kid: "turnstile-contract-test", alg: "RS256", use: "sig" });
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const oidcHeader = encode({ alg: "RS256", typ: "JWT", kid: publicJwk.kid });
const oidcClaims = encode({
  iss: "https://token.actions.githubusercontent.com",
  aud: oidcAudience,
  repository: "officeus-create/Hermes",
  repository_owner: "officeus-create",
  ref: "refs/heads/main",
  event_name: "push",
  runner_environment: "github-hosted",
  workflow_ref: workflowRef,
  iat: nowSeconds - 5,
  nbf: nowSeconds - 5,
  exp: nowSeconds + 300,
});
const signingInput = `${oidcHeader}.${oidcClaims}`;
const signature = Buffer.from(
  await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyPair.privateKey, new TextEncoder().encode(signingInput)),
).toString("base64url");
const signedOidc = `${signingInput}.${signature}`;
const jwksFetch = async () =>
  new Response(JSON.stringify({ keys: [publicJwk] }), { status: 200, headers: { "Content-Type": "application/json" } });

assert.equal(
  await verifyGithubActionsOidcToken({
    token: signedOidc,
    expectedAudience: oidcAudience,
    allowedWorkflowRefs: [workflowRef],
    fetchImpl: jwksFetch,
  }),
  true,
);
assert.equal(
  await verifyGithubActionsOidcToken({
    token: signedOidc,
    expectedAudience: "https://evil.example/",
    allowedWorkflowRefs: [workflowRef],
    fetchImpl: jwksFetch,
  }),
  false,
);
assert.equal(
  await verifyGithubActionsOidcToken({
    token: signedOidc,
    expectedAudience: oidcAudience,
    allowedWorkflowRefs: ["officeus-create/Hermes/.github/workflows/untrusted.yml@refs/heads/main"],
    fetchImpl: jwksFetch,
  }),
  false,
);
const tamperedParts = signedOidc.split(".");
tamperedParts[2] = (tamperedParts[2].startsWith("A") ? "B" : "A") + tamperedParts[2].slice(1);
const tamperedOidc = tamperedParts.join(".");
assert.equal(
  await verifyGithubActionsOidcToken({
    token: tamperedOidc,
    expectedAudience: oidcAudience,
    allowedWorkflowRefs: [workflowRef],
    fetchImpl: jwksFetch,
  }),
  false,
);

console.log("Repair booking Turnstile + GitHub OIDC contract passed.");
