const baseUrl = process.env.HERMES_PRODUCTION_URL || "https://hermeslogisticsus.com";
const cacheBust = process.env.GITHUB_SHA || Date.now().toString();

const checks = [
  ["/legal-compliance/", "Legal & Compliance"],
  ["/privacy/", "Privacy"],
  ["/privacy-choices/", "Privacy Choices"],
  ["/company-information/", "Company Information"],
  ["/payments-cancellations/", "Payments"],
  ["/data-security/", "Data Security"],
  ["/asset-licensing/", "Asset Licensing"],
  ["/regional-privacy/", "Regional Privacy & International Data"],
];

const failures = [];

for (const [path, marker] of checks) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("_hermes_verify", cacheBust);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesProductionComplianceSmoke/1.0",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
    });
    const body = await response.text();
    const ok = response.ok && body.toLowerCase().includes(marker.toLowerCase());

    console.log(`${ok ? "PASS" : "FAIL"} ${response.status} ${path} marker=${JSON.stringify(marker)}`);
    if (!ok) failures.push(`${path}: status=${response.status}, marker=${JSON.stringify(marker)}`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`FAIL ${path}`, error);
  }
}

if (failures.length) {
  console.error("\nProduction compliance smoke failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nProduction compliance smoke passed for ${checks.length} public routes.`);
