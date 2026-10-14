/** Gentle living subject cycles with long rests; no panel motion, timers or frame loop. */
export function initializeHomePortalMotion() {
  const layers = [...document.querySelectorAll<HTMLElement>("[data-home-motion]")];
  if (!layers.length || !window.IntersectionObserver || !Element.prototype.animate) return;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const visible = new Set<Element>();
  const animations = new Map<HTMLElement, Animation>();
  const completed = new Set<HTMLElement>();

  function update() {
    for (const layer of layers) {
      let animation = animations.get(layer);
      if (preference.matches) {
        animation?.cancel();
        animations.delete(layer);
        layer.dataset.motionState = "reduced";
        continue;
      }
      const canRun = visible.has(layer) && !document.hidden;
      if (completed.has(layer)) continue;
      if (!animation && canRun) {
        const truck = layer.dataset.homeMotion === "truck";
        animation = layer.animate(truck ? [
          { transform: "translate(0,0) rotate(-18deg)", opacity: 1 },
          { transform: "translate(0,0) rotate(-18deg)", opacity: 1, offset: .08 },
          { transform: "translate(-35%,75%) rotate(-18deg)", opacity: 1, offset: .34 },
          { transform: "translate(-35%,75%) rotate(-18deg)", opacity: 0, offset: .40 },
          { transform: "translate(0,0) rotate(-18deg)", opacity: 0, offset: .41 },
          { transform: "translate(0,0) rotate(-18deg)", opacity: 1, offset: .47 },
          { transform: "translate(0,0) rotate(-18deg)", opacity: 1 },
        ] : [
          { transform: "rotate(0deg)" },
          { transform: "rotate(0deg)", offset: .06 },
          { transform: "rotate(-2deg)", offset: .12 },
          { transform: "rotate(1.5deg)", offset: .20 },
          { transform: "rotate(0deg)", offset: .28 },
          { transform: "rotate(0deg)" },
        ], { duration: 18000, iterations: Infinity, easing: "ease-in-out" });
        animations.set(layer, animation);
      }
      if (!animation) continue;
      if (canRun) {
        animation.play();
        layer.dataset.motionState = "running";
      } else {
        animation.pause();
        layer.dataset.motionState = "paused";
      }
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= .2) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    update();
  }, { threshold: .2 });
  layers.forEach(layer => observer.observe(layer));
  preference.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
  update();
}
