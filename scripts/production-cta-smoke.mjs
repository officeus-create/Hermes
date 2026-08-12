const baseUrl = process.env.HERMES_PRODUCTION_URL || "https://hermeslogisticsus.com";
const cacheBust = process.env.GITHUB_SHA || Date.now().toString();

const checks = [
  {
    path: "/paths/marketing/",
    markers: ["Prepare a marketing brief"],
  },
  {
    path: "/paths/academy/",
    markers: ["Ask about the Academy path"],
  },
  {
    path: "/logistics/direct-vehicle-transport-network/",
    markers: [
      "A Direct Vehicle Transport Network Built Around Real Demand and Carrier Fit",
      'href="/logistics/request-vehicle-transport/#transport-intake"',
      'href="/logistics/start-car-hauling-dispatch/"',
    ],
    canonical: "https://hermeslogisticsus.com/logistics/direct-vehicle-transport-network/",
    requireIndexable: true,
  },
];

const failures = [];

function canonicalMatches(body, expected) {
  const linkTags = body.match(/<link\b[^>]*>/gi) || [];
  return linkTags.some((tag) =>
    /\brel=["']canonical["']/i.test(tag) &&
    tag.includes(`href="${expected}"`),
  );
}

function hasNoindex(body) {
  const metaTags = body.match(/<meta\b[^>]*>/gi) || [];
  return metaTags.some((tag) =>
    /\bname=["']robots["']/i.test(tag) &&
    /\bcontent=["'][^"']*\bnoindex\b/i.test(tag),
  );
}

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
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
    const missingMarkers = check.markers.filter((marker) => !body.includes(marker));
    const canonicalOk = !check.canonical || canonicalMatches(body, check.canonical);
    const indexableOk = !check.requireIndexable || !hasNoindex(body);
    const ok = response.ok && missingMarkers.length === 0 && canonicalOk && indexableOk;

    console.log(
      `${ok ? "PASS" : "FAIL"} ${response.status} ${check.path} ` +
      `markers=${check.markers.length - missingMarkers.length}/${check.markers.length} ` +
      `canonical=${canonicalOk ? "PASS" : "FAIL"} indexable=${indexableOk ? "PASS" : "FAIL"}`,
    );

    if (!response.ok) failures.push(`${check.path}: status=${response.status}`);
    for (const marker of missingMarkers) failures.push(`${check.path}: missing marker=${JSON.stringify(marker)}`);
    if (!canonicalOk) failures.push(`${check.path}: canonical mismatch; expected=${check.canonical}`);
    if (!indexableOk) failures.push(`${check.path}: robots noindex detected`);
  } catch (error) {
    failures.push(`${check.path}: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`FAIL ${check.path}`, error);
  }
}

if (failures.length) {
  console.error("\nProduction CTA smoke failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nProduction CTA smoke passed for ${checks.length} public path contracts.`);