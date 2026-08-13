const CONNECT_HOST = "connect.hermeslogisticsus.com";
const MAIN_HOST = "hermeslogisticsus.com";
const CONNECT_ASSET_ROOT = "/demos/hermes-connect";
const CONNECT_ANALYTICS_SCRIPT = "/connect-analytics-consent.mjs";
const CONNECT_ANALYTICS_MARKER = "data-hermes-connect-analytics-consent";
const LIVE_DELIVERY_COPY = "Delivery is confirmed only after a successful server response.";
const STALE_PUBLIC_COPY = [
  "Your information was not sent or stored.",
  "Contact delivery is not connected",
  "contact delivery is not connected",
];

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
  if (isConnectDocument(pathname)) {
    return `${CONNECT_ASSET_ROOT}/`;
  }

  if (pathname === CONNECT_ASSET_ROOT || pathname.startsWith(`${CONNECT_ASSET_ROOT}/`)) {
    return pathname;
  }

  return `${CONNECT_ASSET_ROOT}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
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

async function connectHtmlResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) return response;

  const original = await response.text();
  if (original.includes(CONNECT_ANALYTICS_MARKER)) {
    return new Response(original, response);
  }

  const bootstrap = `<script type="module" src="${CONNECT_ANALYTICS_SCRIPT}" ${CONNECT_ANALYTICS_MARKER}></script>`;
  const closingHead = /<\/head\s*>/i;
  const injected = closingHead.test(original)
    ? original.replace(closingHead, `${bootstrap}</head>`)
    : `${bootstrap}${original}`;

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(injected, {
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
    markdownUrl.pathname = `${CONNECT_ASSET_ROOT}/index.md`;
    const response = await context.env.ASSETS.fetch(
      new Request(markdownUrl, context.request),
    );
    if (response.ok) return markdownResponse(response);
  }

  const assetUrl = new URL(incomingUrl);
  assetUrl.pathname = connectAssetPath(incomingUrl.pathname);

  const assetResponse = await context.env.ASSETS.fetch(
    new Request(assetUrl, context.request),
  );

  return connectHtmlResponse(assetResponse);
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
