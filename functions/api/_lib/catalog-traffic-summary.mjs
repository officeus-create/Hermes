const DAY = 86400000;
const day = (date) => date.toISOString().slice(0, 10);
export function catalogTrafficPeriod(now = new Date()) {
  return { start: day(new Date(now.getTime() - 27 * DAY)), start7: day(new Date(now.getTime() - 6 * DAY)), end: day(now) };
}
export function catalogCountryCode(value) {
  const code = String(value || '').toUpperCase();
  return /^[A-Z]{2}$/.test(code) && !['XX', 'ZZ'].includes(code) ? code : null;
}
const count = (value) => Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
export function publicCatalogTrafficSummary(rows, countryRows, period) {
  const observed = (rows || []).filter((row) => row.day >= period.start && row.day <= period.end);
  const sum = (from) => observed.filter((row) => row.day >= from).reduce((n, row) => n + count(row.event_count), 0);
  const countryTotals = new Map();
  for (const row of countryRows || []) {
    const code = catalogCountryCode(row.country);
    if (code) countryTotals.set(code, (countryTotals.get(code) || 0) + count(row.views));
  }
  const coverage = [...countryTotals.values()].reduce((a, b) => a + b, 0);
  const total = observed.length ? sum(period.start) : null;
  // A missing/partial geography history must never be backfilled or equated to all views.
  return {
    state: observed.length ? 'measured' : 'no_observations',
    viewsToday: observed.length ? sum(period.end) : null,
    views7d: observed.length ? sum(period.start7) : null,
    views28d: total,
    updatedAt: observed.map((row) => String(row.updated_at || row.day).slice(0, 10)).sort().at(-1) || null,
    countries: [...countryTotals].filter(([, views]) => views >= 5).map(([country, views]) => ({ country, views })).sort((a, b) => b.views - a.views || a.country.localeCompare(b.country)),
    countryCoverageViews: coverage,
    countriesState: !coverage ? 'unavailable' : coverage === total ? 'covered' : 'partial',
    countryMinimumViews: 5,
  };
}
