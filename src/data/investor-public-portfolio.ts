/**
 * Public-only Investor Relations portfolio copy.
 * Canonical evidence and private unit economics live in One Brain, NOT in this module.
 * Stages are conservative editorial labels, not percentages or commercial promises.
 * Any change must pass Finance/Compliance/QA/Search release review.
 */
export const investorPortfolioReviewedAt = "2026-10-24";

export const investorPublicProjects = [
  {
    id: "logistics",
    href: "/paths/logistics/",
    en: { title: "U.S. Logistics & Fleet Expansion", stage: "Operating foundation / proposed expansion", detail: "Hermes Logistics LLC's U.S. carrier and car-hauling operating activities are the foundation. Purchasing 3–6-car transport equipment is a separate financing proposal; ownership, historic gross and cost evidence must be verified." },
    ru: { title: "Логистика США и развитие автопарка", stage: "Операционная основа / проект расширения", detail: "Работа Hermes Logistics LLC в логистике и перевозках автомобилей — операционная основа. Покупка автовозов на 3–6 машин рассматривается как отдельный проект, требующий проверки собственности, gross и расходов." },
  },
  {
    id: "load-board",
    href: "/load-board/",
    en: { title: "Hermes Load Board & Logistics Intelligence", stage: "Permissioned product / real-source integration gating", detail: "Carrier, dispatcher and dealer/shipper workspaces have bounded deployed production evidence. Operational source history is documented, while a fresh permitted source record flowing end-to-end into D1 and real authorized user acceptance remains the next gate." },
    ru: { title: "Load Board и аналитика логистики", stage: "Рабочий продукт / проверка реальных источников", detail: "Кабинеты перевозчика, диспетчера и дилера/отправителя имеют ограниченные production-доказательства. История реальных источников зафиксирована; следующий gate — свежая разрешенная запись от источника до D1 и подтверждение реальным авторизованным пользователем." },
  },
  {
    id: "connect",
    href: "/services/hermes-connect/",
    en: { title: "Hermes Connect & Business CRM", stage: "Production pilot / real-user validation open", detail: "Repair Shop accounts, service profiles, Catalog publication and configured production demos have bounded verification. The remaining gate is real owner/customer use through booking, processing, return use and a commercial decision; private commercial evidence is reviewed separately." },
    ru: { title: "Hermes Connect и CRM", stage: "Production-пилот / проверка реального использования", detail: "Проверены production-аккаунты автосервисов, профили услуг, публикация в Catalog и настроенные демо. Следующий gate — реальное использование владельцем и клиентом: booking, обработка, повторное использование и коммерческое решение; финансовые доказательства рассматриваются отдельно в private diligence." },
  },
  {
    id: "marketing",
    href: "/paths/marketing/",
    en: { title: "ProgressoPro & Digital Growth", stage: "Services + live distribution infrastructure / attribution open", detail: "Website development, SEO/GEO and social distribution infrastructure are operating assets. Provider-verified organic publishing exists; current attribution and qualified-outcome evidence are evaluated separately from reach, clicks or code releases." },
    ru: { title: "ProgressoPro и цифровой маркетинг", stage: "Услуги + работающая дистрибуция / атрибуция открыта", detail: "Создание сайтов, SEO/GEO и социальная дистрибуция являются действующими активами. Есть provider-verified публикации; атрибуция и квалифицированные результаты оцениваются отдельно от охвата, кликов и релизов кода." },
  },
  {
    id: "academy",
    href: "/paths/academy/",
    en: { title: "Hermes Business Academy", stage: "Core learning product engineered / commercial access deferred", detail: "Learner identity, curriculum, submissions, human review, support and progress are implemented on the shared Hermes architecture. Commercial access terms remain a separate owner-approved gate; regional expansion stays a future-stage plan." },
    ru: { title: "Hermes Business Academy", stage: "Учебное ядро реализовано / коммерческий доступ отложен", detail: "На общей архитектуре Hermes реализованы аккаунт ученика, программа, задания, проверка человеком, поддержка и прогресс. Коммерческие условия остаются отдельным owner-approved gate; региональное масштабирование — следующий этап, а не текущий факт." },
  },
  {
    id: "automation",
    href: "/paths/technology/",
    en: { title: "Business Automation & AI Systems", stage: "Merged runtime architecture / bounded cloud proofs", detail: "A shared HAE control plane, D1/Queue patterns, capability policies and read-only runtime evidence exist, with provider publication kept off. Full autonomous operation across all business functions is not claimed." },
    ru: { title: "Автоматизация бизнеса и AI-системы", stage: "Общая runtime-архитектура / ограниченные cloud-доказательства", detail: "Существуют единый контур HAE, D1/Queue-паттерны, capability policy и read-only runtime-доказательства; публикация во внешние провайдеры выключена. Полная автономная работа всех подразделений не заявляется." },
  },
  {
    id: "catalog",
    href: "/businesses/",
    en: { title: "Hermes Business Catalog", stage: "Factory implementation complete / adoption validation open", detail: "The Catalog → Website Concept → Lead → Claim lifecycle and reusable Website Factory contracts are implemented, with public pilot routes and production readback recorded. Owner claim, client adoption and conversion remain separate evidence states." },
    ru: { title: "Hermes Business Catalog", stage: "Factory реализован / проверка adoption открыта", detail: "Реализован цикл Catalog → Website Concept → Lead → Claim и повторяемые контракты Website Factory; есть публичные пилотные маршруты и production-readback. Claim владельца, использование клиентом и конверсия остаются отдельными состояниями доказательств." },
  },
] as const;


/**
 * Editorial sequencing hypothesis, not a funding offer, timetable, or reported financial result.
 * Publish only source-backed milestones after Finance/Compliance/CEO review.
 */
export const investorCapitalLadder = [
  {
    id: "proof",
    en: { stage: "01 · Measure", title: "Establish operating economics", detail: "Reconcile completed logistics activity, service fees and verified cash receipts. Separate actual Hermes earnings from transport value handled by independent carriers." },
    ru: { stage: "01 · Измеряем", title: "Доказываем экономику бизнеса", detail: "Сверяем перевозки, комиссии за услуги и реальные поступления. Отдельно учитываем доход Hermes и оборот независимых перевозчиков." },
  },
  {
    id: "commercial",
    en: { stage: "02 · Sell", title: "Grow proven services", detail: "Use the existing logistics, website, SEO/GEO and marketing capabilities to test repeatable customer demand and profitable delivery before scaling fixed costs." },
    ru: { stage: "02 · Продаём", title: "Увеличиваем продажи услуг", detail: "Используем существующие возможности логистики, сайтов, SEO/GEO и маркетинга, чтобы подтвердить повторяемый спрос и прибыльность до роста постоянных расходов." },
  },
  {
    id: "asset",
    en: { stage: "03 · Finance assets", title: "Pilot fleet expansion", detail: "Consider a bounded car-hauling equipment pilot only after equipment quotes, authority, insurance, driver readiness, truck-level economics and repayment capacity are independently verified." },
    ru: { stage: "03 · Финансируем активы", title: "Пилотное расширение автопарка", detail: "Рассматриваем один контролируемый проект с автовозом только после проверки стоимости техники, разрешений, страховки, готовности водителей, экономики трака и обслуживания финансирования." },
  },
  {
    id: "technology",
    en: { stage: "04 · Reinvest", title: "Productize repeatable workflows", detail: "Improve Load Board, CRM and Automation with real customer and operating data. Separate proven reliability from commercial value before expanding the product footprint." },
    ru: { stage: "04 · Реинвестируем", title: "Масштабируем проверенные технологии", detail: "Развиваем Load Board, CRM и автоматизацию на основе реального опыта и спроса. Техническую готовность и коммерческую ценность проверяем отдельно." },
  },
  {
    id: "academy",
    en: { stage: "05 · Replicate", title: "Train teams for new markets", detail: "Use Academy-enabled team preparation to evaluate regional operating partnerships one market at a time, subject to local compliance and measured demand." },
    ru: { stage: "05 · Повторяем", title: "Готовим команды для новых рынков", detail: "Академия помогает готовить команды для новых подразделений. Каждый рынок проходит отдельную проверку спроса, местных требований и экономики." },
  },
] as const;
