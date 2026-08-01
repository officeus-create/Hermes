import { spawnSync } from "node:child_process";

const result = spawnSync("npm", ["audit", "--json"], {
  encoding: "utf8",
  shell: process.platform === "win32",
  maxBuffer: 10 * 1024 * 1024,
});

const output = result.stdout?.trim() || result.stderr?.trim();
if (!output) {
  console.log("Dependency audit produced no output.");
  process.exit(0);
}

let report;
try {
  report = JSON.parse(output);
} catch {
  console.log("Dependency audit output was not valid JSON.");
  console.log(output.slice(0, 4000));
  process.exit(0);
}

const vulnerabilities = Object.entries(report.vulnerabilities ?? {})
  .map(([name, vulnerability]) => {
    const via = (vulnerability.via ?? []).map((item) => {
      if (typeof item === "string") return item;
      return item.name ?? item.title ?? item.url ?? "advisory";
    });
    const fix = vulnerability.fixAvailable;
    const fixLabel = fix === true
      ? "available"
      : fix && typeof fix === "object"
        ? `${fix.name ?? name}@${fix.version ?? "unknown"}${fix.isSemVerMajor ? " (major)" : ""}`
        : "none";
    return {
      name,
      severity: vulnerability.severity ?? "unknown",
      direct: Boolean(vulnerability.isDirect),
      range: vulnerability.range ?? "unknown",
      via: [...new Set(via)].join(", ") || "unknown",
      fix: fixLabel,
    };
  })
  .sort((left, right) => left.severity.localeCompare(right.severity) || left.name.localeCompare(right.name));

const metadata = report.metadata?.vulnerabilities ?? {};
console.log(`Dependency audit summary: ${JSON.stringify(metadata)}`);
for (const item of vulnerabilities) {
  console.log([
    `package=${item.name}`,
    `severity=${item.severity}`,
    `direct=${item.direct}`,
    `range=${item.range}`,
    `via=${item.via}`,
    `fix=${item.fix}`,
  ].join(" | "));
}

// Diagnostic only. The remediation PR will make high-severity findings blocking
// after safe package-lock updates have passed the full website regression suite.
process.exit(0);
