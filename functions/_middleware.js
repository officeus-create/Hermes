const CONNECT_HOST = "connect.hermeslogisticsus.com";
const CONNECT_ASSET_ROOT = "/demos/hermes-connect";

function isConnectHost(request) {
  return new URL(request.url).hostname.toLowerCase() === CONNECT_HOST;
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

export const onRequest = [routeConnectHost];
