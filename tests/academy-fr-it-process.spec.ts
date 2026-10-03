import { expect, test } from '@playwright/test';
import { localizedDirectionCopy, localizedDirectionUi } from '../src/data/localized-direction-copy';
import { directionOwnerRoutes } from '../src/data/localized-direction-owners';

const worksheet = 'https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/#decision-checks-title';
const cases = [
  { locale: 'fr' as const, title: 'Commencer par la logistique des États-Unis.', audience: '1. À qui s\'adresse ce parcours ?', resource: 'Ouvrir la grille de questions en anglais', program: 'Voir le programme de logistique USA en français', boundary: 'une demande ne réserve pas de place et ne vaut pas admission.' },
  { locale: 'it' as const, title: 'Iniziare dalla logistica degli Stati Uniti.', audience: '1. A chi si rivolge questo percorso?', resource: 'Aprire la lista di domande in inglese', program: 'Vedere il programma di logistica USA in italiano', boundary: "una richiesta non riserva un posto e non equivale all'ammissione." },
];
test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, route => route.abort());
});
for (const c of cases) {
  test(`${c.locale} Academy offers a scoped logistics starting example and visible continuation`, async ({ page }) => {
    await page.goto(directionOwnerRoutes[c.locale].academy);
    const process = page.locator('.localized-owner-process');
    await expect(process.getByRole('heading', { level: 2 })).toHaveText(c.title);
    const cards = process.locator('article');
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0).getByRole('heading')).toHaveText(c.audience);
    await expect(cards.nth(1)).toContainText('B2');
    await expect(cards.nth(3)).toContainText(c.boundary);
    const resource = cards.nth(2).getByRole('link', { name: c.resource, exact: true });
    const program = cards.nth(3).getByRole('link', { name: c.program, exact: true });
    await expect(resource).toBeVisible();
    await expect(resource).toHaveAttribute('href', worksheet);
    await expect(program).toBeVisible();
    await expect(program).toHaveAttribute('href', `https://hermeslogisticsus.com/${c.locale}/academy/us-logistics-operations/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(localizedDirectionCopy[c.locale].academy.h1);
    await expect(page.locator('.localized-owner-detail')).toHaveText(localizedDirectionCopy[c.locale].academy.detail);
    await expect(page.locator('.localized-owner-boundary-card p').last()).toHaveText(localizedDirectionCopy[c.locale].academy.boundary);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://hermeslogisticsus.com${directionOwnerRoutes[c.locale].academy}`);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
  test(`${c.locale} other direction owners retain their existing process`, async ({ page }) => {
    for (const direction of ['logistics', 'marketing', 'technology'] as const) {
      await page.goto(directionOwnerRoutes[c.locale][direction]);
      if (c.locale === 'it' && direction !== 'logistics') {
        const process = page.locator('.it-commercial-process');
        await expect(process.getByRole('heading', { level: 2 })).toHaveText('Prima la diagnosi. Poi il lavoro che conta.');
        await expect(process.locator('article')).toHaveCount(4);
        await expect(process.locator('a')).toHaveCount(0);
        await expect(process.locator('article h3')).toHaveText(direction === 'marketing'
          ? ['Baseline', 'Priorità', 'Esecuzione', 'Apprendimento']
          : ['Mappa del processo', 'Scope verificabile', 'Build e integrazione', 'Rilascio e iterazione']);
        continue;
      }
      const process = page.locator('.localized-owner-process');
      await expect(process.getByRole('heading', { level: 2 })).toHaveText(localizedDirectionUi[c.locale].processTitle);
      await expect(process.locator('article')).toHaveCount(4);
      await expect(process.locator('a')).toHaveCount(0);
      for (const [i, step] of localizedDirectionUi[c.locale].process.entries()) {
        await expect(process.locator('article').nth(i).getByRole('heading')).toHaveText(step.title);
        await expect(process.locator('article').nth(i).locator('p')).toHaveText(step.body);
      }
    }
  });
}
