/**
 * Browser micro-conversion helpers.
 * Emits CustomEvent `hermes:analytics` for local product behavior.
 * Google delivery is permitted only after explicit analytics consent.
 */

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

type GtagParameters = Record<string, string | number | boolean>;
type AnalyticsWindow = Window & {
  gtag?: (command: "event", eventName: string, parameters?: GtagParameters) => void;
  __hermesCarrierGa4Bridge?: boolean;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const ANALYTICS_CONSENT_KEY = "hermes-analytics-consent";
const LOAD_BOARD_PATH = "/load-board/";
const CARRIER_GA4_EVENTS = new Set([
  "carrier_intake_start",
  "carrier_intake_preview_ready",
  "carrier_handoff_ready",
]);
const CARRIER_GA4_PARAMETER_KEYS = new Set([
  "audience_type",
  "page_group",
  "service_group",
  "page_path",
  "preview_status",
  "handoff_method",
]);
let pushingFromEmit = false;

function analyticsConsentGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

function normalizePayload(payload: AnalyticsPayload): GtagParameters {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as GtagParameters;
}

function carrierGa4Parameters(payload: Record<string, unknown>): GtagParameters {
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => (
      CARRIER_GA4_PARAMETER_KEYS.has(key)
      && (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    )),
  ) as GtagParameters;
}

function installCarrierDataLayerBridge(): void {
  if (typeof window === "undefined" || window.location.pathname !== LOAD_BOARD_PATH) return;

  const analyticsWindow = window as AnalyticsWindow;
  if (analyticsWindow.__hermesCarrierGa4Bridge) return;

  window.dataLayer = window.dataLayer || [];
  const layer = window.dataLayer;
  const nativePush = layer.push.bind(layer);

  layer.push = (...items: Record<string, unknown>[]) => {
    const result = nativePush(...items);
    if (pushingFromEmit || !analyticsConsentGranted() || typeof analyticsWindow.gtag !== "function") return result;

    for (const item of items) {
      const eventName = typeof item?.event === "string" ? item.event : "";
      if (!CARRIER_GA4_EVENTS.has(eventName)) continue;
      analyticsWindow.gtag("event", eventName, carrierGa4Parameters(item));
    }
    return result;
  };

  analyticsWindow.__hermesCarrierGa4Bridge = true;
}

function emit(name: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const detail = { name, ...payload, ts: Date.now() };
  window.dispatchEvent(new CustomEvent("hermes:analytics", { detail }));

  if (analyticsConsentGranted() && Array.isArray(window.dataLayer)) {
    const parameters = normalizePayload(payload);
    (window as AnalyticsWindow).gtag?.("event", name, parameters);
    try {
      pushingFromEmit = true;
      window.dataLayer.push({ event: name, ...parameters });
    } finally {
      pushingFromEmit = false;
    }
  }
}

installCarrierDataLayerBridge();

export function trackTrackSelected(track: string): void {
  emit("track_selected", { track });
}

export function trackCaseOpened(caseId: string): void {
  emit("case_opened", { caseId });
}

export function trackSimulationStarted(): void {
  emit("simulation_started");
}

export function trackCtaClicked(ctaName: string): void {
  emit("cta_clicked", { ctaName });
}

export function trackEvent(name: string, payload: AnalyticsPayload = {}): void {
  emit(name, payload);
}
