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

  const isRu = () => (document.documentElement.lang || "").toLowerCase() === "ru";
  const departmentId = (href) => order.find((id) => href === departments[id].href || href.endsWith(`#${id}`)) || null;
  const makeLink = (label, href, className) => { const link = document.createElement("a"); link.href = href; link.textContent = label; if (className) link.className = className; return link; };
  const localizedProduct = (id, label, href) => {
    if (!isRu()) return { label, href };
    const localizedLabel = ruLabels[href] || label;
    const localizedHref = id === "marketing" ? (ruMarketing[href] || href) : id === "technology" ? (ruTechnology[href] || href) : href;
    return { label: localizedLabel, href: localizedHref };
  };
  const localizedOverview = (id) => isRu() ? ruOverview[id] : departments[id].href;
  const closeDesktop = (except) => document.querySelectorAll("[data-department-menu]").forEach((menu) => { if (menu === except) return; menu.removeAttribute("data-open"); menu.querySelector("[data-department-toggle]")?.setAttribute("aria-expanded", "false"); });

  const desktopPanel = (id, primaryLabel) => {
    const config = departments[id];
    const panel = document.createElement("div"); panel.className = "department-menu-panel"; panel.dataset.departmentPanel = id;
    const heading = document.createElement("div"); heading.className = "department-menu-panel__heading";
    const strong = document.createElement("strong"); strong.textContent = primaryLabel || config.label;
    heading.append(strong, makeLink(isRu() ? "Открыть раздел" : "Open department", localizedOverview(id)));
    const grid = document.createElement("div"); grid.className = "department-menu-panel__grid";
    config.items.forEach(([label, href]) => { const item = localizedProduct(id, label, href); grid.append(makeLink(item.label, item.href)); });
    panel.append(heading, grid); return panel;
  };

  const ensureDesktopPanel = (wrapper, id, primary) => {
    let panel = wrapper.querySelector("[data-department-panel]");
    if (!panel) { panel = desktopPanel(id, primary.textContent?.trim() || departments[id].label); wrapper.append(panel); }
    return panel;
  };

  const setDesktopOpen = (wrapper, toggle, id, primary, open) => {
    if (open) { ensureDesktopPanel(wrapper, id, primary); closeDesktop(wrapper); wrapper.setAttribute("data-open", "true"); }
    else wrapper.removeAttribute("data-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
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
      const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "department-menu__toggle"; toggle.dataset.departmentToggle = id; toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", `${isRu() ? "Открыть меню" : "Open"} ${primary.textContent?.trim() || config.label}${isRu() ? "" : " menu"}`); toggle.innerHTML = '<span aria-hidden="true">⌄</span>';
      toggle.addEventListener("click", (event) => { event.stopPropagation(); setDesktopOpen(wrapper, toggle, id, primary, wrapper.getAttribute("data-open") !== "true"); });
      wrapper.addEventListener("mouseenter", () => setDesktopOpen(wrapper, toggle, id, primary, true));
      wrapper.addEventListener("mouseleave", () => setDesktopOpen(wrapper, toggle, id, primary, false));
      wrapper.addEventListener("focusin", () => setDesktopOpen(wrapper, toggle, id, primary, true));
      wrapper.addEventListener("focusout", (event) => { if (event.relatedTarget instanceof Node && wrapper.contains(event.relatedTarget)) return; setDesktopOpen(wrapper, toggle, id, primary, false); });
      wrapper.append(primary, toggle); nav.insertBefore(wrapper, marker); anchor.remove();
    });
    marker.remove(); nav.dataset.departmentEnhanced = "true";
  };

  const ensureMobileBody = (nav, header, anchor, toggle, id) => {
    let body = toggle.nextElementSibling;
    if (!(body instanceof HTMLElement) || !body.matches(`[data-mobile-department-body="${id}"]`)) {
      body = document.createElement("div"); body.className = "mobile-department-menu__body"; body.dataset.mobileDepartmentBody = id; body.hidden = true; body.style.setProperty("--department-accent", departments[id].accent);
      const overviewLabel = isRu() ? `Открыть раздел «${anchor.textContent?.trim() || departments[id].label}»` : `${anchor.textContent?.trim() || departments[id].label} overview`;
      body.append(makeLink(overviewLabel, localizedOverview(id), "mobile-department-menu__overview"));
      departments[id].items.forEach(([label, href]) => { const item = localizedProduct(id, label, href); body.append(makeLink(item.label, item.href)); });
      toggle.insertAdjacentElement("afterend", body);
      body.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => { nav.hidden = true; const button = header.querySelector("[data-menu-button]"); button?.setAttribute("aria-expanded", "false"); button?.setAttribute("aria-label", "Open navigation"); }));
    }
    return body;
  };

  const enhanceMobile = (header) => {
    const nav = header.querySelector(".mobile-nav"); if (!nav || nav.dataset.departmentEnhanced === "true") return;
    [...nav.querySelectorAll(":scope > a")].forEach((anchor) => {
      const id = departmentId(anchor.getAttribute("href") || ""); if (!id) return;
      const config = departments[id]; anchor.classList.add("mobile-department-primary"); anchor.dataset.mobileDepartment = id; anchor.style.setProperty("--department-accent", config.accent);
      const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "mobile-department-toggle"; toggle.dataset.mobileDepartmentToggle = id; toggle.style.setProperty("--department-accent", config.accent); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", `${isRu() ? "Открыть меню" : "Open"} ${anchor.textContent?.trim() || config.label}${isRu() ? "" : " menu"}`); toggle.innerHTML = '<span aria-hidden="true">⌄</span>';
      anchor.insertAdjacentElement("afterend", toggle);
      toggle.addEventListener("click", () => {
        const body = ensureMobileBody(nav, header, anchor, toggle, id); const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", open ? "true" : "false"); toggle.toggleAttribute("data-open", open); body.hidden = !open;
      });
    });
    nav.dataset.departmentEnhanced = "true";
  };

  const init = () => { document.querySelectorAll(".site-header").forEach((header) => { enhanceDesktop(header); enhanceMobile(header); }); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  document.addEventListener("click", (event) => { const target = event.target; if (target instanceof Element && !target.closest("[data-department-menu]")) closeDesktop(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeDesktop(); });
})();
