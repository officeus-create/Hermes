(() => {
  const HUB_PATH = "/services/hermes-connect";
  const REPAIR_PATH = "/services/hermes-connect/repair-shops/";
  const AUTH_PATH = "/services/hermes-connect/repair-shops/auth/";

  const normalizedPath = () => {
    const path = window.location.pathname.replace(/\/+$/, "");
    return path || "/";
  };

  const setLink = (anchor, href, label) => {
    if (!(anchor instanceof HTMLAnchorElement)) return;
    anchor.href = href;
    if (label) anchor.textContent = label;
  };

  const enhanceHubPreview = () => {
    if (normalizedPath() !== HUB_PATH) return;
    const previewButton = document.querySelector(".connect-service-profile button");
    if (!(previewButton instanceof HTMLButtonElement)) return;
    previewButton.tabIndex = 0;
    previewButton.textContent = "Open Repair Shop";
    previewButton.setAttribute("aria-label", "Open Repair Shop pilot");
    previewButton.addEventListener("click", () => window.location.assign(REPAIR_PATH));
  };

  const enhanceRepairLanding = () => {
    if (normalizedPath() !== "/services/hermes-connect/repair-shops") return;

    document.querySelectorAll("a").forEach((anchor) => {
      const label = (anchor.textContent || "").replace(/\s+/g, " ").trim();
      if (label.includes("Owner Login / Get Started")) {
        setLink(anchor, `${AUTH_PATH}?mode=register`, "Create Shop Account");
      } else if (label.includes("Open Web App Workspace")) {
        setLink(anchor, `${AUTH_PATH}?mode=login`, "Open Shop Workspace →");
      }
    });
  };

  const selectAuthMode = () => {
    if (normalizedPath() !== "/services/hermes-connect/repair-shops/auth") return;
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode !== "register" && mode !== "login") return;
    const tab = document.querySelector(`[data-tab="${mode}"]`);
    if (tab instanceof HTMLButtonElement) tab.click();
  };

  const boot = () => {
    enhanceHubPreview();
    enhanceRepairLanding();
    selectAuthMode();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
