const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export const DEFAULT_SCREENSHOT_ROUTES = Object.freeze([
  { id: "homepage", path: "/" },
  { id: "path-logistics", path: "/paths/logistics/" },
  { id: "path-marketing", path: "/paths/marketing/" },
  { id: "path-academy", path: "/paths/academy/" },
  { id: "path-technology", path: "/paths/technology/" },
  { id: "car-hauling-dispatch", path: "/logistics/car-hauling-dispatch/" },
  { id: "carrier-sales", path: "/carrier/" },
  { id: "carrier-signing", path: "/sign/" },
  { id: "dealer-vehicle-transportation", path: "/logistics/dealer-vehicle-transportation/" },
  { id: "load-board", path: "/load-board/" },
  { id: "seo-service", path: "/services/seo/" },
  { id: "hermes-connect-overview", path: "/services/hermes-connect/" },
  { id: "repair-shops", path: "/services/hermes-connect/repair-shops/" },
  { id: "repair-shop-auth", path: "/services/hermes-connect/repair-shops/auth/" },
  { id: "repair-shop-plan", path: "/services/hermes-connect/repair-shops/plan/" },
  { id: "hermes-connect-web-app", path: "/demos/hermes-connect/" },
]);

export const SCREENSHOT_VIEWPORTS = Object.freeze([
  { id: "desktop", width: 1440, height: 1200 },
  { id: "mobile", width: 390, height: 844 },
]);

export function parseScreenshotBaseUrl(value, { allowRemote = false } = {}) {
  const url = new URL(value);
  if (!new Set(["http:", "https:"]).has(url.protocol)) throw new Error(`Unsupported screenshot protocol: ${url.protocol}`);
  if (url.username || url.password) throw new Error("Screenshot base URL must not contain credentials");
  if (!allowRemote && !LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error(`Remote screenshot capture is disabled for ${url.hostname}. Use a loopback preview or explicitly set ALLOW_REMOTE_SCREENSHOTS=true.`);
  }
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

export function validateScreenshotRoutes(routes = DEFAULT_SCREENSHOT_ROUTES) {
  const ids = new Set();
  const paths = new Set();
  for (const route of routes) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route.id)) throw new Error(`Invalid screenshot route id: ${route.id}`);
    if (!route.path.startsWith("/") || route.path.includes("?") || route.path.includes("#")) throw new Error(`Screenshot route must be a clean absolute path: ${route.path}`);
    if (ids.has(route.id) || paths.has(route.path)) throw new Error(`Duplicate screenshot route: ${route.id} ${route.path}`);
    ids.add(route.id);
    paths.add(route.path);
  }
  return routes;
}

export function screenshotUrl(baseUrl, routePath) {
  return new URL(routePath.replace(/^\//, ""), baseUrl);
}

export function screenshotFileName(routeId, viewportId) {
  if (!/^[a-z0-9-]+$/.test(routeId) || !/^[a-z0-9-]+$/.test(viewportId)) throw new Error("Screenshot file identifiers must be slug-safe");
  return `${routeId}--${viewportId}.png`;
}
