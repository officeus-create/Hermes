import { academyLogisticsOwnerRoutes, type DirectionId, type LocalizedSiteLocale } from "./localized-direction-owners";

export type LocalizedDirectionCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  detail: string;
  boundary: string;
  related: Array<{ label: string; href: string; body: string }>;
};

export type LocalizedDirectionUi = {
  home: string;
  directionHub: string;
  scopeEyebrow: string;
  scopeTitle: string;
  scopeIntro: string;
  processEyebrow: string;
  processTitle: string;
  processIntro: string;
  process: Array<{ title: string; body: string; link?: { label: string; href: string } }>;
  boundaryEyebrow: string;
  boundaryTitle: string;
  relatedEyebrow: string;
  relatedTitle: string;
  faqEyebrow: string;
  faqTitle: string;
  faq: Array<{ question: string; answer: string }>;
  contactEyebrow: string;
  contactTitle: string;
  contactBody: string;
  contactButton: string;
  emailSubject: string;
};

export const localizedDirectionUi: Record<LocalizedSiteLocale, LocalizedDirectionUi> = {
  uk: {
    home: "Головна", directionHub: "Усі напрями Hermes", scopeEyebrow: "Що входить", scopeTitle: "Один напрям — чіткий набір задач.",
    scopeIntro: "Ця сторінка є мовним власником напряму. Нижче — фактичний публічний обсяг і прямі переходи до чинних продуктів та форм звернення.",
    processEyebrow: "Як почати", processTitle: "Від пошукового запиту до перевіреної наступної дії.", processIntro: "Ми не підміняємо результат сторінками. Спочатку визначаємо потребу, потім ведемо до конкретного продукту, заявки або контакту й вимірюємо реальну дію.",
    process: [
      { title: "1. Визначити потребу", body: "Сформулюйте задачу, аудиторію, ринок і найближчий бізнес-результат." },
      { title: "2. Перевірити обсяг", body: "Зіставте задачу з поточними можливостями, обмеженнями та доказами Hermes." },
      { title: "3. Перейти до канонічної сторінки", body: "Відкрийте точну сторінку продукту, програму або контрольований канал звернення." },
      { title: "4. Виміряти дію", body: "Кваліфікована заявка, дзвінок, електронний лист або інша підтверджена передача звернення важливіші за сам перегляд." },
    ],
    boundaryEyebrow: "Межа обіцянок", boundaryTitle: "Публікуємо тільки те, що можемо описати правдиво.",
    relatedEyebrow: "Наступний крок", relatedTitle: "Перейдіть до конкретного продукту або ресурсу.",
    faqEyebrow: "FAQ", faqTitle: "Що важливо знати перед зверненням.",
    faq: [
      { question: "Чи можна звертатися українською?", answer: "Так. Ця сторінка дає україномовний вхід у напрям. Для роботи з ринком США окремі операційні ролі, дзвінки або переговори можуть вимагати робочої англійської." },
      { question: "Чи гарантує Hermes результат, позицію в Google, дохід або роботу?", answer: "Ні. Умови, доступність, ціни, строки, місткість, результати та інші комерційні параметри підтверджуються для конкретної пропозиції; зовнішній результат не гарантується." },
      { question: "З чого почати?", answer: "Відкрийте найближчу до вашої задачі публічну сторінку напряму нижче або надішліть короткий опис компанії, задачі, країни та бажаного результату." },
    ],
    contactEyebrow: "Кваліфікований запит", contactTitle: "Опишіть задачу, яку потрібно вирішити.", contactBody: "Вкажіть компанію, країну або ринок, поточну проблему, бажаний результат і напрям Hermes. Команда зможе віднести запит до правильного робочого потоку.", contactButton: "Надіслати запит", emailSubject: "Hermes · запит українською",
  },
  ru: {
    home: "Главная", directionHub: "Все направления Hermes", scopeEyebrow: "Что входит", scopeTitle: "Одно направление — понятный набор задач.",
    scopeIntro: "Эта страница является русскоязычным владельцем направления. Ниже — фактический публичный объём и прямые переходы к действующим продуктам и каналам обращения.",
    processEyebrow: "Как начать", processTitle: "От поискового запроса до проверяемого следующего действия.", processIntro: "Мы не подменяем результат количеством страниц. Сначала определяем потребность, затем ведём к конкретному продукту, заявке или контакту и измеряем реальное действие.",
    process: [
      { title: "1. Определить задачу", body: "Сформулируйте проблему, аудиторию, рынок и ближайший бизнес-результат." },
      { title: "2. Проверить объём", body: "Сопоставьте задачу с текущими возможностями, ограничениями и доказательствами Hermes." },
      { title: "3. Перейти к канонической странице", body: "Откройте точную страницу продукта, программу или контролируемый канал обращения." },
      { title: "4. Измерить действие", body: "Квалифицированная заявка, звонок, электронное письмо или другая подтверждённая передача обращения важнее самого просмотра." },
    ],
    boundaryEyebrow: "Граница обещаний", boundaryTitle: "Публикуем только то, что можем описать правдиво.",
    relatedEyebrow: "Следующий шаг", relatedTitle: "Перейдите к конкретному продукту или ресурсу.",
    faqEyebrow: "FAQ", faqTitle: "Что важно знать до обращения.",
    faq: [
      { question: "Можно ли обращаться на русском?", answer: "Да. Эта страница даёт русскоязычный вход в направление. Для работы с рынком США отдельные операционные роли, звонки и переговоры могут требовать рабочего английского." },
      { question: "Гарантирует ли Hermes результат, позицию в Google, доход или работу?", answer: "Нет. Условия, доступность, цены, сроки, вместимость, результаты и другие коммерческие параметры подтверждаются для конкретного предложения; внешний результат не гарантируется." },
      { question: "С чего начать?", answer: "Откройте наиболее близкую к вашей задаче публичную страницу направления ниже или отправьте краткое описание компании, задачи, страны и желаемого результата." },
    ],
    contactEyebrow: "Квалифицированный запрос", contactTitle: "Опишите задачу, которую нужно решить.", contactBody: "Укажите компанию, страну или рынок, текущую проблему, желаемый результат и направление Hermes. Команда сможет направить запрос в правильный рабочий поток.", contactButton: "Отправить запрос", emailSubject: "Hermes · запрос на русском",
  },
  es: {
    home: "Inicio", directionHub: "Todas las áreas de Hermes", scopeEyebrow: "Qué incluye", scopeTitle: "Un área, un conjunto claro de necesidades.",
    scopeIntro: "Esta página es el propietario en español de esta área. Resume el alcance público verificable y enlaza directamente con los productos y canales de contacto vigentes.",
    processEyebrow: "Cómo empezar", processTitle: "De una búsqueda a una siguiente acción verificable.", processIntro: "No sustituimos resultados por más páginas. Primero definimos la necesidad, después llevamos al producto, solicitud o contacto correcto y medimos una acción real.",
    process: [
      { title: "1. Definir la necesidad", body: "Describa el problema, la audiencia, el mercado y el siguiente resultado empresarial que necesita." },
      { title: "2. Confirmar el alcance", body: "Compare la necesidad con las capacidades, límites y pruebas actuales de Hermes." },
      { title: "3. Abrir la página canónica correcta", body: "Vaya a la página exacta del producto, programa o canal de contacto controlado." },
      { title: "4. Medir la acción", body: "Una consulta cualificada, una llamada, un correo electrónico u otra entrega confirmada importan más que una visita aislada." },
    ],
    boundaryEyebrow: "Límite de promesas", boundaryTitle: "Publicamos solo lo que podemos describir con precisión.",
    relatedEyebrow: "Siguiente paso", relatedTitle: "Abra el producto o recurso que corresponde a su necesidad.",
    faqEyebrow: "Preguntas frecuentes", faqTitle: "Lo que conviene saber antes de contactar.",
    faq: [
      { question: "¿Puedo contactar en español?", answer: "Sí. Esta página ofrece una entrada pública en español. Algunas tareas operativas del mercado estadounidense, llamadas o negociaciones pueden requerir inglés de trabajo." },
      { question: "¿Hermes garantiza resultados, posiciones en Google, ingresos o empleo?", answer: "No. Alcance, disponibilidad, precios, plazos, capacidad y otras condiciones se confirman para cada oferta concreta; no se garantiza un resultado externo." },
      { question: "¿Cómo empiezo?", answer: "Abra la página pública más cercana a su necesidad o envíe una descripción breve de la empresa, el problema, el país y el resultado deseado." },
    ],
    contactEyebrow: "Consulta cualificada", contactTitle: "Describa el problema que necesita resolver.", contactBody: "Incluya empresa, país o mercado, problema actual, resultado deseado y área de Hermes. Así la consulta puede llegar al flujo de trabajo adecuado.", contactButton: "Enviar consulta", emailSubject: "Hermes · consulta en español",
  },
  it: {
    home: "Home", directionHub: "Tutte le aree Hermes", scopeEyebrow: "Cosa include", scopeTitle: "Un'area, un insieme chiaro di esigenze.",
    scopeIntro: "Questa è la pagina canonica italiana dell'area. Riassume l'ambito pubblico verificabile e collega direttamente ai prodotti e ai canali di contatto attuali.",
    processEyebrow: "Come iniziare", processTitle: "Dalla ricerca alla prossima azione verificabile.", processIntro: "Non sostituiamo i risultati con più pagine. Definiamo prima il bisogno, poi portiamo al prodotto, alla richiesta o al contatto corretto e misuriamo un'azione reale.",
    process: [
      { title: "1. Definire il bisogno", body: "Descrivete il problema, il pubblico, il mercato e il prossimo risultato aziendale necessario." },
      { title: "2. Confermare l'ambito", body: "Confrontate il bisogno con capacità, limiti ed evidenze attuali di Hermes." },
      { title: "3. Aprire la pagina canonica corretta", body: "Passate alla pagina esatta del prodotto, al programma o al canale di contatto controllato." },
      { title: "4. Misurare l'azione", body: "Una richiesta qualificata, una chiamata, un'email o un altro passaggio confermato contano più di una semplice visita." },
    ],
    boundaryEyebrow: "Limite delle promesse", boundaryTitle: "Pubblichiamo solo ciò che possiamo descrivere con precisione.",
    relatedEyebrow: "Prossimo passo", relatedTitle: "Aprite il prodotto o la risorsa più adatta al bisogno.",
    faqEyebrow: "FAQ", faqTitle: "Cosa sapere prima di contattarci.",
    faq: [
      { question: "Posso contattarvi in italiano?", answer: "Sì. Questa pagina offre un ingresso pubblico in italiano. Alcune attività operative sul mercato statunitense, chiamate o negoziazioni possono richiedere inglese operativo." },
      { question: "Hermes garantisce risultati, posizioni Google, reddito o lavoro?", answer: "No. Ambito, disponibilità, prezzi, tempi, capacità e altre condizioni vengono confermati per ogni offerta specifica; non viene garantito un risultato esterno." },
      { question: "Da dove inizio?", answer: "Aprite la pagina pubblica più vicina al bisogno oppure inviate una breve descrizione dell'azienda, del problema, del paese e del risultato desiderato." },
    ],
    contactEyebrow: "Richiesta qualificata", contactTitle: "Descrivete il problema che volete risolvere.", contactBody: "Indicate azienda, paese o mercato, problema attuale, risultato desiderato e area Hermes. La richiesta potrà essere instradata nel flusso corretto.", contactButton: "Invia richiesta", emailSubject: "Hermes · richiesta in italiano",
  },
  fr: {
    home: "Accueil", directionHub: "Toutes les activités Hermes", scopeEyebrow: "Ce qui est inclus", scopeTitle: "Un pôle, un ensemble clair de besoins.",
    scopeIntro: "Cette page est le propriétaire francophone de ce pôle. Elle résume le périmètre public vérifiable et renvoie directement vers les produits et canaux de contact actuels.",
    processEyebrow: "Comment commencer", processTitle: "D'une recherche à une prochaine action vérifiable.", processIntro: "Nous ne remplaçons pas les résultats par davantage de pages. Nous définissons d'abord le besoin, puis orientons vers le bon produit, la bonne demande ou le bon contact et mesurons une action réelle.",
    process: [
      { title: "1. Définir le besoin", body: "Décrivez le problème, l'audience, le marché et le prochain résultat commercial attendu." },
      { title: "2. Confirmer le périmètre", body: "Comparez le besoin aux capacités, limites et preuves actuelles de Hermes." },
      { title: "3. Ouvrir la bonne page canonique", body: "Accédez à la page exacte du produit, au programme ou au canal de contact contrôlé." },
      { title: "4. Mesurer l'action", body: "Une demande qualifiée, un appel, un e-mail ou un autre transfert confirmé comptent davantage qu'une simple visite." },
    ],
    boundaryEyebrow: "Limite des promesses", boundaryTitle: "Nous publions uniquement ce que nous pouvons décrire avec précision.",
    relatedEyebrow: "Étape suivante", relatedTitle: "Ouvrez le produit ou la ressource adapté à votre besoin.",
    faqEyebrow: "FAQ", faqTitle: "Ce qu'il faut savoir avant de nous contacter.",
    faq: [
      { question: "Puis-je vous contacter en français ?", answer: "Oui. Cette page fournit un point d'entrée public en français. Certaines opérations sur le marché américain, les appels ou les négociations peuvent nécessiter un anglais professionnel." },
      { question: "Hermes garantit-il un résultat, une position Google, un revenu ou un emploi ?", answer: "Non. Le périmètre, la disponibilité, les prix, les délais, la capacité et les autres conditions sont confirmés pour chaque offre précise ; aucun résultat externe n'est garanti." },
      { question: "Par où commencer ?", answer: "Ouvrez la page publique la plus proche de votre besoin ou envoyez une courte description de l'entreprise, du problème, du pays et du résultat souhaité." },
    ],
    contactEyebrow: "Demande qualifiée", contactTitle: "Décrivez le problème à résoudre.", contactBody: "Indiquez l'entreprise, le pays ou marché, le problème actuel, le résultat souhaité et le pôle Hermes. La demande pourra être orientée vers le bon flux de travail.", contactButton: "Envoyer la demande", emailSubject: "Hermes · demande en français",
  },
};

export const localizedDirectionCopy: Record<LocalizedSiteLocale, Record<DirectionId, LocalizedDirectionCopy>> = {
  uk: {
    logistics: {
      metaTitle: "Логістика США, диспетчеризація та Car Hauling | Hermes Logistics",
      metaDescription: "Логістична підтримка для перевізників, власників-операторів, дилерів і вантажовідправників у США: диспетчеризація, документи, координація та Car Hauling.",
      h1: "Логістика США для перевізників, дилерів і вантажовідправників.",
      detail: "Hermes Logistics поєднує dispatch і back-office підтримку, координацію документів, взаємодію з брокерами та вантажовідправниками й окремі Car Hauling маршрути. Конкретна доступність, навантаження, ставки та комерційні умови перевіряються перед роботою.",
      boundary: "Сторінка не означає наявність конкретного вантажу, гарантованої ставки, гарантованого gross або автоматичного прийняття перевізника. Реальна робота починається після перевірки authority, insurance, equipment, lane fit та поточних умов.",
      related: [
        { label: "Запит на перевезення авто", href: "/logistics/request-vehicle-transport/", body: "Контрольований шлях для клієнта, якому потрібно перевезти транспортний засіб у США." },
        { label: "Load Board", href: "/load-board/", body: "Публічний огляд можливостей із чітким відокремленням демонстраційних матеріалів і підтвердженої передачі звернення." },
        { label: "Carrier onboarding", href: "/carrier/", body: "Договір, перевірка документів і наступні кроки для перевізника." },
      ],
    },
    marketing: {
      metaTitle: "Маркетинг, SEO, контент і лідогенерація | Hermes Marketing",
      metaDescription: "Маркетинг для бізнесу: позиціонування, сайти, SEO, контент, соціальні мережі, реклама, шлях ліда, передача в CRM та аналітика.",
      h1: "Маркетинг, який з'єднує попит із кваліфікованою дією.",
      detail: "Hermes Marketing / ProgressoPro будує не набір розрізнених публікацій, а шлях від оферу й контенту до сайту, CTA, заявки, подальшого супроводу та вимірювання. Канали підбираються під бізнес-задачу й фактичний бюджет.",
      boundary: "Ми не гарантуємо позицію Google, фіксовану кількість лідів, охоплення або дохід. SEO, GEO/AEO, соціальні мережі та реклама оцінюються за вихідним рівнем, виконаною роботою, якістю запитів і доступними бізнес-результатами.",
      related: [
        { label: "SEO для бізнесу", href: "/services/seo/", body: "Технічна й контентна SEO-основа, канонічна сторінка для кожного пошукового наміру, внутрішні зв'язки та вимірювання." },
        { label: "Розробка сайту", href: "/services/website-development/", body: "Сайт і посадкові сторінки навколо оферу, конверсії та контрольованого прийому заявки." },
        { label: "Business Growth", href: "/ua/business-growth/", body: "Україномовний шлях до сайту, SEO, реклами, соціальних мереж та AI-автоматизації." },
      ],
    },
    technology: {
      metaTitle: "Сайти, CRM та AI-автоматизація | Hermes Technology",
      metaDescription: "Розробка сайтів, web apps, CRM, інтеграцій, аналітики та AI-автоматизації навколо реальних бізнес-процесів.",
      h1: "Цифрові системи, побудовані навколо реального процесу компанії.",
      detail: "Hermes Technology починає з користувачів, даних, рішень і чіткої передачі між етапами, а не з модного стеку. Проєкт може початися із сайту, CRM-модуля, порталу, інтеграції або AI-помічника й розширюватися після перевірки першої версії.",
      boundary: "Прототип, демонстрація і робоча функція не є одним і тим самим. Інтеграції, зовнішні дії, приватні дані та платежі активуються тільки після окремої технічної й операційної перевірки.",
      related: [
        { label: "Hermes Connect", href: "/services/hermes-connect/", body: "Публічне сімейство взаємопов’язаних робочих продуктів Hermes Technology." },
        { label: "Розробка сайту", href: "/services/website-development/", body: "Контрольований прийом вимог до сайту й визначення наступного технічного обсягу робіт." },
        { label: "Приклад IT-проєкту", href: "/case/it-development/", body: "Публічний приклад підходу до розробки, перевірки якості й контрольованого випуску." },
      ],
    },
    academy: {
      metaTitle: "Навчання логістиці, маркетингу, IT та операціям | Hermes Academy",
      metaDescription: "Практичні навчальні напрями Hermes Business Academy: логістика США, маркетинг, IT & AI, продажі та операційне управління.",
      h1: "Практичне навчання для роботи з реальними бізнес-процесами.",
      detail: "Hermes Business Academy публічно показує навчальні напрями з логістики США, маркетингу, IT & AI, продажів та операцій. Видимий напрям не означає, що платний набір, місце або точна дата вже відкриті.",
      boundary: "Навчання й практика не гарантують роботу, дохід, клієнтів, сертифікацію, підвищення або майбутню оплачувану роль. Формат, графік, ціна, місткість і умови допуску підтверджуються для конкретної програми.",
      related: [
        { label: "Логістика США українською", href: academyLogisticsOwnerRoutes.uk, body: "Окрема канонічна україномовна сторінка практичної програми U.S. Logistics Operations." },
        { label: "Програма з маркетингу українською", href: "/ua/academy/marketing/", body: "Практична програма з позиціонування, контенту з опорою на сайт, шляху ліда та аналітики." },
        { label: "Подати заявку в Academy", href: "/ua/academy/apply/", body: "Канонічна україномовна сторінка подання заявки без створення другої форми." },
        { label: "Як працює навчання", href: "/academy/how-training-works/", body: "Публічні етапи навчання, перевірки, межі участі та прогресу." },
      ],
    },
  },
  ru: {
    logistics: {
      metaTitle: "Логистика США, диспетчеризация и Car Hauling | Hermes Logistics",
      metaDescription: "Логистическая поддержка для перевозчиков, владельцев-операторов, дилеров и отправителей в США: диспетчеризация, документы, координация и Car Hauling.",
      h1: "Логистика США для перевозчиков, дилеров и отправителей.",
      detail: "Hermes Logistics объединяет dispatch и back-office поддержку, координацию документов, взаимодействие с брокерами и отправителями и отдельные Car Hauling маршруты. Доступность, грузы, ставки и коммерческие условия проверяются перед работой.",
      boundary: "Страница не означает наличие конкретного груза, гарантированной ставки, гарантированного gross или автоматического принятия перевозчика. Реальная работа начинается после проверки authority, insurance, equipment, lane fit и текущих условий.",
      related: [
        { label: "Запрос на перевозку автомобиля", href: "/logistics/request-vehicle-transport/", body: "Контролируемый путь для клиента, которому нужно перевезти автомобиль в США." },
        { label: "Load Board", href: "/load-board/", body: "Публичный обзор возможностей с разделением демонстрационных материалов и подтверждённой передачи обращения." },
        { label: "Carrier onboarding", href: "/carrier/", body: "Договор, проверка документов и следующие шаги для перевозчика." },
      ],
    },
    marketing: {
      metaTitle: "Маркетинг, SEO, контент и лидогенерация | Hermes Marketing",
      metaDescription: "Маркетинг для бизнеса: позиционирование, сайты, SEO, контент, социальные сети, реклама, путь лида, передача в CRM и аналитика.",
      h1: "Маркетинг, который связывает спрос с квалифицированным действием.",
      detail: "Hermes Marketing / ProgressoPro строит не набор разрозненных публикаций, а путь от оффера и контента до сайта, CTA, заявки, дальнейшего сопровождения и измерения. Каналы выбираются под бизнес-задачу и фактический бюджет.",
      boundary: "Мы не гарантируем позицию Google, фиксированное число лидов, охват или доход. SEO, GEO/AEO, социальные сети и реклама оцениваются через исходный уровень, выполненную работу, качество запросов и доступные бизнес-результаты.",
      related: [
        { label: "SEO для бизнеса", href: "/services/seo/", body: "Техническая и контентная SEO-основа, каноническая страница для каждого поискового намерения, внутренняя перелинковка и измерение." },
        { label: "Разработка сайта", href: "/services/website-development/", body: "Сайт и посадочные страницы вокруг оффера, конверсии и контролируемого приёма заявки." },
        { label: "Business Growth", href: "/ru/business-growth/", body: "Русскоязычный путь к сайту, SEO, рекламе, социальным сетям и AI-автоматизации." },
      ],
    },
    technology: {
      metaTitle: "Разработка сайтов, CRM и AI-автоматизация | Hermes Technology",
      metaDescription: "Сайты, web apps, CRM, интеграции, аналитика и AI-автоматизация вокруг реальных бизнес-процессов компании.",
      h1: "Цифровые системы, построенные вокруг реального процесса компании.",
      detail: "Hermes Technology начинает с пользователей, данных, решений и понятной передачи между этапами, а не с модного стека. Проект может начаться с сайта, CRM-модуля, портала, интеграции или AI-помощника и расширяться после проверки первой версии.",
      boundary: "Прототип, демонстрация и рабочая функция — не одно и то же. Интеграции, внешние действия, приватные данные и платежи активируются только после отдельной технической и операционной проверки.",
      related: [
        { label: "Hermes Connect", href: "/services/hermes-connect/", body: "Публичное семейство взаимосвязанных рабочих продуктов Hermes Technology." },
        { label: "Разработка сайта", href: "/services/website-development/", body: "Контролируемый приём требований к сайту и определение следующего технического объёма работ." },
        { label: "Пример IT-проекта", href: "/case/it-development/", body: "Публичный пример подхода к разработке, проверке качества и контролируемому выпуску." },
      ],
    },
    academy: {
      metaTitle: "Курсы логистики, маркетинга, IT и операций | Hermes Academy",
      metaDescription: "Практические направления Hermes Business Academy: логистика США, маркетинг, IT & AI, продажи и операционное управление.",
      h1: "Практическое обучение для работы с реальными бизнес-процессами.",
      detail: "Hermes Business Academy публично показывает направления по логистике США, маркетингу, IT & AI, продажам и операциям. Наличие страницы не означает, что платный набор, место или точная дата уже открыты.",
      boundary: "Обучение и практика не гарантируют работу, доход, клиентов, сертификацию, повышение или будущую оплачиваемую роль. Формат, график, цена, вместимость и условия допуска подтверждаются для конкретной программы.",
      related: [
        { label: "Курсы логистики США на русском", href: academyLogisticsOwnerRoutes.ru, body: "Отдельная каноническая русскоязычная страница программы U.S. Logistics Operations: диспетчеризация, брокеры, документы, оборудование и рабочий ритм." },
        { label: "Как работает обучение", href: "/academy/how-training-works/", body: "Публичные этапы обучения, проверки, границы участия и прогресса." },
        { label: "Материалы Academy", href: "/academy/resources/", body: "Публичная библиотека канонических учебных материалов Hermes Academy." },
      ],
    },
  },
  es: {
    logistics: {
      metaTitle: "Logística en EE. UU., dispatch y Car Hauling | Hermes Logistics",
      metaDescription: "Soporte logístico para transportistas, transportistas independientes, concesionarios y remitentes en EE. UU.: despacho, documentos, coordinación y Car Hauling.",
      h1: "Logística de Estados Unidos para transportistas, concesionarios y remitentes.",
      detail: "Hermes Logistics conecta soporte de dispatch y back office, coordinación documental, comunicación con brokers y remitentes y flujos específicos de Car Hauling. La disponibilidad, las cargas, las tarifas y las condiciones comerciales se revisan antes de trabajar.",
      boundary: "Esta página no implica una carga concreta, una tarifa o gross garantizados ni aceptación automática de un carrier. El trabajo real comienza después de revisar authority, insurance, equipment, lane fit y condiciones actuales.",
      related: [
        { label: "Solicitar transporte de vehículo", href: "/logistics/request-vehicle-transport/", body: "Flujo controlado para clientes que necesitan transportar un vehículo en Estados Unidos." },
        { label: "Load Board", href: "/load-board/", body: "Vista pública de oportunidades con separación explícita entre demostraciones y entregas confirmadas." },
        { label: "Carrier onboarding", href: "/carrier/", body: "Acuerdo, revisión documental y siguientes pasos para carriers." },
      ],
    },
    marketing: {
      metaTitle: "Marketing digital, SEO, contenido y leads | Hermes Marketing",
      metaDescription: "Posicionamiento, sitios web, SEO, contenido, redes sociales, publicidad, recorrido del prospecto, transferencia al CRM y analítica para empresas.",
      h1: "Marketing que conecta la demanda con una acción cualificada.",
      detail: "Hermes Marketing / ProgressoPro no trata el sitio web, SEO, las redes sociales y las ventas como tareas aisladas. Conecta oferta, contenido, CTA, captación, seguimiento y medición en un sistema que puede revisarse con datos reales.",
      boundary: "No garantizamos una posición en Google, un número fijo de leads, alcance o ingresos. SEO, GEO/AEO, redes sociales y publicidad se evalúan con un punto de partida, ejecución verificable, calidad de consultas y resultados empresariales disponibles.",
      related: [
        { label: "Servicios SEO", href: "/services/seo/", body: "Base técnica y de contenido, páginas canónicas por intención de búsqueda, enlaces internos y medición." },
        { label: "Desarrollo web", href: "/services/website-development/", body: "Sitios y páginas de destino alrededor de la oferta, la conversión y la recepción controlada de solicitudes." },
        { label: "Checklist search-to-inquiry", href: "/resources/search-to-inquiry-conversion-checklist/", body: "Cómo conectar intención, confianza, CTA, cualificación, entrega y medición." },
      ],
    },
    technology: {
      metaTitle: "Desarrollo web, CRM y automatización con IA | Hermes Technology",
      metaDescription: "Sitios, web apps, CRM, integraciones, analítica y automatización con IA construidos alrededor de procesos empresariales reales.",
      h1: "Sistemas digitales construidos alrededor del proceso real de la empresa.",
      detail: "Hermes Technology empieza por usuarios, datos, decisiones y handoffs, no por una tecnología de moda. Un proyecto puede comenzar con un sitio, módulo CRM, portal, integración o asistente AI y ampliarse después de verificar la primera versión.",
      boundary: "Un prototipo, una demostración y una función operativa no son lo mismo. Integraciones, acciones externas, datos privados y pagos se activan solo después de una revisión técnica y operativa separada.",
      related: [
        { label: "Hermes Connect", href: "/services/hermes-connect/", body: "Familia pública de productos con espacios de trabajo conectados de Hermes Technology." },
        { label: "Desarrollo web", href: "/services/website-development/", body: "Recepción controlada para definir un sitio web y el siguiente alcance técnico." },
        { label: "Caso de IT", href: "/case/it-development/", body: "Ejemplo público del enfoque de desarrollo, control de calidad y publicación controlada." },
      ],
    },
    academy: {
      metaTitle: "Formación en logística, marketing, IT y operaciones | Hermes Academy",
      metaDescription: "Rutas prácticas de Hermes Business Academy: logística de EE. UU., marketing, IT & AI, ventas y gestión operativa.",
      h1: "Formación práctica conectada con procesos empresariales reales.",
      detail: "Hermes Business Academy presenta públicamente rutas de logística de EE. UU., marketing, IT & AI, ventas y operaciones. Una ruta visible no significa que una cohorte de pago, una plaza o una fecha concreta estén abiertas.",
      boundary: "La formación y la práctica no garantizan empleo, ingresos, clientes, certificación, promoción ni trabajo remunerado futuro. Formato, calendario, precio, capacidad y condiciones de admisión se confirman para cada programa concreto.",
      related: [
        { label: "Curso de logística de EE. UU. en español", href: academyLogisticsOwnerRoutes.es, body: "Página canónica en español de U.S. Logistics Operations con currículo, requisitos y límites públicos." },
        { label: "Cómo funciona la formación", href: "/academy/how-training-works/", body: "Etapas públicas, revisión, límites de participación y progression." },
        { label: "Recursos de Academy", href: "/academy/resources/", body: "Biblioteca pública de recursos de aprendizaje canónicos de Hermes Academy." },
      ],
    },
  },
  it: {
    logistics: {
      metaTitle: "Logistica USA, dispatch e Car Hauling | Hermes Logistics",
      metaDescription: "Supporto logistico per vettori, vettori indipendenti, concessionari e mittenti negli USA: gestione operativa, documenti, coordinamento e Car Hauling.",
      h1: "Logistica negli Stati Uniti per vettori, concessionari e mittenti.",
      detail: "Hermes Logistics collega supporto dispatch e back office, coordinamento documentale, comunicazione con broker e mittenti e flussi Car Hauling dedicati. Disponibilità, carichi, tariffe e condizioni commerciali vengono verificati prima del lavoro.",
      boundary: "Questa pagina non implica un carico specifico, una tariffa o gross garantiti né l'accettazione automatica di un carrier. Il lavoro reale inizia dopo la verifica di authority, insurance, equipment, lane fit e condizioni attuali.",
      related: [
        { label: "Richiedi trasporto veicolo", href: "/logistics/request-vehicle-transport/", body: "Percorso controllato per chi deve trasportare un veicolo negli Stati Uniti." },
        { label: "Load Board", href: "/load-board/", body: "Vista pubblica delle opportunità con separazione esplicita tra dimostrazioni e passaggi confermati." },
        { label: "Carrier onboarding", href: "/carrier/", body: "Accordo, verifica documenti e passaggi successivi per i carrier." },
      ],
    },
    marketing: {
      metaTitle: "Marketing Digitale, SEO e GEO per Aziende in Italia | Hermes",
      metaDescription: "Strategia digitale, SEO, GEO/AEO, reti sociali, pubblicità, siti orientati alla conversione, CRM e processi commerciali per aziende in Italia.",
      h1: "Marketing digitale costruito come un sistema di crescita.",
      detail: "La pagina canonica italiana dedicata esiste già e collega sito, SEO, GEO/AEO, contenuti, social media, pubblicità, CRM, seguito e analisi in un unico percorso misurabile.",
      boundary: "Le attività locali, gli uffici, le recensioni e i risultati vengono descritti solo quando sono verificati. Non garantiamo ranking, lead o ricavi.",
      related: [
        { label: "Hermes Marketing Italia", href: "/it/marketing/", body: "Pagina commerciale italiana già pubblicata per Marketing, SEO e GEO." },
      ],
    },
    technology: {
      metaTitle: "Sviluppo Web, Software, CRM e Automazione AI in Italia | Hermes",
      metaDescription: "Siti web, web app, software su misura, CRM, automazione, AI, integrazioni API e dashboard per aziende in Italia.",
      h1: "Software, CRM e AI costruiti intorno al modo in cui lavora l'azienda.",
      detail: "La pagina canonica italiana dedicata esiste già e descrive sviluppo web, software su misura, CRM, automazione, AI, API e dashboard con confini verificabili.",
      boundary: "Dimostrazione e funzione operativa sono distinte. Integrazioni, dati privati, azioni esterne e pagamenti richiedono autorizzazione e verifica separata.",
      related: [
        { label: "Hermes Technology Italia", href: "/it/tecnologia/", body: "Pagina commerciale italiana già pubblicata per Technology, CRM e AI." },
      ],
    },
    academy: {
      metaTitle: "Formazione in logistica, marketing, IT e operations | Hermes Academy",
      metaDescription: "Percorsi pratici Hermes Business Academy: logistica USA, marketing, IT & AI, sales e gestione operativa.",
      h1: "Formazione pratica collegata a processi aziendali reali.",
      detail: "Hermes Business Academy presenta percorsi pubblici in logistica USA, marketing, IT & AI, sales e operations. Un percorso visibile non significa che una coorte a pagamento, un posto o una data specifica siano aperti.",
      boundary: "Formazione e pratica non garantiscono lavoro, reddito, clienti, certificazione, promozione o futuro lavoro retribuito. Formato, calendario, prezzo, capacità e criteri di accesso vengono confermati per ogni programma specifico.",
      related: [
        { label: "Corso di logistica USA in italiano", href: academyLogisticsOwnerRoutes.it, body: "Pagina canonica italiana di U.S. Logistics Operations con curriculum, requisiti e limiti pubblici." },
        { label: "Come funziona la formazione", href: "/academy/how-training-works/", body: "Fasi pubbliche, revisione, limiti di partecipazione e progresso." },
        { label: "Risorse Academy", href: "/academy/resources/", body: "Biblioteca pubblica di risorse formative canoniche di Hermes Academy." },
      ],
    },
  },
  fr: {
    logistics: {
      metaTitle: "Logistique USA, dispatch et Car Hauling | Hermes Logistics",
      metaDescription: "Support logistique pour transporteurs, transporteurs indépendants, concessionnaires et expéditeurs aux États-Unis : gestion opérationnelle, documents, coordination et Car Hauling.",
      h1: "Logistique aux États-Unis pour transporteurs, concessionnaires et expéditeurs.",
      detail: "Hermes Logistics relie support dispatch et back office, coordination documentaire, communication avec brokers et expéditeurs et flux Car Hauling dédiés. La disponibilité, les charges, les tarifs et les conditions commerciales sont vérifiés avant le travail.",
      boundary: "Cette page n'implique pas une charge précise, un tarif ou gross garanti ni l'acceptation automatique d'un transporteur. Le travail réel commence après vérification de l'authority, de l'assurance, de l'équipement, du lane fit et des conditions actuelles.",
      related: [
        { label: "Demander un transport de véhicule", href: "/logistics/request-vehicle-transport/", body: "Parcours contrôlé pour un client qui doit transporter un véhicule aux États-Unis." },
        { label: "Load Board", href: "/load-board/", body: "Vue publique des opportunités avec séparation explicite entre démonstrations et transferts confirmés." },
        { label: "Carrier onboarding", href: "/carrier/", body: "Accord, vérification des documents et prochaines étapes pour les transporteurs." },
      ],
    },
    marketing: {
      metaTitle: "Marketing digital, SEO, contenu et génération de leads | Hermes",
      metaDescription: "Positionnement, sites, SEO, contenu, réseaux sociaux, publicité, parcours prospect, transfert vers le CRM et analyse pour les entreprises.",
      h1: "Un marketing qui relie la demande à une action qualifiée.",
      detail: "Hermes Marketing / ProgressoPro ne traite pas le site, le SEO, les réseaux sociaux et les ventes comme des tâches isolées. Nous relions offre, contenu, CTA, acquisition, suivi et mesure dans un système qui peut être évalué avec des données réelles.",
      boundary: "Nous ne garantissons ni position Google, ni nombre fixe de prospects, ni portée, ni revenu. SEO, GEO/AEO, réseaux sociaux et publicité sont évalués à partir d’un niveau de référence, de l’exécution vérifiable, de la qualité des demandes et des résultats commerciaux disponibles.",
      related: [
        { label: "Services SEO", href: "/services/seo/", body: "Base technique et éditoriale, pages canoniques par intention de recherche, maillage interne et mesure." },
        { label: "Développement de site", href: "/services/website-development/", body: "Sites et pages d’atterrissage autour de l'offre, de la conversion et d’une réception contrôlée des demandes." },
        { label: "Checklist search-to-inquiry", href: "/resources/search-to-inquiry-conversion-checklist/", body: "Relier intention, confiance, CTA, qualification, transfert et mesure." },
      ],
    },
    technology: {
      metaTitle: "Développement web, CRM et automatisation IA | Hermes Technology",
      metaDescription: "Sites, web apps, CRM, intégrations, analytics et automatisation IA construits autour de processus métier réels.",
      h1: "Des systèmes numériques construits autour du processus réel de l'entreprise.",
      detail: "Hermes Technology commence par les utilisateurs, les données, les décisions et les handoffs, pas par une technologie à la mode. Un projet peut démarrer par un site, un module CRM, un portail, une intégration ou un assistant AI, puis s'étendre après validation de la première version.",
      boundary: "Un prototype, une démonstration et une fonction opérationnelle ne sont pas identiques. Intégrations, actions externes, données privées et paiements sont activés uniquement après une validation technique et opérationnelle séparée.",
      related: [
        { label: "Hermes Connect", href: "/services/hermes-connect/", body: "Famille publique de produits à espaces de travail connectés de Hermes Technology." },
        { label: "Développement de site", href: "/services/website-development/", body: "Réception contrôlée pour définir un site web et le prochain périmètre technique." },
        { label: "Étude de cas IT", href: "/case/it-development/", body: "Exemple public de notre approche du développement, du contrôle qualité et de la mise en production contrôlée." },
      ],
    },
    academy: {
      metaTitle: "Formation en logistique, marketing, IT et opérations | Hermes Academy",
      metaDescription: "Parcours pratiques Hermes Business Academy : logistique USA, marketing, IT & AI, ventes et gestion des opérations.",
      h1: "Une formation pratique reliée à des processus métier réels.",
      detail: "Hermes Business Academy présente publiquement des parcours en logistique USA, marketing, IT & AI, ventes et opérations. Un parcours visible ne signifie pas qu'une cohorte payante, une place ou une date précise sont ouvertes.",
      boundary: "La formation et la pratique ne garantissent ni emploi, ni revenu, ni clients, ni certification, ni promotion, ni futur travail rémunéré. Format, calendrier, prix, capacité et critères d’admission sont confirmés pour chaque programme précis.",
      related: [
        { label: "Cours de logistique USA en français", href: academyLogisticsOwnerRoutes.fr, body: "Page canonique française de U.S. Logistics Operations avec programme, prérequis et limites publics." },
        { label: "Comment fonctionne la formation", href: "/academy/how-training-works/", body: "Étapes publiques, évaluation, limites de participation et progression." },
        { label: "Ressources Academy", href: "/academy/resources/", body: "Bibliothèque publique de ressources pédagogiques canoniques de Hermes Academy." },
      ],
    },
  },
};

// These two Academy hubs use the existing U.S. Logistics program as a concrete starting example.
// Other locales and direction owners retain their shared process copy.
export const localizedAcademyProcess: Record<"fr" | "it", Pick<LocalizedDirectionUi, "processEyebrow" | "processTitle" | "processIntro" | "process">> = {
  "fr": {
    "processEyebrow": "Comment commencer",
    "processTitle": "Commencer par la logistique des États-Unis.",
    "processIntro": "L'Academy présente plusieurs parcours. Voici un point de départ concret pour comprendre ou soutenir les opérations logistiques sur le marché américain.",
    "process": [
      {
        "title": "1. À qui s'adresse ce parcours ?",
        "body": "Aux débutants qui souhaitent comprendre les rôles et les processus, aux professionnels bilingues et aux participants qui veulent renforcer leurs compétences en dispatch ou en ventes. Une expérience logistique préalable n'est pas nécessaire pour envoyer une demande."
      },
      {
        "title": "2. Vérifier votre préparation",
        "body": "Les appels en direct, les négociations et la communication avec les transporteurs ou brokers américains exigent un anglais parlé B2 ou supérieur. Les activités sans communication en direct peuvent être évaluées séparément. Le niveau adapté dépend aussi des horaires, de la discipline, de l'expérience récente et du format approuvé."
      },
      {
        "title": "3. Lire une ressource publique",
        "body": "Consultez la grille de questions du guide sur le dispatch délégué et le dispatch assuré par le transporteur, disponible en anglais. Notez qui assume chaque responsabilité, comment l'approbation du transporteur fonctionne et ce qui se passe en cas d'imprévu.",
        "link": {
          "label": "Ouvrir la grille de questions en anglais",
          "href": "https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/#decision-checks-title"
        }
      },
      {
        "title": "4. Consulter le programme et envoyer une demande",
        "body": "Consultez le programme de logistique USA en français, puis utilisez son lien de demande de formation. Indiquez votre objectif, votre niveau d'anglais, votre expérience et vos disponibilités. Le format adapté est vérifié par l'équipe ; une demande ne réserve pas de place et ne vaut pas admission.",
        "link": {
          "label": "Voir le programme de logistique USA en français",
          "href": "https://hermeslogisticsus.com/fr/academy/us-logistics-operations/"
        }
      }
    ]
  },
  "it": {
    "processEyebrow": "Come iniziare",
    "processTitle": "Iniziare dalla logistica degli Stati Uniti.",
    "processIntro": "L'Academy presenta diversi percorsi. Ecco un punto di partenza concreto per comprendere o supportare le operazioni logistiche nel mercato statunitense.",
    "process": [
      {
        "title": "1. A chi si rivolge questo percorso?",
        "body": "Ai principianti che vogliono comprendere ruoli e processi, ai professionisti bilingui e a chi vuole rafforzare le proprie competenze nel dispatch o nelle vendite. Non è necessaria un'esperienza logistica precedente per inviare una richiesta."
      },
      {
        "title": "2. Verificare la propria preparazione",
        "body": "Le chiamate dal vivo, le negoziazioni e la comunicazione con carrier o broker statunitensi richiedono inglese parlato B2 o superiore. Le attività senza comunicazione dal vivo possono essere valutate separatamente. Il livello adatto dipende anche dagli orari, dalla disciplina, dall'esperienza recente e dal formato approvato."
      },
      {
        "title": "3. Leggere una risorsa pubblica",
        "body": "Consultate la lista di domande della guida sul dispatch delegato e sul dispatch gestito dal carrier, disponibile in inglese. Annotate chi assume ogni responsabilità, come funziona l'approvazione del carrier e cosa succede in caso di imprevisti.",
        "link": {
          "label": "Aprire la lista di domande in inglese",
          "href": "https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/#decision-checks-title"
        }
      },
      {
        "title": "4. Consultare il programma e inviare una richiesta",
        "body": "Consultate il programma di logistica USA in italiano, poi utilizzate il suo link per richiedere informazioni sulla formazione. Indicate obiettivo, livello di inglese, esperienza e disponibilità. Il team verifica il formato adatto; una richiesta non riserva un posto e non equivale all'ammissione.",
        "link": {
          "label": "Vedere il programma di logistica USA in italiano",
          "href": "https://hermeslogisticsus.com/it/academy/us-logistics-operations/"
        }
      }
    ]
  }
};
