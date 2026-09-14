(() => {
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const grid = document.querySelector('[data-catalog-grid]');
  const count = document.querySelector('[data-catalog-count]');
  if (!grid) return;
  fetch('/api/catalog/companies', { headers: { Accept: 'application/json' }, credentials: 'omit' })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload?.success || !Array.isArray(payload.companies)) return;
      const existingLinks = new Set([...grid.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
      let added = 0;
      for (const company of payload.companies) {
        const href = String(company.profileUrl || '');
        if (!href || existingLinks.has(href)) continue;
        const services = Array.isArray(company.services) ? company.services.slice(0, 4) : [];
        const article = document.createElement('article');
        article.className = 'business-card';
        article.dataset.catalogCard = '';
        article.dataset.searchText = [company.companyName, company.companyType, company.city, company.state, ...services].filter(Boolean).join(' ').toLowerCase();
        const cadence = company.seoGeo?.reportingCadence === 'monthly'
          ? 'Hermes Connect profile · monthly SEO/GEO reporting cadence'
          : 'Hermes Connect public company profile';
        article.innerHTML = `<div class="business-card__top"><span>${esc(company.companyType === 'repair_shop' ? 'Repair Shop' : company.companyType)}</span><span>${esc(company.verificationLabel || 'Self-submitted')}</span></div><h3>${esc(company.companyName)}</h3><p>${esc(company.city)}, ${esc(company.state)}</p>${services.length ? `<ul>${services.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p>Services are managed in Hermes Connect.</p>'}<div class="business-card__actions"><a href="${esc(href)}">View profile</a><span>${esc(cadence)}</span></div>`;
        grid.appendChild(article);
        existingLinks.add(href);
        added += 1;
      }
      if (added && count) {
        const total = document.querySelectorAll('[data-catalog-card]').length;
        count.textContent = `${total} searchable ${total === 1 ? 'entry' : 'entries'}`;
      }
      document.dispatchEvent(new CustomEvent('hermes:catalog-profiles-loaded', { detail: { added } }));
    })
    .catch(() => {});
})();
