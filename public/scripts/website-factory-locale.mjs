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
    content: "Мова контенту: українська",
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

  if (locale === "ru" || locale === "uk") context.querySelector("[data-hc-english-only]")?.remove();
}

const ru = new Map(Object.entries({
  "Hermes Connect · Technology": "Hermes Connect · Технологии",
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
  "Could not save draft": "Не удалось сохранить черновик",
  "Use a public HTTPS URL without embedded credentials.": "Используйте публичный HTTPS URL без встроенных учетных данных.",
  "Brief is not ready": "Бриф еще не готов",
  "Website Factory unavailable": "Website Factory недоступен",
  "Needs these answers first": "Сначала нужны эти ответы",
  "Ready to create brief": "Готово к созданию брифа",
  "Required decision inputs are present.": "Все обязательные данные для решения заполнены.",
  "Website brief created": "Бриф сайта создан",
  "Brief already created": "Бриф уже создан",
  "Ready to create website brief.": "Готово к созданию брифа сайта.",
  "This creates the handoff record only.": "Это создаст только запись передачи брифа.",
  "Add a source or choose starting from zero": "Добавьте источник или выберите «начинаю с нуля»",
  "Choose a primary goal": "Выберите главную цель",
  "Add a meaningful owner brief": "Добавьте содержательный бриф владельца",
  "Resolve critical conflicting facts": "Разрешите критические противоречия в данных",
  "Not named": "Название не указано",
  "Category not set": "Категория не указана",
  "Market & goal": "Рынок и цель",
  "Primary goal missing": "Главная цель не указана",
  "Geography not set": "География не указана",
  "Brief missing": "Бриф не заполнен",
  "No pages selected": "Страницы не выбраны",
  "None selected": "Ничего не выбрано",
  "No brand direction supplied": "Направление бренда не задано",
  "website": "сайт",
  "No automated build started.": "Автоматическая сборка сайта не запускалась.",
}));

const uk = new Map(Object.entries({
  "Hermes Connect · Technology": "Hermes Connect · Технології",
  "Build the brief before the website.": "Спочатку складіть бриф — потім створюйте сайт.",
  "Give Hermes the business truth, the outcome you want and three useful references. The result is a saved, reviewable website brief — not a fake promise that a production build has already started.": "Передайте Hermes підтверджені дані про бізнес, бажаний результат і три корисні референси. На виході ви отримаєте збережений бриф для перевірки — без хибної обіцянки, що production-збірку вже запущено.",
  "Private · noindex": "Приватно · noindex",
  "Checking your Hermes account…": "Перевіряємо ваш акаунт Hermes…",
  "Website Factory uses the same Hermes identity and session as the rest of Hermes Connect.": "Website Factory використовує той самий акаунт і ту саму сесію Hermes, що й решта Hermes Connect.",
  "One Hermes identity": "Один акаунт Hermes",
  "Sign in or create your Hermes account.": "Увійдіть або створіть акаунт Hermes.",
  "No separate Website Factory password store is created. This form uses the shared Hermes account endpoints; drafts are owner-scoped to that authenticated identity.": "Website Factory не створює окреме сховище паролів. Форма використовує спільні endpoints акаунта Hermes, а чернетки прив’язані до автентифікованого власника.",
  "Authentication mode": "Режим автентифікації",
  "Sign in": "Увійти",
  "Create account": "Створити акаунт",
  "Email": "Email",
  "Password": "Пароль",
  "Full name": "Ім’я та прізвище",
  "Country and city": "Країна та місто",
  "Create Hermes account": "Створити акаунт Hermes",
  "Hermes account and workspaces": "Акаунт Hermes і робочі простори",
  "Draft sync": "Синхронізація",
  "Saved": "Збережено",
  "Saving…": "Зберігаємо…",
  "Save failed": "Помилка збереження",
  "Unsaved changes": "Є незбережені зміни",
  "Brief created": "Бриф створено",
  "Log out": "Вийти",
  "Your website briefs": "Ваші брифи сайтів",
  "Resume or start a new website.": "Продовжте наявний бриф або почніть новий.",
  "Drafts autosave to your Hermes account. Submitted briefs stay immutable as a handoff snapshot.": "Чернетки автоматично зберігаються в акаунті Hermes. Після надсилання бриф фіксується як незмінний snapshot для передачі в роботу.",
  "Start new website": "Почати новий сайт",
  "Website brief progress": "Прогрес брифа сайту",
  "Brief steps": "Кроки брифа",
  "All drafts": "Усі чернетки",
  "Website brief": "Бриф сайту",
  "Draft title": "Назва чернетки",
  "My new website": "Мій новий сайт",
  "Sources": "Джерела",
  "Business truth": "Дані про бізнес",
  "Outcome": "Результат",
  "Owner brief": "Бриф власника",
  "References": "Референси",
  "Pages & capabilities": "Сторінки та функції",
  "Brand": "Бренд",
  "Review": "Перевірка",
  "Handoff": "Передача",
  "01 · Sources": "01 · Джерела",
  "Where does your business already exist?": "Де ваш бізнес уже представлений?",
  "Add public URLs only. Hermes never asks for social-media passwords here. B1 saves these sources for the brief; automated source reading is not yet connected, so imported facts remain owner-entered for now.": "Додавайте лише публічні URL. Hermes ніколи не просить тут паролі від соцмереж. B1 зберігає ці джерела в брифі; автоматичне читання джерел поки не підключено, тому факти наразі підтверджує власник.",
  "Public business URL": "Публічний URL бізнесу",
  "Add source": "Додати джерело",
  "I’m starting from zero": "Я починаю з нуля",
  "Continue without an existing website or public profile.": "Продовжити без наявного сайту чи публічного профілю.",
  "02 · Business truth": "02 · Дані про бізнес",
  "Confirm the facts the website should use.": "Підтвердьте дані, які має використовувати сайт.",
  "Until automated extraction is connected, these are owner-confirmed facts. Nothing is silently inferred from a public profile.": "Доки автоматичне вилучення даних не підключено, ці факти підтверджує власник. Система нічого мовчки не домислює з публічного профілю.",
  "Business name": "Назва бізнесу",
  "Category": "Категорія",
  "Short description": "Короткий опис",
  "Phone": "Телефон",
  "Public email": "Публічний email",
  "Address or service area": "Адреса або зона обслуговування",
  "Services / products": "Послуги / продукти",
  "One per line": "По одному в рядок",
  "03 · Outcome": "03 · Результат",
  "What should the website do for the business?": "Що сайт має робити для бізнесу?",
  "Primary goal": "Головна мета",
  "Choose primary goal": "Оберіть головну мету",
  "Get calls": "Отримувати дзвінки",
  "Collect leads": "Збирати ліди",
  "Bookings / appointments": "Записи / бронювання",
  "Sell services": "Продавати послуги",
  "Show portfolio / work": "Показувати портфоліо / роботи",
  "Explain a complex offer": "Пояснювати складну пропозицію",
  "Recruit people": "Наймати людей",
  "Support local SEO": "Підтримувати локальне SEO",
  "Establish credibility": "Підвищувати довіру",
  "Other": "Інше",
  "Primary visitor action": "Головна дія відвідувача",
  "Call, request quote, book…": "Зателефонувати, запитати ціну, записатися…",
  "Target customer": "Цільовий клієнт",
  "Geography / market": "Географія / ринок",
  "Languages": "Мови",
  "English, Russian…": "Англійська, російська…",
  "04 · Owner brief": "04 · Бриф власника",
  "Explain what you want naturally.": "Опишіть своїми словами, чого ви хочете.",
  "Write what should change, what matters most, what you dislike and any constraints. Your original text is preserved as owner input.": "Напишіть, що потрібно змінити, що найважливіше, що вам не подобається і які є обмеження. Початковий текст зберігається як ввід власника.",
  "Typed brief": "Текстовий бриф",
  "Tell Hermes what you want the new site to achieve, emphasize, remove or feel like…": "Розкажіть Hermes, якого результату має досягти новий сайт, що підкреслити, прибрати і яке враження він має створювати…",
  "Voice brief boundary": "Межа голосового брифа",
  "Secure audio storage/transcription is not connected in B1, so this version does not pretend to save voice recordings. The typed brief is fully production-persisted; voice will be enabled only with an observable storage/transcription path.": "У B1 поки не підключено безпечне зберігання та транскрибацію аудіо, тому ця версія не вдає, що зберігає голосові записи. Текстовий бриф надійно зберігається; голос буде ввімкнено лише після появи перевірюваного шляху зберігання та транскрибації.",
  "Brand tone": "Тон бренду",
  "Premium, calm, direct…": "Преміальний, спокійний, прямий…",
  "Constraints": "Обмеження",
  "One per line or comma separated": "По одному в рядок або через кому",
  "05 · References": "05 · Референси",
  "Three references, three different jobs.": "Три референси — три різні завдання.",
  "These teach principles. Hermes is not instructed to clone competitor text, layout or assets.": "Вони задають принципи. Hermes не отримує завдання копіювати тексти, макети чи матеріали конкурентів.",
  "Visual direction": "Візуальний напрям",
  "Which site has the visual feeling you want?": "Який сайт передає потрібне вам візуальне відчуття?",
  "What do you like?": "Що вам подобається?",
  "Functionality": "Функціональність",
  "Which site works the way you want yours to work?": "Який сайт працює так, як має працювати ваш?",
  "What works well?": "Що працює добре?",
  "Structure / content": "Структура / контент",
  "Which site explains or organizes the business well?": "Який сайт добре пояснює чи структурує бізнес?",
  "What is organized well?": "Що добре організовано?",
  "06 · Pages & capabilities": "06 · Сторінки та функції",
  "Choose the first build brief scope.": "Оберіть обсяг першого брифа на створення сайту.",
  "Pages": "Сторінки",
  "Capabilities": "Функції",
  "Home": "Головна",
  "Services": "Послуги",
  "About / Trust": "Про компанію / довіра",
  "Work / Portfolio": "Роботи / портфоліо",
  "FAQ": "FAQ",
  "Contact": "Контакти",
  "Lead form": "Форма ліда",
  "Click to call": "Дзвінок в один клік",
  "Booking": "Запис",
  "Maps / directions": "Мапа / маршрут",
  "Reviews / proof": "Відгуки / докази",
  "Gallery": "Галерея",
  "Multilingual": "Кілька мов",
  "Analytics": "Аналітика",
  "CRM handoff": "Передача в CRM",
  "AI assistant": "ШІ-асистент",
  "07 · Brand": "07 · Бренд",
  "Use what already exists — or describe the direction.": "Використайте те, що вже є, або опишіть напрям.",
  "Existing public logo URL": "Публічний URL наявного логотипа",
  "Optional HTTPS URL": "Необов’язковий HTTPS URL",
  "Known colors": "Відомі кольори",
  "Brand notes": "Нотатки про бренд",
  "File upload boundary": "Межа завантаження файлів",
  "B1 does not invent an upload backend. Logo/photo uploads stay deferred until secure object storage, retention and delete behavior are connected. A public logo URL and brand notes are saved now.": "B1 не вдає неіснуючий upload-backend. Завантаження логотипів і фото відкладено до підключення безпечного object storage, правил зберігання та видалення. Наразі зберігаються публічний URL логотипа та нотатки про бренд.",
  "08 · Review": "08 · Перевірка",
  "Review what Hermes understands.": "Перевірте, як Hermes зрозумів завдання.",
  "09 · Handoff": "09 · Передача",
  "Create the website brief.": "Створіть бриф сайту.",
  "Ready when the required inputs are complete.": "Буде готово після заповнення обов’язкових даних.",
  "Your brief ID and submitted time will appear here.": "Тут з’являться ID брифа та час надсилання.",
  "Create website brief": "Створити бриф сайту",
  "Previous": "Назад",
  "Save & continue": "Зберегти й продовжити",
  "No website briefs yet.": "Брифів сайтів поки немає.",
  "Start with one public source — or choose starting from zero.": "Почніть з одного публічного джерела або оберіть варіант «починаю з нуля».",
  "View brief": "Відкрити бриф",
  "Resume": "Продовжити",
  "New website brief": "Новий бриф сайту",
  "Authentication failed": "Помилка автентифікації",
  "Could not load Website Factory drafts": "Не вдалося завантажити чернетки Website Factory",
  "Could not create draft": "Не вдалося створити чернетку",
  "Could not delete draft": "Не вдалося видалити чернетку",
  "Could not save draft": "Не вдалося зберегти чернетку",
  "Use a public HTTPS URL without embedded credentials.": "Використовуйте публічний HTTPS URL без вбудованих облікових даних.",
  "Brief is not ready": "Бриф ще не готовий",
  "Website Factory unavailable": "Website Factory недоступний",
  "Needs these answers first": "Спочатку потрібні ці відповіді",
  "Ready to create brief": "Готово до створення брифа",
  "Required decision inputs are present.": "Усі обов’язкові дані для рішення заповнено.",
  "Website brief created": "Бриф сайту створено",
  "Brief already created": "Бриф уже створено",
  "Ready to create website brief.": "Готово до створення брифа сайту.",
  "This creates the handoff record only.": "Це створить лише запис передачі брифа.",
  "Add a source or choose starting from zero": "Додайте джерело або оберіть «починаю з нуля»",
  "Choose a primary goal": "Оберіть головну мету",
  "Add a meaningful owner brief": "Додайте змістовний бриф власника",
  "Resolve critical conflicting facts": "Усуньте критичні суперечності в даних",
  "Not named": "Назву не вказано",
  "Category not set": "Категорію не вказано",
  "Market & goal": "Ринок і мета",
  "Primary goal missing": "Головну мету не вказано",
  "Geography not set": "Географію не вказано",
  "Brief missing": "Бриф не заповнено",
  "No pages selected": "Сторінки не вибрано",
  "None selected": "Нічого не вибрано",
  "No brand direction supplied": "Напрям бренду не задано",
  "website": "сайт",
  "No automated build started.": "Автоматичну збірку сайту не запускали.",
}));

const patternsRu = [
  [/\bStep (\d+) of 9\b/g, "Шаг $1 из 9"],
  [/\bStep (\d+)\b/g, "Шаг $1"],
  [/\b(\d+) services\b/g, "$1 услуг"],
  [/\b(\d+) of 3 roles supplied\b/g, "$1 из 3 референсов заполнено"],
  [/\bAdd the visual reference\b/g, "Добавьте визуальный референс"],
  [/\bAdd the functionality reference\b/g, "Добавьте референс функциональности"],
  [/\bAdd the structure reference\b/g, "Добавьте референс структуры"],
  [/\bBrief needs (\d+) item\.?/g, "Для брифа нужен еще $1 пункт."],
  [/\bBrief needs (\d+) items\.?/g, "Для брифа нужно еще $1 пунктов."],
  [/No automated build started\./g, "Автоматическая сборка сайта не запускалась."],
  [/\bdraft · Шаг/g, "черновик · Шаг"],
  [/\bsubmitted · Шаг/g, "отправлен · Шаг"],
  [/^Delete (.+)\?$/g, "Удалить $1?"],
];

const patternsUk = [
  [/\bStep (\d+) of 9\b/g, "Крок $1 з 9"],
  [/\bStep (\d+)\b/g, "Крок $1"],
  [/\b(\d+) services\b/g, "$1 послуг"],
  [/\b(\d+) of 3 roles supplied\b/g, "$1 з 3 референсів заповнено"],
  [/\bAdd the visual reference\b/g, "Додайте візуальний референс"],
  [/\bAdd the functionality reference\b/g, "Додайте референс функціональності"],
  [/\bAdd the structure reference\b/g, "Додайте референс структури"],
  [/\bBrief needs (\d+) item\.?/g, "Для брифа потрібен ще $1 пункт."],
  [/\bBrief needs (\d+) items\.?/g, "Для брифа потрібно ще $1 пунктів."],
  [/No automated build started\./g, "Автоматичну збірку сайту не запускали."],
  [/\bdraft · Крок/g, "чернетка · Крок"],
  [/\bsubmitted · Крок/g, "надіслано · Крок"],
  [/^Delete (.+)\?$/g, "Видалити $1?"],
];

const dictionary = locale === "ru" ? ru : locale === "uk" ? uk : null;
const patterns = locale === "uk" ? patternsUk : patternsRu;

function translateString(value) {
  if (!value || !dictionary) return value;
  const trimmed = value.trim();
  if (dictionary.has(trimmed)) {
    const replacement = dictionary.get(trimmed);
    return trimmed === value ? replacement : value.replace(trimmed, replacement);
  }

  let output = value;
  for (const [english, translated] of dictionary.entries()) {
    if (output.includes(english)) output = output.split(english).join(translated);
  }
  for (const [pattern, replacement] of patterns) output = output.replace(pattern, replacement);
  return output;
}

function translateElement(element) {
  if (!(element instanceof Element) || !dictionary) return;
  for (const attribute of ["placeholder", "aria-label", "title"]) {
    const current = element.getAttribute(attribute);
    if (current) element.setAttribute(attribute, translateString(current));
  }
}

function translateTree(root) {
  if (!dictionary) return;
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

const handoffCopyByLocale = {
  ru: ["Передача фиксирует эту версию как snapshot для проверки. Она ", "не", " утверждает, что production-процесс создания сайта уже запущен."],
  uk: ["Передача фіксує цю версію як snapshot для перевірки. Вона ", "не", " стверджує, що production-процес створення сайту вже запущено."],
};
const removeLabel = { ru: "Удалить", uk: "Видалити" };

function normalizeLocalizedRuntime() {
  if (!dictionary) return;

  const handoff = handoffCopyByLocale[locale];
  const handoffText = handoff.join("");
  const handoffCopy = document.querySelector('[data-step="9"] > p:not(.factory-kicker)');
  if (handoffCopy && handoffCopy.textContent?.replace(/\s+/g, " ").trim() !== handoffText) {
    const emphasis = document.createElement("strong");
    emphasis.textContent = handoff[1];
    handoffCopy.replaceChildren(
      document.createTextNode(handoff[0]),
      emphasis,
      document.createTextNode(handoff[2]),
    );
  }

  document.querySelectorAll("[data-draft-list] .draft-card span").forEach((node) => {
    const translated = translateString(node.textContent || "");
    if (translated !== node.textContent) node.textContent = translated;
  });
  document.querySelectorAll("[data-draft-list] button[aria-label^='Delete ']").forEach((node) => {
    node.setAttribute("aria-label", `${removeLabel[locale]} ${node.getAttribute("aria-label").slice(7)}`);
  });
  document.querySelectorAll("[data-source-list] button[aria-label^='Remove ']").forEach((node) => {
    node.setAttribute("aria-label", `${removeLabel[locale]} ${node.getAttribute("aria-label").slice(7)}`);
  });

  const back = document.querySelector(".factory-back");
  if (back instanceof HTMLAnchorElement) {
    const url = new URL(back.href, window.location.origin);
    if (url.searchParams.get("lang") !== locale) {
      url.searchParams.set("lang", locale);
      back.href = `${url.pathname}${url.search}${url.hash}`;
    }
  }
}

applyPrivateFactoryContext();
translateTree(document.querySelector(".factory-page") || document);
normalizeLocalizedRuntime();

if (dictionary) {
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = (message) => nativeConfirm(translateString(String(message)));

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
    normalizeLocalizedRuntime();
  });

  observer.observe(document.querySelector(".factory-page") || document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
