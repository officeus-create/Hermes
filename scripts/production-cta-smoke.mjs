const baseUrl = process.env.HERMES_PRODUCTION_URL || "https://hermeslogisticsus.com";
const cacheBust = process.env.GITHUB_SHA || Date.now().toString();

const checks = [
  ["/paths/marketing/", "Prepare a marketing brief"],
  ["/paths/academy/", "Ask about the Academy path"],
];

const failures = [];

for (const [path, marker] of checks) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("_hermes_verify", cacheBust);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesProductionCtaSmoke/1.0",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
    });
    const body = await response.text();
    const ok = response.ok && body.includes(marker);

    console.log(`${ok ? "PASS" : "FAIL"} ${response.status} ${path} marker=${JSON.stringify(marker)}`);
    if (!ok) failures.push(`${path}: status=${response.status}, missing marker=${JSON.stringify(marker)}`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`FAIL ${path}`, error);
  }
}

if (failures.length) {
  console.error("\nProduction CTA smoke failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nProduction CTA smoke passed for ${checks.length} public path CTAs.`);
