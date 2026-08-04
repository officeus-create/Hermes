import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const websiteRoot = new URL("..", import.meta.url).pathname;
const crmRoot = join(homedir(), "Documents", "Database Carrier", "prototypes", "crm-validation-pipeline", "demo");
const externalConnectRoot = process.env.HERMES_CONNECT_SOURCE_DIR
  ? resolve(process.env.HERMES_CONNECT_SOURCE_DIR)
  : null;
const auditRoot = join(homedir(), "Documents", "Отдел маркетинга", "website-audit", "reports", "hermes-site-audit-2026-07-28");

const crmTarget = join(websiteRoot, "public", "demos", "crm-validation");
const connectTarget = join(websiteRoot, "public", "demos", "hermes-connect");
const auditTarget = join(websiteRoot, "public", "demos", "website-audit");

const noindexMeta = '<meta name="robots" content="noindex,nofollow">';
const preserveDemoNoindex = async (path) => {
  const html = await readFile(path, "utf8");
  if (/\bname=["']robots["']/i.test(html)) return;
  const next = html.replace(/<head>/i, `<head>\n  ${noindexMeta}`);
  if (next === html) throw new Error(`Could not add noindex metadata to demo: ${path}`);
  await writeFile(path, next, "utf8");
};

await mkdir(crmTarget, { recursive: true });
await mkdir(connectTarget, { recursive: true });
await mkdir(auditTarget, { recursive: true });

const crmIndex = join(crmTarget, "index.html");
await cp(join(crmRoot, "index.html"), crmIndex);
await preserveDemoNoindex(crmIndex);
await cp(join(crmRoot, "dashboard.json"), join(crmTarget, "dashboard.json"));

const connectIndex = join(connectTarget, "index.html");
if (externalConnectRoot) {
  await cp(join(externalConnectRoot, "prototype", "index.html"), connectIndex);
  await preserveDemoNoindex(connectIndex);
  await cp(join(externalConnectRoot, "prototype", "styles.css"), join(connectTarget, "styles.css"));
  await cp(join(externalConnectRoot, "src", "profile-workspace.mjs"), join(connectTarget, "profile-workspace.mjs"));

  const connectApp = await readFile(join(externalConnectRoot, "prototype", "app.mjs"), "utf8");
  await writeFile(
    join(connectTarget, "app.mjs"),
    connectApp.replace("../src/profile-workspace.mjs", "./profile-workspace.mjs"),
    "utf8",
  );
  console.log(`Synced Hermes Connect from explicit external source: ${externalConnectRoot}`);
} else {
  await preserveDemoNoindex(connectIndex);
  console.log("Preserved repository-managed Hermes Connect funnel. Set HERMES_CONNECT_SOURCE_DIR only for an intentional reviewed import.");
}

const auditIndex = join(auditTarget, "index.html");
await cp(join(auditRoot, "index-after.html"), auditIndex);
await preserveDemoNoindex(auditIndex);
await cp(join(auditRoot, "report-after.json"), join(auditTarget, "report.json"));

console.log("Synced CRM Validation and Website Audit public demos with noindex metadata.");
