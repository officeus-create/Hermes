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
    en: { title: "Hermes Load Board & Logistics Intelligence", stage: "Product development / source-rights gating", detail: "A load-search and carrier decision workflow is in development. Real-time authorized source coverage, actual live loads and individual reviewer logins are not yet certified as a complete commercial release." },
    ru: { title: "Load Board и аналитика логистики", stage: "Разработка / проверка прав источников", detail: "Разрабатываются поиск грузов и инструменты работы перевозчиков. Полноценный доступ к актуальным грузам из разрешенных источников и вход проверяющих пользователей еще требуют подтверждения." },
  },
  {
    id: "connect",
    href: "/services/hermes-connect/",
    en: { title: "Hermes Connect & Business CRM", stage: "Public product / commercial validation open", detail: "Repair-shop booking, service and business CRM interfaces exist alongside pilots and other developing modules. Independent proof of recurring paid adoption is not yet included here." },
    ru: { title: "Hermes Connect и CRM", stage: "Публичный продукт / проверка коммерческого спроса", detail: "Есть интерфейсы для автосервисов, записи клиентов и управления сервисами, а также пилоты и модули в разработке. Повторяющиеся платные продажи пока здесь не заявляются." },
  },
  {
    id: "marketing",
    href: "/paths/marketing/",
    en: { title: "ProgressoPro & Digital Growth", stage: "Services and growth infrastructure", detail: "Website development, SEO/GEO, marketing operations and reusable digital delivery workflows support demand creation across Hermes and eligible external businesses." },
    ru: { title: "ProgressoPro и цифровой маркетинг", stage: "Услуги и инструменты продвижения", detail: "Создание сайтов, SEO/GEO, маркетинг и повторяемые цифровые процессы помогают привлекать спрос в Hermes и у внешних клиентов." },
  },
  {
    id: "academy",
    href: "/paths/academy/",
    en: { title: "Hermes Business Academy", stage: "Training programs / expansion concept", detail: "Practical logistics and marketing training is designed to support operational talent pipelines. A long-term ambition is to prepare regional teams; country openings are not represented as operating facts." },
    ru: { title: "Hermes Business Academy", stage: "Обучение / стратегия развития", detail: "Практическое обучение логистике и маркетингу создает кадровую базу. Подготовка региональных команд — долгосрочная цель; новые международные офисы не заявляются как действующие." },
  },
  {
    id: "automation",
    href: "/paths/technology/",
    en: { title: "Business Automation & AI Systems", stage: "Engineering and limited technical proofs", detail: "Hermes is engineering repeatable, controlled automation of business processes. Bounded cloud read-only runtime checks are not equivalent to autonomous commercial operations across every business." },
    ru: { title: "Автоматизация бизнеса и AI-системы", stage: "Разработка и ограниченные технические проверки", detail: "Разрабатывается управляемая автоматизация бизнес-процессов. Отдельные облачные технические проверки не означают автономную коммерческую работу всех направлений." },
  },
  {
    id: "catalog",
    href: "/businesses/",
    en: { title: "Hermes Business Catalog", stage: "Public discovery surface / adoption to be validated", detail: "Public business profiles and discovery tools connect customers with selected business information and support future CRM and marketing journeys. Commercial conversion must be independently evidenced." },
    ru: { title: "Hermes Business Catalog", stage: "Публичный каталог / проверка использования", detail: "Каталог компаний и инструментов поиска помогает клиентам знакомиться с бизнесами и связывает направления CRM и маркетинга. Коммерческие результаты требуют отдельного подтверждения." },
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
