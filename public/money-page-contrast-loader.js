(() => {
  const path = window.location.pathname;
  const pageClass = path === "/load-board/"
    ? "money-page-load-board"
    : path === "/services/hermes-connect/repair-shops/"
      ? "money-page-repair"
      : "";
  if (!pageClass) return;

  const apply = () => {
    document.body.classList.add("money-page-contrast", pageClass);
    if (document.querySelector('link[data-money-page-contrast="true"]')) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/money-page-contrast.css";
    stylesheet.dataset.moneyPageContrast = "true";
    document.head.append(stylesheet);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
})();