// Progressive cinematic layer for the approved four-pillar Home shell.
// No remote media URLs, no metrics, and no downloads when motion/data saving is requested.
(() => {
  const stage = document.querySelector("[data-home-marketing-cinematic]");
  const video = stage?.querySelector("[data-home-marketing-video]");
  const source = video?.querySelector("[data-home-marketing-source]");
  if (!stage || !video || !source) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 700px)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let intersects = false;
  let loaded = false;
  let unavailable = false;

  const pausedByPolicy = () => reduced.matches || Boolean(connection?.saveData);
  const sync = () => {
    const shouldRun = intersects && !document.hidden && !pausedByPolicy() && !unavailable;
    if (!shouldRun) {
      video.pause();
      stage.dataset.mediaState = "poster";
      return;
    }
    if (!loaded) {
      // The browser does not fetch the MP4 before the portal is eligible for motion.
      source.src = mobile.matches ? source.dataset.mobileSrc : source.dataset.desktopSrc;
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
      intersects = entries.some((entry) => entry.isIntersecting);
      sync();
    }, { rootMargin: "100px", threshold: 0.01 });
    observer.observe(stage);
  } else {
    intersects = true;
    sync();
  }
})();
