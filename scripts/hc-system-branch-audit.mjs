import { execFileSync } from "node:child_process";
import fs from "node:fs";

const sh = (cmd, args, opts = {}) => {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
  } catch (error) {
    if (opts.allowFail) return "";
    const stderr = error?.stderr?.toString?.() || "";
    throw new Error(`${cmd} ${args.join(" ")} failed: ${stderr}`);
  }
};

const escapeCell = (value) => String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
const now = new Date();
const staleDays = (iso) => iso ? Math.floor((now - new Date(iso)) / 86400000) : 9999;

const namePattern = /(hermes|connect|repair|shop|sto|academy|course|load[-_/ ]?board|loadboard|beauty|fitness|real[-_/ ]?estate|professional|hr|candidate|internal[-_/ ]?ai|command[-_/ ]?center|website[-_/ ]?factory|registr|social|linkedin|mailbox|product[-_/ ]?hub|booking|crm|appointment)/i;
const pathPattern = /^(src\/(pages\/services\/hermes-connect|components\/HermesConnect|components\/RepairShop|styles\/hermes-connect)|functions\/api\/(repair-shop|public\/repair-booking|academy|hr|internal-ai|hermes-connect)|public\/(hermes-connect|repair-shop|load-board)|scripts\/(repair|hermes-connect|academy|load-board|hr|internal-ai)|tests\/(repair-shop|hermes-connect|academy|load-board|hr|internal-ai)|docs\/.*hermes-connect|\.github\/workflows\/.*(repair|hermes|academy|load|hr|internal))/i;

const rawPrs = sh("gh", ["pr", "list", "--repo", "officeus-create/Hermes", "--state", "all", "--limit", "1000", "--json", "number,title,headRefName,state,mergedAt,closedAt,url"], { env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN } });
const prs = rawPrs ? JSON.parse(rawPrs) : [];
const prsByHead = new Map();
for (const pr of prs) {
  if (!prsByHead.has(pr.headRefName)) prsByHead.set(pr.headRefName, []);
  prsByHead.get(pr.headRefName).push(pr);
}

const refs = sh("git", ["for-each-ref", "refs/remotes/origin", "--format=%(refname:short)"])
  .split("\n")
  .map((value) => value.trim())
  .filter(Boolean)
  .filter((value) => value !== "origin/main" && value !== "origin/HEAD");

const rows = [];
for (const ref of refs) {
  const branch = ref.replace(/^origin\//, "");
  const counts = sh("git", ["rev-list", "--left-right", "--count", `origin/main...${ref}`], { allowFail: true });
  if (!counts) continue;
  const [behindRaw, aheadRaw] = counts.split(/\s+/);
  const behind = Number(behindRaw || 0);
  const ahead = Number(aheadRaw || 0);
  const filesText = sh("git", ["diff", "--name-only", `origin/main...${ref}`], { allowFail: true });
  const files = filesText ? filesText.split("\n").filter(Boolean) : [];
  const relevantFiles = files.filter((file) => pathPattern.test(file));
  if (!namePattern.test(branch) && relevantFiles.length === 0) continue;

  const meta = sh("git", ["log", "-1", "--format=%cI%x09%s", ref], { allowFail: true });
  const [lastDate = "", ...messageParts] = meta.split("\t");
  const lastMessage = messageParts.join("\t");
  const unique = ahead > 0
    ? sh("git", ["log", "--format=%h %cI %s", "-n", "5", `origin/main..${ref}`], { allowFail: true })
    : "";
  const branchPrs = prsByHead.get(branch) || [];
  const openPr = branchPrs.find((pr) => pr.state === "OPEN");
  const mergedPr = branchPrs.find((pr) => pr.mergedAt);
  const closedPr = branchPrs.find((pr) => pr.state === "CLOSED" && !pr.mergedAt);

  let status = "REVIEW";
  let rationale = "Unique branch state needs product-owner review.";
  if (ahead === 0) {
    status = "MERGED_OR_CONTAINED";
    rationale = "No commits unique versus current main.";
  } else if (openPr) {
    status = "ACTIVE_PR";
    rationale = `Open PR #${openPr.number}.`;
  } else if (mergedPr) {
    status = "POST_MERGE_OR_SUPERSEDED";
    rationale = `PR #${mergedPr.number} merged, but branch still has unique commits.`;
  } else if (closedPr) {
    status = "CLOSED_UNMERGED_REVIEW";
    rationale = `PR #${closedPr.number} closed without merge; inspect unique code before recovery.`;
  } else if (/(archive|proof|smoke|replay|snapshot|evidence|backup)/i.test(branch)) {
    status = "EVIDENCE_OR_REPLAY_REVIEW";
    rationale = "Name indicates evidence/replay/archive lineage; never merge wholesale.";
  } else if (behind > 60) {
    status = "STALE_DONOR_REVIEW";
    rationale = `Unique code exists but branch is ${behind} main commits behind.`;
  } else if (staleDays(lastDate) <= 14) {
    status = "RECOVER_REVIEW";
    rationale = "Recent unique code with no open PR; candidate for semantic recovery.";
  } else {
    status = "HOLD_REVIEW";
    rationale = "Unique code exists without a current PR; needs canonical-scope check.";
  }

  const prLabel = openPr ? `#${openPr.number} open` : mergedPr ? `#${mergedPr.number} merged` : closedPr ? `#${closedPr.number} closed` : "—";
  rows.push({ branch, ahead, behind, lastDate, lastMessage, relevantFiles, status, rationale, prLabel, unique });
}

const statusOrder = ["ACTIVE_PR", "RECOVER_REVIEW", "CLOSED_UNMERGED_REVIEW", "POST_MERGE_OR_SUPERSEDED", "HOLD_REVIEW", "STALE_DONOR_REVIEW", "EVIDENCE_OR_REPLAY_REVIEW", "MERGED_OR_CONTAINED"];
rows.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || b.lastDate.localeCompare(a.lastDate));

const counts = Object.fromEntries(statusOrder.map((status) => [status, rows.filter((row) => row.status === status).length]));
const active = rows.filter((row) => row.ahead > 0);
const report = [];
report.push("# Hermes Connect full branch inventory — 2026-09-08");
report.push("");
report.push(`Generated against \`origin/main\` at \`${sh("git", ["rev-parse", "origin/main"])}\`.`);
report.push("");
report.push("This is a forensic inventory, not an instruction to merge branches wholesale. A branch with unique commits is a donor candidate until its current product scope is reconciled with One Brain / Master Vision and current main.");
report.push("");
report.push("## Summary");
report.push("");
report.push(`- Relevant Hermes Connect branch lineages found: **${rows.length}**`);
report.push(`- Branches with unique commits vs main: **${active.length}**`);
for (const status of statusOrder) report.push(`- ${status}: **${counts[status]}**`);
report.push("");
report.push("## Inventory");
report.push("");
report.push("| Status | Branch | Ahead | Behind | PR | Last commit | Connect files changed | Rationale |");
report.push("|---|---|---:|---:|---|---|---:|---|");
for (const row of rows) {
  report.push(`| ${row.status} | \`${escapeCell(row.branch)}\` | ${row.ahead} | ${row.behind} | ${escapeCell(row.prLabel)} | ${escapeCell(row.lastDate.slice(0, 10))} · ${escapeCell(row.lastMessage).slice(0, 100)} | ${row.relevantFiles.length} | ${escapeCell(row.rationale)} |`);
}
report.push("");
report.push("## Unique-commit details (non-contained branches)");
report.push("");
for (const row of active) {
  report.push(`### ${row.branch}`);
  report.push("");
  report.push(`- Status: **${row.status}**; ahead ${row.ahead}, behind ${row.behind}; PR ${row.prLabel}.`);
  if (row.relevantFiles.length) report.push(`- Relevant files: ${row.relevantFiles.slice(0, 20).map((file) => `\`${file}\``).join(", ")}${row.relevantFiles.length > 20 ? ` … +${row.relevantFiles.length - 20}` : ""}`);
  if (row.unique) {
    report.push("- Latest unique commits:");
    for (const line of row.unique.split("\n")) report.push(`  - ${line}`);
  }
  report.push("");
}

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/hermes-connect-system-branch-inventory-2026-09-08.md", report.join("\n") + "\n");
console.log(`HC_BRANCH_AUDIT_ROWS=${rows.length}`);
console.log(`HC_BRANCH_AUDIT_UNIQUE=${active.length}`);
for (const status of statusOrder) console.log(`HC_BRANCH_AUDIT_${status}=${counts[status]}`);
