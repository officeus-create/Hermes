(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const supported = new Set(["ru", "uk", "es", "it", "fr"]);
  const locale = (new URLSearchParams(window.location.search).get("lang") || "").toLowerCase();
  if (!supported.has(locale)) return;

  const titles = {
    ru: { availability: "Недельный график", customers: "Клиенты" },
    uk: { availability: "Тижневий графік", customers: "Клієнти" },
    es: { availability: "Disponibilidad semanal", customers: "Clientes" },
    it: { availability: "Disponibilità settimanale", customers: "Clienti" },
    fr: { availability: "Disponibilités hebdomadaires", customers: "Clients" },
  }[locale];

  const key = path === `${ROOT}/availability`
    ? "availability"
    : path === `${ROOT}/customers`
      ? "customers"
      : null;
  if (!key) return;

  const selector = key === "availability" ? ".availability-page h1" : ".customers-page h1";
  let scheduled = false;

  function apply() {
    scheduled = false;
    const heading = document.querySelector(selector);
    const expected = titles[key];
    if (heading && heading.textContent !== expected) heading.textContent = expected;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(apply);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();

  const root = document.querySelector(key === "availability" ? ".availability-page" : ".customers-page");
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true, characterData: true });
})();
