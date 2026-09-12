const BASE = "https://hermeslogisticsus.com";
const repo = String(process.env.GITHUB_REPOSITORY || "").trim();
const githubToken = String(process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
const pagesToken = String(process.env.CLOUDFLARE_PAGES_API_TOKEN || "").trim();
const d1Token = String(process.env.CLOUDFLARE_D1_API_TOKEN || "").trim();
const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
const loadBoardMergeSha = "2fff7b4aa703b72948be0696efd3fdcca22aaad6";
const companyName = "Hermes Load Board Production Proof";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mask(value) {
  if (value) console.log(`::add-mask::${value}`);
}

function classify(code) {
  const error = new Error(code);
  error.classification = code;
  throw error;
}

function requireValue(value, code) {
  if (!value) classify(code);
  return value;
}
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
    headers: { "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "HermesLoadBoardCompanyProof/1.0" },
  }, githubToken);
  if (!response.ok) classify("github_release_evidence_unavailable");
  return payload;
}

async function currentMainSha() {
  return String((await github("/branches/main"))?.commit?.sha || "");
}

async function assertLoadBoardAncestor(targetSha) {
  const comparison = await github(`/compare/${loadBoardMergeSha}...${targetSha}`);
  if (!new Set(["ahead", "identical"]).has(String(comparison?.status || ""))) {
    classify("load_board_merge_not_in_main");
  }
}
async function waitForProductionSha(targetSha) {
  for (let attempt = 1; attempt <= 42; attempt += 1) {
    const runs = await github("/actions/workflows/cloudflare-pages-production-v2.yml/runs?branch=main&per_page=40");
    const match = Array.isArray(runs?.workflow_runs)
      ? runs.workflow_runs.find((run) => run?.head_sha === targetSha)
      : null;
    if (match?.status === "completed" && match?.conclusion === "success") return true;
    if (match?.status === "completed" && match?.conclusion && match.conclusion !== "success") {
      classify("production_deploy_failed");
    }
    if (attempt < 42) await sleep(10_000);
  }
  classify("production_parity_required");
}

async function cloudflareProject() {
  const { response, payload } = await jsonRequest(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/hermes`,
    { headers: { "Content-Type": "application/json" } },
    pagesToken,
  );
  if (response.status === 401 || response.status === 403) classify("blocked_cloudflare_pages_read");
  if (!response.ok || payload?.success !== true) classify("cloudflare_project_read_failed");
  return payload.result;
}

function syntheticCandidates(project) {
  const entry = project?.deployment_configs?.production?.env_vars?.HERMES_SYNTHETIC_ACCOUNT_EMAILS;
  const raw = typeof entry === "string" ? entry : String(entry?.value || "");
  if (raw) mask(raw);
  return raw.split(/[;,\n]/).map((item) => item.trim().toLowerCase()).filter(Boolean);
}
function productionDbId(project) {
  const id = String(project?.deployment_configs?.production?.d1_databases?.DB?.id || "").trim();
  if (!id) classify("production_db_binding_missing");
  mask(id);
  return id;
}

async function d1(dbId, sql, params = []) {
  const { response, payload } = await jsonRequest(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    },
    d1Token,
  );
  if (response.status === 401 || response.status === 403) classify("blocked_cloudflare_d1_write");
  if (!response.ok || payload?.success !== true || payload?.result?.[0]?.success !== true) {
    classify("d1_query_failed");
  }
  return payload.result[0];
}

async function d1Batch(dbId, batch) {
  const { response, payload } = await jsonRequest(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batch }) },
    d1Token,
  );
  if (response.status === 401 || response.status === 403) classify("blocked_cloudflare_d1_write");
  if (!response.ok || payload?.success !== true || !payload?.result?.every((item) => item?.success === true)) {
    classify("d1_batch_failed");
  }
  return payload.result;
}
function firstRow(result) {
  return result?.results?.[0] || null;
}

function sessionCookie(response) {
  const raw = response.headers.get("set-cookie") || "";
  const match = raw.match(/hermes_session=([^;]+)/);
  if (!match) classify("session_cookie_missing");
  const cookie = `hermes_session=${match[1]}`;
  mask(match[1]);
  return cookie;
}

async function productJson(path, { method = "GET", cookie = "", body = null } = {}) {
  const headers = new Headers({ Accept: "application/json", Origin: BASE });
  if (cookie) headers.set("Cookie", cookie);
  if (body !== null) headers.set("Content-Type", "application/json");
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === null ? undefined : JSON.stringify(body),
    redirect: "manual",
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
async function chooseUnusedSyntheticEmail(dbId, candidates) {
  for (const email of candidates) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    const existing = firstRow(await d1(dbId, "SELECT COUNT(*) AS n FROM specialists WHERE lower(email) = lower(?)", [email]));
    if (Number(existing?.n || 0) === 0) {
      mask(email);
      return email;
    }
  }
  classify("synthetic_registration_email_unavailable");
}

async function cleanupSynthetic(dbId, email) {
  const owner = firstRow(await d1(dbId, "SELECT id FROM specialists WHERE lower(email)=lower(?) LIMIT 1", [email]));
  const specialistId = String(owner?.id || "");
  if (!specialistId) return true;
  mask(specialistId);
  const tableResult = await d1(dbId, `SELECT name FROM sqlite_master WHERE type='table' AND name IN (
    'hermes_load_market_posts','hermes_company_profiles','hermes_registration_alerts','hermes_registration_flags'
  )`);
  const tables = new Set((tableResult?.results || []).map((row) => String(row.name || "")));
  let companyId = "";
  if (tables.has("hermes_company_profiles")) {
    const company = firstRow(await d1(dbId, "SELECT id FROM hermes_company_profiles WHERE owner_specialist_id=? LIMIT 1", [specialistId]));
    companyId = String(company?.id || "");
    mask(companyId);
  }
  const batch = [];
  if (companyId && tables.has("hermes_load_market_posts")) batch.push({ sql: "DELETE FROM hermes_load_market_posts WHERE company_id=?;", params: [companyId] });
  if (companyId && tables.has("hermes_company_profiles")) batch.push({ sql: "DELETE FROM hermes_company_profiles WHERE id=? AND owner_specialist_id=?;", params: [companyId, specialistId] });
  if (tables.has("hermes_registration_alerts")) batch.push({ sql: "DELETE FROM hermes_registration_alerts WHERE specialist_id=?;", params: [specialistId] });
  if (tables.has("hermes_registration_flags")) batch.push({ sql: "DELETE FROM hermes_registration_flags WHERE specialist_id=?;", params: [specialistId] });
  batch.push({ sql: "DELETE FROM sessions WHERE specialist_id=?;", params: [specialistId] });
  batch.push({ sql: "DELETE FROM specialists WHERE id=? AND lower(email)=lower(?);", params: [specialistId, email] });
  await d1Batch(dbId, batch);
  const core = firstRow(await d1(dbId, `SELECT
    (SELECT COUNT(*) FROM specialists WHERE id=?) AS specialists_count,
    (SELECT COUNT(*) FROM sessions WHERE specialist_id=?) AS sessions_count`, [specialistId, specialistId]));
  if (Number(core?.specialists_count || 0) !== 0 || Number(core?.sessions_count || 0) !== 0) return false;
  if (companyId && tables.has("hermes_company_profiles")) {
    const company = firstRow(await d1(dbId, "SELECT COUNT(*) AS n FROM hermes_company_profiles WHERE id=?", [companyId]));
    if (Number(company?.n || 0) !== 0) return false;
  }
  return true;
}

async function main() {
  requireValue(repo, "github_release_evidence_unavailable");
  requireValue(githubToken, "github_release_evidence_unavailable");
  requireValue(pagesToken, "blocked_cloudflare_account_access");
  requireValue(d1Token, "blocked_cloudflare_account_access");
  requireValue(accountId, "blocked_cloudflare_account_access");
  [githubToken, pagesToken, d1Token, accountId].forEach(mask);

  const targetSha = await currentMainSha();
  requireValue(targetSha, "stale_main");
  mask(targetSha);
  await assertLoadBoardAncestor(targetSha);
  await waitForProductionSha(targetSha);
  if (await currentMainSha() !== targetSha) classify("stale_main_before_proof");

  const project = await cloudflareProject();
  const dbId = productionDbId(project);
  const candidates = syntheticCandidates(project);
  const email = await chooseUnusedSyntheticEmail(dbId, candidates);
  const password = `Hermes-LB-${crypto.randomUUID()}-A9!`;
  mask(password);

  const before = await summary();
  let created = false;
  let specialistId = "";
  let companyId = "";
  let proofError = null;
  try {
    const registration = await productJson("/api/auth/register", {
      method: "POST",
      body: {
        email,
        password,
        name: "Hermes Load Board Proof",
        role: "Carrier Operations",
        location: "United States",
        bio: "Synthetic production proof for the Hermes Load Board company access path.",
      },
    });
    if (registration.response.status !== 201 || registration.payload?.success !== true) {
      classify(`synthetic_registration_failed_${registration.response.status}`);
    }
    created = true;
    const registrationCookie = sessionCookie(registration.response);
    specialistId = String(registration.payload?.specialist?.id || "");
    requireValue(specialistId, "synthetic_registration_id_missing");
    mask(specialistId);

    let syntheticSafe = false;
    for (let attempt = 1; attempt <= 16; attempt += 1) {
      const tableResult = await d1(dbId, `SELECT name FROM sqlite_master WHERE type='table'
        AND name IN ('hermes_registration_flags','hermes_registration_alerts')`);
      const tables = new Set((tableResult?.results || []).map((row) => String(row.name || "")));
      if (tables.has("hermes_registration_flags") && tables.has("hermes_registration_alerts")) {
        const row = firstRow(await d1(dbId, `SELECT COALESCE(f.synthetic,0) AS synthetic, a.status AS alert_status
          FROM specialists s LEFT JOIN hermes_registration_flags f ON f.specialist_id=s.id
          LEFT JOIN hermes_registration_alerts a ON a.specialist_id=s.id AND a.kind='registration'
          WHERE s.id=? LIMIT 1`, [specialistId]));
        if (row?.alert_status === "sent") classify("synthetic_registration_alert_sent");
        if (Number(row?.synthetic || 0) === 1 && row?.alert_status === "skipped") { syntheticSafe = true; break; }
      }
      await sleep(500);
    }
    if (!syntheticSafe) classify("synthetic_registration_not_safely_excluded");
    const initialCompany = await productJson("/api/hermes-connect/company", { cookie: registrationCookie });
    if (!initialCompany.response.ok || initialCompany.payload?.success !== true || initialCompany.payload?.company !== null) {
      classify("initial_company_state_invalid");
    }

    const companyWrite = await productJson("/api/hermes-connect/company", {
      method: "POST",
      cookie: registrationCookie,
      body: {
        companyName,
        companyType: "carrier",
        city: "Milwaukee",
        state: "WI",
        catalogOptIn: false,
      },
    });
    if (!companyWrite.response.ok || companyWrite.payload?.success !== true || companyWrite.payload?.load_board_access !== true) {
      classify("company_registration_failed");
    }
    if (companyWrite.payload?.catalog?.listed !== false || companyWrite.payload?.catalog?.status !== "opted_out") {
      classify("catalog_opt_out_failed");
    }
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
    if (!companyRead.response.ok || companyRead.payload?.success !== true
      || company?.id !== companyId || company?.loadBoardAccess !== true || company?.catalogOptIn !== false) {
      classify("company_readback_failed");
    }

    const account = await productJson("/api/hermes-connect/account", { cookie: loginCookie });
    const loadWorkspace = Array.isArray(account.payload?.workspaces)
      ? account.payload.workspaces.find((item) => item?.key === "load_board")
      : null;
    if (!account.response.ok || account.payload?.success !== true || loadWorkspace?.available !== true
      || loadWorkspace?.state?.company_id !== companyId || loadWorkspace?.state?.load_board_access !== true
      || loadWorkspace?.state?.catalog_opt_in !== false) {
      classify("account_workspace_unlock_failed");
    }

    const active = await productJson("/api/load-board/active?type=load", { cookie: loginCookie });
    if (!active.response.ok || active.payload?.success !== true || active.payload?.load_board_access !== true
      || active.payload?.audience !== "carrier_candidate" || active.payload?.contact_details_exposed !== false) {
      classify("load_board_unlock_failed");
    }
    const posts = await productJson("/api/load-board/posts", { cookie: loginCookie });
    if (!posts.response.ok || posts.payload?.success !== true || posts.payload?.company?.id !== companyId
      || posts.payload?.company?.can_post_truck !== true || posts.payload?.company?.can_post_load !== false
      || !Array.isArray(posts.payload?.posts) || posts.payload.posts.length !== 0) {
      classify("marketplace_company_readback_failed");
    }

    const during = await summary();
    if (during.loads !== before.loads || during.trucks !== before.trucks) classify("synthetic_proof_changed_inventory");
    if (await currentMainSha() !== targetSha) classify("stale_main_after_proof");
  } catch (error) {
    proofError = error;
  }

  let cleanupOk = true;
  if (created) {
    try { cleanupOk = await cleanupSynthetic(dbId, email); }
    catch { cleanupOk = false; }
  }
  if (!cleanupOk) classify("synthetic_cleanup_failed");
  if (proofError) throw proofError;

  const after = await summary();
  if (after.loads !== before.loads || after.trucks !== before.trucks) classify("inventory_changed_after_cleanup");
  console.log(JSON.stringify({
    ok: true,
    classification: "pass",
    account_registration: "public_synthetic",
    company_saved: true,
    catalog_public: false,
    repeat_login: true,
    load_board_unlocked: true,
    marketplace_company_tools: true,
    inventory_unchanged: true,
    cleanup_verified: true,
  }, null, 2));
}
main().catch((error) => {
  const classification = String(error?.classification || error?.message || "unexpected_failure")
    .replace(/[^a-z0-9_-]/gi, "_")
    .slice(0, 120);
  console.error(`LOAD_BOARD_COMPANY_PROOF_CLASS=${classification}`);
  process.exit(1);
});
