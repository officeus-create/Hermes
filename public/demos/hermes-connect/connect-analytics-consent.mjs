const MEASUREMENT_ID = "G-RY26321PVW";
const CONSENT_KEY = "hermes-analytics-consent";
const SCRIPT_ID = "hermes-connect-google-tag";
const STYLE_ID = "hermes-connect-analytics-consent-style";
const PANEL_ID = "hermes-connect-analytics-consent";
const MANAGE_ID = "hermes-connect-analytics-manage";
const ALLOWED_EVENT_KEYS = new Set([
  "event",
  "page_group",
  "page_path",
  "module_id",
  "platform_id",
  "category_id",
]);
const EVENT_PATTERN = /^[a-z][a-z0-9_]{2,63}$/;
const TOKEN_PATTERN = /^[a-z0-9][a-z0-9_-]{0,79}$/;

let analyticsEnabled = false;

function readConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : "unknown";
  } catch {
    return "unknown";
  }
}

function writeConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {}
}

function createDiscardingLayer() {
  const sink = [];
  Object.defineProperty(sink, "push", { configurable: true, value: () => 0 });
  return sink;
}

function sanitizedEventObject(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (Object.keys(input).some((key) => !ALLOWED_EVENT_KEYS.has(key))) return null;
  const event = typeof input.event === "string" ? input.event.trim() : "";
  if (!EVENT_PATTERN.test(event)) return null;
  const pageGroup = typeof input.page_group === "string" ? input.page_group.trim() : "";
  const moduleId = typeof input.module_id === "string" ? input.module_id.trim() : "";
  const platformId = typeof input.platform_id === "string" ? input.platform_id.trim() : "";
  const categoryId = typeof input.category_id === "string" ? input.category_id.trim() : "";
  if (pageGroup && (!pageGroup.startsWith("hermes_connect_") || pageGroup.length > 96)) return null;
  if (moduleId && !TOKEN_PATTERN.test(moduleId)) return null;
  if (platformId && platformId !== "web") return null;
  if (categoryId && !TOKEN_PATTERN.test(categoryId)) return null;
  return {
    event,
    ...(pageGroup ? { page_group: pageGroup } : {}),
    page_path: window.location.pathname,
    ...(moduleId ? { module_id: moduleId } : {}),
    ...(platformId ? { platform_id: platformId } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
  };
}

function installGrantedLayer() {
  const layer = [];
  const nativePush = Array.prototype.push;
  window.dataLayer = layer;
  window.gtag = function gtag() { nativePush.call(layer, arguments); };
  Object.defineProperty(layer, "push", {
    configurable: true,
    value: (...items) => {
      for (const item of items) {
        if (Object.prototype.toString.call(item) === "[object Arguments]") {
          nativePush.call(layer, item);
          continue;
        }
        const event = sanitizedEventObject(item);
        if (!event || !analyticsEnabled) continue;
        const { event: eventName, ...parameters } = event;
        window.gtag("event", eventName, parameters);
      }
      return layer.length;
    },
  });
}

function analyticsPageLocation() { return `${window.location.origin}${window.location.pathname}`; }
function loadGoogleTag() {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.append(script);
}

function emitReviewedEvent(input) {
  if (!analyticsEnabled || typeof window.gtag !== "function") return false;
  const event = sanitizedEventObject(input);
  if (!event) return false;
  const { event: eventName, ...parameters } = event;
  window.gtag("event", eventName, parameters);
  return true;
}
window.hermesConnectAnalytics = Object.freeze({ event: emitReviewedEvent, consentState: () => readConsent() });

function enableAnalytics() {
  if (analyticsEnabled) return;
  analyticsEnabled = true;
  window[`ga-disable-${MEASUREMENT_ID}`] = false;
  installGrantedLayer();
  window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", wait_for_update: 500 });
  window.gtag("set", "ads_data_redaction", true);
  window.gtag("set", "allow_google_signals", false);
  window.gtag("set", "allow_ad_personalization_signals", false);
  window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false, page_location: analyticsPageLocation(), page_path: window.location.pathname, allow_google_signals: false, allow_ad_personalization_signals: false });
  window.gtag("event", "page_view", { page_location: analyticsPageLocation(), page_path: window.location.pathname, page_title: document.title.slice(0, 120), page_group: "hermes_connect_web_app" });
  loadGoogleTag();
}

function clearAnalyticsCookies() {
  const names = document.cookie.split(";").map((item) => item.split("=")[0]?.trim()).filter((name) => name === "_ga" || name?.startsWith("_ga_"));
  for (const name of names) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}
function disableAnalytics() {
  if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window[`ga-disable-${MEASUREMENT_ID}`] = true;
  analyticsEnabled = false;
  window.dataLayer = createDiscardingLayer();
  clearAnalyticsCookies();
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `.connect-analytics-manage{position:fixed;left:14px;bottom:14px;z-index:2147483000;border:1px solid rgba(255,255,255,.24);border-radius:999px;background:#07152f;color:#fff;padding:9px 13px;font:600 12px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 8px 26px rgba(0,0,0,.2);cursor:pointer}.connect-analytics-panel{position:fixed;inset:auto 16px 16px 16px;z-index:2147483001;max-width:720px;margin:0 auto;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:#07152f;color:#fff;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.35);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.connect-analytics-panel[hidden]{display:none}.connect-analytics-panel strong{display:block;font-size:17px;margin-bottom:7px}.connect-analytics-panel p{margin:0;color:#d5dceb;font-size:13px;line-height:1.55}.connect-analytics-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}.connect-analytics-actions button{border-radius:999px;padding:10px 15px;font:700 13px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.connect-analytics-allow{border:1px solid #fff;background:#fff;color:#07152f}.connect-analytics-decline{border:1px solid rgba(255,255,255,.35);background:transparent;color:#fff}.connect-analytics-panel a{color:#fff}.connect-analytics-state{display:block;margin-top:10px;color:#aebad0;font-size:11px}@media(max-width:640px){.connect-analytics-panel{inset:auto 10px 10px 10px}.connect-analytics-manage{left:10px;bottom:10px}}`;
  document.head.append(style);
}
function renderConsentControls() {
  ensureStyles();
  const manage = document.createElement("button"); manage.type = "button"; manage.id = MANAGE_ID; manage.className = "connect-analytics-manage"; manage.textContent = "Privacy"; manage.setAttribute("aria-controls", PANEL_ID);
  const panel = document.createElement("section"); panel.id = PANEL_ID; panel.className = "connect-analytics-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Hermes Connect analytics choices");
  const heading = document.createElement("strong"); heading.textContent = "Optional analytics for Hermes Connect";
  const copy = document.createElement("p"); copy.textContent = "Allow privacy-limited analytics to help Hermes understand which Connect tools are used. Advertising storage stays denied. Tool inputs, routes, rates, customer or carrier details, free text, and imported search or revenue values are not sent by this analytics layer.";
  const details = document.createElement("p"); details.style.marginTop = "8px"; const privacyLink = document.createElement("a"); privacyLink.href = "https://hermeslogisticsus.com/privacy/"; privacyLink.textContent = "Read the privacy notice"; details.append(privacyLink);
  const actions = document.createElement("div"); actions.className = "connect-analytics-actions";
  const allow = document.createElement("button"); allow.type = "button"; allow.className = "connect-analytics-allow"; allow.textContent = "Allow analytics";
  const decline = document.createElement("button"); decline.type = "button"; decline.className = "connect-analytics-decline"; decline.textContent = "Decline"; actions.append(allow, decline);
  const state = document.createElement("span"); state.className = "connect-analytics-state";
  const refreshState = () => { const value = readConsent(); state.textContent = value === "granted" ? "Analytics: allowed" : value === "denied" ? "Analytics: declined" : "Analytics: not chosen"; };
  allow.addEventListener("click", () => { writeConsent("granted"); enableAnalytics(); refreshState(); panel.hidden = true; manage.focus(); });
  decline.addEventListener("click", () => { writeConsent("denied"); disableAnalytics(); refreshState(); panel.hidden = true; manage.focus(); });
  manage.addEventListener("click", () => { panel.hidden = !panel.hidden; if (!panel.hidden) allow.focus(); });
  panel.append(heading, copy, details, actions, state); refreshState(); panel.hidden = readConsent() !== "unknown"; document.body.append(panel, manage);
}
window.dataLayer = createDiscardingLayer();
window[`ga-disable-${MEASUREMENT_ID}`] = true;
if (readConsent() === "granted") enableAnalytics();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderConsentControls, { once: true }); else renderConsentControls();
