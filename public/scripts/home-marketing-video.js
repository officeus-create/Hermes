// Hermes Home: one hovered/focused/pressed portal animates at a time.
// Posters are the default; no film or audio starts merely by scrolling.
// Music is optional and synthesized locally only after clicking Sound on.
(() => {
  const routes = [...document.querySelectorAll("[data-home-route]")];
  if (!routes.length) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = () => Boolean(connection?.saveData) || /(^|-)2g/.test(connection?.effectiveType || "");
  let active = null;
  const toggle = document.querySelector("[data-home-sound-toggle]");
  let soundEnabled = false;
  let audio = null;
  let master = null;
  let notesTimer = null;
  let noteIndex = 0;
  const notes = [220, 261.63, 329.63, 392, 329.63, 261.63];

  function stopMusic() {
    if (notesTimer) clearInterval(notesTimer);
    notesTimer = null;
    if (master && audio) {
      try { master.gain.setTargetAtTime(0, audio.currentTime, 0.065); } catch {}
    }
  }
  function playNote() {
    if (!audio || !master || !active || !soundEnabled || document.hidden || reduced.matches) return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[noteIndex++ % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.63);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.66);
  }
  function syncMusic() {
    stopMusic();
    if (!soundEnabled || !active || document.hidden || reduced.matches || saveData() || !audio || !master) return;
    if (audio.state === "suspended") void audio.resume().catch(() => {});
    master.gain.setTargetAtTime(0.16, audio.currentTime, 0.075);
    playNote();
    notesTimer = setInterval(playNote, 540);
  }
  function activate(route) {
    if (reduced.matches || saveData() || document.hidden) return deactivate();
    if (active === route) return;
    if (active) {
      active.dataset.homePortalActive = "false";
      active.dispatchEvent(new Event("home-portal-activation"));
    }
    active = route;
    if (route) {
      route.dataset.homePortalActive = "true";
      route.dispatchEvent(new Event("home-portal-activation"));
    }
    syncMusic();
    for (const stage of document.querySelectorAll("[data-home-progressive-cinematic]")) {
      stage.dispatchEvent(new Event("home-portal-activation"));
    }
  }
  function deactivate(route) {
    if (route && active !== route) return;
    if (active) {
      active.dataset.homePortalActive = "false";
      active.dispatchEvent(new Event("home-portal-activation"));
    }
    active = null;
    stopMusic();
    for (const stage of document.querySelectorAll("[data-home-progressive-cinematic]")) {
      stage.dispatchEvent(new Event("home-portal-activation"));
    }
  }
  for (const route of routes) {
    route.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") activate(route);
    });
    route.addEventListener("pointerleave", () => deactivate(route));
    route.addEventListener("focusin", () => activate(route));
    route.addEventListener("focusout", event => {
      if (!route.contains(event.relatedTarget)) deactivate(route);
    });
    route.addEventListener("pointerdown", event => {
      if (event.pointerType === "touch") activate(route);
    });
    route.addEventListener("pointerup", event => {
      if (event.pointerType === "touch") deactivate(route);
    });
    route.addEventListener("pointercancel", () => deactivate(route));
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) deactivate();
  });
  reduced.addEventListener?.("change", () => { if (reduced.matches) deactivate(); });
  connection?.addEventListener?.("change", () => { if (saveData()) deactivate(); });
  toggle?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    toggle.setAttribute("aria-pressed", String(soundEnabled));
    toggle.textContent = soundEnabled ? "Sound on" : "Sound off";
    toggle.setAttribute("aria-label", soundEnabled ? "Disable preview music" : "Enable preview music");
    if (soundEnabled) {
      const AudioConstructor = window.AudioContext || window.webkitAudioContext;
      if (AudioConstructor && !audio) {
        audio = new AudioConstructor();
        master = audio.createGain();
        master.gain.value = 0;
        master.connect(audio.destination);
      }
    }
    syncMusic();
  });

  const stages = [...document.querySelectorAll("[data-home-progressive-cinematic]")];
  for (const stage of stages) {
    const video = stage.querySelector("[data-home-progressive-video]");
    const source = stage.querySelector("[data-home-progressive-source]");
    const route = stage.closest("[data-home-route]");
    if (!video || !source || !route) continue;
    let inView = false;
    let loaded = false;
    let unavailable = false;
    const sync = () => {
      const shouldRun = inView && active === route && !document.hidden && !reduced.matches && !saveData() && !unavailable;
      if (!shouldRun) {
        video.pause();
        stage.dataset.mediaState = "poster";
        return;
      }
      if (!loaded) {
        const src = source.dataset.desktopSrc || source.dataset.mobileSrc;
        if (!src?.startsWith("/media/home/")) { unavailable = true; return; }
        source.src = src;
        loaded = true;
        video.load();
      }
      if (video.paused) void video.play().catch(() => { stage.dataset.mediaState = "poster"; });
    };
    video.addEventListener("playing", () => { if (active === route) stage.dataset.mediaState = "ready"; });
    video.addEventListener("error", () => { unavailable = true; video.pause(); stage.dataset.mediaState = "poster"; });
    stage.addEventListener("home-portal-activation", sync);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener?.("change", sync);
    connection?.addEventListener?.("change", sync);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => { inView = entries.some(e => e.isIntersecting); sync(); }, { threshold: 0.01 }).observe(stage);
    } else { inView = true; }
  }
})();
