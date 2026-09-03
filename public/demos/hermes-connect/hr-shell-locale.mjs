const SUPPORTED = new Set(['en', 'ru', 'uk']);
const STORAGE_KEY = 'hermes-connect-hr-pilot-v1';

const COPY = {
  en: {
    brand: 'HR · Candidate Interview', badge: 'Pilot V1', eyebrow: 'Candidate → Evidence → Human review → Next step',
    heroTitle: 'Show us how you think, learn and apply.',
    heroBody: 'This pilot replaces a long application form with a structured conversation. It gathers job-relevant evidence, gives candidates a clear view of the process and keeps every consequential employment or training step behind an authorized human review.',
    start: 'Start interview', how: 'How it works', phaseTarget: 'PHASE 1 TARGET', funnelTitle: 'One global funnel, three initial tracks.',
    logistics: 'Logistics', carrier: 'Carrier acquisition', sales: 'U.S. Sales', salesDesc: 'Web · SEO/GEO · SMM', marketing: 'Marketing', marketingDesc: 'Training & client thinking',
    contextNote: 'Country, language and source are used for localization and funnel analytics only. They are not readiness-scoring inputs.',
    modelKicker: 'OPERATING MODEL', modelTitle: 'Interview becomes the first learning experience', modelBody: 'The system asks, listens, requests evidence and adapts. It does not auto-hire or auto-reject.',
    pipe: [
      ['Context', 'Why now, what the candidate wants to change, preferred direction.'],
      ['Understanding', 'Read a short role brief and explain it in their own words.'],
      ['Application', 'Respond to a real work scenario instead of choosing A/B/C.'],
      ['Evidence', 'Concrete examples, questions asked, actions taken and lessons learned.'],
      ['Human gate', 'An authorized reviewer decides whether the next step is more evidence, Academy practice or a supervised test.'],
    ],
    intakeKicker: 'STEP 1 · INTAKE', intakeTitle: 'Choose your direction', intakeBody: 'No résumé is required for this pilot. We need only enough contact information to return a human-reviewed next step.',
    fullName: 'Full name', namePlaceholder: 'Your name', email: 'Email', telegram: 'Telegram username', optional: '(optional)', country: 'Country / current market', language: 'Interview language', source: 'How did you find Hermes?', select: 'Select',
    direction: 'Which direction interests you most?',
    tracks: [
      ['Logistics · Carrier Acquisition', 'Talk with U.S. carriers, discover needs, build trust and move qualified opportunities forward.'],
      ['U.S. Sales · Digital Services', 'Sell websites, SEO/GEO and social media marketing to U.S. businesses.'],
      ['Marketing · Training Track', 'Learn research, positioning, content thinking and client-focused marketing.'],
    ],
    consent: 'I consent to Hermes storing my contact details and job-relevant interview answers for this pilot. I understand these answers support a human review and are not an automatic employment decision.',
    begin: 'Begin structured interview →',
    persistence: 'Private server persistence will be attempted when the Hermes HR endpoint is available; the browser keeps a local recovery copy so a network interruption does not erase the interview.',
    whyKicker: 'WHY THIS FORMAT', whyTitle: 'We measure evidence, not polished résumés',
    evidenceRows: [
      ['Understand', 'Can you explain what you read without copying it?'],
      ['Realize', 'Can you connect the idea to the business problem behind it?'],
      ['Apply', 'Can you turn the idea into a question, action or next step?'],
      ['Prove', 'Can you give a concrete example instead of a general statement?'],
    ],
    fairnessLabel: 'Fairness boundary:', fairness: 'age, gender, ethnicity, religion, disability, family status and other protected or sensitive attributes are not requested by this pilot and must not be used to score readiness.',
    answerPlaceholder: 'Answer in your own words. Concrete examples are more useful than perfect wording.', reset: 'Clear this browser & restart', continue: 'Save answer & continue →',
    clearNote: 'Clearing this browser removes only the local recovery copy. If the interview has already synchronized to private Hermes HR, this button does not delete that server record.',
    completeKicker: 'INTERVIEW COMPLETE · REVIEW REQUIRED', summaryTitle: 'Your evidence summary', summaryBody: 'This summary helps an authorized reviewer decide the next step. It is not an employment decision.', humanGate: 'Human gate',
    routeStatus: 'Suggested development route', identityStatus: 'Identity continuity', identityTitle: 'One person, one learning record',
    export: 'Export sanitized pilot summary', claim: 'Link to my Hermes account', restart: 'Clear browser & start another interview',
    nextStep: 'Your next consequential step stays with an authorized human reviewer. If Academy practice or a supervised test is appropriate, that route is recorded through the private reviewer workflow rather than exposed as a self-approval action here.',
    reviewerLabel: 'Reviewer rule:', reviewer: 'Hermes may use the job-relevant answers and evidence shown here to support a human review. The pilot must not automatically hire, reject or rank candidates using protected traits, country, language or acquisition source.',
    footer: 'Hermes Connect HR Pilot V1 · Private D1 persistence when available · Human-reviewed next steps', privacy: 'Privacy', saved: 'Saved.',
  },
  ru: {
    brand: 'HR · Интервью кандидата', badge: 'Пилот V1', eyebrow: 'Кандидат → Evidence → Проверка человеком → Следующий шаг',
    heroTitle: 'Покажите, как вы думаете, учитесь и применяете знания.',
    heroBody: 'Этот пилот заменяет длинную анкету структурированным разговором. Он собирает evidence, относящийся к работе, показывает кандидату понятный процесс и оставляет любое существенное решение о работе или обучении за авторизованным человеком.',
    start: 'Начать интервью', how: 'Как это работает', phaseTarget: 'ЦЕЛЬ ФАЗЫ 1', funnelTitle: 'Одна глобальная воронка, три стартовых направления.',
    logistics: 'Логистика', carrier: 'Привлечение перевозчиков', sales: 'Продажи в США', salesDesc: 'Сайты · SEO/GEO · SMM', marketing: 'Маркетинг', marketingDesc: 'Обучение и мышление о клиенте',
    contextNote: 'Страна, язык и источник используются только для локализации и аналитики воронки. Они не участвуют в оценке готовности.',
    modelKicker: 'МОДЕЛЬ РАБОТЫ', modelTitle: 'Интервью становится первым учебным опытом', modelBody: 'Система задаёт вопросы, слушает, просит evidence и адаптируется. Она не нанимает и не отклоняет кандидата автоматически.',
    pipe: [
      ['Контекст', 'Почему сейчас, что кандидат хочет изменить и какое направление предпочитает.'],
      ['Понимание', 'Прочитать короткое описание роли и объяснить его своими словами.'],
      ['Применение', 'Ответить на реальную рабочую ситуацию вместо выбора A/B/C.'],
      ['Evidence', 'Конкретные примеры, заданные вопросы, действия и извлечённые уроки.'],
      ['Решение человеком', 'Авторизованный reviewer решает, нужен ли дополнительный evidence, практика в Academy или supervised test.'],
    ],
    intakeKicker: 'ШАГ 1 · ДАННЫЕ', intakeTitle: 'Выберите направление', intakeBody: 'Для этого пилота резюме не требуется. Нужны только контактные данные, достаточные для того, чтобы вернуть следующий шаг после проверки человеком.',
    fullName: 'Имя и фамилия', namePlaceholder: 'Ваше имя', email: 'Email', telegram: 'Telegram username', optional: '(необязательно)', country: 'Страна / текущий рынок', language: 'Язык интервью', source: 'Как вы узнали о Hermes?', select: 'Выберите',
    direction: 'Какое направление интересует вас больше всего?',
    tracks: [
      ['Логистика · Привлечение перевозчиков', 'Общайтесь с перевозчиками в США, выявляйте потребности, выстраивайте доверие и двигайте квалифицированные возможности дальше.'],
      ['Продажи в США · Цифровые услуги', 'Продавайте сайты, SEO/GEO и маркетинг в социальных сетях бизнесам в США.'],
      ['Маркетинг · Обучение', 'Изучайте исследования, позиционирование, контент-мышление и маркетинг, ориентированный на клиента.'],
    ],
    consent: 'Я согласен(на), чтобы Hermes сохранял мои контактные данные и ответы интервью, относящиеся к работе, для этого пилота. Я понимаю, что ответы помогают проверке человеком и не являются автоматическим решением о найме.',
    begin: 'Начать структурированное интервью →',
    persistence: 'Hermes попытается сохранить данные на приватном сервере HR, когда endpoint доступен; браузер хранит локальную recovery-копию, чтобы сбой сети не удалил интервью.',
    whyKicker: 'ПОЧЕМУ ТАКОЙ ФОРМАТ', whyTitle: 'Мы оцениваем evidence, а не отполированное резюме',
    evidenceRows: [
      ['Понять', 'Можете объяснить прочитанное, не копируя текст?'],
      ['Осознать', 'Можете связать идею с бизнес-проблемой за ней?'],
      ['Применить', 'Можете превратить идею в вопрос, действие или следующий шаг?'],
      ['Доказать', 'Можете привести конкретный пример вместо общего утверждения?'],
    ],
    fairnessLabel: 'Граница справедливости:', fairness: 'возраст, пол, этническая принадлежность, религия, инвалидность, семейное положение и другие защищённые или чувствительные характеристики не запрашиваются этим пилотом и не должны использоваться для оценки готовности.',
    answerPlaceholder: 'Отвечайте своими словами. Конкретные примеры полезнее идеальных формулировок.', reset: 'Очистить этот браузер и начать заново', continue: 'Сохранить ответ и продолжить →',
    clearNote: 'Очистка браузера удаляет только локальную recovery-копию. Если интервью уже синхронизировано с приватным Hermes HR, эта кнопка не удаляет запись на сервере.',
    completeKicker: 'ИНТЕРВЬЮ ЗАВЕРШЕНО · НУЖНА ПРОВЕРКА', summaryTitle: 'Сводка вашего evidence', summaryBody: 'Эта сводка помогает авторизованному reviewer определить следующий шаг. Это не решение о найме.', humanGate: 'Решение человеком',
    routeStatus: 'Предлагаемый путь развития', identityStatus: 'Непрерывность идентичности', identityTitle: 'Один человек — одна запись обучения',
    export: 'Экспортировать очищенную сводку', claim: 'Связать с моим аккаунтом Hermes', restart: 'Очистить браузер и начать другое интервью',
    nextStep: 'Ваш следующий существенный шаг остаётся за авторизованным reviewer. Если подходит практика в Academy или supervised test, маршрут фиксируется через приватный reviewer workflow, а не выдаётся здесь как самостоятельное одобрение.',
    reviewerLabel: 'Правило reviewer:', reviewer: 'Hermes может использовать показанные здесь ответы и evidence, относящиеся к работе, для поддержки проверки человеком. Пилот не должен автоматически нанимать, отклонять или ранжировать кандидатов по защищённым характеристикам, стране, языку или источнику привлечения.',
    footer: 'Hermes Connect HR Pilot V1 · Приватное D1-хранение при доступности · Следующие шаги после проверки человеком', privacy: 'Конфиденциальность', saved: 'Сохранено.',
  },
  uk: {
    brand: 'HR · Інтерв’ю кандидата', badge: 'Пілот V1', eyebrow: 'Кандидат → Evidence → Перевірка людиною → Наступний крок',
    heroTitle: 'Покажіть, як ви думаєте, навчаєтесь і застосовуєте знання.',
    heroBody: 'Цей пілот замінює довгу анкету структурованою розмовою. Він збирає evidence, пов’язаний із роботою, показує кандидату зрозумілий процес і залишає будь-яке суттєве рішення щодо роботи чи навчання за авторизованою людиною.',
    start: 'Почати інтерв’ю', how: 'Як це працює', phaseTarget: 'ЦІЛЬ ФАЗИ 1', funnelTitle: 'Одна глобальна воронка, три стартові напрями.',
    logistics: 'Логістика', carrier: 'Залучення перевізників', sales: 'Продажі у США', salesDesc: 'Сайти · SEO/GEO · SMM', marketing: 'Маркетинг', marketingDesc: 'Навчання та мислення про клієнта',
    contextNote: 'Країна, мова та джерело використовуються лише для локалізації й аналітики воронки. Вони не беруть участі в оцінці готовності.',
    modelKicker: 'МОДЕЛЬ РОБОТИ', modelTitle: 'Інтерв’ю стає першим навчальним досвідом', modelBody: 'Система ставить запитання, слухає, просить evidence й адаптується. Вона не наймає і не відхиляє кандидата автоматично.',
    pipe: [
      ['Контекст', 'Чому зараз, що кандидат хоче змінити та якому напряму надає перевагу.'],
      ['Розуміння', 'Прочитати короткий опис ролі та пояснити його своїми словами.'],
      ['Застосування', 'Відповісти на реальну робочу ситуацію замість вибору A/B/C.'],
      ['Evidence', 'Конкретні приклади, поставлені запитання, дії та отримані уроки.'],
      ['Рішення людиною', 'Авторизований reviewer вирішує, чи потрібен додатковий evidence, практика в Academy або supervised test.'],
    ],
    intakeKicker: 'КРОК 1 · ДАНІ', intakeTitle: 'Оберіть напрям', intakeBody: 'Для цього пілота резюме не потрібне. Потрібні лише контактні дані, достатні для повернення наступного кроку після перевірки людиною.',
    fullName: 'Ім’я та прізвище', namePlaceholder: 'Ваше ім’я', email: 'Email', telegram: 'Telegram username', optional: '(необов’язково)', country: 'Країна / поточний ринок', language: 'Мова інтерв’ю', source: 'Як ви дізналися про Hermes?', select: 'Оберіть',
    direction: 'Який напрям цікавить вас найбільше?',
    tracks: [
      ['Логістика · Залучення перевізників', 'Спілкуйтеся з перевізниками у США, виявляйте потреби, будуйте довіру та просувайте кваліфіковані можливості далі.'],
      ['Продажі у США · Цифрові послуги', 'Продавайте сайти, SEO/GEO та маркетинг у соціальних мережах бізнесам у США.'],
      ['Маркетинг · Навчання', 'Вивчайте дослідження, позиціонування, контент-мислення та маркетинг, орієнтований на клієнта.'],
    ],
    consent: 'Я погоджуюсь, щоб Hermes зберігав мої контактні дані та відповіді інтерв’ю, пов’язані з роботою, для цього пілота. Я розумію, що відповіді допомагають перевірці людиною і не є автоматичним рішенням про найм.',
    begin: 'Почати структуроване інтерв’ю →',
    persistence: 'Hermes спробує зберегти дані на приватному сервері HR, коли endpoint доступний; браузер зберігає локальну recovery-копію, щоб збій мережі не видалив інтерв’ю.',
    whyKicker: 'ЧОМУ ТАКИЙ ФОРМАТ', whyTitle: 'Ми оцінюємо evidence, а не відполіроване резюме',
    evidenceRows: [
      ['Зрозуміти', 'Можете пояснити прочитане, не копіюючи текст?'],
      ['Усвідомити', 'Можете пов’язати ідею з бізнес-проблемою за нею?'],
      ['Застосувати', 'Можете перетворити ідею на запитання, дію або наступний крок?'],
      ['Довести', 'Можете навести конкретний приклад замість загального твердження?'],
    ],
    fairnessLabel: 'Межа справедливості:', fairness: 'вік, стать, етнічна належність, релігія, інвалідність, сімейний стан та інші захищені або чутливі характеристики не запитуються цим пілотом і не повинні використовуватися для оцінки готовності.',
    answerPlaceholder: 'Відповідайте своїми словами. Конкретні приклади корисніші за ідеальні формулювання.', reset: 'Очистити цей браузер і почати заново', continue: 'Зберегти відповідь і продовжити →',
    clearNote: 'Очищення браузера видаляє лише локальну recovery-копію. Якщо інтерв’ю вже синхронізовано з приватним Hermes HR, ця кнопка не видаляє запис на сервері.',
    completeKicker: 'ІНТЕРВ’Ю ЗАВЕРШЕНО · ПОТРІБНА ПЕРЕВІРКА', summaryTitle: 'Зведення вашого evidence', summaryBody: 'Це зведення допомагає авторизованому reviewer визначити наступний крок. Це не рішення про найм.', humanGate: 'Рішення людиною',
    routeStatus: 'Запропонований шлях розвитку', identityStatus: 'Безперервність ідентичності', identityTitle: 'Одна людина — один запис навчання',
    export: 'Експортувати очищене зведення', claim: 'Пов’язати з моїм акаунтом Hermes', restart: 'Очистити браузер і почати інше інтерв’ю',
    nextStep: 'Ваш наступний суттєвий крок залишається за авторизованим reviewer. Якщо підходить практика в Academy або supervised test, маршрут фіксується через приватний reviewer workflow, а не видається тут як самостійне схвалення.',
    reviewerLabel: 'Правило reviewer:', reviewer: 'Hermes може використовувати показані тут відповіді та evidence, пов’язані з роботою, для підтримки перевірки людиною. Пілот не повинен автоматично наймати, відхиляти або ранжувати кандидатів за захищеними характеристиками, країною, мовою чи джерелом залучення.',
    footer: 'Hermes Connect HR Pilot V1 · Приватне D1-зберігання за доступності · Наступні кроки після перевірки людиною', privacy: 'Конфіденційність', saved: 'Збережено.',
  },
};

const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];

function setText(selector, value, root = document) {
  const node = one(selector, root);
  if (node && value != null) node.textContent = value;
}
function setLeadingText(controlName, value) {
  const control = document.querySelector(`[name="${controlName}"]`);
  const label = control?.closest('label');
  if (!label) return;
  const textNode = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.nodeValue = `${value}\n            `;
}
function setCallout(selector, label, body) {
  const node = one(selector);
  if (!node) return;
  const strong = node.querySelector('b');
  if (strong) strong.textContent = label;
  const textNode = [...node.childNodes].find((item) => item.nodeType === Node.TEXT_NODE && item.nodeValue?.trim());
  if (textNode) textNode.nodeValue = ` ${body}`;
}
function storedLanguage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return String(parsed?.context?.language || '').toLowerCase();
  } catch { return ''; }
}
function currentLanguage() {
  const query = String(new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  if (SUPPORTED.has(query)) return query;
  const saved = storedLanguage();
  if (SUPPORTED.has(saved)) return saved;
  const selected = String(document.querySelector('[name="language"]')?.value || 'en').toLowerCase();
  return SUPPORTED.has(selected) ? selected : 'en';
}

function applyLanguage(language, { syncUrl = false } = {}) {
  const locale = SUPPORTED.has(language) ? language : 'en';
  const t = COPY[locale] || COPY.en;
  document.documentElement.lang = locale;
  document.body.dataset.hrLocale = locale;

  const selector = document.querySelector('[name="language"]');
  if (selector && selector.value !== locale) selector.value = locale;
  if (syncUrl) {
    const url = new URL(location.href);
    if (locale === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', locale);
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }

  setText('.brand small', t.brand); setText('.badge', t.badge); setText('.hr-hero .eyebrow', t.eyebrow);
  setText('.hr-hero h1', t.heroTitle); setText('.hr-hero .hero-copy > p', t.heroBody);
  setText('.hero-links a[href="#intake"]', t.start); setText('.hero-links a[href="#model"]', t.how);
  setText('.hero-card > small', t.phaseTarget); setText('.hero-card > h2', t.funnelTitle);
  const minis = all('.hr-track-mini');
  [[t.logistics,t.carrier],[t.sales,t.salesDesc],[t.marketing,t.marketingDesc]].forEach(([title, body], index) => {
    setText('b', title, minis[index]); setText('span', body, minis[index]);
  });
  setText('.hero-card .hr-muted', t.contextNote);

  setText('#model .panel-head small', t.modelKicker); setText('#model .panel-head h3', t.modelTitle); setText('#model .panel-head p', t.modelBody);
  all('#model .pipe-step').forEach((node, index) => {
    setText('b', t.pipe[index]?.[0], node); setText('small', t.pipe[index]?.[1], node);
  });

  const intake = one('[data-intake-panel]');
  setText('.panel-head small', t.intakeKicker, intake); setText('.panel-head h3', t.intakeTitle, intake); setText('.panel-head p', t.intakeBody, intake);
  setLeadingText('name', t.fullName); setLeadingText('email', t.email); setLeadingText('telegram_handle', t.telegram); setLeadingText('country', t.country); setLeadingText('language', t.language); setLeadingText('source', t.source);
  const nameInput = one('[name="name"]'); if (nameInput) nameInput.placeholder = t.namePlaceholder;
  const telegramLabelSmall = one('[name="telegram_handle"]')?.closest('label')?.querySelector('small'); if (telegramLabelSmall) telegramLabelSmall.textContent = t.optional;
  ['country','source'].forEach((name) => { const option = one(`[name="${name}"] option[value=""]`); if (option) option.textContent = t.select; });
  setText('[data-intake-panel] legend', t.direction);
  all('[data-intake-panel] .track-choice').forEach((node, index) => {
    setText('b', t.tracks[index]?.[0], node); setText('small', t.tracks[index]?.[1], node);
  });
  setText('[data-intake-panel] .consent-row span', t.consent); setText('[data-intake-panel] button[type="submit"]', t.begin);
  setText('[data-intake-panel] [data-server-sync-status]', t.persistence);

  const side = one('.hr-side-panel'); setText('.panel-head small', t.whyKicker, side); setText('.panel-head h3', t.whyTitle, side);
  all('.hr-side-panel .row').forEach((node, index) => { setText('b', t.evidenceRows[index]?.[0], node); setText('small', t.evidenceRows[index]?.[1], node); });
  setCallout('.hr-side-panel .hr-safe', t.fairnessLabel, t.fairness);

  const answer = one('[data-answer]'); if (answer) answer.placeholder = t.answerPlaceholder;
  setText('[data-interview-panel] [data-reset]', t.reset); setText('[data-interview-panel] [data-answer-form] button[type="submit"]', t.continue);
  const interviewNotes = all('[data-interview-panel] .hr-muted'); if (interviewNotes.length) interviewNotes[interviewNotes.length - 1].textContent = t.clearNote;

  const result = one('[data-result-panel]');
  setText('.panel-head small', t.completeKicker, result); setText('.panel-head h3', t.summaryTitle, result); setText('.panel-head p', t.summaryBody, result); setText('.stage.warn', t.humanGate, result);
  const cards = all('.card', result); if (cards[0]) setText('.status', t.routeStatus, cards[0]); if (cards[1]) { setText('.status', t.identityStatus, cards[1]); setText('h4', t.identityTitle, cards[1]); }
  setText('[data-export]', t.export); setText('[data-claim-hr]', t.claim); setText('[data-restart]', t.restart);
  const resultMuted = all(':scope > .hr-muted', result); if (resultMuted[0]) resultMuted[0].textContent = t.nextStep;
  setCallout('[data-result-panel] .hr-safe', t.reviewerLabel, t.reviewer);
  setText('.footer > span:first-child', t.footer); setText('.footer a[href*="/privacy/"]', t.privacy); setText('[data-toast]', t.saved);

  document.dispatchEvent(new CustomEvent('hermes:hr-locale-change', { detail: { language: locale } }));
}

const initial = currentLanguage();
applyLanguage(initial);
document.querySelector('[name="language"]')?.addEventListener('change', (event) => {
  applyLanguage(String(event.target?.value || 'en').toLowerCase(), { syncUrl: true });
});
