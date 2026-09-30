/** One brief compositor animation per visible portal; no timers or frame loop. */
export function initializeHomePortalMotion() {
  const layers = [...document.querySelectorAll<SVGSVGElement>("[data-home-motion]")];
  if (!layers.length || !window.IntersectionObserver || !Element.prototype.animate) return;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const visible = new Set<Element>();
  const animations = new Map<SVGSVGElement, Animation>();
  const completed = new Set<SVGSVGElement>();

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
        const patch = layer.querySelector("g");
        if (!patch) continue;
        const truck = layer.dataset.homeMotion === "truck";
        animation = patch.animate(truck ? [
          { transform: "translate(0, 0)", opacity: 0 },
          { transform: "translate(-.3px, -1px)", opacity: 1, offset: .18 },
          { transform: "translate(-1.8px, -6px)", opacity: 1, offset: .8 },
          { transform: "translate(-2px, -7px)", opacity: 0 },
        ] : [
          { transform: "rotate(0deg)", opacity: 0 },
          { transform: "rotate(-.6deg)", opacity: 1, offset: .25 },
          { transform: "rotate(.5deg)", opacity: 1, offset: .65 },
          { transform: "rotate(0deg)", opacity: 0 },
        ], { duration: 6000, iterations: 1, easing: "ease-in-out" });
        patch.style.transformOrigin = "181px 148px";
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
  preference.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
  update();
}
