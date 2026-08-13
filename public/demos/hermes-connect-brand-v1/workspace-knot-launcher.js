(() => {
  const existingControl = document.querySelector('[data-hermes-open]');
  if (!existingControl || document.querySelector('.hc-floating-knot')) return;

  const approvedStyle = document.createElement('link');
  approvedStyle.rel = 'stylesheet';
  approvedStyle.href = '/workspace-v2-injected.css';
  approvedStyle.dataset.hcV2Style = 'true';
  document.head.appendChild(approvedStyle);

  const knotSvg = `
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hc-launch-knot-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#B6A8FF"/>
          <stop offset="1" stop-color="#7C5CFF"/>
        </linearGradient>
        <linearGradient id="hc-launch-knot-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7FD1B6"/>
          <stop offset="1" stop-color="#5AC8FA"/>
        </linearGradient>
      </defs>
      <path d="M12 18c0-5 4-9 9-9h10c5 0 9 4 9 9v4c0 5-4 9-9 9H21c-5 0-9 4-9 9v6" fill="none" stroke="url(#hc-launch-knot-a)" stroke-width="7" stroke-linecap="round"/>
      <path d="M52 46c0 5-4 9-9 9H33c-5 0-9-4-9-9v-4c0-5 4-9 9-9h10c5 0 9-4 9-9v-6" fill="none" stroke="url(#hc-launch-knot-b)" stroke-width="7" stroke-linecap="round"/>
    </svg>`;

  document.querySelectorAll('.hermes-cta > span').forEach((slot) => {
    slot.classList.add('hc-logo-slot');
    slot.innerHTML = knotSvg;
  });

  document.querySelectorAll('.mobile-bar [data-hermes-open]').forEach((button) => {
    const label = button.textContent.trim().replace(/^✦\s*/, '') || 'Ask Hermes';
    button.innerHTML = `<span class="hc-logo-slot" aria-hidden="true">${knotSvg}</span><span>${label}</span>`;
  });

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'hc-floating-knot';
  launcher.setAttribute('aria-label', 'Open Hermes Intelligence');
  launcher.innerHTML = `${knotSvg}<span class="hc-knot-tip">Hermes Intelligence</span>`;
  launcher.addEventListener('click', () => existingControl.click());
  document.body.appendChild(launcher);
})();
