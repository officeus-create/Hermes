const params = new URLSearchParams(window.location.search);
const requested = params.get("lang") || "en";
const locale = ["en", "ru", "uk", "es", "it", "fr"].includes(requested) ? requested : "en";

const privateContext = {
  en: {
    status: "PRIVATE WEBSITE FACTORY WORKFLOW",
    product: "Private workflow: Website Factory",
    content: "Content language: English",
    nav: "Website Factory",
  },
  ru: {
    status: "ПРИВАТНЫЙ ПРОЦЕСС WEBSITE FACTORY",
    product: "Приватный процесс: Website Factory",
    content: "Язык контента: русский",
    nav: "Website Factory",
  },
  uk: {
    status: "ПРИВАТНИЙ ПРОЦЕС WEBSITE FACTORY",
    product: "Приватний процес: Website Factory",
    content: "Мова контенту: англійська",
    nav: "Website Factory",
  },
  es: {
    status: "FLUJO PRIVADO DE WEBSITE FACTORY",
    product: "Flujo privado: Website Factory",
    content: "Idioma del contenido: inglés",
    nav: "Website Factory",
  },
  it: {
    status: "FLUSSO PRIVATO WEBSITE FACTORY",
    product: "Flusso privato: Website Factory",
    content: "Lingua dei contenuti: inglese",
    nav: "Website Factory",
  },
  fr: {
    status: "FLUX PRIVÉ WEBSITE FACTORY",
    product: "Flux privé : Website Factory",
    content: "Langue du contenu : anglais",
    nav: "Website Factory",
  },
};

function applyPrivateFactoryContext() {
  const context = document.querySelector("[data-hc-product-context]");
  if (!context) return;

  const copy = privateContext[locale] || privateContext.en;
  context.classList.remove("is-reference", "is-live", "is-hub");
  context.classList.add("is-private");

  const summary = context.querySelector(".hc-product-context__summary");
  const status = summary?.querySelector("strong");
  const spans = summary ? [...summary.querySelectorAll(":scope > span")] : [];
  const product = spans.find((node) => !node.classList.contains("hc-product-context__dot") && !node.classList.contains("hc-content-language"));
  const contentLanguage = summary?.querySelector(".hc-content-language");
  if (status) status.textContent = copy.status;
  if (product) product.textContent = copy.product;
  if (contentLanguage) contentLanguage.textContent = copy.content;

  const nav = context.querySelector(".hc-family-nav");
  if (nav && !nav.querySelector("[data-hc-website-factory-link]")) {
    const link = document.createElement("a");
    link.textContent = copy.nav;
    link.href = locale === "en"
      ? "/services/hermes-connect/website-factory/"
      : `/services/hermes-connect/website-factory/?lang=${encodeURIComponent(locale)}`;
    link.setAttribute("aria-current", "page");
    link.setAttribute("data-hc-website-factory-link", "true");
    nav.append(link);
  }

  if (locale === "ru") context.querySelector("[data-hc-english-only]")?.remove();
}

const textMap = new Map(Object.entries({
  "Build the brief before the website.": "Сначала соберите бриф — потом создавайте сайт.",
  "Give Hermes the business truth, the outcome you want and three useful references. The result is a saved, reviewable website brief — not a fake promise that a production build has already started.": "Передайте Hermes подтвержденные данные о бизнесе, желаемый результат и три полезных референса. На выходе вы получите сохраненный бриф для проверки — без ложного обещания, что production-сборка уже запущена.",
  "Private · noindex": "Приватно · noindex",
  "Checking your Hermes account…": "Проверяем ваш аккаунт Hermes…",
  "Website Factory uses the same Hermes identity and session as the rest of Hermes Connect.": "Website Factory использует тот же аккаунт и ту же сессию Hermes, что и остальная система Hermes Connect.",
  "One Hermes identity": "Один аккаунт Hermes",
  "Sign in or create your Hermes account.": "Войдите или создайте аккаунт Hermes.",
  "No separate Website Factory password store is created. This form uses the shared Hermes account endpoints; drafts are owner-scoped to that authenticated identity.": "Website Factory не создает отдельное хранилище паролей. Форма использует общие endpoints аккаунта Hermes, а черновики привязаны к авторизованному владельцу.",
  "Authentication mode": "Режим авторизации",
  "Sign in": "Войти",
  "Create account": "Создать аккаунт",
  "Email": "Email",
  "Password": "Пароль",
  "Full name": "Имя и фамилия",
  "Country and city": "Страна и город",
  "Create Hermes account": "Создать аккаунт Hermes",
  "Hermes account and workspaces": "Аккаунт Hermes и рабочие пространства",
  "Draft sync": "Синхронизация",
  "Saved": "Сохранено",
  "Saving…": "Сохраняем…",
  "Save failed": "Ошибка сохранения",
  "Unsaved changes": "Есть несохраненные изменения",
  "Brief created": "Бриф создан",
  "Log out": "Выйти",
  "Your website briefs": "Ваши брифы сайтов",
  "Resume or start a new website.": "Продолжите существующий бриф или начните новый.",
  "Drafts autosave to your Hermes account. Submitted briefs stay immutable as a handoff snapshot.": "Черновики автоматически сохраняются в аккаунте Hermes. После отправки бриф фиксируется как неизменяемый snapshot для передачи в работу.",
  "Start new website": "Начать новый сайт",
  "Website brief progress": "Прогресс брифа сайта",
  "Brief steps": "Шаги брифа",
  "All drafts": "Все черновики",
  "Website brief": "Бриф сайта",
  "Draft title": "Название черновика",
  "My new website": "Мой новый сайт",
  "Sources": "Источники",
  "Business truth": "Данные о бизнесе",
  "Outcome": "Результат",
  "Owner brief": "Бриф владельца",
  "References": "Референсы",
  "Pages & capabilities": "Страницы и функции",
  "Brand": "Бренд",
  "Review": "Проверка",
  "Handoff": "Передача",
  "01 · Sources": "01 · Источники",
  "Where does your business already exist?": "Где ваш бизнес уже представлен?",
  "Add public URLs only. Hermes never asks for social-media passwords here. B1 saves these sources for the brief; automated source reading is not yet connected, so imported facts remain owner-entered for now.": "Добавляйте только публичные URL. Hermes никогда не просит здесь пароли от соцсетей. B1 сохраняет эти источники в брифе; автоматическое чтение источников пока не подключено, поэтому факты сейчас подтверждает владелец.",
  "Public business URL": "Публичный URL бизнеса",
  "Add source": "Добавить источник",
  "I’m starting from zero": "Я начинаю с нуля",
  "Continue without an existing website or public profile.": "Продолжить без существующего сайта или публичного профиля.",
  "02 · Business truth": "02 · Данные о бизнесе",
  "Confirm the facts the website should use.": "Подтвердите данные, которые должен использовать сайт.",
  "Until automated extraction is connected, these are owner-confirmed facts. Nothing is silently inferred from a public profile.": "Пока автоматическое извлечение данных не подключено, эти факты подтверждает владелец. Система ничего молча не додумывает по публичному профилю.",
  "Business name": "Название бизнеса",
  "Category": "Категория",
  "Short description": "Краткое описание",
  "Phone": "Телефон",
  "Public email": "Публичный email",
  "Address or service area": "Адрес или зона обслуживания",
  "Services / products": "Услуги / продукты",
  "One per line": "По одному на строку",
  "03 · Outcome": "03 · Результат",
  "What should the website do for the business?": "Что сайт должен делать для бизнеса?",
  "Primary goal": "Главная цель",
  "Choose primary goal": "Выберите главную цель",
  "Get calls": "Получать звонки",
  "Collect leads": "Собирать лиды",
  "Bookings / appointments": "Записи / бронирования",
  "Sell services": "Продавать услуги",
  "Show portfolio / work": "Показывать портфолио / работы",
  "Explain a complex offer": "Объяснять сложное предложение",
  "Recruit people": "Набирать людей",
  "Support local SEO": "Поддерживать локальное SEO",
  "Establish credibility": "Повышать доверие",
  "Other": "Другое",
  "Primary visitor action": "Главное действие посетителя",
  "Call, request quote, book…": "Позвонить, запросить цену, записаться…",
  "Target customer": "Целевой клиент",
  "Geography / market": "География / рынок",
  "Languages": "Языки",
  "English, Russian…": "Английский, русский…",
  "04 · Owner brief": "04 · Бриф владельца",
  "Explain what you want naturally.": "Опишите своими словами, чего вы хотите.",
  "Write what should change, what matters most, what you dislike and any constraints. Your original text is preserved as owner input.": "Напишите, что нужно изменить, что важнее всего, что вам не нравится и какие есть ограничения. Исходный текст сохраняется как ввод владельца.",
  "Typed brief": "Текстовый бриф",
  "Tell Hermes what you want the new site to achieve, emphasize, remove or feel like…": "Расскажите Hermes, какого результата должен добиться новый сайт, что подчеркнуть, убрать и какое впечатление он должен создавать…",
  "Voice brief boundary": "Граница голосового брифа",
  "Secure audio storage/transcription is not connected in B1, so this version does not pretend to save voice recordings. The typed brief is fully production-persisted; voice will be enabled only with an observable storage/transcription path.": "В B1 пока не подключены безопасное хранение и транскрибация аудио, поэтому эта версия не делает вид, что сохраняет голосовые записи. Текстовый бриф надежно сохраняется; голос будет включен только после появления проверяемого пути хранения и транскрибации.",
  "Brand tone": "Тон бренда",
  "Premium, calm, direct…": "Премиальный, спокойный, прямой…",
  "Constraints": "Ограничения",
  "One per line or comma separated": "По одному на строку или через запятую",
  "05 · References": "05 · Референсы",
  "Three references, three different jobs.": "Три референса — три разные задачи.",
  "These teach principles. Hermes is not instructed to clone competitor text, layout or assets.": "Они задают принципы. Hermes не получает задачу копировать тексты, макеты или материалы конкурентов.",
  "Visual direction": "Визуальное направление",
  "Which site has the visual feeling you want?": "Какой сайт передает нужное вам визуальное ощущение?",
  "What do you like?": "Что вам нравится?",
  "Functionality": "Функциональность",
  "Which site works the way you want yours to work?": "Какой сайт работает так, как должен работать ваш?",
  "What works well?": "Что работает хорошо?",
  "Structure / content": "Структура / контент",
  "Which site explains or organizes the business well?": "Какой сайт хорошо объясняет или структурирует бизнес?",
  "What is organized well?": "Что хорошо организовано?",
  "06 · Pages & capabilities": "06 · Страницы и функции",
  "Choose the first build brief scope.": "Выберите объем первого брифа на создание сайта.",
  "Pages": "Страницы",
  "Capabilities": "Функции",
  "Home": "Главная",
  "Services": "Услуги",
  "About / Trust": "О компании / доверие",
  "Work / Portfolio": "Работы / портфолио",
  "FAQ": "FAQ",
  "Contact": "Контакты",
  "Lead form": "Форма лида",
  "Click to call": "Звонок в один клик",
  "Booking": "Запись",
  "Maps / directions": "Карта / маршрут",
  "Reviews / proof": "Отзывы / доказательства",
  "Gallery": "Галерея",
  "Multilingual": "Несколько языков",
  "Analytics": "Аналитика",
  "CRM handoff": "Передача в CRM",
  "AI assistant": "ИИ-ассистент",
  "07 · Brand": "07 · Бренд",
  "Use what already exists — or describe the direction.": "Используйте то, что уже есть, или опишите направление.",
  "Existing public logo URL": "Публичный URL существующего логотипа",
  "Optional HTTPS URL": "Необязательный HTTPS URL",
  "Known colors": "Известные цвета",
  "Brand notes": "Заметки о бренде",
  "File upload boundary": "Граница загрузки файлов",
  "B1 does not invent an upload backend. Logo/photo uploads stay deferred until secure object storage, retention and delete behavior are connected. A public logo URL and brand notes are saved now.": "B1 не изображает несуществующий upload-backend. Загрузка логотипов и фото остается отложенной до подключения безопасного object storage, правил хранения и удаления. Сейчас сохраняются публичный URL логотипа и заметки о бренде.",
  "08 · Review": "08 · Проверка",
  "Review what Hermes understands.": "Проверьте, как Hermes понял задачу.",
  "09 · Handoff": "09 · Передача",
  "Create the website brief.": "Создайте бриф сайта.",
  "The handoff freezes this version as a reviewable snapshot. It does not claim a production website worker has started.": "Передача фиксирует эту версию как snapshot для проверки. Она не утверждает, что production-процесс создания сайта уже запущен.",
  "Ready when the required inputs are complete.": "Будет готово после заполнения обязательных данных.",
  "Your brief ID and submitted time will appear here.": "Здесь появятся ID брифа и время отправки.",
  "Create website brief": "Создать бриф сайта",
  "Previous": "Назад",
  "Save & continue": "Сохранить и продолжить",
  "No website briefs yet.": "Брифов сайтов пока нет.",
  "Start with one public source — or choose starting from zero.": "Начните с одного публичного источника или выберите вариант «начинаю с нуля».",
  "View brief": "Открыть бриф",
  "Resume": "Продолжить",
  "New website brief": "Новый бриф сайта",
  "Authentication failed": "Ошибка авторизации",
  "Could not load Website Factory drafts": "Не удалось загрузить черновики Website Factory",
  "Could not create draft": "Не удалось создать черновик",
  "Could not delete draft": "Не удалось удалить черновик",
  "Needs these answers first": "Сначала нужны эти ответы",
  "Ready to create brief": "Готово к созданию брифа",
  "Required decision inputs are present.": "Все обязательные данные для решения заполнены.",
  "Website brief created": "Бриф сайта создан",
  "Brief already created": "Бриф уже создан",
  "Ready to create website brief.": "Готово к созданию брифа сайта.",
  "This creates the handoff record only.": "Это создаст только запись передачи брифа.",
  "Could not save draft": "Не удалось сохранить черновик",
  "Use a public HTTPS URL without embedded credentials.": "Используйте публичный HTTPS URL без встроенных учетных данных.",
  "Brief is not ready": "Бриф еще не готов",
  "Website Factory unavailable": "Website Factory недоступен",
  "Add a source or choose starting from zero": "Добавьте источник или выберите «начинаю с нуля»",
  "Choose a primary goal": "Выберите главную цель",
  "Add a meaningful owner brief": "Добавьте содержательный бриф владельца",
  "Resolve critical conflicting facts": "Разрешите критические противоречия в данных",
  "Not named": "Название не указано",
  "Category not set": "Категория не указана",
  "Primary goal missing": "Главная цель не указана",
  "Geography not set": "География не указана",
  "Brief missing": "Бриф не заполнен",
  "No pages selected": "Страницы не выбраны",
  "None selected": "Ничего не выбрано",
  "No brand direction supplied": "Направление бренда не задано",
}));

const phraseReplacements = [
  [/\bStep (\d+) of 9\b/g, "Шаг $1 из 9"],
  [/\bStep (\d+)\b/g, "Шаг $1"],
  [/\b(\d+) services\b/g, "$1 услуг"],
  [/\b(\d+) of 3 roles supplied\b/g, "$1 из 3 референсов заполнено"],
  [/\bAdd the visual reference\b/g, "Добавьте визуальный референс"],
  [/\bAdd the functionality reference\b/g, "Добавьте референс функциональности"],
  [/\bAdd the structure reference\b/g, "Добавьте референс структуры"],
  [/\bBrief needs (\d+) item\.?\b/g, "Для брифа нужен еще $1 пункт."],
  [/\bBrief needs (\d+) items\.?\b/g, "Для брифа нужно еще $1 пунктов."],
  [/\bNo automated build started\.\b/g, "Автоматическая сборка сайта не запускалась."],
  [/\bdraft · Шаг/g, "черновик · Шаг"],
  [/\bsubmitted · Шаг/g, "отправлен · Шаг"],
];

function translateString(value) {
  if (!value) return value;
  const trimmed = value.trim();
  if (textMap.has(trimmed)) {
    const replacement = textMap.get(trimmed);
    if (trimmed === value) return replacement;
    return value.replace(trimmed, replacement);
  }
  let output = value;
  for (const [english, russian] of textMap.entries()) {
    if (output.includes(english)) output = output.split(english).join(russian);
  }
  for (const [pattern, replacement] of phraseReplacements) output = output.replace(pattern, replacement);
  return output;
}

function translateElement(element) {
  if (!(element instanceof Element)) return;
  for (const attribute of ["placeholder", "aria-label", "title"]) {
    const current = element.getAttribute(attribute);
    if (current) element.setAttribute(attribute, translateString(current));
  }
}

function translateTree(root) {
  if (locale !== "ru") return;
  const scope = root instanceof Element || root instanceof DocumentFragment ? root : document;
  if (scope instanceof Element) translateElement(scope);
  scope.querySelectorAll?.("*").forEach(translateElement);

  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (node.parentElement?.closest("script,style")) continue;
    const translated = translateString(node.nodeValue || "");
    if (translated !== node.nodeValue) node.nodeValue = translated;
  }
}

function normalizeDynamicRussian() {
  if (locale !== "ru") return;

  document.querySelectorAll("[data-draft-list] .draft-card span").forEach((node) => {
    node.textContent = translateString(node.textContent || "");
  });
  document.querySelectorAll("[data-draft-list] button[aria-label^='Delete ']").forEach((node) => {
    node.setAttribute("aria-label", `Удалить ${node.getAttribute("aria-label").slice(7)}`);
  });
  document.querySelectorAll("[data-source-list] button[aria-label^='Remove ']").forEach((node) => {
    node.setAttribute("aria-label", `Удалить ${node.getAttribute("aria-label").slice(7)}`);
  });

  const back = document.querySelector(".factory-back");
  if (back instanceof HTMLAnchorElement) {
    const url = new URL(back.href, window.location.origin);
    url.searchParams.set("lang", "ru");
    back.href = `${url.pathname}${url.search}${url.hash}`;
  }
}

applyPrivateFactoryContext();
translateTree(document.querySelector(".factory-page") || document);
normalizeDynamicRussian();

if (locale === "ru") {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        const translated = translateString(mutation.target.nodeValue || "");
        if (translated !== mutation.target.nodeValue) mutation.target.nodeValue = translated;
        continue;
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const translated = translateString(node.nodeValue || "");
          if (translated !== node.nodeValue) node.nodeValue = translated;
        } else if (node instanceof Element) {
          translateTree(node);
        }
      });
    }
    normalizeDynamicRussian();
  });
  observer.observe(document.querySelector(".factory-page") || document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
