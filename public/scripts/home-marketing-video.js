// Hermes Home v3: continuously living, source-locked local cinematic windows.
// Any scene that is meaningfully visible may play muted/inline; touch and desktop
// share the same visibility gate. Reduced-motion and Save-Data remain poster-only.
// Offscreen footage is not requested until it first becomes visible.
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
    let loaded = false;
    let unavailable = false;

    const sync = () => {
      const shouldRun = intersects && !document.hidden && !posterOnly() && !unavailable;
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
          stage.dataset.videoInteraction = "failed";
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
