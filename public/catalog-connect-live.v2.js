(() => {
  const repairGrid = document.querySelector('[data-catalog-grid]');
  const grid = repairGrid;
  const academyGrid = document.querySelector('[data-academy-catalog-grid]');
  if (!repairGrid && !academyGrid) return;

  const syncPublishedCount = () => {
    const publishedCount = grid ? grid.querySelectorAll('[data-catalog-card]').length : 0;
    document.querySelectorAll('[data-catalog-business-count]').forEach((node) => {
      node.textContent = String(publishedCount);
    });
  };
  document.addEventListener('hermes:catalog-profiles-loaded', syncPublishedCount);

  const makeCard = (company, profileHref = "") => {
    const article = document.createElement('article');
    article.className = 'business-card';
    article.dataset.catalogCard = '';
    article.dataset.catalogEntityId = String(company?.id || '');

    const isAcademy = company?.companyType === 'academy_business';
    const isGenericAcademyLike = ['business_club','business_academy','online_school','courses','coaching','corporate_academy'].includes(String(company?.companyType || ''));
    const isAcademyLike = isAcademy || isGenericAcademyLike;
    const typeLabel = isAcademy
      ? String(company.typeLabel || 'Academy / Courses')
      : isGenericAcademyLike
        ? String(company.typeLabel || company.companyType || 'Academy / Courses').replaceAll('_',' ')
        : 'Repair Shop';
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
      note.textContent = isAcademyLike
        ? 'Programs and public business details are managed by the owner in Hermes Connect.'
        : 'Services are managed by the owner in Hermes Connect.';
      article.append(note);
    }

    const actions = document.createElement('div');
    actions.className = 'business-card__actions';
    const meta = document.createElement('span');
    if (profileHref) {
      const link = document.createElement('a');
      link.href = profileHref;
      link.textContent = 'View profile';
      meta.textContent = isAcademyLike ? 'Hermes Connect Academy profile · owner-submitted' : 'Hermes Connect profile · owner-submitted';
      actions.append(link, meta);
    } else {
      meta.textContent = isAcademyLike
        ? 'Hermes Connect public facts · owner-submitted · profile route pending verification'
        : 'Hermes Connect public facts · owner-submitted';
      actions.append(meta);
    }
    article.append(actions);
    return article;
  };

  fetch('/api/catalog/companies', { headers: { Accept: 'application/json' }, credentials: 'omit' })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload?.success || !Array.isArray(payload.companies)) return;

      const repairExistingIds = new Set(repairGrid ? [...repairGrid.querySelectorAll('[data-catalog-entity-id]')].map((node) => node.getAttribute('data-catalog-entity-id')).filter(Boolean) : []);
      const academyExistingIds = new Set(academyGrid ? [...academyGrid.querySelectorAll('[data-catalog-entity-id]')].map((node) => node.getAttribute('data-catalog-entity-id')).filter(Boolean) : []);

      for (const company of payload.companies) {
        const href = String(company?.profileUrl || '');
        const id = String(company?.id || '');
        if (!id) continue;

        const repairHref = /^\/businesses\/connect\/repair-shop\/[a-zA-Z0-9%_-]+\/$/.test(href) ? href : '';
        const academyHref = /^\/businesses\/connect\/academy\/[a-zA-Z0-9%_-]+\/$/.test(href) ? href : '';
        const isGenericUaAcademyLike = company?.source === 'hermes_connect_company'
          && String(company?.countryCode || '').toUpperCase() === 'UA'
          && ['business_club','business_academy','online_school','courses','coaching','corporate_academy'].includes(String(company?.companyType || ''));

        if (company?.companyType === 'repair_shop' && repairGrid && repairHref && !repairExistingIds.has(id)) {
          repairGrid.append(makeCard(company, repairHref));
          repairExistingIds.add(id);
          continue;
        }
        if (company?.companyType === 'academy_business' && academyGrid && academyHref && !academyExistingIds.has(id)) {
          academyGrid.append(makeCard(company, academyHref));
          academyExistingIds.add(id);
          continue;
        }
        if (isGenericUaAcademyLike && academyGrid && !academyExistingIds.has(id)) {
          academyGrid.append(makeCard(company, ''));
          academyExistingIds.add(id);
        }
      }

      syncPublishedCount();
      document.dispatchEvent(new CustomEvent('hermes:catalog-profiles-loaded'));
    })
    .catch(() => {});
})();
