/**
 * Browser micro-conversion helpers.
 * Emits CustomEvent `hermes:analytics` and optional dataLayer push.
 * No third-party network calls until an approved receiver is configured.
 */

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function emit(name: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const detail = { name, ...payload, ts: Date.now() };
  window.dispatchEvent(new CustomEvent("hermes:analytics", { detail }));

  if (Array.isArray(window.dataLayer)) {
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
