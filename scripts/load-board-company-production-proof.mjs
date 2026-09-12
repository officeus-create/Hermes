const BASE = "https://hermeslogisticsus.com";
const repo = String(process.env.GITHUB_REPOSITORY || "").trim();
const githubToken = String(process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
const loadBoardMergeSha = "2fff7b4aa703b72948be0696efd3fdcca22aaad6";
const email = "repair-booking-production-smoke@hermesconnect.app";
const companyName = "Hermes Load Board Production Proof";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mask(value) { if (value) console.log(`::add-mask::${value}`); }
function classify(code) { const error = new Error(code); error.classification = code; throw error; }
function requireValue(value, code) { if (!value) classify(code); return value; }

async function jsonRequest(url, options = {}, token = "") {
  const headers = new Headers(options.headers || {});
  headers.set("accept", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers, signal: AbortSignal.timeout(25_000) });
  let payload = null;
  try { payload = await response.json(); } catch {}
  return { response, payload };
}

async function github(path) {
  const { response, payload } = await jsonRequest(`https://api.github.com/repos/${repo}${path}`, {
    headers: { "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "HermesLoadBoardCompanyProof/2.0" },
  }, githubToken);
  if (!response.ok) classify("github_release_evidence_unavailable");
  return payload;
}

async function currentMainSha() { return String((await github("/branches/main"))?.commit?.sha || ""); }
async function assertLoadBoardAncestor(targetSha) {
  const comparison = await github(`/compare/${loadBoardMergeSha}...${targetSha}`);
  if (!new Set(["ahead", "identical"]).has(String(comparison?.status || ""))) classify("load_board_merge_not_in_main");
}
async function waitForProductionSha(targetSha) {
  for (let attempt = 1; attempt <= 42; attempt += 1) {
    const runs = await github("/actions/workflows/cloudflare-pages-production-v2.yml/runs?branch=main&per_page=40");
    const match = Array.isArray(runs?.workflow_runs) ? runs.workflow_runs.find((run) => run?.head_sha === targetSha) : null;
    if (match?.status === "completed" && match?.conclusion === "success") return true;
    if (match?.status === "completed" && match?.conclusion && match.conclusion !== "success") classify("production_deploy_failed");
    if (attempt < 42) await sleep(10_000);
  }
  classify("production_parity_required");
}

function sessionCookie(response) {
  const raw = response.headers.get("set-cookie") || "";
  const match = raw.match(/hermes_session=([^;]+)/);
  if (!match) classify("session_cookie_missing");
  mask(match[1]);
  return `hermes_session=${match[1]}`;
}

async function productJson(path, { method = "GET", cookie = "", body = null } = {}) {
  const headers = new Headers({ Accept: "application/json", Origin: BASE });
  if (cookie) headers.set("Cookie", cookie);
  if (body !== null) headers.set("Content-Type", "application/json");
  const response = await fetch(`${BASE}${path}`, {
    method, headers, body: body === null ? undefined : JSON.stringify(body), redirect: "manual",
    signal: AbortSignal.timeout(25_000),
  });
  let payload = null;
  try { payload = await response.json(); } catch {}
  return { response, payload };
}

async function summary() {
  const { response, payload } = await productJson("/api/load-board/summary");
  if (!response.ok || payload?.success !== true) classify("public_summary_read_failed");
  return { loads: Number(payload.available_loads || 0), trucks: Number(payload.available_trucks || 0) };
}

async function cleanup() {
  return productJson("/api/load-board/cleanup-company-smoke", { method: "POST" });
}

async function main() {
  requireValue(repo, "github_release_evidence_unavailable");
  requireValue(githubToken, "github_release_evidence_unavailable");
  mask(githubToken); mask(email);

  const targetSha = await currentMainSha();
  requireValue(targetSha, "stale_main");
  mask(targetSha);
  await assertLoadBoardAncestor(targetSha);
  await waitForProductionSha(targetSha);
  if (await currentMainSha() !== targetSha) classify("stale_main_before_proof");

  const before = await summary();
  const password = `Hermes-LB-${crypto.randomUUID()}-A9!`;
  mask(password);
  let created = false;
  let companyId = "";
  let proofError = null;

  try {
    const registration = await productJson("/api/auth/register", {
      method: "POST",
      body: {
        email, password, name: "Hermes Load Board Proof", role: "Carrier Operations",
        location: "United States", bio: "Synthetic production proof for the Hermes Load Board company access path.",
      },
    });
    if (registration.response.status === 409) classify("synthetic_account_busy");
    if (registration.response.status !== 201 || registration.payload?.success !== true) classify(`synthetic_registration_failed_${registration.response.status}`);
    created = true;
    const registrationCookie = sessionCookie(registration.response);

    const initialCompany = await productJson("/api/hermes-connect/company", { cookie: registrationCookie });
    if (!initialCompany.response.ok || initialCompany.payload?.success !== true || initialCompany.payload?.company !== null) classify("initial_company_state_invalid");

    const companyWrite = await productJson("/api/hermes-connect/company", {
      method: "POST", cookie: registrationCookie,
      body: { companyName, companyType: "carrier", city: "Milwaukee", state: "WI", catalogOptIn: false },
    });
    if (!companyWrite.response.ok || companyWrite.payload?.success !== true || companyWrite.payload?.load_board_access !== true) classify("company_registration_failed");
    if (companyWrite.payload?.catalog?.listed !== false || companyWrite.payload?.catalog?.status !== "opted_out") classify("catalog_opt_out_failed");
    companyId = String(companyWrite.payload?.company?.id || "");
    requireValue(companyId, "company_id_missing");
    mask(companyId);

    const publicCatalog = await productJson("/api/catalog/companies");
    const leaked = Array.isArray(publicCatalog.payload?.companies)
      && publicCatalog.payload.companies.some((item) => item?.id === companyId || item?.companyName === companyName);
    if (!publicCatalog.response.ok || publicCatalog.payload?.success !== true || leaked) classify("synthetic_company_publicly_listed");

    const login = await productJson("/api/auth/login", { method: "POST", body: { email, password } });
    if (!login.response.ok || login.payload?.success !== true) classify("repeat_login_failed");
    const loginCookie = sessionCookie(login.response);

    const companyRead = await productJson("/api/hermes-connect/company", { cookie: loginCookie });
    const company = companyRead.payload?.company;
    if (!companyRead.response.ok || companyRead.payload?.success !== true || company?.id !== companyId
      || company?.loadBoardAccess !== true || company?.catalogOptIn !== false) classify("company_readback_failed");

    const account = await productJson("/api/hermes-connect/account", { cookie: loginCookie });
    const loadWorkspace = Array.isArray(account.payload?.workspaces)
      ? account.payload.workspaces.find((item) => item?.key === "load_board") : null;
    if (!account.response.ok || account.payload?.success !== true || loadWorkspace?.available !== true
      || loadWorkspace?.state?.company_id !== companyId || loadWorkspace?.state?.load_board_access !== true
      || loadWorkspace?.state?.catalog_opt_in !== false) classify("account_workspace_unlock_failed");

    const active = await productJson("/api/load-board/active?type=load", { cookie: loginCookie });
    if (!active.response.ok || active.payload?.success !== true || active.payload?.load_board_access !== true
      || active.payload?.audience !== "carrier_candidate" || active.payload?.contact_details_exposed !== false) classify("load_board_unlock_failed");

    const posts = await productJson("/api/load-board/posts", { cookie: loginCookie });
    if (!posts.response.ok || posts.payload?.success !== true || posts.payload?.company?.id !== companyId
      || posts.payload?.company?.can_post_truck !== true || posts.payload?.company?.can_post_load !== false
      || !Array.isArray(posts.payload?.posts) || posts.payload.posts.length !== 0) classify("marketplace_company_readback_failed");

    const during = await summary();
    if (during.loads !== before.loads || during.trucks !== before.trucks) classify("synthetic_proof_changed_inventory");
    if (await currentMainSha() !== targetSha) classify("stale_main_after_proof");
  } catch (error) {
    proofError = error;
  }

  let cleanupPayload = null;
  if (created) {
    const cleaned = await cleanup();
    cleanupPayload = cleaned.payload;
    if (!cleaned.response.ok || cleaned.payload?.success !== true || cleaned.payload?.remaining !== 0) classify("synthetic_cleanup_failed");
    if (cleaned.payload?.synthetic !== true || cleaned.payload?.registration_alert_status !== "skipped") classify("synthetic_registration_not_safely_excluded");
    if (cleaned.payload?.company_removed !== true) classify("synthetic_company_cleanup_failed");
  }
  if (proofError) throw proofError;

  const after = await summary();
  if (after.loads !== before.loads || after.trucks !== before.trucks) classify("inventory_changed_after_cleanup");
  console.log(JSON.stringify({
    ok: true, classification: "pass", account_registration: "public_synthetic", company_saved: true,
    catalog_public: false, repeat_login: true, load_board_unlocked: true, marketplace_company_tools: true,
    synthetic_alert_suppressed: cleanupPayload?.registration_alert_status === "skipped",
    inventory_unchanged: true, cleanup_verified: true,
  }, null, 2));
}

main().catch((error) => {
  const classification = String(error?.classification || error?.message || "unexpected_failure")
    .replace(/[^a-z0-9_-]/gi, "_").slice(0, 120);
  console.error(`LOAD_BOARD_COMPANY_PROOF_CLASS=${classification}`);
  process.exit(1);
});
