(() => {
  const repairGrid = document.querySelector('[data-catalog-grid]');
  const grid = repairGrid;
  const academyGrid = document.querySelector('[data-academy-catalog-grid]');
  if (!repairGrid && !academyGrid) return;

  const catalogInput = document.querySelector('[data-catalog-input]');
  const catalogSearch = document.querySelector('#catalog-search');
  const catalogCategories = document.querySelector('.category-grid');

  const bindDynamicCategory = (button, query) => {
    button.addEventListener('click', () => {
      if (catalogInput instanceof HTMLInputElement) {
        catalogInput.value = query;
        catalogInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      catalogSearch?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const reconcileCategoryCount = (categoryLabel) => {
    if (!catalogCategories || !categoryLabel) return;
    const buttons = [...catalogCategories.querySelectorAll('[data-catalog-query]')];
    let button = buttons.find((node) =>
      String(node.getAttribute('data-catalog-query') || '').trim().toLowerCase() === categoryLabel.toLowerCase()
    );
    if (button) {
      const countNode = button.querySelector('span');
      const current = Number.parseInt(String(countNode?.textContent || '0'), 10) || 0;
      const nextCount = current + 1;
      if (countNode) countNode.textContent = `${nextCount} profile${nextCount === 1 ? '' : 's'}`;
      return;
    }

    button = document.createElement('button');
    button.type = 'button';
    button.dataset.catalogQuery = categoryLabel;
    const label = document.createElement('strong');
    label.textContent = categoryLabel;
    const count = document.createElement('span');
    count.textContent = '1 profile';
    button.append(label, count);
    bindDynamicCategory(button, categoryLabel);
    catalogCategories.append(button);
  };

  const reconcileStateCount = (stateCode) => {
    const normalizedState = String(stateCode || '').trim().toUpperCase();
    if (!normalizedState) return;
    const tile = [...document.querySelectorAll('.tile-map .state-tile')].find(
      (node) => String(node.querySelector('strong')?.textContent || '').trim().toUpperCase() === normalizedState,
    );
    if (!(tile instanceof HTMLElement)) return;

    let countNode = tile.querySelector('span');
    const current = Number.parseInt(String(countNode?.textContent || '0'), 10) || 0;
    const nextCount = current + 1;
    if (!countNode) {
      countNode = document.createElement('span');
      tile.append(countNode);
    }
    countNode.textContent = String(nextCount);
    const hasStatePage = tile instanceof HTMLAnchorElement && tile.hasAttribute('href');
    tile.classList.toggle('active', hasStatePage);
    tile.classList.toggle('has-profiles', !hasStatePage);
    tile.classList.remove('pending');
    const currentLabel = tile.getAttribute('aria-label') || tile.getAttribute('title') || normalizedState;
    const stateName = currentLabel.split(':')[0]?.trim() || normalizedState;
    const label = `${stateName}: ${nextCount} business profile${nextCount === 1 ? '' : 's'}${hasStatePage ? '' : '; available in catalog search; state directory page unavailable'}`;
    tile.setAttribute('aria-label', label);
    if (hasStatePage) tile.removeAttribute('title');
    else tile.setAttribute('title', label);
  };

  const makeCard = (company, profileHref = "") => {
    const article = document.createElement('article');
    article.className = 'business-card';
    article.dataset.catalogCard = '';
    article.dataset.catalogEntityId = String(company?.id || '');

    const isRepair = company?.companyType === 'repair_shop';
    const isAcademy = company?.companyType === 'academy_business';
    const isGenericAcademyLike = ['business_club','business_academy','online_school','courses','coaching','corporate_academy'].includes(String(company?.companyType || ''));
    const isAcademyLike = isAcademy || isGenericAcademyLike;
    const typeLabel = isRepair
      ? 'Auto Repair'
      : isAcademy
        ? String(company.typeLabel || 'Academy / Courses')
        : isGenericAcademyLike
          ? String(company.typeLabel || company.companyType || 'Academy / Courses').replaceAll('_',' ')
          : 'Business';
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
    return { article, typeLabel };
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

        if (company?.companyType === 'repair_shop' && String(company?.countryCode || '').trim().toUpperCase() === 'US' && repairGrid && repairHref && !repairExistingIds.has(id)) {
          const rendered = makeCard(company, repairHref);
          repairGrid.append(rendered.article);
          repairExistingIds.add(id);
          reconcileCategoryCount(rendered.typeLabel);
          reconcileStateCount(company?.state);
          continue;
        }
        if (company?.companyType === 'academy_business' && academyGrid && academyHref && !academyExistingIds.has(id)) {
          academyGrid.append(makeCard(company, academyHref).article);
          academyExistingIds.add(id);
          continue;
        }
        if (isGenericUaAcademyLike && academyGrid && !academyExistingIds.has(id)) {
          academyGrid.append(makeCard(company, '').article);
          academyExistingIds.add(id);
        }
      }

      const publishedCount = grid ? grid.querySelectorAll('[data-catalog-card]').length : 0;
      document.querySelectorAll('[data-catalog-business-count]').forEach((node) => {
        node.textContent = String(publishedCount);
      });
      document.dispatchEvent(new CustomEvent('hermes:catalog-profiles-loaded'));
    })
    .catch(() => {});
})();
