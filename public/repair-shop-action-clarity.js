(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const dynamicPlaceholderSelectors = [
    "#open-link-btn",
    "#open-booking-link",
    "#detail-email",
    "#detail-phone",
    "[data-call-shop]",
    "[data-shop-directions]",
  ];

  function installStyles() {
    if (document.getElementById("hc-repair-action-clarity-styles")) return;
    const style = document.createElement("style");
    style.id = "hc-repair-action-clarity-styles";
    style.textContent = `
      [data-hc-awaiting-action="true"]{display:none!important}
      .connection-card button:disabled,.connection-card [data-hc-pending-action="true"]{min-height:0!important;width:max-content!important;padding:5px 9px!important;border:1px solid #e1e7ed!important;border-radius:999px!important;background:#f4f6f8!important;color:#738093!important;box-shadow:none!important;cursor:default!important;font-size:11px!important;font-weight:800!important;opacity:1!important}
      .connection-card button:disabled::before,.connection-card [data-hc-pending-action="true"]::before{content:""}
    `;
    document.head.append(style);
  }

  function syncDynamicAnchors() {
    for (const selector of dynamicPlaceholderSelectors) {
      document.querySelectorAll(selector).forEach((node) => {
        if (!(node instanceof HTMLAnchorElement)) return;
        const href = (node.getAttribute("href") || "").trim();
        const waiting = !href || href === "#";
        if (waiting) {
          node.dataset.hcAwaitingAction = "true";
          node.setAttribute("aria-disabled", "true");
          node.tabIndex = -1;
        } else if (node.dataset.hcAwaitingAction === "true") {
          delete node.dataset.hcAwaitingAction;
          node.removeAttribute("aria-disabled");
          node.removeAttribute("tabindex");
        }
      });
    }
  }

  function clarifyPendingConnections() {
    document.querySelectorAll(".connection-card button:disabled").forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) return;
      node.dataset.hcPendingAction = "true";
      node.setAttribute("aria-label", node.textContent?.trim() || "Not available yet");
    });
  }

  function sync() {
    installStyles();
    syncDynamicAnchors();
    clarifyPendingConnections();
  }

  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "disabled"] });
})();
