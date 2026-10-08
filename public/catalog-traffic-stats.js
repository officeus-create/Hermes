(() => {
  if (window.__hermesCatalogTraffic || !location.pathname.startsWith('/businesses/')) return;
  window.__hermesCatalogTraffic = true;
  const targets = new Map();
  const data = new Map();
  const requested = new Set();
  let scheduled = false;
  const uk = () => document.documentElement.lang === 'uk' || new URLSearchParams(location.search).get('lang') === 'uk';
  const text = (en, ua) => uk() ? ua : en;
  const number = (value) => Number.isSafeInteger(value) && value >= 0 ? new Intl.NumberFormat(uk() ? 'uk-UA' : 'en-US').format(value) : '—';
  const node = (tag, content, className) => { const el = document.createElement(tag); el.textContent = content; if (className) el.className = className; return el; };
  const style = node('style', '.catalog-traffic-badge{display:inline-flex;align-items:center;gap:5px;width:fit-content;margin:8px 0 0;padding:4px 8px;border:1px solid #dde5ec;border-radius:999px;background:#f8fafc;color:#526378;font:500 11px/1.4 system-ui;font-variant-numeric:tabular-nums}.catalog-traffic-detail{margin:12px 0;padding:0 12px;border:1px solid #dce5ed;border-radius:12px;background:#f8fafc;color:#26384b;font:400 13px/1.5 system-ui}.catalog-traffic-detail summary{min-height:44px;display:list-item;align-content:center;cursor:pointer;font-weight:600}.catalog-traffic-detail dl{display:flex;flex-wrap:wrap;gap:12px 24px;margin:8px 0}.catalog-traffic-detail dl div{min-width:90px}.catalog-traffic-detail dt{font-size:11px;color:#617286}.catalog-traffic-detail dd{margin:2px 0;font-size:20px;font-weight:650;font-variant-numeric:tabular-nums}.catalog-traffic-detail p{font-size:11px;color:#617286;margin:8px 0 12px}.catalog-traffic-detail ul{padding-left:18px;font-size:12px}');
  document.head.append(style);
  const render = (target, result) => {
    const views = number(result?.views28d);
    if (!target.detail) {
      target.el.textContent = text(`Views · ${views} / 28d`, `Перегляди · ${views} / 28 дн.`);
      target.el.title = text('Consented views of this profile, not unique visitors. Unavailable counts remain —.', 'Перегляди цього профілю за згодою на аналітику, не унікальні відвідувачі. Недоступні дані —.');
      return;
    }
    const wasOpen = target.el.open;
    target.el.replaceChildren(node('summary', text(`Profile views · ${views} in 28 days`, `Перегляди профілю · ${views} за 28 днів`)));
    target.el.open = wasOpen;
    const dl = node('dl', '');
    for (const [en, ua, key] of [['Today','Сьогодні','viewsToday'],['7 days','7 днів','views7d'],['28 days','28 днів','views28d']]) {
      const row = node('div', ''); row.append(node('dt', text(en, ua)), node('dd', number(result?.[key]))); dl.append(row);
    }
    target.el.append(dl);
    if (result?.countries?.length) {
      const countries = node('ul', '');
      const names = new Intl.DisplayNames([uk() ? 'uk' : 'en'], { type: 'region' });
      for (const row of result.countries) countries.append(node('li', `${names.of(row.country) || row.country}: ${number(row.views)}`));
      target.el.append(countries);
    }
    target.el.append(node('p', text('Consented profile views · UTC · not unique people. Country detail starts with newly recorded views; only groups of 5+ views are shown. Missing data is not zero.', 'Перегляди профілю за згодою на аналітику · UTC · не унікальні люди. Країни враховуються з початку нового збору; показано лише групи від 5 переглядів. Відсутні дані не означають нуль.')));
    if (result?.updatedAt) target.el.append(node('p', text('Data through: ', 'Дані до: ') + String(result.updatedAt).slice(0, 10) + ' UTC'));
  };
  const add = (path, anchor, detail = false) => {
    if (anchor.dataset.catalogTrafficMounted === 'true') return;
    anchor.dataset.catalogTrafficMounted = 'true';
    const el = node(detail ? 'details' : 'span', '', detail ? 'catalog-traffic-detail' : 'catalog-traffic-badge');
    el.setAttribute('data-catalog-traffic', detail ? 'detail' : 'badge');
    anchor.insertAdjacentElement('afterend', el);
    const target = { el, detail };
    if (!targets.has(path)) targets.set(path, []);
    targets.get(path).push(target); render(target, data.get(path));
  };
  const scan = () => {
    scheduled = false;
    document.querySelectorAll('.business-card .business-card__actions a[href]').forEach((anchor) => {
      const url = new URL(anchor.href, location.origin);
      if (url.origin === location.origin && /^\/businesses\/[a-z0-9/-]+\/$/.test(url.pathname) && url.pathname !== '/businesses/request/') add(url.pathname, anchor);
    });
    if (document.querySelector('script[data-catalog-business-id]')) {
      const heading = document.querySelector('main h1');
      if (heading) add(location.pathname, heading, true);
    }
    const paths = [...targets.keys()].filter((path) => !requested.has(path));
    for (let offset = 0; offset < paths.length; offset += 12) {
      const batch = paths.slice(offset, offset + 12); batch.forEach((path) => requested.add(path));
      const query = new URLSearchParams(); batch.forEach((path) => query.append('path', path));
      fetch('/api/catalog-business-event?' + query, { credentials: 'same-origin', cache: 'no-store' })
        .then(async (response) => { if (!response.ok) throw new Error('unavailable'); return response.json(); })
        .then((payload) => { if (payload.success !== true || !Array.isArray(payload.profiles)) return; for (const row of payload.profiles) { if (!batch.includes(row.path)) continue; data.set(row.path, row); for (const target of targets.get(row.path) || []) render(target, row); } })
        .catch(() => { /* Keep a truthful unavailable placeholder; never invent zero or retry blindly. */ });
    }
  };
  const start = () => {
    scan();
    new MutationObserver((changes) => {
      if (changes.some((change) => [...change.addedNodes].some((item) => item.nodeType === 1 && (item.matches?.('.business-card') || item.querySelector?.('.business-card')))) && !scheduled) {
        scheduled = true; queueMicrotask(scan);
      }
    }).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(() => { for (const [path, list] of targets) for (const target of list) render(target, data.get(path)); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
