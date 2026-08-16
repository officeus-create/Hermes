(() => {
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
    enhanceRepairLanding();
    selectAuthMode();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
