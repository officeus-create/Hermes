import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://hermeslogisticsus.com";
const outputDir = path.resolve("artifacts");

async function fetchPublic(input) {
  const url = input.startsWith("http://") || input.startsWith("https://")
    ? input
    : new URL(input, baseUrl).toString();

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesHotfixProductionVerifier/1.3 (+public read-only release check)",
        accept: "text/html,text/css,*/*;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      signal: AbortSignal.timeout(20_000),
    });
    return {
      url,
      finalUrl: response.url,
      status: response.status,
      body: await response.text(),
      error: null,
    };
  } catch (error) {
    return {
      url,
      finalUrl: null,
      status: null,
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function stylesheetUrls(html) {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  const urls = [];
  for (const tag of links) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
    if (!href || !rel.toLowerCase().split(/\s+/).includes("stylesheet")) continue;
    urls.push(new URL(href, baseUrl).toString());
  }
  return [...new Set(urls)];
}

function normalize(value) {
  return value.replace(/\s+/g, "").toLowerCase();
}

await fs.mkdir(outputDir, { recursive: true });

const homepage = await fetchPublic("/");
const cssUrls = stylesheetUrls(homepage.body);
const cssFetches = [];
for (const url of cssUrls) cssFetches.push(await fetchPublic(url));
const css = normalize(cssFetches.map((item) => item.body).join("\n"));

const homepageChecks = {
  status200: homepage.status === 200,
  finalUrlCorrect: homepage.finalUrl === `${baseUrl}/`,
  fourDirectionsMarkup: homepage.body.includes("Four directions."),
  hotfixSelectorPresent: css.includes(".home-rooms-display"),
  opaqueWebkitTextFill: css.includes("-webkit-text-fill-color:#fff!important"),
  opaquePaintLayer:
    css.includes("opacity:1!important") &&
    css.includes("visibility:visible!important") &&
    css.includes("color:#fff!important"),
  safariPaintGuard: css.includes("@supports(-webkit-touch-callout:none)"),
  contactOuterRadiusReset:
    css.includes("#contact.home-contact-shell") &&
    css.includes("border-radius:0!important") &&
    css.includes("background-color:#070912!important"),
  contactInnerRounded:
    css.includes("#contact.home-contact-shell.home-final-contact") ||
    (css.includes("#contact.home-contact-shell") && css.includes(".home-final-contact") && css.includes("border-radius:clamp(34px,5vw,72px)")),
  contactTransitionGuard:
    css.includes(".home-final-contact::after") &&
    css.includes("clamp(80px,12vw,170px)"),
  responsiveHeaderMobileContract:
    css.includes("@media(max-width:900px)") &&
    css.includes(".site-header.desktop-nav") === false &&
    css.includes(".site-header .desktop-nav") &&
    css.includes(".site-header .header-actions") &&
    css.includes("display:none!important") &&
    css.includes(".site-header .menu-button") &&
    css.includes("display:inline-flex!important"),
};

const connect = await fetchPublic("/services/hermes-connect/?lang=ru");
const connectNormalized = normalize(connect.body);
const connectChecks = {
  status200: connect.status === 200,
  russianQueryPreserved: connect.finalUrl?.includes("/services/hermes-connect/?lang=ru") === true,
  localeStorageBootstrap: connect.body.includes("hermes-connect-language"),
  localeRestoreRedirect: connectNormalized.includes("window.location.replace"),
  documentLanguageBootstrap: connectNormalized.includes("document.documentelement.lang=active"),
  localePersistenceWrite: connectNormalized.includes('localstorage.setitem("hermes-connect-language",active)'),
};

const stylesheetChecks = {
  discovered: cssUrls.length > 0,
  fetched: cssFetches.length > 0 && cssFetches.every((item) => item.status === 200 && !item.error),
};

const allChecks = [
  ...Object.values(homepageChecks),
  ...Object.values(connectChecks),
  ...Object.values(stylesheetChecks),
];
const live = allChecks.every(Boolean);
const classification = live ? "LIVE_HOME_CONNECT_HOTFIX" : "HOME_CONNECT_HOTFIX_NOT_CONFIRMED";

const result = {
  checkedAt: new Date().toISOString(),
  classification,
  boundaries: {
    publicReadOnly: true,
    noFormsSubmitted: true,
    noCredentialsUsed: true,
    noPrivateDataCollected: true,
  },
  homepage: {
    status: homepage.status,
    finalUrl: homepage.finalUrl,
    checks: homepageChecks,
    stylesheetCount: cssUrls.length,
    error: homepage.error,
  },
  connectRussian: {
    status: connect.status,
    finalUrl: connect.finalUrl,
    checks: connectChecks,
    error: connect.error,
  },
  stylesheets: stylesheetChecks,
};

const checkLines = (group) => Object.entries(group)
  .map(([name, passed]) => `- ${passed ? "✅" : "❌"} ${name}`);

const markdown = [
  "# Homepage + Hermes Connect hotfix production verification",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Classification: **${classification}**`,
  `- Homepage: ${homepage.status ?? "unavailable"} · ${homepage.finalUrl ?? "unavailable"}`,
  `- Hermes Connect RU: ${connect.status ?? "unavailable"} · ${connect.finalUrl ?? "unavailable"}`,
  "",
  "## Homepage regression checks",
  "",
  ...checkLines(homepageChecks),
  "",
  "## Hermes Connect Russian locale checks",
  "",
  ...checkLines(connectChecks),
  "",
  "## Asset checks",
  "",
  ...checkLines(stylesheetChecks),
  "",
  "> Public read-only verification only. No form was submitted, no account or booking was created, and no credential/private identifier was accessed.",
  "",
].join("\n");

await fs.writeFile(path.join(outputDir, "home-connect-hotfix-production.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(outputDir, "home-connect-hotfix-production.md"), markdown, "utf8");

console.log(markdown);
if (!live) process.exitCode = 1;
