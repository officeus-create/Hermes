(() => {
  const HUB_PATH = "/services/hermes-connect";
  const REPAIR_PATH = "/services/hermes-connect/repair-shops/";
  const AUTH_PATH = "/services/hermes-connect/repair-shops/auth/";

  const normalizedPath = () => {
    const path = window.location.pathname.replace(/\/+$/, "");
    return path || "/";
  };

  const makeLink = (href, label, className, marker) => {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.textContent = label;
    anchor.className = className;
    anchor.dataset[marker] = "true";
    return anchor;
  };

  const enhanceHub = () => {
    if (normalizedPath() !== HUB_PATH) return;

    const heroActions = document.querySelector(".connect-service-actions");
    if (heroActions && !heroActions.querySelector("[data-repair-shop-launch]")) {
      heroActions.appendChild(
        makeLink(REPAIR_PATH, "Repair Shop / STO Pilot", "button button-ghost", "repairShopLaunch"),
      );
    }

    const previewButton = document.querySelector(".connect-service-profile button");
    if (previewButton instanceof HTMLButtonElement) {
      previewButton.tabIndex = 0;
      previewButton.textContent = "Open Repair Shop";
      previewButton.setAttribute("aria-label", "Open Repair Shop pilot");
      previewButton.addEventListener("click", () => window.location.assign(REPAIR_PATH));
    }
  };

  const enhanceRepairLanding = () => {
    if (normalizedPath() !== "/services/hermes-connect/repair-shops") return;
    if (document.querySelector("[data-repair-launch-bar]")) return;

    const launchBar = document.createElement("div");
    launchBar.className = "repair-launch-bar";
    launchBar.dataset.repairLaunchBar = "true";
    launchBar.setAttribute("aria-label", "Repair Shop account actions");
    launchBar.append(
      makeLink(`${AUTH_PATH}?mode=register`, "Create Shop Account", "repair-launch-primary", "repairRegisterLaunch"),
      makeLink(`${AUTH_PATH}?mode=login`, "Owner Login", "repair-launch-secondary", "repairLoginLaunch"),
    );
    document.body.appendChild(launchBar);
  };

  const selectAuthMode = () => {
    if (normalizedPath() !== "/services/hermes-connect/repair-shops/auth") return;
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode !== "register" && mode !== "login") return;
    const tab = document.querySelector(`[data-tab="${mode}"]`);
    if (tab instanceof HTMLButtonElement) tab.click();
  };

  const boot = () => {
    enhanceHub();
    enhanceRepairLanding();
    selectAuthMode();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
