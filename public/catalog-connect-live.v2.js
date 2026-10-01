(() => {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid) return;
  const makeCard = (company) => {
    const article = document.createElement('article');
    article.className = 'business-card';
    article.dataset.catalogCard = '';
    article.dataset.connectCompanyId = String(company.id || '');
    const club = company.companyType === 'business_club';
    const typeLabel = club ? 'Business club · training' : 'Repair Shop';
    const services = Array.isArray(company.services) ? company.services.slice(0, 4).map(String) : [];
    article.dataset.searchText = [company.companyName, typeLabel, company.city, company.state, company.countryCode, ...services].filter(Boolean).join(' ').toLowerCase();

    const top = document.createElement('div');
    top.className = 'business-card__top';
    const type = document.createElement('span');
    type.textContent = typeLabel;
    const status = document.createElement('span');
    status.textContent = String(company.verificationLabel || 'Self-submitted · verification pending');
    top.append(type, status);

    const title = document.createElement('h3');
    title.textContent = String(company.companyName || typeLabel);
    const location = document.createElement('p');
    location.textContent = [company.city, company.state, ...(club ? [company.countryCode] : [])].filter(Boolean).join(', ');
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
      note.textContent = club ? 'Business facts are maintained in Hermes Connect.' : 'Services are managed by the owner in Hermes Connect.';
      article.append(note);
    }

    const actions = document.createElement('div');
    actions.className = 'business-card__actions';
    if (!club) {
      const link = document.createElement('a');
      link.href = String(company.profileUrl);
      link.textContent = 'View profile';
      actions.append(link);
    }
    const meta = document.createElement('span');
    meta.textContent = 'Hermes Connect profile · owner-submitted';
    actions.append(meta);
    article.append(actions);
    return article;
  };

  fetch('/api/catalog/companies', { headers: { Accept: 'application/json' }, credentials: 'omit' })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload?.success || !Array.isArray(payload.companies)) return;
      const existing = new Set([...grid.querySelectorAll('a[href]')].map((link) => link.getAttribute('href')));
      const existingIds = new Set([...grid.querySelectorAll('[data-connect-company-id]')].map(node => node.dataset.connectCompanyId));
      for (const company of payload.companies) {
        const href = String(company?.profileUrl || '');
        const club = company?.companyType === 'business_club' && company?.source === 'hermes_connect_company' && company?.countryCode === 'UA' && typeof company?.id === 'string' && company.id;
        const repair = company?.companyType === 'repair_shop' && /^\/businesses\/connect\/repair-shop\/[a-zA-Z0-9%_-]+\/$/.test(href) && !existing.has(href);
        if ((!club && !repair) || existingIds.has(company.id)) continue;
        grid.append(makeCard(company));
        existingIds.add(company.id);
        existing.add(href);
      }
      const publishedCount = grid.querySelectorAll('[data-catalog-card]').length;
      document.querySelectorAll('[data-catalog-business-count]').forEach((node) => {
        node.textContent = String(publishedCount);
      });
      document.dispatchEvent(new CustomEvent('hermes:catalog-profiles-loaded'));
    })
    .catch(() => {});
})();
