import { directionOwnerRoutes, type DirectionId } from '../data/localized-direction-owners';

/** Only the three existing bilingual authentication pages call this adapter. */
export function syncConnectAuthChrome(language: 'en' | 'uk') {
  const labels = language === 'uk'
    ? { logistics: 'Логістика', marketing: 'Маркетинг', technology: 'IT-розробка', academy: 'Академія', signIn: 'Увійти', contact: 'Почати розмову', content: 'Мова контенту: українська' }
    : { logistics: 'Logistics', marketing: 'Marketing', technology: 'IT', academy: 'Academy', signIn: 'Sign in', contact: 'Start a conversation', content: 'Content language: English' };
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  for (const direction of ['logistics', 'marketing', 'technology', 'academy'] as DirectionId[]) {
    header.querySelectorAll<HTMLAnchorElement>(`a[data-nav-tone="${direction}"]`).forEach(link => {
      // Reuse existing canonical language destinations; do not create a new route owner.
      link.href = directionOwnerRoutes[language][direction];
      const text = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
      if (text) text.textContent = labels[direction];
    });
  }
  header.querySelectorAll<HTMLElement>('[data-hermes-sign-in]').forEach(node => { node.textContent = labels.signIn; });
  header.querySelectorAll<HTMLAnchorElement>('a[href$="#contact"]').forEach(node => { node.textContent = labels.contact; });
  const home = header.querySelector<HTMLAnchorElement>('a.wordmark');
  if (home) home.href = language === 'uk' ? '/ua/#top' : '/#top';
  const contentLanguage = document.querySelector<HTMLElement>('[data-hc-product-context] .hc-content-language');
  if (contentLanguage) contentLanguage.textContent = labels.content;
  // Both EN and UK dictionaries exist on these routes, so the generic English-only notice is false here.
  document.querySelectorAll('[data-hc-english-only]').forEach(node => node.remove());
}
