export type LocalizedOverview = {
  locale: "uk" | "ru" | "es" | "it" | "fr";
  path: "/ua/" | "/ru/" | "/es/" | "/it/" | "/fr/";
  metaTitle: string;
  metaDescription: string;
  heroImageAlt: string;
  hero: { eyebrow: string; title: string; body: string; primary: string; secondary: string };
  intro: { eyebrow: string; title: string; body: string };
  directions: {
    id: "logistics" | "marketing" | "academy" | "technology";
    number: string;
    brand: string;
    title: string;
    body: string;
    points: string[];
    cta: string;
    image: string;
    imageAlt: string;
  }[];
  partnership: { eyebrow: string; title: string; body: string; items: { title: string; body: string }[]; note: string };
  capabilities: { eyebrow: string; title: string; body: string; items: { status: string; title: string; body: string }[] };
  contact: { eyebrow: string; title: string; body: string; button: string; note: string };
};

export const localizedOverviews: Record<"uk" | "ru" | "es" | "it" | "fr", LocalizedOverview> = {
  uk: {
    locale: "uk",
    path: "/ua/",
    metaTitle: "Hermes | Логістика, маркетинг, академія та IT",
    metaDescription: "Hermes об'єднує логістику, маркетинг, практичну бізнес-освіту й IT-розробку для компаній у США та міжнародних партнерів.",
    heroImageAlt: "Чотири освітлені архітектурні портали, що символізують напрями бізнесу Hermes",
    hero: {
      eyebrow: "Логістика · Розвиток · Освіта · Технології",
      title: "Чотири напрями. Одна екосистема для зростання.",
      body: "Почніть із задачі, яка важлива зараз: логістичні операції, маркетинг, навчання команди або цифровий продукт для бізнесу.",
      primary: "Обрати напрям",
      secondary: "Написати команді",
    },
    intro: {
      eyebrow: "Єдина система Hermes",
      title: "Ми будуємо не окремі послуги, а наступний робочий етап компанії.",
      body: "Один напрям може стати точкою входу. Далі ми допомагаємо пов'язати технології, попит, компетенції команди та операційні процеси в реалістичну дорожню карту.",
    },
    directions: [
      {
        id: "logistics", number: "01", brand: "Hermes Logistics", title: "Рух вантажів із чіткою операційною підтримкою.",
        body: "Диспетчеризація, документи, координація перевізників і Car Hauling для перевізників, власників-операторів, відправників та дилерів на ринку США.",
        points: ["Перевізники та автопарки", "Відправники й дилери", "Car Hauling та операційна підтримка"], cta: "Запит щодо логістики",
        image: "/images/path-logistics-system.jpg", imageAlt: "Система логістичних маршрутів і операцій",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Перетворюйте увагу на керовану систему зростання.",
        body: "Стратегія сайту, SEO/GEO, соціальні мережі, позиціонування, кампанії, лідогенерація, процес продажів і вимірювання навколо визначеної бізнес-цілі.",
        points: ["Стратегія та позиціонування", "Контент і залучення попиту", "Продажі, CRM та аналітика"], cta: "Запит щодо маркетингу",
        image: "/images/path-marketing-system.jpg", imageAlt: "Маркетингова система контенту, аудиторій та аналітики",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Практичні навички, пов'язані з реальною роботою.",
        body: "Hermes Business Academy публічно представляє практичні напрями з логістики США, маркетингу, IT та AI, продажів і COO / операційного управління. Точні умови набору, практики та доступності підтверджуються окремо.",
        points: ["Логістика США", "Маркетинг · IT та AI · Продажі", "COO / операційне управління"], cta: "Запит щодо навчання",
        image: "/images/path-academy-system.jpg", imageAlt: "Архітектурне середовище практичного навчання",
      },
      {
        id: "technology", number: "04", brand: "Hermes Technology", title: "Цифрові продукти навколо того, як працює ваш бізнес.",
        body: "Hermes Technology перетворює визначені бізнес-процеси на кастомні сайти, портали, CRM-модулі, автоматизацію робочих процесів, бізнес-асистентів, інтеграції та галузеве програмне забезпечення, яке створюється контрольованими етапами.",
        points: ["Сайти, портали та застосунки", "CRM й операційні системи", "AI-асистенти та інтеграції"], cta: "Описати IT-проєкт",
        image: "/images/path-technology-portal.jpg", imageAlt: "Цифровий портал Hermes Technology",
      },
    ],
    partnership: {
      eyebrow: "Партнерство для розвитку компанії",
      title: "Почніть із доступного кроку. Розширюйте систему разом із результатами.",
      body: "Ми підбираємо перший продукт під поточну стадію та інвестиційні можливості компанії, а потім можемо підключати наступні напрями.",
      items: [
        { title: "Technology", body: "Створюємо цифровий продукт і операційну основу." },
        { title: "Marketing", body: "Будуємо попит, контент і шлях клієнта навколо продукту." },
        { title: "Academy", body: "Готуємо людей працювати з новими процесами та системами." },
        { title: "Logistics", body: "Оцінюємо фізичну операцію, координацію та логістичне розширення." },
      ],
      note: "Міжнародне логістичне розширення розглядається окремо після перевірки попиту, ліцензування, партнерів і економіки ринку.",
    },
    capabilities: {
      eyebrow: "Поточний статус продуктів",
      title: "Працюючі продукти відокремлюємо від попередніх концепцій і поетапної розробки.",
      body: "Статус на мовних сторінках має збігатися з канонічними власниками продуктів: жодна демонстрація, концепція чи інтеграція не стає робочою лише через переклад.",
      items: [
        { status: "Працює", title: "Корпоративний сайт Hermes", body: "Багатомовна публічна екосистема з контрольованим випуском, канонічними мовними власниками та автоматичними перевірками." },
        { status: "Працює", title: "Hermes Connect · СТО", body: "Поточний публічний робочий напрям Hermes Connect об’єднує послуги, доступність, записи, клієнтів і автомобілі в одному процесі." },
        { status: "Поетапна послуга", title: "Hermes Technology", body: "Сайти, портали, CRM-модулі, автоматизація, бізнес-асистенти та інтеграції створюються за погодженим обсягом; це не означає, що кожна можливість уже працює для кожного клієнта." },
        { status: "За підтвердженим статусом", title: "Інші конфігурації Hermes Connect", body: "Статус Academy, Beauty, Logistics, Marketing, Professional Services та інших конфігурацій визначає їхня канонічна сторінка; демонстраційні й довідкові сторінки не видаються за робочі функції." },
      ],
    },
    contact: {
      eyebrow: "Наступний крок", title: "Опишіть, що має працювати краще у вашій компанії.",
      body: "Напишіть своїми словами про компанію, три бажані проєкти, приклади, країну, регіон і доступний інвестиційний ритм. Ми підготуємо логіку наступного етапу.",
      button: "Надіслати опис електронною поштою", note: "Поки що звернення приймаються через email. Голосовий та AI-аналіз брифу заплановано наступним етапом.",
    },
  },
  ru: {
    locale: "ru",
    path: "/ru/",
    metaTitle: "Hermes | Логистика, маркетинг, академия и IT",
    metaDescription: "Hermes объединяет логистику, маркетинг, практическое бизнес-образование и IT-разработку для компаний в США и международных партнёров.",
    heroImageAlt: "Четыре освещённых архитектурных портала, символизирующих направления бизнеса Hermes",
    hero: {
      eyebrow: "Логистика · Развитие · Образование · Технологии",
      title: "Четыре направления. Одна экосистема для роста.",
      body: "Начните с задачи, которая важна сейчас: логистические операции, маркетинг, обучение команды или цифровой продукт для бизнеса.",
      primary: "Выбрать направление",
      secondary: "Написать команде",
    },
    intro: {
      eyebrow: "Единая система Hermes",
      title: "Мы строим не отдельные услуги, а следующий рабочий этап компании.",
      body: "Одно направление может стать точкой входа. Дальше мы помогаем связать технологии, спрос, компетенции команды и операционные процессы в реалистичную дорожную карту.",
    },
    directions: [
      {
        id: "logistics", number: "01", brand: "Hermes Logistics", title: "Движение грузов с понятной операционной поддержкой.",
        body: "Диспетчеризация, документы, координация перевозчиков и Car Hauling для перевозчиков, владельцев-операторов, отправителей и дилеров на рынке США.",
        points: ["Перевозчики и автопарки", "Отправители и дилеры", "Car Hauling и операционная поддержка"], cta: "Запрос по логистике",
        image: "/images/path-logistics-system.jpg", imageAlt: "Система логистических маршрутов и операций",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Превращайте внимание в управляемую систему роста.",
        body: "Стратегия сайта, SEO/GEO, социальные сети, позиционирование, кампании, лидогенерация, процесс продаж и измерение вокруг определённой бизнес-цели.",
        points: ["Стратегия и позиционирование", "Контент и создание спроса", "Продажи, CRM и аналитика"], cta: "Запрос по маркетингу",
        image: "/images/path-marketing-system.jpg", imageAlt: "Маркетинговая система контента, аудиторий и аналитики",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Практические навыки, связанные с реальной работой.",
        body: "Hermes Business Academy публично представляет практические направления по логистике США, маркетингу, IT и AI, продажам и COO / операционному управлению. Точные условия набора, практики и доступности подтверждаются отдельно.",
        points: ["Логистика США", "Маркетинг · IT и AI · Продажи", "COO / операционное управление"], cta: "Запрос по обучению",
        image: "/images/path-academy-system.jpg", imageAlt: "Архитектурная среда практического обучения",
      },
      {
        id: "technology", number: "04", brand: "Hermes Technology", title: "Цифровые продукты вокруг того, как работает ваш бизнес.",
        body: "Hermes Technology превращает определённые бизнес-процессы в кастомные сайты, порталы, CRM-модули, автоматизацию рабочих процессов, бизнес-ассистентов, интеграции и отраслевое программное обеспечение, создаваемое контролируемыми этапами.",
        points: ["Сайты, порталы и приложения", "CRM и операционные системы", "AI-ассистенты и интеграции"], cta: "Описать IT-проект",
        image: "/images/path-technology-portal.jpg", imageAlt: "Цифровой портал Hermes Technology",
      },
    ],
    partnership: {
      eyebrow: "Партнёрство для развития компании",
      title: "Начните с доступного шага. Расширяйте систему вместе с результатами.",
      body: "Мы подбираем первый продукт под текущую стадию и инвестиционные возможности компании, а затем можем подключать следующие направления.",
      items: [
        { title: "Technology", body: "Создаём цифровой продукт и операционную основу." },
        { title: "Marketing", body: "Строим спрос, контент и путь клиента вокруг продукта." },
        { title: "Academy", body: "Готовим людей работать с новыми процессами и системами." },
        { title: "Logistics", body: "Оцениваем физическую операцию, координацию и логистическое расширение." },
      ],
      note: "Международное логистическое расширение рассматривается отдельно после проверки спроса, лицензирования, партнёров и экономики рынка.",
    },
    capabilities: {
      eyebrow: "Текущий статус продуктов",
      title: "Рабочие продукты отделяем от предварительных концепций и поэтапной разработки.",
      body: "Статус на языковых страницах должен совпадать с каноническими владельцами продуктов: демонстрация, концепция или интеграция не становится рабочей только из-за перевода.",
      items: [
        { status: "Работает", title: "Корпоративный сайт Hermes", body: "Многоязычная публичная экосистема с контролируемым выпуском, каноническими языковыми владельцами и автоматическими проверками." },
        { status: "Работает", title: "Hermes Connect · СТО", body: "Текущее публичное рабочее направление Hermes Connect объединяет услуги, доступность, записи, клиентов и автомобили в одном процессе." },
        { status: "Поэтапная услуга", title: "Hermes Technology", body: "Сайты, порталы, CRM-модули, автоматизация, бизнес-ассистенты и интеграции создаются в согласованном объёме; это не означает, что каждая возможность уже работает для каждого клиента." },
        { status: "По подтверждённому статусу", title: "Другие конфигурации Hermes Connect", body: "Статус Academy, Beauty, Logistics, Marketing, Professional Services и других конфигураций определяет их каноническая страница; демонстрационные и справочные страницы не выдаются за рабочие функции." },
      ],
    },
    contact: {
      eyebrow: "Следующий шаг", title: "Опишите, что должно работать лучше в вашей компании.",
      body: "Напишите своими словами о компании, трёх желаемых проектах, примерах, стране, регионе и доступном инвестиционном ритме. Мы подготовим логику следующего этапа.",
      button: "Отправить описание по электронной почте", note: "Пока обращения принимаются через email. Голосовой и AI-анализ брифа запланированы следующим этапом.",
    },
  },
  es: {
    locale: "es",
    path: "/es/",
    metaTitle: "Hermes | Logística, marketing, academia y desarrollo IT",
    metaDescription: "Hermes integra logística, marketing, formación empresarial práctica y desarrollo IT para empresas de Estados Unidos y socios internacionales.",
    heroImageAlt: "Cuatro portales arquitectónicos iluminados que representan las direcciones de negocio de Hermes",
    hero: {
      eyebrow: "Logística · Crecimiento · Formación · Tecnología",
      title: "Cuatro áreas. Un ecosistema para crecer.",
      body: "Empiece por la necesidad más importante ahora: operaciones logísticas, marketing, formación del equipo o un producto digital para su empresa.",
      primary: "Elegir un área",
      secondary: "Escribir al equipo",
    },
    intro: {
      eyebrow: "El sistema Hermes",
      title: "No creamos servicios aislados. Construimos la siguiente etapa operativa de su empresa.",
      body: "Un área puede ser el punto de partida. Después conectamos tecnología, demanda, capacidades del equipo y operaciones en una hoja de ruta realista.",
    },
    directions: [
      {
        id: "logistics", number: "01", brand: "Hermes Logistics", title: "Movimiento de carga con soporte operativo claro.",
        body: "Despacho, documentación, coordinación de transportistas y Car Hauling para transportistas independientes, remitentes y concesionarios en Estados Unidos.",
        points: ["Transportistas y flotas", "Remitentes y concesionarios", "Car Hauling y soporte operativo"], cta: "Consultar sobre logística",
        image: "/images/path-logistics-system.jpg", imageAlt: "Sistema de rutas y operaciones logísticas",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Convierta la atención en un sistema de crecimiento medible.",
        body: "Estrategia web, SEO/GEO, redes sociales, posicionamiento, campañas, generación de leads, proceso comercial y medición alrededor de un objetivo empresarial definido.",
        points: ["Estrategia y posicionamiento", "Contenido y generación de demanda", "Ventas, CRM y analítica"], cta: "Consultar sobre marketing",
        image: "/images/path-marketing-system.jpg", imageAlt: "Sistema de marketing, audiencias y analítica",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Habilidades prácticas conectadas con el trabajo real.",
        body: "Hermes Business Academy presenta públicamente itinerarios prácticos de logística de EE. UU., marketing, IT e IA, ventas y COO / operaciones. Las condiciones exactas de cada convocatoria, práctica y disponibilidad se confirman por separado.",
        points: ["Logística de EE. UU.", "Marketing · IT e IA · Ventas", "COO / Operaciones"], cta: "Consultar sobre formación",
        image: "/images/path-academy-system.jpg", imageAlt: "Entorno de formación empresarial práctica",
      },
      {
        id: "technology", number: "04", brand: "Hermes Technology", title: "Productos digitales diseñados alrededor de su empresa.",
        body: "Hermes Technology convierte procesos empresariales definidos en sitios web a medida, portales, módulos CRM, automatización de flujos, asistentes empresariales, integraciones y software sectorial desarrollado por etapas controladas.",
        points: ["Sitios, portales y aplicaciones", "CRM y sistemas operativos", "Asistentes con AI e integraciones"], cta: "Describir un proyecto IT",
        image: "/images/path-technology-portal.jpg", imageAlt: "Portal digital de Hermes Technology",
      },
    ],
    partnership: {
      eyebrow: "Una alianza para desarrollar su empresa",
      title: "Empiece con un paso viable. Amplíe el sistema con los resultados.",
      body: "Definimos el primer producto según la etapa y la capacidad de inversión de su empresa, y conectamos nuevas áreas cuando aporten valor.",
      items: [
        { title: "Technology", body: "Creamos el producto digital y la base operativa." },
        { title: "Marketing", body: "Construimos demanda, contenido y el recorrido del cliente." },
        { title: "Academy", body: "Preparamos al equipo para trabajar con nuevos procesos y sistemas." },
        { title: "Logistics", body: "Evaluamos operaciones físicas, coordinación y expansión logística." },
      ],
      note: "La expansión logística internacional se evalúa por separado tras validar demanda, licencias, socios y economía del mercado.",
    },
    capabilities: {
      eyebrow: "Estado actual de los productos",
      title: "Separamos los productos operativos de los conceptos preliminares y del desarrollo por etapas.",
      body: "El estado de cada versión lingüística debe coincidir con su página canónica: una demostración, un concepto o una integración no se convierte en una función operativa solo por estar traducida.",
      items: [
        { status: "Operativo", title: "Sitio corporativo de Hermes", body: "Ecosistema público multilingüe con publicación controlada, propietarios canónicos por idioma y comprobaciones automatizadas." },
        { status: "Operativo", title: "Hermes Connect · Talleres", body: "El vertical público operativo actual de Hermes Connect reúne servicios, disponibilidad, reservas, clientes y vehículos en un mismo flujo." },
        { status: "Servicio por etapas", title: "Hermes Technology", body: "Sitios, portales, módulos CRM, automatización, asistentes empresariales e integraciones se desarrollan según el alcance acordado; no significa que cada capacidad esté activa para todos los clientes." },
        { status: "Según estado verificado", title: "Otras configuraciones de Hermes Connect", body: "El estado de Academy, Beauty, Logistics, Marketing, Professional Services y otras configuraciones lo determina su página canónica; las superficies de demostración o referencia no se presentan como funciones de producción." },
      ],
    },
    contact: {
      eyebrow: "Siguiente paso", title: "Cuéntenos qué debería funcionar mejor en su empresa.",
      body: "Describa su empresa, tres proyectos deseados, referencias, país, región y ritmo de inversión. Prepararemos la lógica de la siguiente etapa.",
      button: "Enviar la descripción por email", note: "Por ahora, las consultas se reciben por email. El brief por voz y su análisis con AI están previstos para una siguiente etapa.",
    },
  },
  it: {
    locale: "it",
    path: "/it/",
    metaTitle: "Hermes | Logistica, marketing, accademia e sviluppo IT",
    metaDescription: "Hermes integra logistica, marketing, formazione aziendale pratica e sviluppo IT per imprese negli Stati Uniti e partner internazionali.",
    heroImageAlt: "Quattro portali architettonici illuminati che rappresentano le direzioni di business di Hermes",
    hero: {
      eyebrow: "Logistica · Crescita · Formazione · Tecnologia",
      title: "Quattro aree. Un ecosistema per crescere.",
      body: "Partite dalla priorità di oggi: operazioni logistiche, marketing, formazione del team o un prodotto digitale per l'azienda.",
      primary: "Scegli un'area",
      secondary: "Scrivi al team",
    },
    intro: {
      eyebrow: "Il sistema Hermes",
      title: "Non realizziamo servizi isolati. Costruiamo la prossima fase operativa dell'azienda.",
      body: "Un'area può essere il punto di partenza. Poi colleghiamo tecnologia, domanda, competenze del team e operazioni in una roadmap realistica.",
    },
    directions: [
      {
        id: "logistics", number: "01", brand: "Hermes Logistics", title: "Merci in movimento con un supporto operativo chiaro.",
        body: "Dispatch, documentazione, coordinamento dei vettori e Car Hauling per vettori indipendenti, mittenti e concessionari negli Stati Uniti.",
        points: ["Vettori e flotte", "Mittenti e concessionari", "Car Hauling e supporto operativo"], cta: "Richiedi informazioni sulla logistica",
        image: "/images/path-logistics-system.jpg", imageAlt: "Sistema di rotte e operazioni logistiche",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Trasformate l'attenzione in una crescita misurabile.",
        body: "Strategia web, SEO/GEO, social media, posizionamento, campagne, lead generation, processo di vendita e misurazione attorno a un obiettivo aziendale definito.",
        points: ["Strategia e posizionamento", "Contenuti e sviluppo della domanda", "Vendite, CRM e analisi"], cta: "Richiedi informazioni sul marketing",
        image: "/images/path-marketing-system.jpg", imageAlt: "Sistema di marketing, pubblico e analisi",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Competenze pratiche collegate al lavoro reale.",
        body: "Hermes Business Academy presenta pubblicamente percorsi pratici di logistica USA, marketing, IT e AI, vendite e COO / operations. Le condizioni esatte di ogni selezione, pratica e disponibilità vengono confermate separatamente.",
        points: ["Logistica USA", "Marketing · IT e AI · Vendite", "COO / Operations"], cta: "Richiedi informazioni sulla formazione",
        image: "/images/path-academy-system.jpg", imageAlt: "Ambiente di formazione aziendale pratica",
      },
      {
        id: "technology", number: "04", brand: "Hermes Technology", title: "Prodotti digitali progettati intorno alla vostra azienda.",
        body: "Hermes Technology trasforma processi aziendali definiti in siti web su misura, portali, moduli CRM, automazione dei flussi di lavoro, assistenti aziendali, integrazioni e software di settore sviluppato in fasi controllate.",
        points: ["Siti, portali e applicazioni", "CRM e sistemi operativi", "Assistenti AI e integrazioni"], cta: "Descrivi un progetto IT",
        image: "/images/path-technology-portal.jpg", imageAlt: "Portale digitale Hermes Technology",
      },
    ],
    partnership: {
      eyebrow: "Una partnership per sviluppare l'azienda",
      title: "Iniziate con un passo sostenibile. Ampliate il sistema con i risultati.",
      body: "Definiamo il primo prodotto in base alla fase e alla capacità di investimento dell'azienda, collegando nuove aree quando generano valore.",
      items: [
        { title: "Technology", body: "Creiamo il prodotto digitale e la base operativa." },
        { title: "Marketing", body: "Costruiamo domanda, contenuti e percorso del cliente." },
        { title: "Academy", body: "Prepariamo il team a nuovi processi e sistemi." },
        { title: "Logistics", body: "Valutiamo operazioni fisiche, coordinamento ed espansione logistica." },
      ],
      note: "L'espansione logistica internazionale viene valutata separatamente dopo aver verificato domanda, licenze, partner ed economia del mercato.",
    },
    capabilities: {
      eyebrow: "Stato attuale dei prodotti",
      title: "Separiamo i prodotti operativi dai concetti preliminari e dallo sviluppo per fasi.",
      body: "Lo stato di ogni versione linguistica deve corrispondere alla relativa pagina canonica: una dimostrazione, un concetto o un’integrazione non diventano operativi solo perché tradotti.",
      items: [
        { status: "Operativo", title: "Sito corporate Hermes", body: "Ecosistema pubblico multilingue con rilascio controllato, pagine canoniche per lingua e verifiche automatizzate." },
        { status: "Operativo", title: "Hermes Connect · Officine", body: "Il verticale pubblico operativo attuale di Hermes Connect riunisce servizi, disponibilità, prenotazioni, clienti e veicoli in un unico flusso." },
        { status: "Servizio per fasi", title: "Hermes Technology", body: "Siti, portali, moduli CRM, automazione, assistenti aziendali e integrazioni vengono sviluppati secondo l’ambito concordato; non significa che ogni capacità sia già attiva per ogni cliente." },
        { status: "Secondo stato verificato", title: "Altre configurazioni Hermes Connect", body: "Lo stato di Academy, Beauty, Logistics, Marketing, Professional Services e delle altre configurazioni è definito dalla rispettiva pagina canonica; dimostrazioni e superfici di riferimento non vengono presentate come funzioni operative." },
      ],
    },
    contact: {
      eyebrow: "Prossimo passo", title: "Raccontateci cosa dovrebbe funzionare meglio nella vostra azienda.",
      body: "Descrivete l'azienda, tre progetti desiderati, riferimenti, paese, regione e ritmo di investimento. Prepareremo la logica della fase successiva.",
      button: "Invia la descrizione via email", note: "Per ora le richieste arrivano via email. Il brief vocale e l'analisi AI sono previsti per una fase successiva.",
    },
  },
  fr: {
    locale: "fr",
    path: "/fr/",
    metaTitle: "Hermes | Logistique, marketing, académie et développement IT",
    metaDescription: "Hermes réunit logistique, marketing, formation professionnelle et développement IT pour les entreprises aux États-Unis et leurs partenaires internationaux.",
    heroImageAlt: "Quatre portails architecturaux illuminés représentant les directions commerciales de Hermes",
    hero: {
      eyebrow: "Logistique · Croissance · Formation · Technologie",
      title: "Quatre pôles. Un écosystème pour grandir.",
      body: "Commencez par votre priorité actuelle : opérations logistiques, marketing, formation de l'équipe ou produit numérique pour l'entreprise.",
      primary: "Choisir un pôle",
      secondary: "Écrire à l'équipe",
    },
    intro: {
      eyebrow: "Le système Hermes",
      title: "Nous ne créons pas des services isolés. Nous construisons la prochaine étape opérationnelle de votre entreprise.",
      body: "Un pôle peut être le point de départ. Nous relions ensuite technologie, demande, compétences de l'équipe et opérations dans une feuille de route réaliste.",
    },
    directions: [
      {
        id: "logistics", number: "01", brand: "Hermes Logistics", title: "Des marchandises en mouvement avec un soutien opérationnel clair.",
        body: "Dispatch, documentation, coordination des transporteurs et Car Hauling pour transporteurs indépendants, expéditeurs et concessionnaires aux États-Unis.",
        points: ["Transporteurs et flottes", "Expéditeurs et concessionnaires", "Car Hauling et soutien opérationnel"], cta: "Demander des informations logistiques",
        image: "/images/path-logistics-system.jpg", imageAlt: "Système de routes et d'opérations logistiques",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Transformez l'attention en croissance mesurable.",
        body: "Stratégie web, SEO/GEO, réseaux sociaux, positionnement, campagnes, génération de prospects, processus commercial et mesure autour d’un objectif d’entreprise défini.",
        points: ["Stratégie et positionnement", "Contenu et création de la demande", "Ventes, CRM et analyse"], cta: "Demander des informations marketing",
        image: "/images/path-marketing-system.jpg", imageAlt: "Système de marketing, audiences et analyse",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Des compétences pratiques liées au travail réel.",
        body: "Hermes Business Academy présente publiquement des parcours pratiques en logistique américaine, marketing, IT et IA, ventes et COO / opérations. Les conditions exactes de chaque sélection, pratique et disponibilité sont confirmées séparément.",
        points: ["Logistique américaine", "Marketing · IT et IA · Ventes", "COO / Opérations"], cta: "Demander des informations sur la formation",
        image: "/images/path-academy-system.jpg", imageAlt: "Environnement de formation professionnelle pratique",
      },
      {
        id: "technology", number: "04", brand: "Hermes Technology", title: "Des produits numériques conçus autour de votre entreprise.",
        body: "Hermes Technology transforme des processus métier définis en sites web sur mesure, portails, modules CRM, automatisation des flux, assistants métier, intégrations et logiciels sectoriels développés par étapes contrôlées.",
        points: ["Sites, portails et applications", "CRM et systèmes opérationnels", "Assistants AI et intégrations"], cta: "Décrire un projet IT",
        image: "/images/path-technology-portal.jpg", imageAlt: "Portail numérique Hermes Technology",
      },
    ],
    partnership: {
      eyebrow: "Un partenariat pour développer l'entreprise",
      title: "Commencez par une étape accessible. Élargissez le système avec les résultats.",
      body: "Nous définissons le premier produit selon le stade et la capacité d'investissement de l'entreprise, puis connectons de nouveaux pôles lorsqu'ils créent de la valeur.",
      items: [
        { title: "Technology", body: "Nous créons le produit numérique et la base opérationnelle." },
        { title: "Marketing", body: "Nous développons la demande, le contenu et le parcours client." },
        { title: "Academy", body: "Nous préparons les équipes aux nouveaux processus et systèmes." },
        { title: "Logistics", body: "Nous évaluons les opérations physiques, la coordination et l'expansion logistique." },
      ],
      note: "L'expansion logistique internationale est étudiée séparément après validation de la demande, des licences, des partenaires et de l'économie du marché.",
    },
    capabilities: {
      eyebrow: "État actuel des produits",
      title: "Nous séparons les produits opérationnels des concepts préliminaires et du développement par étapes.",
      body: "Le statut de chaque version linguistique doit correspondre à son propriétaire canonique : une démo, un concept ou une intégration ne devient pas opérationnel simplement parce qu’il est traduit.",
      items: [
        { status: "Opérationnel", title: "Site corporate Hermes", body: "Écosystème public multilingue avec publication contrôlée, propriétaires canoniques par langue et vérifications automatisées." },
        { status: "Opérationnel", title: "Hermes Connect · Ateliers", body: "Le vertical public opérationnel actuel de Hermes Connect réunit services, disponibilités, réservations, clients et véhicules dans un même flux." },
        { status: "Service par étapes", title: "Hermes Technology", body: "Sites, portails, modules CRM, automatisation, assistants métier et intégrations sont développés selon le périmètre convenu ; cela ne signifie pas que chaque capacité est déjà active pour chaque client." },
        { status: "Selon le statut vérifié", title: "Autres configurations Hermes Connect", body: "Le statut d’Academy, Beauty, Logistics, Marketing, Professional Services et des autres configurations est défini par leur page canonique ; les surfaces de démonstration ou de référence ne sont pas présentées comme des fonctions de production." },
      ],
    },
    contact: {
      eyebrow: "Prochaine étape", title: "Dites-nous ce qui devrait mieux fonctionner dans votre entreprise.",
      body: "Décrivez votre entreprise, trois projets souhaités, des références, votre pays, votre région et votre rythme d'investissement. Nous préparerons la logique de l'étape suivante.",
      button: "Envoyer la description par email", note: "Pour le moment, les demandes sont reçues par email. Le brief vocal et son analyse AI sont prévus pour une étape ultérieure.",
    },
  },
};
