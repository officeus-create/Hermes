(() => {
  const render = () => {
    const locale = new URLSearchParams(window.location.search).get("lang") === "uk" ? "uk" : "en";
    const roots = document.querySelectorAll("[data-catalog-uk-en]");
    if (!roots.length) return;
    document.documentElement.lang = locale;
    roots.forEach(root => {
      root.querySelectorAll("[data-uk][data-en]").forEach(element => {
        const value = element.getAttribute("data-" + locale);
        if (value !== null) element.textContent = value;
      });
      if (locale === "uk" && root.getAttribute("data-title-uk")) document.title = root.getAttribute("data-title-uk");
    });
    const menu = document.querySelector("[data-language-menu]");
    if (menu) {
      const summary = menu.querySelector("summary");
      if (summary) {
        summary.setAttribute("aria-label", "Language: " + (locale === "uk" ? "Українська" : "English"));
        const label = summary.querySelector("span");
        if (label) label.textContent = locale === "uk" ? "Українська" : "English";
      }
      menu.querySelectorAll("a[lang]").forEach(link => {
        if (link.getAttribute("lang") === locale) link.setAttribute("aria-current","page");
        else link.removeAttribute("aria-current");
      });
    }
    const academy = document.querySelector("[data-catalog-academy-registration]");
    if (academy) {
      const url = new URL(academy.getAttribute("href"),window.location.origin);
      url.searchParams.set("lang",locale);
      academy.setAttribute("href",url.pathname+url.search+url.hash);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",render,{once:true});
  else render();
})();
