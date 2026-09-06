export type RussianDirectionHubId = "logistics" | "marketing" | "technology" | "academy";

type HubLink = {
  label: string;
  title: string;
  body: string;
  href: string;
  status?: string;
};

export type RussianDirectionHub = {
  id: RussianDirectionHubId;
  brand: string;
  eyebrow: string;
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  primary: HubLink;
  products: HubLink[];
  boundary: string;
};

export const russianDirectionHubs: Record<RussianDirectionHubId, RussianDirectionHub> = {
  logistics: {
    id: "logistics",
    brand: "Hermes Logistics",
    eyebrow: "Логистика США",
    title: "Перевозчики, Load Board, договоры и операционная работа в одном маршруте.",
    summary: "Выберите свою роль и переходите сразу к рабочему инструменту: поиск грузов, подключение перевозчика, owner-operator, брокер, отправитель или дилер, диспетчеризация и операционные ресурсы.",
    seoTitle: "Hermes Logistics на русском | Перевозчики, Load Board и Car Hauling",
    seoDescription: "Русскоязычный вход в Hermes Logistics: Load Board, подключение перевозчиков, договор и онбординг, owner-operators, брокеры, отправители, дилеры и Car Hauling.",
    primary: {
      label: "Открыть Load Board",
      title: "Load Board",
      body: "Перейдите к единой доске грузов Hermes и выберите роль перевозчика или клиента.",
      href: "/load-board/?role=carrier#available-loads",
      status: "Рабочий продукт",
    },
    products: [
      { label: "Договор и онбординг", title: "Подключение перевозчика", body: "Проверка требований, документов, договора и следующего шага подключения.", href: "/carrier/" },
      { label: "Перевозчики и автопарки", title: "Carriers & Fleets", body: "Маршрут для автопарков и перевозчиков с действующей операционной структурой.", href: "/paths/logistics/carriers/fleet-owners/" },
      { label: "Owner-operators", title: "Owner-Operators", body: "Отдельный путь для владельцев-водителей и небольших операций.", href: "/paths/logistics/carriers/owner-operators/" },
      { label: "Брокеры", title: "Brokers", body: "Предложение мощности и операционная координация для брокеров.", href: "/paths/logistics/brokers/carrier-capacity/" },
      { label: "Отправители и дилеры", title: "Shippers & Dealers", body: "Запрос перевозки автомобиля или регулярной транспортной мощности.", href: "/paths/logistics/customers/vehicle-transport/" },
      { label: "Диспетчеризация", title: "Dispatch & Back Office", body: "Car Hauling dispatch, документы, координация и операционная поддержка.", href: "/logistics/car-hauling-dispatch/" },
      { label: "Ресурсы", title: "Carrier Knowledge Hub", body: "RPM, factoring, readiness, broker setup и практические операционные материалы.", href: "/logistics/resources/" },
    ],
    boundary: "Наличие страницы или инструмента не означает автоматическое одобрение перевозчика, наличие груза, гарантированную ставку, доход или коммерческий результат. Условия подтверждаются отдельно.",
  },
  marketing: {
    id: "marketing",
    brand: "Hermes Marketing · ProgressoPro",
    eyebrow: "Маркетинг и рост",
    title: "Сайт, SEO/GEO, контент, социальные сети и платный спрос как одна система.",
    summary: "Начните с текущей задачи бизнеса и переходите к конкретному продукту: сайт, поисковое продвижение, социальные сети, Meta Ads или комплексная система роста.",
    seoTitle: "Hermes Marketing на русском | Сайты, SEO/GEO, SMM и Meta Ads",
    seoDescription: "Русскоязычный вход в Hermes Marketing и ProgressoPro: сайты, SEO/GEO, социальные сети, Meta Ads, CRM и система роста.",
    primary: {
      label: "Открыть систему роста",
      title: "Growth System",
      body: "Связать предложение, сайт, трафик, контент, CRM и продажи в один измеримый путь клиента.",
      href: "/business-growth/",
    },
    products: [
      { label: "Сайты", title: "Website Development", body: "Корпоративные сайты, продуктовые страницы и конверсионные маршруты.", href: "/gb/london/website-development/" },
      { label: "SEO и GEO", title: "SEO & GEO", body: "Поисковая архитектура, локальные страницы, техническое SEO и AI-search visibility.", href: "/gb/london/seo-services/" },
      { label: "Социальные сети", title: "Social Media", body: "Контент и органическое развитие Instagram, Facebook, Threads и других каналов.", href: "/gb/london/social-media-management/" },
      { label: "Meta Ads", title: "Meta Ads", body: "Платные кампании с понятным предложением, посадочной страницей и измерением результата.", href: "/gb/london/meta-ads/" },
      { label: "Обучение маркетингу", title: "Hermes Academy · Marketing", body: "Практический учебный трек по маркетинговой системе и работе со спросом.", href: "/academy/marketing/" },
    ],
    boundary: "Маркетинговые страницы описывают процесс и возможности. Позиции в поиске, лиды, продажи и финансовый результат не гарантируются и зависят от рынка, предложения, бюджета и исполнения.",
  },
  technology: {
    id: "technology",
    brand: "Hermes IT",
    eyebrow: "IT · AI · автоматизация",
    title: "Hermes Connect, Load Board, веб-системы и AI вокруг реальных бизнес-процессов.",
    summary: "IT-направление соединяет продукт, интерфейс, данные, автоматизацию и AI. Начните с Hermes Connect или Load Board, либо сформируйте собственный проектный бриф.",
    seoTitle: "Hermes IT на русском | Hermes Connect, Load Board, AI и автоматизация",
    seoDescription: "Русскоязычный вход в Hermes IT: Hermes Connect, Load Board, веб-разработка, автоматизация, AI, интеграции и проектный бриф.",
    primary: {
      label: "Открыть Hermes Connect",
      title: "Hermes Connect",
      body: "Единое семейство рабочих продуктов Hermes. Русский интерфейс открывается через языковой режим продукта.",
      href: "/services/hermes-connect/?lang=ru",
      status: "Repair Shops · рабочий пилот",
    },
    products: [
      { label: "Load Board", title: "Load Board", body: "Общий продукт Logistics + IT для грузов, ролей и операционных маршрутов.", href: "/load-board/" },
      { label: "Веб-разработка", title: "Web Development", body: "Сайты и web-приложения вокруг бизнес-процесса и измеримых пользовательских действий.", href: "/gb/london/website-development/" },
      { label: "Возможности", title: "Capabilities", body: "Каталог систем, автоматизации и продуктовых возможностей Hermes IT.", href: "/paths/technology/#service-groups-title" },
      { label: "Бриф проекта", title: "Project Brief", body: "Соберите задачу, контекст и ограничения до начала разработки.", href: "/paths/technology/#project-brief" },
      { label: "Кейс IT", title: "IT Development", body: "Пример архитектуры и разработки вокруг реального продукта.", href: "/case/it-development/" },
    ],
    boundary: "Статус каждой возможности проверяется отдельно. Прототип, демонстрация или описание функции не выдаются за production-возможность без соответствующей проверки.",
  },
  academy: {
    id: "academy",
    brand: "Hermes Academy",
    eyebrow: "Практическое обучение",
    title: "Пять направлений обучения: Logistics, Marketing, IT & AI, Sales и COO / Operations.",
    summary: "Academy показывает направления навыков и практики. Публичность трека не означает, что набор, цена, место, сертификат или оплачиваемая работа уже открыты.",
    seoTitle: "Hermes Academy на русском | Logistics, Marketing, IT, Sales и COO",
    seoDescription: "Русскоязычный вход в Hermes Academy: Logistics, Marketing, IT & AI, Sales и COO / Operations с практическим форматом и прозрачными условиями.",
    primary: {
      label: "Открыть Academy",
      title: "Пять учебных треков",
      body: "Посмотрите структуру направлений, практики и модель участия без скрытых обещаний трудоустройства или дохода.",
      href: "/paths/academy/",
    },
    products: [
      { label: "Логистика", title: "U.S. Logistics Operations", body: "Диспетчеризация, документы, оборудование, жизненный цикл груза и коммуникация на рынке США.", href: "/academy/us-logistics-operations/" },
      { label: "Маркетинг", title: "Marketing", body: "Позиционирование, контент, кампании, путь клиента, follow-up и аналитика.", href: "/academy/marketing/" },
      { label: "IT и AI", title: "IT & AI", body: "Product thinking, web-системы, данные, автоматизация, AI и тестирование.", href: "/paths/academy/#academy-it" },
      { label: "Продажи", title: "Sales", body: "Prospecting, discovery, возражения, follow-up, CRM и переговоры.", href: "/paths/academy/#academy-sales" },
      { label: "COO / Операции", title: "COO / Operations", body: "Структура отделов, KPI, SOP, ритм исполнения, аналитика и масштабирование.", href: "/paths/academy/#academy-operations" },
      { label: "Как проходит обучение", title: "Training model", body: "Принципы практики, проверки и участия до подачи заявки.", href: "/academy/how-training-works/" },
    ],
    boundary: "Нет гарантии трудоустройства, дохода, клиентов, сертификата, повышения или будущей оплачиваемой работы. Точные даты, цена, вместимость и условия публикуются только после утверждения конкретного набора.",
  },
};

export const russianDirectionHubOrder: RussianDirectionHubId[] = ["logistics", "marketing", "technology", "academy"];
