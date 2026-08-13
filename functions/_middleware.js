const CONNECT_HOST = "connect.hermeslogisticsus.com";
const MAIN_HOST = "hermeslogisticsus.com";
const LEGACY_CONNECT_ASSET_ROOT = "/demos/hermes-connect";
const BRAND_CONNECT_ASSET_ROOT = "/demos/hermes-connect-brand-v1";
const CONNECT_ANALYTICS_SCRIPT = "/connect-analytics-consent.mjs";
const CONNECT_ANALYTICS_MARKER = "data-hermes-connect-analytics-consent";
const CONNECT_BRAND_SHELL = "/brand-shell.css";
const CONNECT_BRAND_SHELL_MARKER = "data-hermes-connect-brand-shell";
const CONNECT_ACCESS_REDIRECT = "/workspace-access-redirect.js";
const CONNECT_ACCESS_REDIRECT_MARKER = "data-hermes-connect-access-redirect";
const LIVE_DELIVERY_COPY = "Delivery is confirmed only after a successful server response.";
const STALE_PUBLIC_COPY = [
  "Your information was not sent or stored.",
  "Contact delivery is not connected",
  "contact delivery is not connected",
];

const ACCESS_DOCUMENTS = new Map([
  ["/request-access", "/index.html"],
  ["/request-access/", "/index.html"],
  ["/request-access/index.html", "/index.html"],
]);

const BRAND_ROOT_ASSETS = new Set([
  "/workspace.css",
  "/workspace-launch-v2.css",
  "/workspace-v2-injected.css",
  "/workspace.js",
  "/workspace-launch-v2.js",
  "/workspace-v2.js",
  "/workspace-access-redirect.js",
  "/styles.css",
  "/app.js",
]);

const BRAND_DOCUMENTS = new Map([
  ["/", "/workspace.html"],
  ["/index.html", "/workspace.html"],
  ["/workspace", "/workspace.html"],
  ["/workspace/", "/workspace.html"],
  ["/workspace.html", "/workspace.html"],
  ["/mobile.html", "/mobile.html"],
  ["/review.html", "/review.html"],
  ["/sales-roleplay.html", "/sales-roleplay.html"],
]);

const KNOT_MARKUP = `<span class="brand-mark brand-mark-knot" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false"><path d="M8 12c0-3 2.4-5.4 5.4-5.4h7.2c2.6 0 4.7 2.1 4.7 4.7v3.4c0 2.6-2.1 4.7-4.7 4.7h-7.2A5.4 5.4 0 0 0 8 24.8V28" fill="none" stroke="#9D88FF" stroke-width="5" stroke-linecap="round"/><path d="M36 32c0 3-2.4 5.4-5.4 5.4h-7.2a4.7 4.7 0 0 1-4.7-4.7v-3.4c0-2.6 2.1-4.7 4.7-4.7h7.2a5.4 5.4 0 0 0 5.4-5.4V16" fill="none" stroke="#5AC8FA" stroke-width="5" stroke-linecap="round"/></svg></span>`;

function requestHost(request) {
  return new URL(request.url).hostname.toLowerCase();
}

function isConnectHost(request) {
  return requestHost(request) === CONNECT_HOST;
}

function acceptsMarkdown(request) {
  const accept = request.headers.get("accept") || "";
  return accept.toLowerCase().includes("text/markdown");
}

function isConnectDocument(pathname) {
  return pathname === "/" || pathname === "/index.html";
}

function connectAssetPath(pathname) {
  if (ACCESS_DOCUMENTS.has(pathname)) {
    return `${LEGACY_CONNECT_ASSET_ROOT}${ACCESS_DOCUMENTS.get(pathname)}`;
  }

  if (BRAND_DOCUMENTS.has(pathname)) {
    return `${BRAND_CONNECT_ASSET_ROOT}${BRAND_DOCUMENTS.get(pathname)}`;
  }

  if (BRAND_ROOT_ASSETS.has(pathname)) {
    return `${BRAND_CONNECT_ASSET_ROOT}${pathname}`;
  }

  if (pathname === CONNECT_BRAND_SHELL) {
    return `${LEGACY_CONNECT_ASSET_ROOT}${CONNECT_BRAND_SHELL}`;
  }

  if (pathname === LEGACY_CONNECT_ASSET_ROOT || pathname.startsWith(`${LEGACY_CONNECT_ASSET_ROOT}/`)) {
    return pathname;
  }

  if (pathname === BRAND_CONNECT_ASSET_ROOT || pathname.startsWith(`${BRAND_CONNECT_ASSET_ROOT}/`)) {
    return pathname;
  }

  return `${LEGACY_CONNECT_ASSET_ROOT}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function markdownResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/markdown; charset=utf-8");
  headers.set("x-robots-tag", "noindex, nofollow");

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

  if (!legacy && !html.includes(CONNECT_ACCESS_REDIRECT_MARKER)) {
    const compatibility = `<script src="${CONNECT_ACCESS_REDIRECT}" ${CONNECT_ACCESS_REDIRECT_MARKER}></script>`;
    html = /<\/body\s*>/i.test(html) ? html.replace(/<\/body\s*>/i, `${compatibility}</body>`) : `${html}${compatibility}`;
  }

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

async function routeConnectHost(context) {
  if (!isConnectHost(context.request)) {
    return context.next();
  }

  const incomingUrl = new URL(context.request.url);

  if (incomingUrl.pathname.startsWith("/api/")) {
    return context.next();
  }

  if (isConnectDocument(incomingUrl.pathname) && acceptsMarkdown(context.request)) {
    const markdownUrl = new URL(incomingUrl);
    markdownUrl.pathname = `${LEGACY_CONNECT_ASSET_ROOT}/index.md`;
    const response = await context.env.ASSETS.fetch(new Request(markdownUrl, context.request));
    if (response.ok) return markdownResponse(response);
  }

  const assetUrl = new URL(incomingUrl);
  const assetPath = connectAssetPath(incomingUrl.pathname);
  assetUrl.pathname = assetPath;

  const assetResponse = await context.env.ASSETS.fetch(new Request(assetUrl, context.request));
  const legacy = assetPath.startsWith(`${LEGACY_CONNECT_ASSET_ROOT}/`) && incomingUrl.pathname !== CONNECT_BRAND_SHELL;
  return connectHtmlResponse(assetResponse, { legacy });
}

async function sanitizeMainDomainCopy(context) {
  if (requestHost(context.request) !== MAIN_HOST) {
    return routeConnectHost(context);
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) return response;

  const original = await response.text();
  const sanitized = STALE_PUBLIC_COPY.reduce(
    (html, staleCopy) => html.replaceAll(staleCopy, LIVE_DELIVERY_COPY),
    original,
  );
  if (sanitized === original) return new Response(original, response);

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(sanitized, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest = [sanitizeMainDomainCopy];
