import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const websiteRoot = new URL("..", import.meta.url).pathname;
const crmRoot = join(homedir(), "Documents", "Database Carrier", "prototypes", "crm-validation-pipeline", "demo");
const connectRoot = join(homedir(), "Projects", "hermes-connect-prototype");
const auditRoot = join(homedir(), "Documents", "Отдел маркетинга", "website-audit", "reports", "hermes-site-audit-2026-07-28");

const crmTarget = join(websiteRoot, "public", "demos", "crm-validation");
const connectTarget = join(websiteRoot, "public", "demos", "hermes-connect");
const auditTarget = join(websiteRoot, "public", "demos", "website-audit");

await mkdir(crmTarget, { recursive: true });
await mkdir(connectTarget, { recursive: true });
await mkdir(auditTarget, { recursive: true });

await cp(join(crmRoot, "index.html"), join(crmTarget, "index.html"));
await cp(join(crmRoot, "dashboard.json"), join(crmTarget, "dashboard.json"));

await cp(join(connectRoot, "prototype", "index.html"), join(connectTarget, "index.html"));
await cp(join(connectRoot, "prototype", "styles.css"), join(connectTarget, "styles.css"));
await cp(join(connectRoot, "src", "profile-workspace.mjs"), join(connectTarget, "profile-workspace.mjs"));

const connectApp = await readFile(join(connectRoot, "prototype", "app.mjs"), "utf8");
await writeFile(
  join(connectTarget, "app.mjs"),
  connectApp.replace("../src/profile-workspace.mjs", "./profile-workspace.mjs"),
  "utf8",
);

await cp(join(auditRoot, "index-after.html"), join(auditTarget, "index.html"));
await cp(join(auditRoot, "report-after.json"), join(auditTarget, "report.json"));

console.log("Synced CRM Validation, Hermes Connect, and Website Audit public demos.");
