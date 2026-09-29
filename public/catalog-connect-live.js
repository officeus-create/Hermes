(() => {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid) return;
  const identityKey = (name, city, state) => [name, city, state].map((value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')).join('|');
  const makeCard = (company) => {
    const article = document.createElement('article');
    article.className = 'business-card';
    article.dataset.catalogCard = '';
    article.dataset.businessKey = identityKey(company.companyName, company.city, company.state);
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
      const existingHrefs = new Set([...grid.querySelectorAll('a[href]')].map((link) => link.getAttribute('href')));
      const existingByKey = new Map([...grid.querySelectorAll('[data-business-key]')].map((card) => [card.getAttribute('data-business-key'), card]));
      for (const company of payload.companies) {
        const href = String(company?.profileUrl || '');
        if (!href || company?.companyType !== 'repair_shop' || existingHrefs.has(href)) continue;
        const key = identityKey(company.companyName, company.city, company.state);
        const card = makeCard(company);
        const duplicate = key ? existingByKey.get(key) : null;
        if (duplicate) duplicate.replaceWith(card);
        else grid.append(card);
        existingByKey.set(key, card);
        existingHrefs.add(href);
      }
      const businessCount = grid.querySelectorAll('[data-catalog-card]').length;
      document.querySelectorAll('[data-business-profile-count]').forEach((node) => { node.textContent = String(businessCount); });
      const catalogCount = document.querySelector('[data-catalog-count]');
      const serviceCount = Number(catalogCount?.getAttribute('data-service-count') || 0);
      if (catalogCount) catalogCount.textContent = `${businessCount + serviceCount} searchable entries`;
      document.dispatchEvent(new CustomEvent('hermes:catalog-profiles-loaded'));
    })
    .catch(() => {});
})();
