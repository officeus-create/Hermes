// Hermes Home v3: one visible cinematic video at a time, four unchanged portals.
// Poster-first, local-only, no new library, analytics, new visual, or external request.
// Media is attached ONLY after selection; Save-Data/Reduced Motion are poster-only.
(() => {
  const routes = Array.from(document.querySelectorAll("[data-home-route]")).filter(
    (route) => Boolean(route.dataset.routeId)
  );
  if (!routes.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const records = new Map();
  const visibility = new Map();
  const thresholds = [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1];
  let hovered = null;
  let selected = null;

  for (const route of routes) {
    const id = route.dataset.routeId;
    const video = route.querySelector("[data-home-progressive-video]");
    const source = route.querySelector("[data-home-progressive-source]");
    if (video && source) {
      records.set(id, { route, video, source, loaded: false, unavailable: false });
      video.addEventListener("playing", () => {
        const record = records.get(id);
        if (record && document.documentElement.dataset.homeCinemaActive === id) {
          route.querySelector("[data-home-progressive-cinematic]")?.setAttribute("data-media-state", "ready");
        } else {
          video.pause();
        }
      });
      video.addEventListener("error", () => {
        const record = records.get(id);
        if (record) record.unavailable = true;
        video.pause();
        route.querySelector("[data-home-progressive-cinematic]")?.setAttribute("data-media-state", "poster");
        synchronize();
      });
    }
    visibility.set(id, 0);
  }

  const policyBlocks = () =>
    reduced.matches || Boolean(connection?.saveData) ||
    /^(slow-2g|2g)$/.test(connection?.effectiveType || "") ||
    document.hidden;

  function candidate() {
    if (policyBlocks()) return null;
    const focused = document.activeElement?.closest?.("[data-home-route]")?.dataset?.routeId;
    if (focused && (visibility.get(focused) || 0) >= 0.1) return focused;
    if (hovered && (visibility.get(hovered) || 0) >= 0.1) return hovered;
    let best = null;
    let ratio = 0.2;
    for (const route of routes) {
      const id = route.dataset.routeId;
      const visibleRatio = visibility.get(id) || 0;
      if (visibleRatio > ratio) { best = id; ratio = visibleRatio; }
    }
    return best;
  }

  function synchronize() {
    const active = candidate();
    if (active !== selected) {
      selected = active;
      document.documentElement.dataset.homeCinemaActive = active || "poster";
      // Logistics owns its animation/image policy; notify it without a second player.
      window.dispatchEvent(new Event("hermes:cinema-selection"));
    }
    for (const [id, record] of records) {
      const stage = record.route.querySelector("[data-home-progressive-cinematic]");
      if (id !== active || record.unavailable) {
        record.video.pause();
        stage?.setAttribute("data-media-state", "poster");
        continue;
      }
      if (!record.loaded) {
        const viewportMobile = window.matchMedia("(max-width: 700px)").matches;
        const nextSrc = viewportMobile ? record.source.dataset.mobileSrc : record.source.dataset.desktopSrc;
        if (!nextSrc?.startsWith("/media/home/")) {
          record.unavailable = true;
          continue;
        }
        record.source.src = nextSrc;
        record.loaded = true;
        record.video.load();
      }
      if (record.video.paused) {
        void record.video.play().catch(() => {
          record.video.pause();
          stage?.setAttribute("data-media-state", "poster");
        });
      }
    }
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        visibility.set(entry.target.dataset.routeId, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      synchronize();
    }, { threshold: thresholds });
    for (const route of routes) observer.observe(route);
  } else {
    // No IntersectionObserver: keep original static poster, never load all videos.
    for (const route of routes) visibility.set(route.dataset.routeId, 0);
  }

  for (const route of routes) {
    const id = route.dataset.routeId;
    route.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        hovered = id;
        synchronize();
      }
    }, { passive: true });
    route.addEventListener("pointerleave", () => {
      if (hovered === id) hovered = null;
      synchronize();
    }, { passive: true });
    route.addEventListener("focusin", synchronize);
    route.addEventListener("focusout", () => queueMicrotask(synchronize));
  }
  document.addEventListener("visibilitychange", synchronize);
  reduced.addEventListener?.("change", synchronize);
  connection?.addEventListener?.("change", synchronize);
  window.addEventListener("pageshow", synchronize);
  synchronize();
})();
