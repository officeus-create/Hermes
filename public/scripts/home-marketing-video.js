// Hermes Home v3: source-locked local cinematic windows.
// Approved runtime contract: every meaningfully visible window plays autonomously
// on desktop and touch; offscreen/hidden windows pause. No hover/focus prerequisite.
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
    if (!video || !source) return;
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
        // Keep the four-window entrance light: use HD only when the rendered portal
        // is genuinely large, not merely because a Retina display has high DPR.
        const useHd = Boolean(source.dataset.hdSrc) && !poorNetwork() && finePointer.matches &&
          stage.getBoundingClientRect().width >= 600;
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
