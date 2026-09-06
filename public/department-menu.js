(() => {
  const order = ["logistics", "marketing", "technology", "academy"];
  const departments = {
    logistics: { label: "Logistics", href: "/paths/logistics/", accent: "#5634c8", items: [["Load Board", "/load-board/"], ["Carriers & Fleets", "/paths/logistics/carriers/fleet-owners/"], ["Agreement & onboarding", "/carrier/"], ["Owner-Operators", "/paths/logistics/carriers/owner-operators/"], ["Brokers", "/paths/logistics/brokers/carrier-capacity/"], ["Shippers & Dealers", "/paths/logistics/customers/vehicle-transport/"], ["Dispatch & Back Office", "/logistics/car-hauling-dispatch/"], ["Carrier Resources", "/logistics/resources/"]] },
    marketing: { label: "Marketing", href: "/paths/marketing/", accent: "#c51b72", items: [["Growth System", "/business-growth/"], ["Websites", "/gb/london/website-development/"], ["SEO & GEO", "/gb/london/seo-services/"], ["Social Media", "/gb/london/social-media-management/"], ["Meta Ads", "/gb/london/meta-ads/"], ["London", "/gb/london/"], ["Learn Marketing", "/academy/marketing/"]] },
    technology: { label: "IT", href: "/paths/technology/", accent: "#087f82", items: [["Hermes Connect", "/services/hermes-connect/"], ["Load Board", "/load-board/"], ["Web Development", "/gb/london/website-development/"], ["Capabilities", "/paths/technology/#service-groups-title"], ["Project Brief", "/paths/technology/#project-brief"], ["IT Development", "/case/it-development/"], ["Learn IT & AI", "/paths/academy/#academy-it"]] },
    academy: { label: "Academy", href: "/paths/academy/", accent: "#a56b00", items: [["Logistics", "/academy/us-logistics-operations/"], ["Marketing", "/academy/marketing/"], ["IT & AI", "/paths/academy/#academy-it"], ["Sales", "/paths/academy/#academy-sales"], ["COO / Operations", "/paths/academy/#academy-operations"], ["How Training Works", "/academy/how-training-works/"], ["Apply", "/academy/apply/"]] },
  };
  const ruOverview = { logistics: "/ru/#logistics", marketing: "/ru/#marketing", technology: "/ru/#technology", academy: "/ru/#academy" };
  const ruLabels = {
    "/paths/logistics/": "Логистика", "/load-board/": "Load Board", "/paths/logistics/carriers/fleet-owners/": "Перевозчики и автопарки", "/carrier/": "Договор и онбординг", "/paths/logistics/carriers/owner-operators/": "Owner-operators", "/paths/logistics/brokers/carrier-capacity/": "Брокеры", "/paths/logistics/customers/vehicle-transport/": "Отправители и дилеры", "/logistics/car-hauling-dispatch/": "Диспетчеризация и back office", "/logistics/resources/": "Ресурсы для перевозчиков", "/paths/marketing/": "Маркетинг", "/business-growth/": "Система роста", "/gb/london/website-development/": "Сайты", "/gb/london/seo-services/": "SEO и GEO", "/gb/london/social-media-management/": "Социальные сети", "/gb/london/meta-ads/": "Meta Ads", "/gb/london/": "Лондон", "/academy/marketing/": "Изучать маркетинг", "/paths/technology/": "IT", "/services/hermes-connect/": "Hermes Connect", "/paths/technology/#service-groups-title": "Возможности", "/paths/technology/#project-brief": "Бриф проекта", "/case/it-development/": "IT-разработка", "/paths/academy/#academy-it": "Изучать IT и AI", "/paths/academy/": "Академия", "/academy/us-logistics-operations/": "Логистика", "/paths/academy/#academy-sales": "Продажи", "/paths/academy/#academy-operations": "COO / Операции", "/academy/how-training-works/": "Как проходит обучение", "/academy/apply/": "Подать заявку"
  };
  const ruMarketing = { "/business-growth/": "/ru/business-growth/", "/gb/london/website-development/": "/ru/business-growth/website/", "/gb/london/seo-services/": "/ru/business-growth/seo/", "/gb/london/social-media-management/": "/ru/business-growth/social-media/", "/gb/london/meta-ads/": "/ru/business-growth/advertising/", "/gb/london/": "/ru/gb/london/" };
  const ruTechnology = { "/services/hermes-connect/": "/services/hermes-connect/?lang=ru", "/gb/london/website-development/": "/ru/gb/london/it-web-development/" };

  const departmentId = (href) => order.find((id) => href === departments[id].href || href.endsWith(`#${id}`)) || null;
  const makeLink = (label, href, className) => { const link = document.createElement("a"); link.href = href; link.textContent = label; if (className) link.className = className; return link; };
  const closeDesktop = (except) => document.querySelectorAll("[data-department-menu]").forEach((menu) => { if (menu === except) return; menu.removeAttribute("data-open"); menu.querySelector("[data-department-toggle]")?.setAttribute("aria-expanded", "false"); });
  const setOpen = (wrapper, toggle, open) => { if (open) { closeDesktop(wrapper); wrapper.setAttribute("data-open", "true"); } else wrapper.removeAttribute("data-open"); toggle.setAttribute("aria-expanded", open ? "true" : "false"); };

  const desktopPanel = (id) => {
    const config = departments[id];
    const panel = document.createElement("div"); panel.className = "department-menu-panel"; panel.dataset.departmentPanel = id;
    const heading = document.createElement("div"); heading.className = "department-menu-panel__heading";
    const strong = document.createElement("strong"); strong.textContent = config.label;
    heading.append(strong, makeLink("Open department", config.href));
    const grid = document.createElement("div"); grid.className = "department-menu-panel__grid";
    config.items.forEach(([label, href]) => grid.append(makeLink(label, href)));
    panel.append(heading, grid); return panel;
  };

  const enhanceDesktop = (header) => {
    const nav = header.querySelector(".desktop-nav"); if (!nav || nav.dataset.departmentEnhanced === "true") return;
    const byId = new Map(); [...nav.querySelectorAll(":scope > a")].forEach((anchor) => { const id = departmentId(anchor.getAttribute("href") || ""); if (id) byId.set(id, anchor); });
    const first = order.map((id) => byId.get(id)).find(Boolean); if (!first) return;
    const marker = document.createComment("department-menu-anchor"); nav.insertBefore(marker, first);
    order.forEach((id) => {
      const anchor = byId.get(id); if (!anchor) return; const config = departments[id];
      const wrapper = document.createElement("div"); wrapper.className = "department-menu"; wrapper.dataset.departmentMenu = id; wrapper.style.setProperty("--department-accent", config.accent);
      const primary = anchor.cloneNode(true); primary.classList.add("department-menu__primary");
      const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "department-menu__toggle"; toggle.dataset.departmentToggle = id; toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", `Open ${config.label} menu`); toggle.innerHTML = '<span aria-hidden="true">⌄</span>';
      toggle.addEventListener("click", (event) => { event.stopPropagation(); setOpen(wrapper, toggle, wrapper.getAttribute("data-open") !== "true"); });
      wrapper.addEventListener("mouseenter", () => setOpen(wrapper, toggle, true)); wrapper.addEventListener("mouseleave", () => setOpen(wrapper, toggle, false)); wrapper.addEventListener("focusin", () => setOpen(wrapper, toggle, true)); wrapper.addEventListener("focusout", (event) => { if (event.relatedTarget instanceof Node && wrapper.contains(event.relatedTarget)) return; setOpen(wrapper, toggle, false); });
      wrapper.append(primary, toggle, desktopPanel(id)); nav.insertBefore(wrapper, marker); anchor.remove();
    });
    marker.remove(); nav.dataset.departmentEnhanced = "true";
  };

  const enhanceMobile = (header) => {
    const nav = header.querySelector(".mobile-nav"); if (!nav || nav.dataset.departmentEnhanced === "true") return;
    const byId = new Map(); [...nav.querySelectorAll(":scope > a")].forEach((anchor) => { const id = departmentId(anchor.getAttribute("href") || ""); if (id) byId.set(id, anchor); });
    const first = order.map((id) => byId.get(id)).find(Boolean); if (!first) return;
    const marker = document.createComment("mobile-department-menu-anchor"); nav.insertBefore(marker, first);
    order.forEach((id) => {
      const anchor = byId.get(id); if (!anchor) return; const config = departments[id];
      const details = document.createElement("details"); details.className = "mobile-department-menu"; details.dataset.mobileDepartmentMenu = id; details.style.setProperty("--department-accent", config.accent);
      const summary = document.createElement("summary"); summary.textContent = anchor.textContent?.trim() || config.label;
      const body = document.createElement("div"); body.className = "mobile-department-menu__body"; body.append(makeLink(`${summary.textContent} overview`, config.href, "mobile-department-menu__overview")); config.items.forEach(([label, href]) => body.append(makeLink(label, href)));
      details.append(summary, body); nav.insertBefore(details, marker); anchor.remove();
    });
    marker.remove(); nav.querySelectorAll(".mobile-department-menu a").forEach((link) => link.addEventListener("click", () => { nav.hidden = true; const button = header.querySelector("[data-menu-button]"); button?.setAttribute("aria-expanded", "false"); button?.setAttribute("aria-label", "Open navigation"); })); nav.dataset.departmentEnhanced = "true";
  };

  const localizeRu = () => {
    if ((document.documentElement.lang || "").toLowerCase() !== "ru") return;
    const productRoute = (department, href) => department === "marketing" ? (ruMarketing[href] || href) : department === "technology" ? (ruTechnology[href] || href) : href;
    document.querySelectorAll("[data-department-menu]").forEach((menu) => {
      const department = menu.dataset.departmentMenu || ""; const overviewHref = ruOverview[department]; const primary = menu.querySelector(".department-menu__primary"); const title = menu.querySelector(".department-menu-panel__heading strong");
      if (primary && overviewHref) primary.setAttribute("href", overviewHref); if (title && primary) title.textContent = primary.textContent?.trim() || title.textContent;
      const overview = menu.querySelector(".department-menu-panel__heading a"); if (overview) { overview.textContent = "Открыть раздел"; if (overviewHref) overview.setAttribute("href", overviewHref); }
      menu.querySelectorAll(".department-menu-panel__grid a").forEach((link) => { const href = link.getAttribute("href") || ""; if (ruLabels[href]) link.textContent = ruLabels[href]; const localized = productRoute(department, href); if (localized !== href) link.setAttribute("href", localized); });
      const toggle = menu.querySelector("[data-department-toggle]"); if (toggle && primary) toggle.setAttribute("aria-label", `Открыть меню «${primary.textContent?.trim() || "раздел"}»`);
    });
    document.querySelectorAll("[data-mobile-department-menu]").forEach((menu) => {
      const department = menu.dataset.mobileDepartmentMenu || ""; const overviewHref = ruOverview[department];
      menu.querySelectorAll("a").forEach((link) => { const href = link.getAttribute("href") || ""; if (link.classList.contains("mobile-department-menu__overview")) { const summary = menu.querySelector("summary")?.textContent?.trim(); link.textContent = summary ? `Открыть раздел «${summary}»` : "Открыть раздел"; if (overviewHref) link.setAttribute("href", overviewHref); return; } if (ruLabels[href]) link.textContent = ruLabels[href]; const localized = productRoute(department, href); if (localized !== href) link.setAttribute("href", localized); });
    });
  };

  const init = () => { document.querySelectorAll(".site-header").forEach((header) => { enhanceDesktop(header); enhanceMobile(header); }); localizeRu(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  document.addEventListener("click", (event) => { const target = event.target; if (target instanceof Element && !target.closest("[data-department-menu]")) closeDesktop(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeDesktop(); });
})();
