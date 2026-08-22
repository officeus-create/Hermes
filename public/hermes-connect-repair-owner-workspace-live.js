(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== `${ROOT}/dashboard`) return;

  const install = () => {
    const page = document.querySelector(".workspace-page");
    const shell = page?.querySelector(":scope > .shell");
    if (!(page instanceof HTMLElement) || !(shell instanceof HTMLElement) || page.dataset.ownerWorkspaceVnext === "true") return;
    page.dataset.ownerWorkspaceVnext = "true";
    page.classList.add("hc-owner-live-page");

    const lang = (new URLSearchParams(window.location.search).get("lang") || "").toLowerCase();
    const withLang = (href) => lang ? `${href}${href.includes("?") ? "&" : "?"}lang=${encodeURIComponent(lang)}` : href;
    const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char]);

    const app = document.createElement("div");
    app.className = "hc-owner-live-app";
    app.dataset.hcOwnerWorkspace = "live";

    const sidebar = document.createElement("aside");
    sidebar.className = "hc-owner-live-sidebar";
    sidebar.setAttribute("aria-label", "Repair Shop owner workspace navigation");
    sidebar.innerHTML = `
      <a class="hc-owner-live-brand" href="${withLang(`${ROOT}/`)}">
        <img src="/demos/hermes-connect/icon-192.svg" width="34" height="34" alt="Hermes Connect" />
        <span><strong>Hermes Connect</strong><small>Repair Shop Owner OS</small></span>
      </a>
      <div class="hc-owner-live-switcher">
        <span>Workspace</span>
        <div><strong data-hc-owner-shop-name>Repair Shop</strong><small data-hc-owner-location>Owner workspace</small></div>
      </div>
      <nav class="hc-owner-live-nav">
        <a href="#overview" aria-current="page"><span>01</span>Overview</a>
        <a href="#bookings"><span>02</span>Bookings <em data-hc-nav-bookings>—</em></a>
        <a href="#calendar"><span>03</span>Calendar</a>
        <a href="${withLang(`${ROOT}/customers/`)}"><span>04</span>Customers</a>
        <a href="#services"><span>05</span>Services <em data-hc-nav-services>—</em></a>
        <a href="#growth"><span>06</span>Growth</a>
        <a href="#intelligence"><span>07</span>Hermes Intelligence</a>
        <a href="#settings"><span>08</span>Settings</a>
      </nav>
      <div class="hc-owner-live-sidebar-spacer"></div>
      <a class="hc-owner-live-ai-launch" href="#intelligence"><span>✦</span><div><strong>Hermes Intelligence</strong><small>Understand → decide → act</small></div><b>↗</b></a>
      <div class="hc-owner-live-role"><span>Current role</span><strong>Owner</strong><small>Manager / Advisor / Technician — future permissions, not active credentials.</small></div>
    `;

    const content = document.createElement("div");
    content.className = "hc-owner-live-content";
    shell.parentElement?.insertBefore(app, shell);
    app.append(sidebar, content);
    content.append(shell);

    const oldBack = shell.querySelector(".back-link");
    if (oldBack instanceof HTMLElement) oldBack.classList.add("hc-owner-live-legacy-hidden");

    const oldHeader = shell.querySelector(".workspace-header");
    const ownerSummary = document.getElementById("owner-summary");
    const logoutButton = document.getElementById("logout-btn");

    const mobileBar = document.createElement("div");
    mobileBar.className = "hc-owner-live-mobilebar";
    mobileBar.innerHTML = `<a href="${withLang(`${ROOT}/`)}"><img src="/demos/hermes-connect/icon-192.svg" width="30" height="30" alt="" /><span><strong>Hermes Connect</strong><small data-hc-mobile-shop>Repair Shop</small></span></a><a href="#intelligence">✦ Ask Hermes</a>`;
    content.prepend(mobileBar);

    const mobileNav = document.createElement("nav");
    mobileNav.className = "hc-owner-live-mobile-nav";
    mobileNav.setAttribute("aria-label", "Mobile owner tasks");
    mobileNav.innerHTML = `<a href="#overview">Overview</a><a href="#bookings">Bookings</a><a href="#calendar">Calendar</a><a href="${withLang(`${ROOT}/customers/`)}">Customers</a><a href="#services">Services</a>`;
    mobileBar.after(mobileNav);

    const overview = document.createElement("section");
    overview.id = "overview";
    overview.className = "hc-owner-live-overview";
    overview.innerHTML = `
      <header class="hc-owner-live-topbar">
        <div><p>REPAIR SHOP OWNER OS · LIVE WORKSPACE</p><h1 data-hc-owner-greeting>Owner workspace</h1><div class="hc-owner-live-summary-slot"></div></div>
        <div class="hc-owner-live-top-actions"><a href="${withLang(`${ROOT}/customers/`)}">Customers ↗</a><button type="button" data-hc-logout-slot>Logout</button></div>
      </header>
      <div class="hc-owner-live-hero-grid">
        <article class="hc-owner-live-intelligence" id="intelligence">
          <div><small>HERMES INTELLIGENCE · LIVE SIGNALS ONLY</small><h2 data-hc-intelligence-title>Reading your workspace…</h2><p data-hc-intelligence-copy>Recommendations are derived only from the data already loaded in this owner workspace.</p></div>
          <div class="hc-owner-live-intelligence-actions"><a data-hc-intelligence-primary href="#settings">Open next action</a><a href="#bookings">Review bookings</a></div>
        </article>
        <article class="hc-owner-live-focus">
          <small>OWNER FOCUS</small><h2>What needs you next</h2>
          <div class="hc-owner-live-focus-list" data-hc-focus-list><div><span>01</span><p><strong>Loading live signals…</strong><small>No representative KPI is used here.</small></p></div></div>
        </article>
      </div>
      <div class="hc-owner-live-metrics">
        <article><span>Bookings</span><strong data-hc-metric-bookings>—</strong><small data-hc-metric-bookings-copy>Loading real booking inbox</small></article>
        <article><span>Services</span><strong data-hc-metric-services>—</strong><small>Current service catalog</small></article>
        <article><span>Public booking</span><strong data-hc-metric-public>—</strong><small>Real shop booking-link readiness</small></article>
        <article><span>Completed visits</span><strong data-hc-metric-completed>—</strong><small>Derived from booking statuses</small></article>
      </div>
      <section class="hc-owner-live-growth" id="growth">
        <div><small>GROWTH · REAL ACTIVITY ONLY</small><h2>Customer → booking → completed visit</h2><p>No revenue or conversion number is invented. This surface activates from persisted booking and customer activity.</p></div>
        <div class="hc-owner-live-growth-stats"><span><b data-hc-growth-confirmed>—</b>Confirmed</span><span><b data-hc-growth-progress>—</b>In progress</span><span><b data-hc-growth-completed>—</b>Completed</span><span><b data-hc-growth-cancelled>—</b>Cancelled</span></div>
        <a href="${withLang(`${ROOT}/customers/`)}">Open customer CRM ↗</a>
      </section>
    `;

    const alert = document.getElementById("workspace-alert");
    if (alert?.parentElement === shell) shell.insertBefore(overview, alert);
    else shell.prepend(overview);

    const summarySlot = overview.querySelector(".hc-owner-live-summary-slot");
    if (ownerSummary instanceof HTMLElement && summarySlot) summarySlot.append(ownerSummary);

    const logoutSlot = overview.querySelector("[data-hc-logout-slot]");
    if (logoutButton instanceof HTMLButtonElement && logoutSlot instanceof HTMLButtonElement) {
      logoutSlot.replaceWith(logoutButton);
      logoutButton.classList.add("hc-owner-live-logout");
    }
    if (oldHeader instanceof HTMLElement) oldHeader.hidden = true;

    const profile = shell.querySelector('[aria-labelledby="profile-title"]');
    const services = shell.querySelector('[aria-labelledby="services-title"]');
    const availability = shell.querySelector(".availability-panel");
    const bookings = shell.querySelector('[aria-labelledby="bookings-title"]');
    const feedback = shell.querySelector('[aria-labelledby="feedback-title"]');
    if (profile instanceof HTMLElement) { profile.id = "settings"; profile.classList.add("hc-owner-live-section"); }
    if (services instanceof HTMLElement) { services.id = "services"; services.classList.add("hc-owner-live-section"); }
    if (availability instanceof HTMLElement) { availability.id = "calendar"; availability.classList.add("hc-owner-live-section", "hc-owner-live-calendar"); }
    if (bookings instanceof HTMLElement) { bookings.id = "bookings"; bookings.classList.add("hc-owner-live-section", "hc-owner-live-bookings"); }
    if (feedback instanceof HTMLElement) { feedback.id = "feedback"; feedback.classList.add("hc-owner-live-section"); }

    const ordered = [bookings, availability, services, profile, feedback].filter((node) => node instanceof HTMLElement);
    for (const node of ordered) shell.append(node);

    const numberFrom = (id) => {
      const text = document.getElementById(id)?.textContent || "";
      const match = text.match(/\d+/);
      return match ? Number(match[0]) : null;
    };

    const hasProfileValues = () => {
      const ids = ["shop-name", "shop-city", "shop-state", "shop-timezone"];
      return ids.every((id) => {
        const field = document.getElementById(id);
        return (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && field.value.trim().length > 0;
      });
    };

    const state = () => {
      const bookingCount = numberFrom("booking-count");
      const serviceCount = numberFrom("service-count");
      const feedbackCount = numberFrom("feedback-count");
      const publicReady = !document.getElementById("public-link-wrap")?.classList.contains("hidden");
      return {
        bookingCount,
        serviceCount,
        feedbackCount,
        profileSaved: publicReady || hasProfileValues(),
        publicReady,
        confirmed: document.querySelectorAll("#bookings-list .status-confirmed").length,
        inProgress: document.querySelectorAll("#bookings-list .status-in_progress").length,
        completed: document.querySelectorAll("#bookings-list .status-completed").length,
        cancelled: document.querySelectorAll("#bookings-list .status-cancelled").length,
      };
    };

    const setText = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };

    const updateOwnerIdentity = () => {
      const raw = ownerSummary?.textContent?.trim() || "";
      const ownerName = raw && !raw.toLowerCase().includes("loading") ? raw.split(" · ")[0].trim() : "Owner";
      setText("[data-hc-owner-greeting]", ownerName === "Owner" ? "Owner workspace" : `Good day, ${ownerName}.`);
      const shopName = (document.getElementById("shop-name") instanceof HTMLInputElement ? document.getElementById("shop-name").value.trim() : "") || "Repair Shop";
      setText("[data-hc-owner-shop-name]", shopName);
      setText("[data-hc-mobile-shop]", shopName);
      const city = document.getElementById("shop-city") instanceof HTMLInputElement ? document.getElementById("shop-city").value.trim() : "";
      const region = document.getElementById("shop-state") instanceof HTMLInputElement ? document.getElementById("shop-state").value.trim() : "";
      setText("[data-hc-owner-location]", [city, region].filter(Boolean).join(", ") || "Owner workspace");
    };

    const update = () => {
      const s = state();
      setText("[data-hc-metric-bookings]", s.bookingCount == null ? "—" : String(s.bookingCount));
      setText("[data-hc-metric-services]", s.serviceCount == null ? "—" : String(s.serviceCount));
      const publicStatusText = s.publicReady ? (lang === "ru" || lang === "uk" ? "Готово" : lang === "es" ? "Listo" : lang === "it" ? "Pronto" : lang === "fr" ? "Prêt" : "Ready") : s.profileSaved ? (lang === "ru" ? "Настройка" : lang === "uk" ? "Налаштування" : lang === "es" ? "Configuración" : "Setup") : (lang === "ru" ? "Не настроено" : lang === "uk" ? "Не налаштовано" : "Not ready");
      setText("[data-hc-metric-public]", publicStatusText);
      setText("[data-hc-metric-completed]", s.bookingCount == null ? "—" : String(s.completed));
      setText("[data-hc-nav-bookings]", s.bookingCount == null ? "—" : String(s.bookingCount));
      setText("[data-hc-nav-services]", s.serviceCount == null ? "—" : String(s.serviceCount));
      setText("[data-hc-growth-confirmed]", s.bookingCount == null ? "—" : String(s.confirmed));
      setText("[data-hc-growth-progress]", s.bookingCount == null ? "—" : String(s.inProgress));
      setText("[data-hc-growth-completed]", s.bookingCount == null ? "—" : String(s.completed));
      setText("[data-hc-growth-cancelled]", s.bookingCount == null ? "—" : String(s.cancelled));

      const bookingCopy = s.bookingCount == null ? "Loading real booking inbox" : s.bookingCount === 0 ? "No bookings yet" : `${s.confirmed} confirmed · ${s.inProgress} in progress`;
      setText("[data-hc-metric-bookings-copy]", bookingCopy);

      const focus = [];
      if (!s.profileSaved) focus.push(["Complete shop profile", "Your real profile controls the public booking link.", "#settings"]);
      else focus.push(["Shop profile is saved", s.publicReady ? "Public booking link is ready to use." : "Check the public booking-link setup.", "#settings"]);
      if ((s.serviceCount ?? 0) === 0) focus.push(["Add your first service", "Customers cannot choose a service until the catalog is configured.", "#services"]);
      else focus.push([`${s.serviceCount} service${s.serviceCount === 1 ? "" : "s"} live`, "This is the catalog customers can book.", "#services"]);
      if ((s.bookingCount ?? 0) > 0) focus.push([`Review ${s.bookingCount} booking${s.bookingCount === 1 ? "" : "s"}`, `${s.confirmed} confirmed · ${s.inProgress} in progress · ${s.completed} completed.`, "#bookings"]);
      else focus.push([s.publicReady ? "Share your booking link" : "Finish setup before sharing", s.publicReady ? "The next real signal is the first customer booking." : "Profile and services come before customer acquisition.", "#settings"]);

      const focusList = document.querySelector("[data-hc-focus-list]");
      if (focusList) focusList.innerHTML = focus.slice(0,3).map((item, index) => `<a href="${item[2]}"><span>0${index + 1}</span><p><strong>${esc(item[0])}</strong><small>${esc(item[1])}</small></p><b>↗</b></a>`).join("");

      let title = "Finish the real shop setup before driving traffic.";
      let copy = "Hermes is reading profile, service and booking readiness already loaded in this workspace.";
      let href = "#settings";
      if (s.profileSaved && (s.serviceCount ?? 0) === 0) {
        title = "Your profile is saved. Add the first bookable service next.";
        copy = "This is the earliest remaining activation step visible in the live owner data.";
        href = "#services";
      } else if (s.profileSaved && (s.serviceCount ?? 0) > 0 && (s.bookingCount ?? 0) === 0) {
        title = s.publicReady ? "Your booking setup is ready. The next proof is a real customer booking." : "Services are live. Finish the public booking-link setup next.";
        copy = s.publicReady ? "Share the real booking link and measure time to first completed appointment." : "Hermes will not claim activation until the public intake path is ready.";
        href = "#settings";
      } else if ((s.bookingCount ?? 0) > 0) {
        title = `${s.bookingCount} real booking${s.bookingCount === 1 ? " is" : "s are"} in the workspace.`;
        copy = `${s.confirmed} confirmed, ${s.inProgress} in progress, ${s.completed} completed, ${s.cancelled} cancelled. Review status and customer follow-up before adding new features.`;
        href = "#bookings";
      }
      setText("[data-hc-intelligence-title]", title);
      setText("[data-hc-intelligence-copy]", copy);
      const primary = document.querySelector("[data-hc-intelligence-primary]");
      if (primary instanceof HTMLAnchorElement) primary.href = href;
      updateOwnerIdentity();
      if (typeof window.HermesOwnerBridge?.refresh === "function") window.HermesOwnerBridge.refresh();
    };

    const watched = ["owner-summary","profile-state","service-count","booking-count","feedback-count","public-link-wrap","bookings-list"]
      .map((id) => document.getElementById(id)).filter(Boolean);
    for (const node of watched) new MutationObserver(update).observe(node, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:["class"] });
    for (const id of ["shop-name","shop-city","shop-state","shop-timezone"]) document.getElementById(id)?.addEventListener("input", updateOwnerIdentity);

    update();
    window.setTimeout(update, 80);
    window.setTimeout(update, 400);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();