(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== `${ROOT}/dashboard`) return;

  const positionPanels = () => {
    const shell = document.querySelector(".hc-owner-live-page .shell");
    const overview = document.querySelector(".hc-owner-live-overview");
    if (!(shell instanceof HTMLElement) || !(overview instanceof HTMLElement)) return false;

    const access = shell.querySelector("[data-web-v1-access]");
    const activation = shell.querySelector("[data-repair-activation]");
    let anchor = overview;

    if (access instanceof HTMLElement) {
      access.classList.add("hc-owner-live-operational-panel");
      if (access.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", access);
      anchor = access;
    }
    if (activation instanceof HTMLElement) {
      activation.classList.add("hc-owner-live-operational-panel", "hc-owner-live-activation-panel");
      if (activation.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", activation);
    }
    return true;
  };

  const install = () => {
    const shell = document.querySelector(".workspace-page .shell");
    if (!(shell instanceof HTMLElement)) return;
    positionPanels();
    const observer = new MutationObserver(() => positionPanels());
    observer.observe(shell, { childList: true });
    window.setTimeout(positionPanels, 80);
    window.setTimeout(positionPanels, 300);
    window.setTimeout(positionPanels, 900);
  };

  const waitForShell = () => {
    if (document.querySelector('[data-hc-owner-workspace="live"]')) return install();
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-hc-owner-workspace="live"]')) return;
      observer.disconnect();
      install();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waitForShell, { once: true });
  else waitForShell();
})();