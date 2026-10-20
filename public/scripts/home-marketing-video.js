// Hermes Home v3: mobile-only single-film arbitration; desktop stays exactly as
// approved (independent visible documentary scenes). Poster-first, local media.
(() => {
  const routes = Array.from(document.querySelectorAll("[data-home-route]"));
  if (!routes.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 700px)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const ratios = new Map();
  const records = new Map();
  let winner = null;

  for (const route of routes) {
    const id = route.dataset.routeId;
    if (!id) continue;
    ratios.set(id, 0);
    const stage = route.querySelector("[data-home-progressive-cinematic]");
    const video = stage?.querySelector("[data-home-progressive-video]");
    const source = stage?.querySelector("[data-home-progressive-source]");
    if (!video || !source) continue;
    const record = { id, stage, video, source, loaded: false, unavailable: false };
    records.set(id, record);
    video.addEventListener("playing", () => {
      if (!isAllowed(record)) {
        video.pause();
        stage.dataset.mediaState = "poster";
      } else {
        stage.dataset.mediaState = "ready";
      }
    });
    video.addEventListener("error", () => {
      record.unavailable = true;
      video.pause();
      stage.dataset.mediaState = "poster";
    });
  }

  const motionBlocked = () =>
    reduced.matches || Boolean(connection?.saveData) ||
    /^(slow-2g|2g)$/.test(connection?.effectiveType || "") ||
    document.hidden;

  function electMobile() {
    if (motionBlocked()) return null;
    let id = null;
    let ratio = 0.18;
    for (const route of routes) {
      const next = ratios.get(route.dataset.routeId) || 0;
      // Select only an actually dominant mobile portal (single-card layout).
      if (next > ratio) { id = route.dataset.routeId; ratio = next; }
    }
    return id;
  }

  function isAllowed(record) {
    if (motionBlocked()) return false;
    const visible = (ratios.get(record.id) || 0) >= 0.01;
    return visible && (!mobile.matches || winner === record.id);
  }

  function synchronize() {
    const next = mobile.matches ? electMobile() : null;
    const displayMode = motionBlocked() ? "poster" : mobile.matches ? (next || "poster") : "desktop";
    if (next !== winner || document.documentElement.dataset.homeCinemaActive !== displayMode) {
      winner = next;
      document.documentElement.dataset.homeCinemaActive = displayMode;
      // Logistics remains its own original video runtime on desktop.
      window.dispatchEvent(new Event("hermes:cinema-selection"));
    }
    for (const record of records.values()) {
      if (!isAllowed(record) || record.unavailable) {
        record.video.pause();
        record.stage.dataset.mediaState = "poster";
        continue;
      }
      if (!record.loaded) {
        const src = mobile.matches ? record.source.dataset.mobileSrc : record.source.dataset.desktopSrc;
        if (!src?.startsWith("/media/home/")) {
          record.unavailable = true;
          continue;
        }
        record.source.src = src;
        record.loaded = true;
        record.video.load();
      }
      if (record.video.paused) {
        void record.video.play().catch(() => {
          record.video.pause();
          record.stage.dataset.mediaState = "poster";
        });
      }
    }
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) ratios.set(entry.target.dataset.routeId, entry.isIntersecting ? entry.intersectionRatio : 0);
      synchronize();
    }, { threshold: [0, .01, .1, .2, .4, .6, .8, 1] });
    for (const route of routes) observer.observe(route);
  } else if (!mobile.matches) {
    // Preserve original desktop non-IO fallback while mobile remains poster-only.
    for (const route of routes) ratios.set(route.dataset.routeId, 1);
  }
  document.addEventListener("visibilitychange", synchronize);
  reduced.addEventListener?.("change", synchronize);
  mobile.addEventListener?.("change", synchronize);
  connection?.addEventListener?.("change", synchronize);
  window.addEventListener("pageshow", synchronize);
  synchronize();
})();
