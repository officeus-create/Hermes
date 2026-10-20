// Claude Home v3: shared, optional, locally hosted video layers for the three people
// portals. Logistics has its independent Golden Scene. No external video requests.
// Reduced Motion and Save-Data are poster-only; no source is attached until visible.
(() => {
  const stages = document.querySelectorAll("[data-home-progressive-cinematic]");
  if (!stages.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 700px)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const pausedByPolicy = () => reduced.matches || Boolean(connection?.saveData);

  stages.forEach((stage) => {
    const video = stage.querySelector("[data-home-progressive-video]");
    const source = stage.querySelector("[data-home-progressive-source]");
    if (!video || !source) return;
    let intersects = false;
    let loaded = false;
    let unavailable = false;

    const sync = () => {
      const shouldRun = intersects && !document.hidden && !pausedByPolicy() && !unavailable;
      if (!shouldRun) {
        video.pause();
        stage.dataset.mediaState = "poster";
        return;
      }
      if (!loaded) {
        const lightweightSrc = mobile.matches ? source.dataset.mobileSrc : source.dataset.desktopSrc;
        // Prefer sharper source only for Retina / expanded portals. Do not raise the
        // initial page's network cost, and keep low-resolution film on 2G connections.
        const connectionSlow = ["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
        const needsDetail = window.devicePixelRatio >= 1.5 || stage.getBoundingClientRect().width >= 600;
        const useSharp = needsDetail && !connectionSlow && Boolean(source.dataset.sharpSrc);
        const nextSrc = useSharp ? source.dataset.sharpSrc : lightweightSrc;
        stage.dataset.mediaQuality = useSharp ? "sharp-720" : "lite-540";
        if (!nextSrc || !nextSrc.startsWith("/media/home/")) {
          unavailable = true;
          stage.dataset.mediaState = "poster";
          return;
        }
        source.src = nextSrc;
        loaded = true;
        video.load();
      }
      void video.play().catch(() => {
        video.pause();
        stage.dataset.mediaState = "poster";
      });
    };
    video.addEventListener("playing", () => { stage.dataset.mediaState = "ready"; });
    video.addEventListener("error", () => {
      unavailable = true;
      stage.dataset.mediaState = "poster";
      video.pause();
    });
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener?.("change", sync);
    connection?.addEventListener?.("change", sync);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        // Wait until the visitor can actually see the film: avoids loading
        // Technology's HD video merely because its top touches the fold.
        intersects = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.4);
        sync();
      }, { rootMargin: "0px", threshold: 0.4 });
      observer.observe(stage);
    } else {
      intersects = true;
      sync();
    }
  });
})();
