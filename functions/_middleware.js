import { requireInternalOwner } from "./api/_lib/internal-ai.mjs";

const CONNECT_HOST = "connect.hermeslogisticsus.com";
const MAIN_HOST = "hermeslogisticsus.com";
const WWW_MAIN_HOST = "www.hermeslogisticsus.com";
const PAGES_PRODUCTION_HOST = "hermes-eu4.pages.dev";
const CONNECT_ASSET_ROOT = "/demos/hermes-connect";
const OLD_BRAND_CONNECT_ASSET_ROOT = "/demos/hermes-connect-brand-v1";
const CONNECT_ANALYTICS_SCRIPT = "/connect-analytics-consent.mjs";
const CONNECT_ANALYTICS_MARKER = "data-hermes-connect-analytics-consent";
const CONNECT_BRAND_SHELL = "/brand-shell.css";
const CONNECT_BRAND_SHELL_MARKER = "data-hermes-connect-brand-shell";
const HSTS_HEADER_VALUE = "max-age=31536000";

const MAIN_LEGACY_REDIRECTS = new Map([
  ["/academy", "/paths/academy/"],
  ["/academy/", "/paths/academy/"],
  ["/logistics", "/paths/logistics/"],
  ["/logistics/", "/paths/logistics/"],
  // The carrier audience page merged into the car-hauling dispatch service page (owner decision 2026-10-28).
  ["/logistics/carrier", "/logistics/car-hauling-dispatch/"],
  ["/logistics/carrier/", "/logistics/car-hauling-dispatch/"],
  ["/resources/rpm-calculator", "/logistics/resources/rpm-calculator/"],
  ["/resources/rpm-calculator/", "/logistics/resources/rpm-calculator/"],
  ["/tools/load-analyzer", "/services/hermes-connect/load-analyzer/"],
  ["/tools/load-analyzer/", "/services/hermes-connect/load-analyzer/"],
  ["/ai-command-center", "/services/hermes-connect/command-center/"],
  ["/ai-command-center/", "/services/hermes-connect/command-center/"],
  ["/services/hermes-connect/ai-command-center", "/services/hermes-connect/command-center/"],
  ["/services/hermes-connect/ai-command-center/", "/services/hermes-connect/command-center/"],
  ["/unified-inbox", "/services/hermes-connect/unified-inbox/"],
  ["/unified-inbox/", "/services/hermes-connect/unified-inbox/"],
]);

const MAIN_GONE_PATHS = new Set([
  "/dashboard",
  "/month",
  "/месяц",
  "/cdn-cgi/l/email-protection",
  // Historical malformed root URL surfaced by Search Console on 2026-10-07.
  "/\uFFFC",
  // Historical malformed backlink target `/%20rel=nofollow`; pathname is decoded before lookup.
  "/ rel=nofollow",
]);

const ACCESS_DOCUMENTS = new Map([
  ["/request-access", "/index.html"],
  ["/request-access/", "/index.html"],
  ["/request-access/index.html", "/index.html"],
]);

const CONNECT_DOCUMENTS = new Map([
  ["/", "/workspace.html"],
  ["/index.html", "/workspace.html"],
  ["/workspace", "/workspace.html"],
  ["/workspace/", "/workspace.html"],
  ["/workspace.html", "/workspace.html"],
  ["/mobile.html", "/workspace.html"],
  ["/review.html", "/review.html"],
  ["/sales-roleplay.html", "/sales-roleplay.html"],
]);

const CONNECT_COMPAT_ENTRY_PATHS = new Set([
  "/",
  "/index.html",
  "/workspace",
  "/workspace/",
  "/workspace.html",
  "/mobile.html",
]);

const CURRENT_CAPABILITY_PATHS = new Set([
  "/ai-command-center",
  "/command-center",
  "/unified-inbox",
  "/load-analyzer",
  "/rate-negotiator",
  "/proposal-builder",
  "/roi-calculator",
  "/business-automation",
  "/repair-shops",
]);

const EXPLICIT_DEMO_DOCUMENTS = new Set([
  "/review.html",
  "/sales-roleplay.html",
]);

const SUPPORTED_CONNECT_LANGS = new Set(["en", "es", "fr", "uk", "it", "ru"]);

const NATIVE_CONNECT_DOCUMENTS = new Set([
  "/workspace.html",
  "/review.html",
  "/sales-roleplay.html",
]);

const KNOT_MARKUP = `<span class="brand-mark brand-mark-knot" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false"><path d="M8 12c0-3 2.4-5.4 5.4-5.4h7.2c2.6 0 4.7 2.1 4.7 4.7v3.4c0 2.6-2.1 4.7-4.7 4.7h-7.2A5.4 5.4 0 0 0 8 24.8V28" fill="none" stroke="#9D88FF" stroke-width="5" stroke-linecap="round"/><path d="M36 32c0 3-2.4 5.4-5.4 5.4h-7.2a4.7 4.7 0 0 1-4.7-4.7v-3.4c0-2.6 2.1-4.7 4.7-4.7h7.2a5.4 5.4 0 0 0 5.4-5.4V16" fill="none" stroke="#5AC8FA" stroke-width="5" stroke-linecap="round"/></svg></span>`;

function requestHost(request) {
  return new URL(request.url).hostname.toLowerCase();
}

function isConnectHost(request) {
  return requestHost(request) === CONNECT_HOST;
}

function withTransportSecurity(response) {
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", HSTS_HEADER_VALUE);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function acceptsMarkdown(request) {
  const accept = request.headers.get("accept") || "";
  return accept.toLowerCase().includes("text/markdown");
}

function isConnectDocument(pathname) {
  return pathname === "/" || pathname === "/index.html";
}

function supportedConnectLang(incomingUrl) {
  const lang = incomingUrl.searchParams.get("lang");
  return lang && SUPPORTED_CONNECT_LANGS.has(lang) ? lang : null;
}

function normalizedCapabilityPath(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return CURRENT_CAPABILITY_PATHS.has(normalized) ? normalized : null;
}

function secureReferralCompatibilityRedirect(incomingUrl) {
  const ref = incomingUrl.searchParams.get("ref");
  if (!ref) return null;

  const target = new URL(`https://${MAIN_HOST}/api/repair-shop/referral`);
  target.searchParams.set("ref", ref);
  const lang = supportedConnectLang(incomingUrl);
  if (lang) target.searchParams.set("lang", lang);

  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function canonicalConnectCompatibilityRedirect(incomingUrl) {
  const isEntry = CONNECT_COMPAT_ENTRY_PATHS.has(incomingUrl.pathname);
  const isAccess = ACCESS_DOCUMENTS.has(incomingUrl.pathname);

  if ((isEntry || isAccess) && incomingUrl.searchParams.has("ref")) {
    return secureReferralCompatibilityRedirect(incomingUrl);
  }

  let targetPath = null;
  if (isEntry) {
    targetPath = incomingUrl.searchParams.get("business_type") === "auto_repair"
      ? "/services/hermes-connect/repair-shops/"
      : "/services/hermes-connect/";
  } else if (isAccess) {
    targetPath = "/services/hermes-connect/repair-shops/auth/";
  } else {
    const capabilityPath = normalizedCapabilityPath(incomingUrl.pathname);
    if (capabilityPath) targetPath = capabilityPath === "/ai-command-center"
      ? "/services/hermes-connect/command-center/"
      : `/services/hermes-connect${capabilityPath}/`;
    else if (EXPLICIT_DEMO_DOCUMENTS.has(incomingUrl.pathname)) targetPath = `${CONNECT_ASSET_ROOT}${incomingUrl.pathname}`;
  }

  if (!targetPath) return null;

  const target = new URL(`https://${MAIN_HOST}${targetPath}`);
  const lang = supportedConnectLang(incomingUrl);
  if (lang && lang !== "en") target.searchParams.set("lang", lang);

  if (isAccess) {
    target.searchParams.set("mode", "register");
    const referralState = incomingUrl.searchParams.get("referral");
    if (referralState === "captured" || referralState === "invalid") {
      target.searchParams.set("referral", referralState);
    }
  }

  return Response.redirect(target.toString(), 308);
}

function connectAssetPath(pathname) {
  if (pathname === "/robots.txt") {
    return pathname;
  }

  if (ACCESS_DOCUMENTS.has(pathname)) {
    return `${CONNECT_ASSET_ROOT}${ACCESS_DOCUMENTS.get(pathname)}`;
  }

  if (CONNECT_DOCUMENTS.has(pathname)) {
    return `${CONNECT_ASSET_ROOT}${CONNECT_DOCUMENTS.get(pathname)}`;
  }

  if (pathname === CONNECT_ASSET_ROOT || pathname.startsWith(`${CONNECT_ASSET_ROOT}/`)) {
    return pathname;
  }

  return `${CONNECT_ASSET_ROOT}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function markdownResponse(response, { noindex = true, contentSignal = null, contentLocation = null } = {}) {
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/markdown; charset=utf-8");
  if (noindex) headers.set("x-robots-tag", "noindex, nofollow");
  else headers.delete("x-robots-tag");
  if (contentSignal) headers.set("content-signal", contentSignal);
  if (contentLocation) headers.set("content-location", contentLocation);

  const vary = headers.get("vary");
  if (!vary) {
    headers.set("vary", "Accept");
  } else if (!vary.toLowerCase().split(",").map((value) => value.trim()).includes("accept")) {
    headers.set("vary", `${vary}, Accept`);
  }

  headers.delete("content-length");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function applyLegacyBrandShell(html) {
  let next = html.replaceAll('<span class="brand-mark">H</span>', KNOT_MARKUP);
  next = next.replaceAll('<strong>H</strong>', `<strong class="brand-mark-inline" aria-label="Hermes Connect">HC</strong>`);

  if (!next.includes(CONNECT_BRAND_SHELL_MARKER)) {
    const stylesheet = `<link rel="stylesheet" href="${CONNECT_BRAND_SHELL}" ${CONNECT_BRAND_SHELL_MARKER}>`;
    next = /<\/head\s*>/i.test(next) ? next.replace(/<\/head\s*>/i, `${stylesheet}</head>`) : `${stylesheet}${next}`;
  }
  return next;
}

async function connectHtmlResponse(response, { legacy = false } = {}) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) return response;

  let html = await response.text();
  if (legacy) html = applyLegacyBrandShell(html);

  if (!html.includes(CONNECT_ANALYTICS_MARKER)) {
    const bootstrap = `<script type="module" src="${CONNECT_ANALYTICS_SCRIPT}" ${CONNECT_ANALYTICS_MARKER}></script>`;
    html = /<\/head\s*>/i.test(html) ? html.replace(/<\/head\s*>/i, `${bootstrap}</head>`) : `${bootstrap}${html}`;
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function canonicalOldBrandRedirect(incomingUrl) {
  if (!incomingUrl.pathname.startsWith(OLD_BRAND_CONNECT_ASSET_ROOT)) return null;

  const suffix = incomingUrl.pathname.slice(OLD_BRAND_CONNECT_ASSET_ROOT.length) || "/";
  const target = new URL(`https://${CONNECT_HOST}/`);
  target.search = incomingUrl.search;
  target.hash = incomingUrl.hash;

  if (["/", "/index.html", "/workspace", "/workspace/", "/workspace.html", "/mobile.html", "/workspace-v2.html"].includes(suffix)) {
    return target;
  }

  if (suffix === "/workspace-launch-v2.css") target.pathname = "/workspace-enhancements.css";
  else if (suffix === "/workspace-launch-v2.js") target.pathname = "/workspace-enhancements.js";
  else if (["/workspace-v2-injected.css", "/workspace-v2.js"].includes(suffix)) target.pathname = "/";
  else target.pathname = suffix;
  return target;
}

async function routeConnectHost(context) {
  if (!isConnectHost(context.request)) {
    return context.next();
  }

  const incomingUrl = new URL(context.request.url);

  if (incomingUrl.pathname.startsWith("/api/")) {
    return withTransportSecurity(await context.next());
  }

  const oldBrandTarget = canonicalOldBrandRedirect(incomingUrl);
  if (oldBrandTarget) return withTransportSecurity(Response.redirect(oldBrandTarget.toString(), 308));

  if (isConnectDocument(incomingUrl.pathname) && acceptsMarkdown(context.request)) {
    const markdownUrl = new URL(incomingUrl);
    markdownUrl.pathname = `${CONNECT_ASSET_ROOT}/index.md`;
    const response = await context.env.ASSETS.fetch(new Request(markdownUrl, context.request));
    if (response.ok) return withTransportSecurity(markdownResponse(response));
  }

  const compatibilityResponse = canonicalConnectCompatibilityRedirect(incomingUrl);
  if (compatibilityResponse) return withTransportSecurity(compatibilityResponse);

  const assetUrl = new URL(incomingUrl);
  const assetPath = connectAssetPath(incomingUrl.pathname);
  assetUrl.pathname = assetPath;

  const assetResponse = await context.env.ASSETS.fetch(new Request(assetUrl, context.request));
  const relativeAssetPath = assetPath.slice(CONNECT_ASSET_ROOT.length);
  const legacy = !NATIVE_CONNECT_DOCUMENTS.has(relativeAssetPath) && incomingUrl.pathname !== CONNECT_BRAND_SHELL;
  return withTransportSecurity(await connectHtmlResponse(assetResponse, { legacy }));
}

function canonicalPublicHostRedirect(request) {
  const incomingUrl = new URL(request.url);
  const hostname = incomingUrl.hostname.toLowerCase();
  if (hostname !== PAGES_PRODUCTION_HOST && hostname !== WWW_MAIN_HOST) return null;

  const target = new URL(`https://${MAIN_HOST}${incomingUrl.pathname}`);
  target.search = incomingUrl.search;
  return Response.redirect(target.toString(), 308);
}

function canonicalMainLegacyRedirect(incomingUrl) {
  const targetPath = MAIN_LEGACY_REDIRECTS.get(incomingUrl.pathname);
  if (!targetPath) return null;

  const target = new URL(`https://${MAIN_HOST}${targetPath}`);
  target.search = incomingUrl.search;
  return Response.redirect(target.toString(), 301);
}

function canonicalGonePath(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Keep the encoded pathname when malformed percent-encoding is supplied.
  }
  const normalized = decoded.length > 1 ? decoded.replace(/\/+$/, "") : decoded;
  return MAIN_GONE_PATHS.has(normalized) ? normalized : null;
}

function privateCommandCenterGateResponse(status, incomingUrl) {
  const ru = incomingUrl.searchParams.get("lang") === "ru";
  const title = status === 401
    ? (ru ? "Вход в Command Center" : "Sign in to Command Center")
    : status === 403
      ? (ru ? "Нужен доступ владельца" : "Owner access required")
      : (ru ? "Command Center временно недоступен" : "Command Center temporarily unavailable");
  const copy = status === 401
    ? (ru ? "Закрытая рабочая система открывается только после защищённого входа в Hermes." : "The private workspace opens only after secure Hermes sign-in.")
    : status === 403
      ? (ru ? "Сессия активна, но права владельца для этого рабочего пространства ещё не подтверждены." : "Your session is active, but owner access for this workspace has not been verified yet.")
      : (ru ? "Сервер не смог подтвердить защищённый доступ. Попробуйте снова после восстановления сервиса." : "The server could not verify secure access. Try again after service recovery.");
  const actionHref = status === 401
    ? "/services/hermes-connect/access/?source=command-center" + (ru ? "&lang=ru" : "")
    : status === 403
      ? "/services/hermes-connect/internal/ai-connect/" + (ru ? "?lang=ru" : "")
      : "/services/hermes-connect/command-center/" + (ru ? "?lang=ru" : "");
  const action = status === 401
    ? (ru ? "Войти в Hermes" : "Sign in to Hermes")
    : status === 403
      ? (ru ? "Проверить доступ владельца" : "Review owner access")
      : (ru ? "Открыть публичное демо" : "Open public demo");
  const html = `<!doctype html><html lang="${ru ? "ru" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>${title} | Hermes Connect</title><style>body{margin:0;background:#f7f6f3;color:#0b0d12;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.gate{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(620px,100%);box-sizing:border-box;border:1px solid rgba(11,13,18,.1);border-radius:30px;background:#fff;padding:clamp(24px,5vw,48px);box-shadow:0 24px 70px rgba(11,13,18,.08)}.eyebrow{color:#6446e6;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.card h1{margin:12px 0;font-size:clamp(32px,7vw,56px);line-height:.98;letter-spacing:-.05em}.card p{color:#666c79;font-size:17px;line-height:1.65}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.actions a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:0 18px;border-radius:12px;text-decoration:none;font-weight:800}.primary{background:#0a164f;color:#fff}.secondary{border:1px solid rgba(11,13,18,.12);color:#0b0d12}</style></head><body><main class="gate"><section class="card"><div class="eyebrow">Hermes Connect · Private workspace</div><h1>${title}</h1><p>${copy}</p><div class="actions"><a class="primary" href="${actionHref}">${action}</a><a class="secondary" href="/services/hermes-connect/command-center/${ru ? "?lang=ru" : ""}">${ru ? "Публичная версия" : "Public version"}</a></div></section></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "same-origin",
    },
  });
}

function goneSearchArtifactResponse() {
  return new Response("Gone", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function withLoadBoardVariantNoindex(response) {
  const variant = new Response(response.body, response);
  variant.headers.set("X-Robots-Tag", "noindex, follow");
  return variant;
}

async function routeMainAndCompatibilityHosts(context) {
  const publicHostRedirect = canonicalPublicHostRedirect(context.request);
  if (publicHostRedirect) return withTransportSecurity(publicHostRedirect);

  if (requestHost(context.request) !== MAIN_HOST) {
    return routeConnectHost(context);
  }

  const incomingUrl = new URL(context.request.url);
  const normalizedPrivatePath = incomingUrl.pathname.length > 1 ? incomingUrl.pathname.replace(/\/+$/, "") : incomingUrl.pathname;
  const isPrivateCommandCenter = normalizedPrivatePath === "/services/hermes-connect/internal/command-center"
    || normalizedPrivatePath === "/services/hermes-connect/internal/command-center/index.html";
  if (isPrivateCommandCenter) {
    const owner = await requireInternalOwner(context.request, context.env);
    if (owner.response) return withTransportSecurity(privateCommandCenterGateResponse(owner.response.status, incomingUrl));
  }
  if (canonicalGonePath(incomingUrl.pathname)) {
    return withTransportSecurity(goneSearchArtifactResponse());
  }
  const legacyRedirect = canonicalMainLegacyRedirect(incomingUrl);
  if (legacyRedirect) return withTransportSecurity(legacyRedirect);

  const oldBrandTarget = canonicalOldBrandRedirect(incomingUrl);
  if (oldBrandTarget) return Response.redirect(oldBrandTarget.toString(), 308);

  if ((incomingUrl.pathname === "/" || incomingUrl.pathname === "/index.html") && acceptsMarkdown(context.request)) {
    const markdownUrl = new URL(incomingUrl);
    markdownUrl.pathname = "/llms.txt";
    markdownUrl.search = "";
    const markdownAsset = await context.env.ASSETS.fetch(new Request(markdownUrl, context.request));
    if (markdownAsset.ok) {
      return markdownResponse(markdownAsset, {
        noindex: false,
        contentSignal: "search=yes, ai-input=yes",
        contentLocation: "/llms.txt",
      });
    }
  }

  // Role/prefill links (?role=carrier, ?role=dealer, ...) keep working for visitors,
  // but only the bare /load-board/ URL is indexed so search signals stay on one page.
  if (incomingUrl.pathname === "/load-board/" && incomingUrl.search) {
    return withLoadBoardVariantNoindex(await context.next());
  }

  // Ordinary main-domain pages are static Astro output. Return the upstream
  // response untouched so the root middleware does not buffer/rewrite every
  // HTML document in memory. Public-copy correctness is enforced at source
  // and build/test layers instead of at the edge.
  return context.next();
}

export const onRequest = [routeMainAndCompatibilityHosts];
