// Hermes Home v3: interactive, source-locked local cinematic windows.
// On fine-pointer desktops the hovered/focused window comes alive; touch devices
// autoplay only while visibly onscreen. No network request for offscreen footage.
// Save-Data and reduced-motion remain poster-only for accessibility/bandwidth.
(() => {
  const stages = document.querySelectorAll("[data-home-progressive-cinematic]");
  if (!stages.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const posterOnly = () => reduced.matches || Boolean(connection?.saveData);
  const poorNetwork = () => ["slow-2g", "2g", "3g"].includes(connection?.effectiveType) ||
    (typeof connection?.downlink === "number" && connection.downlink < 1.5);

  stages.forEach((stage) => {
    const video = stage.querySelector("[data-home-progressive-video]");
    const source = stage.querySelector("[data-home-progressive-source]");
    const route = stage.closest("[data-home-route]");
    if (!video || !source || !route) return;
    let intersects = false;
    let active = false;
    let loaded = false;
    let unavailable = false;
    const sync = () => {
      const requested = finePointer.matches ? active : intersects;
      const shouldRun = intersects && requested && !document.hidden && !posterOnly() && !unavailable;
      if (!shouldRun) {
        video.pause();
        stage.dataset.mediaState = "poster";
        stage.dataset.videoInteraction = "idle";
        return;
      }
      if (!loaded) {
        const useHd = Boolean(source.dataset.hdSrc) && !poorNetwork() &&
          (stage.getBoundingClientRect().width >= 600 ||
           (finePointer.matches && window.devicePixelRatio >= 1.5));
        const nextSrc = useHd ? source.dataset.hdSrc :
          finePointer.matches ? source.dataset.desktopSrc : source.dataset.mobileSrc;
        if (!nextSrc || !/^\/media\/home\/[a-z0-9-]+\.mp4$/.test(nextSrc)) {
          unavailable = true;
          stage.dataset.mediaState = "poster";
          return;
        }
        source.src = nextSrc;
        stage.dataset.videoQuality = useHd ? "hd" : "standard";
        loaded = true;
        video.load();
      }
      stage.dataset.videoInteraction = "active";
      void video.play().catch(() => {
        stage.dataset.mediaState = "poster";
        stage.dataset.videoInteraction = "blocked";
      });
    };
    const activate = () => { active = true; sync(); };
    const deactivate = () => {
      active = route.matches(":hover") || route.matches(":focus-within");
      sync();
    };
    route.addEventListener("pointerenter", activate);
    route.addEventListener("pointerleave", () => { active = route.matches(":focus-within"); sync(); });
    route.addEventListener("focusin", activate);
    route.addEventListener("focusout", () => requestAnimationFrame(deactivate));
    video.addEventListener("playing", () => { stage.dataset.mediaState = "ready"; });
    video.addEventListener("error", () => {
      unavailable = true;
      video.pause();
      stage.dataset.mediaState = "poster";
      stage.dataset.videoInteraction = "failed";
    });
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener?.("change", sync);
    finePointer.addEventListener?.("change", sync);
    connection?.addEventListener?.("change", sync);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        intersects = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.15);
        sync();
      }, { rootMargin: "0px", threshold: [0, 0.15, 0.4] }).observe(stage);
    } else {
      intersects = true;
      sync();
    }
  });
})();
