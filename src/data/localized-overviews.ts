export type LocalizedOverview = {
  locale: "uk" | "ru" | "es" | "it" | "fr";
  path: "/ua/" | "/ru/" | "/es/" | "/it/" | "/fr/";
  metaTitle: string;
  metaDescription: string;
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
        body: "Диспетчеризація, документи, координація перевізників і Car Hauling для перевізників, owner-operators, відправників та дилерів на ринку США.",
        points: ["Перевізники та автопарки", "Відправники й дилери", "Car Hauling та операційна підтримка"], cta: "Запит щодо логістики",
        image: "/images/path-logistics-system.jpg", imageAlt: "Система логістичних маршрутів і операцій",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Перетворюйте увагу на керовану систему зростання.",
        body: "Позиціонування, контент, органічне просування, рекламні кампанії, лідогенерація, процес продажів і медіаплани на 3, 6, 9 або 12 місяців.",
        points: ["Стратегія та позиціонування", "Контент і залучення попиту", "Продажі, CRM та аналітика"], cta: "Запит щодо маркетингу",
        image: "/images/path-marketing-system.jpg", imageAlt: "Маркетингова система контенту, аудиторій та аналітики",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Практичні навички, пов'язані з реальною роботою.",
        body: "Навчальні напрями з логістики, маркетингу та операційного управління, а також внутрішні програми адаптації й розвитку команди під процеси компанії.",
        points: ["Логістичні операції", "Маркетинг і продажі", "COO та операційне управління"], cta: "Запит щодо навчання",
        image: "/images/path-academy-system.jpg", imageAlt: "Архітектурне середовище практичного навчання",
      },
      {
        id: "technology", number: "04", brand: "Hermes IT Development", title: "Цифрові продукти навколо того, як працює ваш бізнес.",
        body: "Сайти, застосунки, CRM, системи запису й оплати, автоматизація, аналітика, інтеграції та AI-асистенти для клієнтських і внутрішніх процесів.",
        points: ["Сайти, портали та застосунки", "CRM й операційні системи", "AI-асистенти та інтеграції"], cta: "Описати IT-проєкт",
        image: "/images/path-technology-portal.jpg", imageAlt: "Цифровий портал Hermes IT Development",
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
      eyebrow: "Що ми вже можемо показати",
      title: "Реальні продукти, прототипи та готові до розробки можливості.",
      body: "Ми чітко розрізняємо те, що вже працює, що протестовано як прототип і що може бути створено після уточнення задачі.",
      items: [
        { status: "Працює", title: "Корпоративний вебпродукт", body: "Адаптивний багатонапрямний сайт, автоматичне браузерне тестування та контрольований випуск." },
        { status: "Працює", title: "Електронний бриф", body: "Перетворює вільний опис ідей, приклади, бюджет і ринок на структурований запит." },
        { status: "Робочий прототип", title: "CRM та операційний контроль", body: "Структурований прийом даних, перевірка дублів, черги review, маршрутизація та управлінські результати." },
        { status: "Готово до проєктування", title: "AI та messaging-асистенти", body: "Telegram, WhatsApp, Instagram, Messenger, Google Chat, email і web за наявності офіційного доступу платформи." },
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
        body: "Диспетчеризация, документы, координация перевозчиков и Car Hauling для перевозчиков, owner-operators, отправителей и дилеров на рынке США.",
        points: ["Перевозчики и автопарки", "Отправители и дилеры", "Car Hauling и операционная поддержка"], cta: "Запрос по логистике",
        image: "/images/path-logistics-system.jpg", imageAlt: "Система логистических маршрутов и операций",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Превращайте внимание в управляемую систему роста.",
        body: "Позиционирование, контент, органическое продвижение, рекламные кампании, лидогенерация, процесс продаж и медиапланы на 3, 6, 9 или 12 месяцев.",
        points: ["Стратегия и позиционирование", "Контент и создание спроса", "Продажи, CRM и аналитика"], cta: "Запрос по маркетингу",
        image: "/images/path-marketing-system.jpg", imageAlt: "Маркетинговая система контента, аудиторий и аналитики",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Практические навыки, связанные с реальной работой.",
        body: "Обучение логистике, маркетингу и операционному управлению, а также внутренние программы адаптации и развития команды под процессы компании.",
        points: ["Логистические операции", "Маркетинг и продажи", "COO и операционное управление"], cta: "Запрос по обучению",
        image: "/images/path-academy-system.jpg", imageAlt: "Архитектурная среда практического обучения",
      },
      {
        id: "technology", number: "04", brand: "Hermes IT Development", title: "Цифровые продукты вокруг того, как работает ваш бизнес.",
        body: "Сайты, приложения, CRM, системы записи и оплаты, автоматизация, аналитика, интеграции и AI-ассистенты для клиентских и внутренних процессов.",
        points: ["Сайты, порталы и приложения", "CRM и операционные системы", "AI-ассистенты и интеграции"], cta: "Описать IT-проект",
        image: "/images/path-technology-portal.jpg", imageAlt: "Цифровой портал Hermes IT Development",
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
      eyebrow: "Что мы уже можем показать",
      title: "Реальные продукты, прототипы и готовые к разработке возможности.",
      body: "Мы чётко различаем то, что уже работает, что протестировано как прототип и что может быть создано после уточнения задачи.",
      items: [
        { status: "Работает", title: "Корпоративный веб-продукт", body: "Адаптивный многонаправленный сайт, автоматическое браузерное тестирование и контролируемый выпуск." },
        { status: "Работает", title: "Электронный бриф", body: "Преобразует свободное описание идей, примеры, бюджет и рынок в структурированный запрос." },
        { status: "Рабочий прототип", title: "CRM и операционный контроль", body: "Структурированный приём данных, проверка дублей, очереди review, маршрутизация и управленческие результаты." },
        { status: "Готово к проектированию", title: "AI и messaging-ассистенты", body: "Telegram, WhatsApp, Instagram, Messenger, Google Chat, email и web при наличии официального доступа платформы." },
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
        body: "Despacho, documentación, coordinación de transportistas y Car Hauling para carriers, owner-operators, remitentes y concesionarios en Estados Unidos.",
        points: ["Transportistas y flotas", "Remitentes y concesionarios", "Car Hauling y soporte operativo"], cta: "Consultar sobre logística",
        image: "/images/path-logistics-system.jpg", imageAlt: "Sistema de rutas y operaciones logísticas",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Convierta la atención en un sistema de crecimiento medible.",
        body: "Posicionamiento, contenido, crecimiento orgánico, campañas, generación de leads, procesos comerciales y planes de medios de 3, 6, 9 o 12 meses.",
        points: ["Estrategia y posicionamiento", "Contenido y generación de demanda", "Ventas, CRM y analítica"], cta: "Consultar sobre marketing",
        image: "/images/path-marketing-system.jpg", imageAlt: "Sistema de marketing, audiencias y analítica",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Habilidades prácticas conectadas con el trabajo real.",
        body: "Formación en logística, marketing y gestión operativa, además de programas internos de adaptación y desarrollo para equipos.",
        points: ["Operaciones logísticas", "Marketing y ventas", "Dirección operativa"], cta: "Consultar sobre formación",
        image: "/images/path-academy-system.jpg", imageAlt: "Entorno de formación empresarial práctica",
      },
      {
        id: "technology", number: "04", brand: "Hermes IT Development", title: "Productos digitales diseñados alrededor de su empresa.",
        body: "Sitios web, aplicaciones, CRM, reservas y pagos, automatización, analítica, integraciones y asistentes con AI para procesos internos y de clientes.",
        points: ["Sitios, portales y aplicaciones", "CRM y sistemas operativos", "Asistentes con AI e integraciones"], cta: "Describir un proyecto IT",
        image: "/images/path-technology-portal.jpg", imageAlt: "Portal digital de Hermes IT Development",
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
      eyebrow: "Lo que ya podemos mostrar",
      title: "Productos reales, prototipos y capacidades listas para diseñar.",
      body: "Diferenciamos con claridad lo que ya funciona, lo que ha sido probado como prototipo y lo que puede construirse después de definir la necesidad.",
      items: [
        { status: "Operativo", title: "Producto web corporativo", body: "Sitio multidivisión adaptable, pruebas automatizadas en navegador y publicación controlada." },
        { status: "Operativo", title: "Brief digital", body: "Convierte ideas, referencias, presupuesto y mercado en una solicitud estructurada." },
        { status: "Prototipo funcional", title: "CRM y control operativo", body: "Entrada estructurada, detección de duplicados, revisión, enrutamiento e informes." },
        { status: "Listo para diseñar", title: "Asistentes AI y mensajería", body: "Telegram, WhatsApp, Instagram, Messenger, Google Chat, email y web, según el acceso oficial de cada plataforma." },
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
    metaTitle: "Hermes | Logistica, marketing, academy e sviluppo IT",
    metaDescription: "Hermes integra logistica, marketing, formazione aziendale pratica e sviluppo IT per imprese negli Stati Uniti e partner internazionali.",
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
        body: "Dispatch, documentazione, coordinamento dei vettori e Car Hauling per carrier, owner-operator, mittenti e concessionari negli Stati Uniti.",
        points: ["Vettori e flotte", "Mittenti e concessionari", "Car Hauling e supporto operativo"], cta: "Richiedi informazioni sulla logistica",
        image: "/images/path-logistics-system.jpg", imageAlt: "Sistema di rotte e operazioni logistiche",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Trasformate l'attenzione in una crescita misurabile.",
        body: "Posizionamento, contenuti, crescita organica, campagne, lead generation, processi di vendita e media plan da 3, 6, 9 o 12 mesi.",
        points: ["Strategia e posizionamento", "Contenuti e sviluppo della domanda", "Vendite, CRM e analisi"], cta: "Richiedi informazioni sul marketing",
        image: "/images/path-marketing-system.jpg", imageAlt: "Sistema di marketing, pubblico e analisi",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Competenze pratiche collegate al lavoro reale.",
        body: "Formazione in logistica, marketing e gestione operativa, oltre a programmi interni di onboarding e sviluppo del team.",
        points: ["Operazioni logistiche", "Marketing e vendite", "Direzione operativa"], cta: "Richiedi informazioni sulla formazione",
        image: "/images/path-academy-system.jpg", imageAlt: "Ambiente di formazione aziendale pratica",
      },
      {
        id: "technology", number: "04", brand: "Hermes IT Development", title: "Prodotti digitali progettati intorno alla vostra azienda.",
        body: "Siti, applicazioni, CRM, prenotazioni e pagamenti, automazione, analisi, integrazioni e assistenti AI per processi interni e clienti.",
        points: ["Siti, portali e applicazioni", "CRM e sistemi operativi", "Assistenti AI e integrazioni"], cta: "Descrivi un progetto IT",
        image: "/images/path-technology-portal.jpg", imageAlt: "Portale digitale Hermes IT Development",
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
      eyebrow: "Cosa possiamo già mostrare",
      title: "Prodotti reali, prototipi e capacità pronte per la progettazione.",
      body: "Distinguiamo chiaramente ciò che è operativo, ciò che è stato testato come prototipo e ciò che può essere realizzato dopo la definizione dell'esigenza.",
      items: [
        { status: "Operativo", title: "Prodotto web corporate", body: "Sito responsive multi-divisione, test automatici nel browser e rilascio controllato." },
        { status: "Operativo", title: "Brief digitale", body: "Trasforma idee, riferimenti, budget e mercato in una richiesta strutturata." },
        { status: "Prototipo funzionale", title: "CRM e controllo operativo", body: "Acquisizione strutturata, controllo duplicati, review, routing e report." },
        { status: "Pronto da progettare", title: "Assistenti AI e messaggistica", body: "Telegram, WhatsApp, Instagram, Messenger, Google Chat, email e web, in base agli accessi ufficiali della piattaforma." },
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
        body: "Dispatch, documentation, coordination des transporteurs et Car Hauling pour carriers, owner-operators, expéditeurs et concessionnaires aux États-Unis.",
        points: ["Transporteurs et flottes", "Expéditeurs et concessionnaires", "Car Hauling et soutien opérationnel"], cta: "Demander des informations logistiques",
        image: "/images/path-logistics-system.jpg", imageAlt: "Système de routes et d'opérations logistiques",
      },
      {
        id: "marketing", number: "02", brand: "Hermes Marketing · ProgressoPro", title: "Transformez l'attention en croissance mesurable.",
        body: "Positionnement, contenu, croissance organique, campagnes, génération de prospects, processus commercial et plans médias sur 3, 6, 9 ou 12 mois.",
        points: ["Stratégie et positionnement", "Contenu et création de la demande", "Ventes, CRM et analyse"], cta: "Demander des informations marketing",
        image: "/images/path-marketing-system.jpg", imageAlt: "Système de marketing, audiences et analyse",
      },
      {
        id: "academy", number: "03", brand: "Hermes Business Academy", title: "Des compétences pratiques liées au travail réel.",
        body: "Formation en logistique, marketing et gestion opérationnelle, ainsi que programmes internes d'intégration et de développement des équipes.",
        points: ["Opérations logistiques", "Marketing et ventes", "Direction opérationnelle"], cta: "Demander des informations sur la formation",
        image: "/images/path-academy-system.jpg", imageAlt: "Environnement de formation professionnelle pratique",
      },
      {
        id: "technology", number: "04", brand: "Hermes IT Development", title: "Des produits numériques conçus autour de votre entreprise.",
        body: "Sites, applications, CRM, réservation et paiement, automatisation, analyse, intégrations et assistants AI pour les processus internes et clients.",
        points: ["Sites, portails et applications", "CRM et systèmes opérationnels", "Assistants AI et intégrations"], cta: "Décrire un projet IT",
        image: "/images/path-technology-portal.jpg", imageAlt: "Portail numérique Hermes IT Development",
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
      eyebrow: "Ce que nous pouvons déjà montrer",
      title: "Des produits réels, des prototypes et des capacités prêtes à concevoir.",
      body: "Nous distinguons clairement ce qui fonctionne déjà, ce qui a été testé comme prototype et ce qui peut être réalisé après définition du besoin.",
      items: [
        { status: "Opérationnel", title: "Produit web corporate", body: "Site responsive multi-activité, tests automatisés dans le navigateur et mise en production contrôlée." },
        { status: "Opérationnel", title: "Brief numérique", body: "Transforme idées, références, budget et marché en une demande structurée." },
        { status: "Prototype fonctionnel", title: "CRM et contrôle opérationnel", body: "Collecte structurée, détection des doublons, revue, routage et rapports." },
        { status: "Prêt à concevoir", title: "Assistants AI et messagerie", body: "Telegram, WhatsApp, Instagram, Messenger, Google Chat, email et web, selon les accès officiels de chaque plateforme." },
      ],
    },
    contact: {
      eyebrow: "Prochaine étape", title: "Dites-nous ce qui devrait mieux fonctionner dans votre entreprise.",
      body: "Décrivez votre entreprise, trois projets souhaités, des références, votre pays, votre région et votre rythme d'investissement. Nous préparerons la logique de l'étape suivante.",
      button: "Envoyer la description par email", note: "Pour le moment, les demandes sont reçues par email. Le brief vocal et son analyse AI sont prévus pour une étape ultérieure.",
    },
  },
};
