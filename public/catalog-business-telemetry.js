(() => {
  const script = document.currentScript;
  const catalogBusinessId = String(script?.dataset?.catalogBusinessId || "").trim();
  if (!catalogBusinessId) return;

  const CONSENT_KEY = "hermes-analytics-consent";
  const sentOnce = new Set();

  const hasConsent = () => {
    if (navigator.webdriver === true) return false;
    try {
      return localStorage.getItem(CONSENT_KEY) === "granted";
    } catch {
      return false;
    }
  };

  const send = (eventType, once = false) => {
    if (!hasConsent()) return;
    if (once && sentOnce.has(eventType)) return;
    if (once) sentOnce.add(eventType);
    fetch("/api/catalog-business-event", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catalog_business_id: catalogBusinessId,
        event_type: eventType,
        analytics_consent: true,
      }),
    }).catch(() => {
      if (once) sentOnce.delete(eventType);
    });
  };

  const bindClicks = () => {
    document.querySelectorAll("[data-catalog-event]").forEach((node) => {
      if (!(node instanceof HTMLElement) || node.dataset.catalogTelemetryBound === "true") return;
      node.dataset.catalogTelemetryBound = "true";
      node.addEventListener("click", () => {
        const eventType = String(node.dataset.catalogEvent || "").trim();
        if (eventType) send(eventType);
      }, { passive: true });
    });
  };

  const start = () => {
    bindClicks();
    send("profile_view", true);
    const observer = new MutationObserver(() => {
      if (document.documentElement.dataset.analyticsConsent === "granted") {
        send("profile_view", true);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-analytics-consent"],
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
