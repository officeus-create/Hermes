(() => {
  const PRIORITY = [
    { key: "hub", href: "/services/hermes-connect/" },
    { key: "repair", href: "/services/hermes-connect/repair-shops/" },
    { key: "loadBoard", href: "/load-board/" },
    { key: "aiCommand", href: "/services/hermes-connect/ai-command-center/" },
    { key: "academy", href: "/services/hermes-connect/academy/" },
  ];

  const LABELS = {
    en: { hub: "Product Hub", repair: "Repair Shops", loadBoard: "Load Board", aiCommand: "AI Command Center", academy: "Academy" },
    ru: { hub: "Центр продуктов", repair: "СТО", loadBoard: "Load Board", aiCommand: "ИИ-командный центр", academy: "Академия" },
    uk: { hub: "Центр продуктів", repair: "СТО", loadBoard: "Load Board", aiCommand: "AI-командний центр", academy: "Академія" },
    es: { hub: "Centro de productos", repair: "Talleres", loadBoard: "Load Board", aiCommand: "Centro de mando de IA", academy: "Academia" },
    it: { hub: "Centro prodotti", repair: "Officine", loadBoard: "Load Board", aiCommand: "Centro di comando AI", academy: "Accademia" },
    fr: { hub: "Centre produits", repair: "Ateliers", loadBoard: "Load Board", aiCommand: "Centre de commande IA", academy: "Académie" },
  };

  const HUB_RU = new Map([
    ["AI operating system for business", "AI-операционная система для бизнеса"],
    ["Run your business", "Управляйте бизнесом"],
    ["with AI.", "с AI."],
    ["One operating system for leads, bookings, customers, operations, and growth. Hermes adapts the workspace around the way your business actually works.", "Одна операционная система для лидов, записей, клиентов, операций и роста. Hermes адаптирует рабочее пространство под реальные процессы вашего бизнеса."],
    ["Open Repair Shops", "Открыть СТО"],
    ["Owner access", "Вход владельца"],
    ["Open Academy", "Открыть Академию"],
    ["Choose your business", "Выбрать направление"],
    ["Repair Shops is live", "СТО уже работает"],
    ["Academy has private learner access", "Academy: приватный доступ к обучению"],
    ["Beauty has a private owner foundation", "Beauty: приватная основа для владельца"],
    ["Unreleased industries remain previews", "Невыпущенные направления остаются превью"],
    ["Hermes Intelligence · signature system object", "Hermes Intelligence · ключевой объект системы"],
    ["Signal arrives", "Поступает сигнал"],
    ["Request captured", "Запрос зафиксирован"],
    ["Hermes coordinates", "Hermes координирует"],
    ["Intent + next step", "Намерение + следующий шаг"],
    ["Work moves forward", "Работа движется дальше"],
    ["Human-review ready", "Готово к проверке человеком"],
    ["WORKSPACE PREVIEW · SAMPLE DATA", "ПРЕВЬЮ РАБОЧЕГО ПРОСТРАНСТВА · ПРИМЕР ДАННЫХ"],
    ["Home", "Главная"],
    ["Inbox", "Входящие"],
    ["Calendar", "Календарь"],
    ["Customers", "Клиенты"],
    ["Operations", "Операции"],
    ["Good morning.", "Доброе утро."],
    ["Here’s what needs attention today.", "Вот что требует внимания сегодня."],
    ["Bookings", "Записи"],
    ["New leads", "Новые лиды"],
    ["AI reviews", "AI-проверки"],
    ["sample", "пример"],
    ["AI workflows", "AI-процессы"],
    ["Reception", "Приём"],
    ["Preview", "Превью"],
    ["Follow-up", "Сопровождение"],
    ["What needs attention next?", "Что требует внимания дальше?"],
    ["Illustrative UI — no autonomous action.", "Демонстрационный интерфейс — без автономных действий."],
    ["Adaptive by business", "Адаптация под бизнес"],
    ["One system. Different business realities.", "Одна система. Разные бизнес-процессы."],
    ["The product identity stays constant. Language and modules adapt to the operating context without creating separate Hermes brands.", "Идентичность продукта остаётся единой. Язык и модули адаптируются под рабочий контекст без создания отдельных брендов Hermes."],
    ["Repair Shops", "СТО"],
    ["LIVE PRODUCT", "РАБОЧИЙ ПРОДУКТ"],
    ["Bookings, services, availability, customers, vehicles, follow-up, and owner operations in one workspace.", "Записи, услуги, доступность, клиенты, автомобили, сопровождение и операции владельца в одном рабочем пространстве."],
    ["Services", "Услуги"],
    ["Vehicles", "Автомобили"],
    ["Open live product", "Открыть рабочий продукт"],
    ["Logistics", "Логистика"],
    ["PREVIEW CONFIGURATION", "КОНФИГУРАЦИЯ-ПРЕВЬЮ"],
    ["Loads, carriers, dispatch, documents, freight decisions, and operating visibility around one shared workflow.", "Грузы, перевозчики, диспетчинг, документы, решения по перевозкам и операционная прозрачность в едином процессе."],
    ["Loads", "Грузы"],
    ["Carriers", "Перевозчики"],
    ["Dispatch", "Диспетчинг"],
    ["Documents", "Документы"],
    ["Marketing", "Маркетинг"],
    ["Leads, clients, campaigns, meetings, sales handoff, and AI-assisted follow-up in one operating view.", "Лиды, клиенты, кампании, встречи, передача в продажи и AI-сопровождение в одном операционном представлении."],
    ["Leads", "Лиды"],
    ["Clients", "Клиенты"],
    ["Campaigns", "Кампании"],
    ["Pipeline", "Воронка"],
    ["Academy", "Академия"],
    ["PRIVATE LEARNER WORKSPACE", "ПРИВАТНОЕ ПРОСТРАНСТВО ОБУЧЕНИЯ"],
    ["Students, programs, assignments, practice, evidence, progress, support, and human-reviewed progression in one learner workspace.", "Студенты, программы, задания, практика, доказательства выполнения, прогресс, поддержка и проверяемое человеком продвижение в одном учебном пространстве."],
    ["Students", "Студенты"],
    ["Programs", "Программы"],
    ["Evidence", "Результаты"],
    ["Progress", "Прогресс"],
    ["Open learner workspace", "Открыть обучение"],
    ["Beauty & Wellness", "Красота и wellness"],
    ["PRIVATE OWNER FOUNDATION", "ПРИВАТНАЯ ОСНОВА ДЛЯ ВЛАДЕЛЬЦА"],
    ["Owner-scoped salon profile, team, and shared services are available in a private Hermes workspace. Appointments, CRM, payments, revenue, inventory, payroll, and autonomous outreach remain deferred.", "Профиль салона, команда и общие услуги доступны владельцу в приватном пространстве Hermes. Запись клиентов, CRM, платежи, выручка, склад, расчёт выплат и автономные рассылки пока отложены."],
    ["Profile", "Профиль"],
    ["Team", "Команда"],
    ["Open private workspace", "Открыть приватное пространство"],
    ["Professional Services", "Профессиональные услуги"],
    ["Requests, clients, proposals, projects, tasks, documents, and follow-up for service businesses.", "Запросы, клиенты, предложения, проекты, задачи, документы и сопровождение для сервисного бизнеса."],
    ["Requests", "Запросы"],
    ["Projects", "Проекты"],
    ["Tasks", "Задачи"],
    ["Configuration preview · not a released vertical", "Превью конфигурации · направление ещё не выпущено"],
    ["One Hermes workspace", "Единое рабочее пространство Hermes"],
    ["Pearl outside. Obsidian where work gets serious.", "Pearl снаружи. Obsidian там, где начинается серьёзная работа."],
    ["Public pages explain the system with clarity and air. Operational tools become darker, denser, and more focused. The visual language stays unmistakably Hermes in both modes.", "Публичные страницы объясняют систему ясно и свободно. Операционные инструменты становятся темнее, плотнее и сфокусированнее. В обоих режимах визуальный язык остаётся узнаваемо Hermes."],
    ["Reference capabilities stay visible without pretending they are separate live products.", "Референсные возможности остаются видимыми, но не выдаются за отдельные рабочие продукты."],
    ["These modules support product exploration while remaining subordinate to the current Repair Shops live vertical.", "Эти модули помогают исследовать продукт, оставаясь вспомогательными по отношению к текущему рабочему направлению СТО."],
    ["REFERENCE", "РЕФЕРЕНС"],
    ["Product truth", "Статус продукта"],
    ["Clear status. No fake live surface.", "Чёткий статус. Никакой имитации рабочего продукта."],
    ["Preview UI is labeled as preview or sample data. Repair Shops is the current public live vertical; Academy and Beauty are private product surfaces with bounded scopes.", "Превью-интерфейсы отмечены как превью или пример данных. СТО — текущее публичное рабочее направление; Academy и Beauty — приватные поверхности продукта с ограниченным подтверждённым набором функций."],
    ["Which Hermes Connect configuration is live today?", "Какая конфигурация Hermes Connect работает сейчас?"],
    ["Repair Shops is the current public live product vertical. Academy has a private learner workspace, and Beauty & Wellness has a private owner foundation for salon profile, team, and services. Logistics, Marketing, and Professional Services remain previews.", "СТО — текущее публичное рабочее направление. В Academy есть приватное учебное пространство, а в Beauty & Wellness — приватная основа владельца для профиля салона, команды и услуг. Логистика, Маркетинг и Профессиональные услуги остаются превью."],
    ["Is Hermes Connect one product or many separate apps?", "Hermes Connect — это один продукт или несколько отдельных приложений?"],
    ["One product family. Identity, workspace principles, intelligence, and operating patterns stay recognizable while terminology and workflows adapt to the business.", "Это единая продуктовая экосистема. Идентичность, принципы рабочего пространства, intelligence и операционные паттерны остаются узнаваемыми, а терминология и процессы адаптируются под бизнес."],
    ["Are the dashboard numbers real customer data?", "Цифры на демонстрационной панели — реальные данные клиентов?"],
    ["No. The product-preview dashboard on this page is explicitly labeled as sample presentation data. Live and private product surfaces are identified separately.", "Нет. Демонстрационная панель на этой странице прямо отмечена как пример данных. Рабочие и приватные поверхности продукта обозначаются отдельно."],
  ]);

  const normalize = (value) => {
    const path = String(value || "/").split("?")[0].split("#")[0];
    return path.endsWith("/") ? path : `${path}/`;
  };

  const activeKey = (path) => {
    const current = normalize(path);
    if (current === "/services/hermes-connect/") return "hub";
    if (current.startsWith("/services/hermes-connect/repair-shops/")) return "repair";
    if (current.startsWith("/load-board/")) return "loadBoard";
    if (current.startsWith("/services/hermes-connect/ai-command-center/")) return "aiCommand";
    if (current.startsWith("/services/hermes-connect/academy/")) return "academy";
    return "";
  };

  const withLocale = (href, locale) => {
    const url = new URL(href, window.location.origin);
    if (locale === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", locale);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const requestedLocale = () => String(new URLSearchParams(window.location.search).get("lang") || "").trim().toLowerCase();

  function applyRussianHub() {
    if (normalize(window.location.pathname) !== "/services/hermes-connect/" || requestedLocale() !== "ru") return false;
    const root = document.querySelector(".hc-brand-page");
    if (!(root instanceof HTMLElement)) return false;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) continue;
      const value = node.nodeValue || "";
      const key = value.trim();
      const translated = HUB_RU.get(key);
      if (translated) node.nodeValue = value.replace(key, translated);
    }

    document.documentElement.lang = "ru";
    root.setAttribute("data-hc-hub-locale", "ru");
    root.querySelector('[aria-label="Current Hermes Connect product status"]')?.setAttribute("aria-label", "Текущий статус продукта Hermes Connect");
    root.querySelector('[aria-label="Hermes Connect product preview"]')?.setAttribute("aria-label", "Превью продукта Hermes Connect");

    const productContext = document.querySelector("[data-hc-product-context]");
    productContext?.querySelectorAll("[data-hc-english-only]").forEach((node) => node.remove());
    const contentLanguage = productContext?.querySelector(".hc-content-language");
    if (contentLanguage) contentLanguage.textContent = "Язык контента: русский";
    const languageLabel = productContext?.querySelector(".hc-language-menu strong");
    if (languageLabel) languageLabel.textContent = "Русский";

    try { window.localStorage.setItem("hermes-connect-language", "ru"); } catch {}

    document.title = "Hermes Connect | AI-операционная система для бизнеса";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", "Управляйте бизнесом с AI. Hermes Connect адаптирует единую операционную систему под разные бизнес-процессы; СТО — текущее публичное рабочее направление, Academy и Beauty — приватные пространства с ограниченным подтверждённым набором функций.");

    root.querySelectorAll("a[href]").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const raw = link.getAttribute("href") || "";
      if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) return;
      const url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/services/hermes-connect/") || url.pathname.startsWith("/load-board/")) {
        url.searchParams.set("lang", "ru");
        link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
      }
    });

    return true;
  }

  function apply() {
    const nav = document.querySelector("[data-hc-product-context] .hc-family-nav");
    if (!(nav instanceof HTMLElement)) return false;

    const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
    const locale = supported.has(document.documentElement.lang) ? document.documentElement.lang : "en";
    const labels = LABELS[locale] || LABELS.en;
    const selected = activeKey(window.location.pathname);
    const existing = Array.from(nav.querySelectorAll(":scope > a"));
    const priorityPaths = new Set(PRIORITY.map((item) => normalize(item.href)));
    const trailing = existing.filter((link) => !priorityPaths.has(normalize(link.getAttribute("href"))));

    const fragment = document.createDocumentFragment();
    for (const item of PRIORITY) {
      let link = existing.find((candidate) => normalize(candidate.getAttribute("href")) === normalize(item.href));
      if (!link) link = document.createElement("a");
      link.textContent = labels[item.key];
      link.setAttribute("href", withLocale(item.href, locale));
      link.setAttribute("data-hc-product-key", item.key);
      if (selected === item.key) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      fragment.append(link);
    }

    for (const link of trailing) {
      if (link instanceof HTMLAnchorElement) {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("/services/hermes-connect/")) link.setAttribute("href", withLocale(href, locale));
        if (!selected || !normalize(href).startsWith(normalize(window.location.pathname))) link.removeAttribute("aria-current");
      }
      fragment.append(link);
    }

    nav.replaceChildren(fragment);
    nav.setAttribute("data-hc-priority-order", "current-products-first");
    return true;
  }

  const run = () => {
    applyRussianHub();
    if (apply()) {
      applyRussianHub();
      return;
    }
    const observer = new MutationObserver(() => {
      applyRussianHub();
      if (apply()) {
        applyRussianHub();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => {
      applyRussianHub();
      observer.disconnect();
    }, 4000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();