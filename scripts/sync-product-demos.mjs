import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const websiteRoot = new URL("..", import.meta.url).pathname;
const externalCrmRoot = process.env.HERMES_CRM_VALIDATION_SOURCE_DIR
  ? resolve(process.env.HERMES_CRM_VALIDATION_SOURCE_DIR)
  : null;
const externalConnectRoot = process.env.HERMES_CONNECT_SOURCE_DIR
  ? resolve(process.env.HERMES_CONNECT_SOURCE_DIR)
  : null;
const externalAuditRoot = process.env.HERMES_WEBSITE_AUDIT_SOURCE_DIR
  ? resolve(process.env.HERMES_WEBSITE_AUDIT_SOURCE_DIR)
  : null;

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
if (externalCrmRoot) {
  await cp(join(externalCrmRoot, "index.html"), crmIndex);
  await preserveDemoNoindex(crmIndex);
  await cp(join(externalCrmRoot, "dashboard.json"), join(crmTarget, "dashboard.json"));
  console.log(`Synced CRM Validation from explicit external source: ${externalCrmRoot}`);
} else {
  await preserveDemoNoindex(crmIndex);
  console.log("Preserved repository-managed CRM Validation demo. Set HERMES_CRM_VALIDATION_SOURCE_DIR only for an intentional reviewed import.");
}

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
if (externalAuditRoot) {
  await cp(join(externalAuditRoot, "index-after.html"), auditIndex);
  await preserveDemoNoindex(auditIndex);
  await cp(join(externalAuditRoot, "report-after.json"), join(auditTarget, "report.json"));
  console.log(`Synced Website Audit from explicit external source: ${externalAuditRoot}`);
} else {
  await preserveDemoNoindex(auditIndex);
  console.log("Preserved repository-managed Website Audit demo. Set HERMES_WEBSITE_AUDIT_SOURCE_DIR only for an intentional reviewed import.");
}

console.log("Product demo sync complete with repository-safe defaults and noindex metadata.");
