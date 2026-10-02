/** Three gentle subject cycles with rests; no panel motion, timers or frame loop. */
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
          { transform: "translate(-35%,75%) rotate(-18deg)", opacity: 1, offset: .48 },
          { transform: "translate(-35%,75%) rotate(-18deg)", opacity: 0, offset: .55 },
          { transform: "translate(0,0) rotate(-18deg)", opacity: 0, offset: .56 },
          { transform: "translate(0,0) rotate(-18deg)", opacity: 1, offset: .64 },
          { transform: "translate(0,0) rotate(-18deg)", opacity: 1 },
        ] : [
          { transform: "rotate(0deg)" },
          { transform: "rotate(-2.2deg)", offset: .16 },
          { transform: "rotate(1.8deg)", offset: .32 },
          { transform: "rotate(0deg)", offset: .48 },
          { transform: "rotate(0deg)" },
        ], { duration: 12000, iterations: 3, easing: "ease-in-out" });
        animations.set(layer, animation);
        animation.onfinish = () => {
          completed.add(layer);
          animations.delete(layer);
          layer.dataset.motionState = "finished";
        };
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
  const truck = layers.find(layer => layer.dataset.homeMotion === "truck");
  const logistics = truck?.closest<HTMLElement>(".home-master-route-logistics");
  const restartFinishedTruck = () => {
    if (!truck || preference.matches || !completed.has(truck)) return;
    completed.delete(truck);
    update();
  };
  logistics?.addEventListener("pointerenter", restartFinishedTruck);
  logistics?.addEventListener("focusin", restartFinishedTruck);
  preference.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
  update();
}
