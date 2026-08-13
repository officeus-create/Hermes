(() => {
  const frame = document.getElementById('workspace-frame');
  const root = document.documentElement;

  const knotSvg = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="hc-knot-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#B6A8FF"/>
          <stop offset="1" stop-color="#7C5CFF"/>
        </linearGradient>
        <linearGradient id="hc-knot-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7FD1B6"/>
          <stop offset="1" stop-color="#5AC8FA"/>
        </linearGradient>
      </defs>
      <path d="M12 18c0-5 4-9 9-9h10c5 0 9 4 9 9v4c0 5-4 9-9 9H21c-5 0-9 4-9 9v6" fill="none" stroke="url(#hc-knot-a)" stroke-width="7" stroke-linecap="round"/>
      <path d="M52 46c0 5-4 9-9 9H33c-5 0-9-4-9-9v-4c0-5 4-9 9-9h10c5 0 9-4 9-9v-6" fill="none" stroke="url(#hc-knot-b)" stroke-width="7" stroke-linecap="round"/>
    </svg>`;

  function installStyle(doc) {
    if (doc.querySelector('link[data-hc-v2-style]')) return;
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = './workspace-v2-injected.css';
    link.dataset.hcV2Style = 'true';
    doc.head.appendChild(link);
  }

  function installAmbientVisuals(doc) {
    if (!doc.querySelector('.hc-brand-ghost')) {
      const ghost = doc.createElement('div');
      ghost.className = 'hc-brand-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      ghost.innerHTML = knotSvg;
      doc.body.appendChild(ghost);
    }

    if (!doc.querySelector('.hc-signal-lines')) {
      const signals = doc.createElement('div');
      signals.className = 'hc-signal-lines';
      signals.setAttribute('aria-hidden', 'true');
      signals.innerHTML = '<i></i><i></i><i></i>';
      doc.body.appendChild(signals);
    }

    if (!doc.querySelector('.hc-floating-knot')) {
      const launcher = doc.createElement('button');
      launcher.type = 'button';
      launcher.className = 'hc-floating-knot';
      launcher.setAttribute('aria-label', 'Open Hermes Intelligence');
      launcher.innerHTML = `${knotSvg}<span class="hc-knot-tip">Open Hermes Intelligence</span>`;
      launcher.addEventListener('click', () => {
        const existing = doc.querySelector('[data-hermes-open]');
        if (existing) existing.click();
      });
      doc.body.appendChild(launcher);
    }
  }

  function replaceGenericHermesIcons(doc) {
    doc.querySelectorAll('.hermes-cta > span').forEach(slot => {
      slot.classList.add('hc-logo-slot');
      slot.innerHTML = knotSvg;
    });

    doc.querySelectorAll('.mobile-bar [data-hermes-open]').forEach(button => {
      const text = button.textContent.trim();
      button.innerHTML = `<span class="hc-logo-slot" aria-hidden="true">${knotSvg}</span><span>${text.replace(/^✦\s*/, '')}</span>`;
    });

    doc.querySelectorAll('[data-hermes-open]').forEach(button => {
      if (button.classList.contains('hc-floating-knot')) return;
      button.setAttribute('title', 'Hermes Intelligence');
    });
  }

  function refineCopy(doc) {
    const hero = doc.querySelector('.hero-intelligence h2');
    if (hero && /business is moving/i.test(hero.textContent)) {
      hero.textContent = 'Hermes keeps your business in motion.';
    }
    const summary = doc.querySelector('[data-ai-summary-text]');
    if (summary) summary.setAttribute('aria-live', 'polite');
  }

  function bindModuleAtmosphere(doc) {
    const setView = (view) => {
      doc.body.dataset.hcView = view || 'home';
    };
    doc.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });
    doc.querySelectorAll('[data-mobile-view]').forEach(button => {
      button.addEventListener('click', () => setView(button.dataset.mobileView));
    });
    doc.querySelectorAll('[data-view-jump]').forEach(button => {
      button.addEventListener('click', () => setView(button.dataset.viewJump));
    });
    setView('home');
  }

  function bindDrawerState(doc) {
    const drawer = doc.querySelector('[data-hermes-drawer]');
    if (!drawer) return;
    const sync = () => doc.body.classList.toggle('hc-hermes-open', drawer.classList.contains('open'));
    const observer = new MutationObserver(sync);
    observer.observe(drawer, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
    sync();
  }

  function bindPointerMotion(doc) {
    const reduce = doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = doc.defaultView.matchMedia('(pointer: coarse)').matches;
    if (reduce || coarse) return;

    let raf = 0;
    doc.addEventListener('pointermove', event => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (event.clientX / doc.defaultView.innerWidth) * 100;
        const y = (event.clientY / doc.defaultView.innerHeight) * 100;
        doc.documentElement.style.setProperty('--hc-pointer-x', `${x.toFixed(1)}%`);
        doc.documentElement.style.setProperty('--hc-pointer-y', `${y.toFixed(1)}%`);
      });
    }, { passive: true });

    doc.querySelectorAll('.hero-intelligence,.panel,.focus-card,.metric-grid article,.integration-card,.deal-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        const max = card.classList.contains('hero-intelligence') ? 2.6 : 1.4;
        card.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  function bindVerticalEnergy(doc) {
    const palette = {
      beauty: ['#7C5CFF','#5AC8FA'],
      logistics: ['#5AC8FA','#7FD1B6'],
      fitness: ['#7FD1B6','#7C5CFF'],
      agency: ['#7C5CFF','#D99A3D'],
      realestate: ['#5AC8FA','#D7B9FF']
    };
    doc.querySelectorAll('[data-vertical]').forEach(button => button.addEventListener('click', () => {
      const pair = palette[button.dataset.vertical] || palette.beauty;
      doc.documentElement.style.setProperty('--hc-violet', pair[0]);
      doc.documentElement.style.setProperty('--hc-blue', pair[1]);
    }));
  }

  function markReady() {
    root.classList.add('ready');
  }

  frame.addEventListener('load', () => {
    try {
      const doc = frame.contentDocument;
      installStyle(doc);
      installAmbientVisuals(doc);
      replaceGenericHermesIcons(doc);
      refineCopy(doc);
      bindModuleAtmosphere(doc);
      bindDrawerState(doc);
      bindPointerMotion(doc);
      bindVerticalEnergy(doc);
      setTimeout(markReady, 220);
    } catch (error) {
      console.error('Hermes Connect V2 enhancement failed', error);
      markReady();
    }
  });
})();
