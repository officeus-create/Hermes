(() => {
  const root = document.querySelector("[data-catalog-business-id]");
  if (!(root instanceof HTMLElement)) return;
  const businessId = (root.dataset.catalogBusinessId || "").trim();
  if (!businessId) return;

  const CONSENT_KEY = "hermes-analytics-consent";
  let viewSent = false;
  const hasConsent = () => {
    if (navigator.webdriver === true) return false;
    try {
      return localStorage.getItem(CONSENT_KEY) === "granted";
    } catch {
      return false;
    }
  };

  const send = (action) => {
    if (!hasConsent()) return;
    fetch("/api/catalog/activity", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_id: businessId,
        action,
        analytics_consent: true
      })
    }).catch(() => {});
  };

  const sendView = () => {
    if (viewSent || !hasConsent()) return;
    viewSent = true;
    send("profile_view");
  };

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-catalog-action]") : null;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.catalogAction || "";
    if (["call_click", "maps_click", "website_click", "booking_click"].includes(action)) send(action);
  }, { capture: true });

  sendView();
  const observer = new MutationObserver(() => {
    if (document.documentElement.dataset.analyticsConsent === "granted") sendView();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-analytics-consent"] });
})();
