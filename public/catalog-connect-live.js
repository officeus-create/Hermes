(() => {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid) return;
  const makeCard = (company) => {
    const article = document.createElement('article');
    article.className = 'business-card';
    article.dataset.catalogCard = '';
    const services = Array.isArray(company.services) ? company.services.slice(0, 4).map(String) : [];
    article.dataset.searchText = [company.companyName, 'Repair Shop', company.city, company.state, ...services].filter(Boolean).join(' ').toLowerCase();

    const top = document.createElement('div');
    top.className = 'business-card__top';
    const type = document.createElement('span');
    type.textContent = 'Repair Shop';
    const status = document.createElement('span');
    status.textContent = String(company.verificationLabel || 'Self-submitted · verification pending');
    top.append(type, status);

    const title = document.createElement('h3');
    title.textContent = String(company.companyName || 'Repair Shop');
    const location = document.createElement('p');
    location.textContent = [company.city, company.state].filter(Boolean).join(', ');
    article.append(top, title, location);

    if (services.length) {
      const list = document.createElement('ul');
      for (const service of services) {
        const item = document.createElement('li');
        item.textContent = service;
        list.append(item);
      }
      article.append(list);
    } else {
      const note = document.createElement('p');
      note.textContent = 'Services are managed by the owner in Hermes Connect.';
      article.append(note);
    }

    const actions = document.createElement('div');
    actions.className = 'business-card__actions';
    const link = document.createElement('a');
    link.href = String(company.profileUrl || '#');
    link.textContent = 'View profile';
    const meta = document.createElement('span');
    meta.textContent = 'Hermes Connect profile · owner-submitted';
    actions.append(link, meta);
    article.append(actions);
    return article;
  };

  fetch('/api/catalog/companies', { headers: { Accept: 'application/json' }, credentials: 'omit' })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload?.success || !Array.isArray(payload.companies)) return;
      const existing = new Set([...grid.querySelectorAll('a[href]')].map((link) => link.getAttribute('href')));
      for (const company of payload.companies) {
        const href = String(company?.profileUrl || '');
        if (!href || company?.companyType !== 'repair_shop' || existing.has(href)) continue;
        grid.append(makeCard(company));
        existing.add(href);
      }
      document.dispatchEvent(new CustomEvent('hermes:catalog-profiles-loaded'));
    })
    .catch(() => {});
})();
