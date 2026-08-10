/**
 * Browser micro-conversion helpers.
 * Emits CustomEvent `hermes:analytics` for local product behavior.
 * Google dataLayer delivery is permitted only after explicit analytics consent.
 */

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const ANALYTICS_CONSENT_KEY = "hermes-analytics-consent";

function analyticsConsentGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

function emit(name: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const detail = { name, ...payload, ts: Date.now() };
  window.dispatchEvent(new CustomEvent("hermes:analytics", { detail }));

  if (analyticsConsentGranted() && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...payload });
  }
}

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
