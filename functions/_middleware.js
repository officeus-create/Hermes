const CONNECT_HOST = "connect.hermeslogisticsus.com";
const MAIN_HOST = "hermeslogisticsus.com";
const CONNECT_ASSET_ROOT = "/demos/hermes-connect";
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

function connectAssetPath(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return `${CONNECT_ASSET_ROOT}/`;
  }

  if (pathname === CONNECT_ASSET_ROOT || pathname.startsWith(`${CONNECT_ASSET_ROOT}/`)) {
    return pathname;
  }

  return `${CONNECT_ASSET_ROOT}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function routeConnectHost(context) {
  if (!isConnectHost(context.request)) {
    return context.next();
  }

  const incomingUrl = new URL(context.request.url);

  // Keep the lead receiver and any future explicit API routes on their normal
  // Pages Functions paths. The public Web App currently posts to the main
  // Hermes origin, but this boundary prevents a static-asset rewrite from
  // shadowing an API endpoint later.
  if (incomingUrl.pathname.startsWith("/api/")) {
    return context.next();
  }

  const assetUrl = new URL(incomingUrl);
  assetUrl.pathname = connectAssetPath(incomingUrl.pathname);

  const assetResponse = await context.env.ASSETS.fetch(
    new Request(assetUrl, context.request),
  );

  // Do not let the internal /demos path leak into the browser. The request URL
  // remains on connect.hermeslogisticsus.com while Pages serves the approved
  // Web App assets from the reviewed repository release.
  return assetResponse;
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
