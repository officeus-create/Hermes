(() => {
  const PRIORITY = [
    { key: "hub", href: "/services/hermes-connect/" },
    { key: "repair", href: "/services/hermes-connect/repair-shops/" },
    { key: "loadBoard", href: "/load-board/" },
    { key: "aiCommand", href: "/services/hermes-connect/ai-command-center/" },
    { key: "academy", href: "/services/hermes-connect/academy/" },
  ];

  const LABELS = {
    en: { hub: "Product Hub", repair: "Repair Shops", loadBoard: "Load Board", aiCommand: "AI Command Center", academy: "Academy" },
    ru: { hub: "Центр продуктов", repair: "СТО", loadBoard: "Load Board", aiCommand: "ИИ-командный центр", academy: "Академия" },
    uk: { hub: "Центр продуктів", repair: "СТО", loadBoard: "Load Board", aiCommand: "AI-командний центр", academy: "Академія" },
    es: { hub: "Centro de productos", repair: "Talleres", loadBoard: "Load Board", aiCommand: "Centro de mando de IA", academy: "Academia" },
    it: { hub: "Centro prodotti", repair: "Officine", loadBoard: "Load Board", aiCommand: "Centro di comando AI", academy: "Accademia" },
    fr: { hub: "Centre produits", repair: "Ateliers", loadBoard: "Load Board", aiCommand: "Centre de commande IA", academy: "Académie" },
  };

  const normalize = (value) => {
    const path = String(value || "/").split("?")[0].split("#")[0];
    return path.endsWith("/") ? path : `${path}/`;
  };

  const activeKey = (path) => {
    const current = normalize(path);
    if (current === "/services/hermes-connect/") return "hub";
    if (current.startsWith("/services/hermes-connect/repair-shops/")) return "repair";
    if (current.startsWith("/load-board/")) return "loadBoard";
    if (current.startsWith("/services/hermes-connect/ai-command-center/")) return "aiCommand";
    if (current.startsWith("/services/hermes-connect/academy/")) return "academy";
    return "";
  };

  const withLocale = (href, locale) => {
    const url = new URL(href, window.location.origin);
    if (locale === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", locale);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  function apply() {
    const nav = document.querySelector("[data-hc-product-context] .hc-family-nav");
    if (!(nav instanceof HTMLElement)) return false;

    const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
    const locale = supported.has(document.documentElement.lang) ? document.documentElement.lang : "en";
    const labels = LABELS[locale] || LABELS.en;
    const selected = activeKey(window.location.pathname);
    const existing = Array.from(nav.querySelectorAll(":scope > a"));
    const priorityPaths = new Set(PRIORITY.map((item) => normalize(item.href)));
    const trailing = existing.filter((link) => !priorityPaths.has(normalize(link.getAttribute("href"))));

    const fragment = document.createDocumentFragment();
    for (const item of PRIORITY) {
      let link = existing.find((candidate) => normalize(candidate.getAttribute("href")) === normalize(item.href));
      if (!link) link = document.createElement("a");
      link.textContent = labels[item.key];
      link.setAttribute("href", withLocale(item.href, locale));
      link.setAttribute("data-hc-product-key", item.key);
      if (selected === item.key) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      fragment.append(link);
    }

    for (const link of trailing) {
      if (link instanceof HTMLAnchorElement) {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("/services/hermes-connect/")) link.setAttribute("href", withLocale(href, locale));
        if (!selected || !normalize(href).startsWith(normalize(window.location.pathname))) link.removeAttribute("aria-current");
      }
      fragment.append(link);
    }

    nav.replaceChildren(fragment);
    nav.setAttribute("data-hc-priority-order", "current-products-first");
    return true;
  }

  const run = () => {
    if (apply()) return;
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 4000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
