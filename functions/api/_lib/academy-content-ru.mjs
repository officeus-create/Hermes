const source = (title, path) => ({ title, path });
const hasCyrillic = (value) => /[А-Яа-яЁё]/.test(String(value || ""));
const criterion = (key, label, pass) => ({ key, label: hasCyrillic(label) ? label : `Критерий: ${label}`, pass });

const logisticsPrivacy = [
  "Используйте только синтетические или явно разрешённые обезличенные примеры. Не вставляйте реальные load, rate confirmation, carrier, broker, driver, customer, VIN, маршрут, CRM-запись или приватную переписку.",
  "Не добавляйте пароли, API-ключи, коды подтверждения, банковские реквизиты, документы личности или другие чувствительные данные в учебные материалы, URL и аналитику.",
  "Урок является учебным доказательством. Он не даёт права бронировать грузы, подписывать документы, представлять перевозчика или принимать safety, financial и operating решения без отдельного разрешения человека.",
];

const marketingPrivacy = [
  "Используйте только синтетический контекст и одобренные публичные источники. Не вставляйте реальные лиды, контакты, CRM-записи, приватную аналитику, переписки, credentials или клиентские данные.",
  "Не помещайте персональные или операционные значения в URL, UTM, analytics events, screenshots или публичные fixtures.",
  "Учебный draft не является разрешением на публикацию, рекламу, вход в аккаунт, отправку сообщения, изменение сайта или работу от имени клиента. Реальное внешнее действие контролирует авторизованный человек.",
];

const dispatchFoundations = {
  program_slug: "us-logistics-operations",
  lesson_id: "dispatch-foundations",
  version: "2026-09-01-ru-v1",
  title: "Основы диспетчинга: роли, контроль и путь груза",
  purpose: "Понять основные обязанности в carrier dispatch workflow, кто контролирует каждое решение и какую информацию нужно подтвердить до перехода к следующему шагу.",
  objectives: [
    "Отличать контроль перевозчика от координации и поддержки диспетчера.",
    "Собрать поиск груза, коммуникацию, проверку маршрута, setup, документы, approval и follow-up в один процесс.",
    "Разделять факты, которые dispatcher может организовать, и решения, которые остаются у motor carrier.",
    "Отличать полезный рабочий вопрос от неподтверждённого обещания loads, rates, utilization или revenue.",
    "Фиксировать владельца решения и следующий шаг, когда информации или approval не хватает.",
  ],
  sections: [
    {
      title: "Сначала распределите ответственность",
      summary: "Надёжный workflow заранее показывает, кто ищет, звонит, проверяет маршрут, готовит setup и даёт финальное approval.",
      actions: [
        "Carrier контролирует truck, driver, safety, compliance и финальное одобрение груза.",
        "Dispatcher может исследовать рынок, организовывать информацию, вести разрешённую коммуникацию и follow-up в согласованных пределах.",
        "Broker или shipper предоставляет opportunity, requirements и коммерческие данные, которые контролирует его сторона.",
        "Если владелец решения неясен, остановитесь и определите его до следующего действия.",
      ],
    },
    {
      title: "Следуйте потоку информации",
      summary: "Opportunity становится полезной только после проверки equipment, area, timing, access, documents и approval.",
      actions: [
        "Найдите или получите opportunity, не выдавая её наличие за обещание результата.",
        "Подтвердите факты, необходимые для operating-fit review.",
        "Покажите конфликты и missing information вместо сокрытия неопределённости.",
        "Сохраните финальное approval carrier до любого booking action.",
      ],
    },
    {
      title: "Не путайте координацию с полномочиями",
      summary: "Поддержка может уменьшить повторяющуюся работу, но не переносит юридическую, safety и operating ответственность carrier.",
      actions: [
        "Определите, какую коммуникацию dispatcher может вести самостоятельно.",
        "Зафиксируйте, что всегда требует подтверждения carrier.",
        "Не переносите credentials, security codes, shipment details и payment data в публичные URL или learner fixtures.",
        "Оценивайте качество workflow без обещаний market outcomes.",
      ],
    },
  ],
  approved_sources: [source("Dispatch Service vs Self-Dispatch", "/logistics/resources/dispatch-service-vs-self-dispatch/")],
  scenario: "Синтетический кейс: небольшой car-hauling carrier хочет помощь с load search и back-office, но ещё не определил, кто обсуждает load, проверяет route fit, готовит setup documents и даёт финальное booking approval.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 300,
    prompt: "Создайте карту ответственности для синтетического carrier workflow.",
    parts: [
      "Workflow — расположите search, communication, route/equipment review, setup/documents и booking/follow-up в логичной последовательности.",
      "Owner — назначьте каждый шаг carrier, dispatcher/support, broker/shipper или совместной проверке.",
      "Carrier-control boundary — назовите минимум три решения, которые обязаны оставаться у carrier.",
      "Missing-information rule — опишите, что происходит, если отсутствует критический факт или approval.",
      "Claim-safety note — приведите одну полезную рабочую формулировку и одно обещание результата, которое делать нельзя.",
    ],
  },
  rubric: [
    criterion("workflow_sequence", "Последовательность workflow", "Основные шаги расположены логично, booking не предполагается до review."),
    criterion("role_clarity", "Ясность ролей", "Ответственность carrier, dispatcher/support и внешней стороны разделена."),
    criterion("carrier_control", "Контроль carrier", "Truck, driver, safety и final approval явно остаются у carrier."),
    criterion("missing_information", "Работа с missing information", "Learner проверяет, останавливает или эскалирует, а не выдумывает ответ."),
    criterion("privacy_boundary", "Граница приватности", "Credentials, payment и shipment values не раскрываются в публичных или learner systems."),
    criterion("claim_safety", "Безопасность обещаний", "Нет гарантии load, rate, utilization, profit или revenue."),
  ],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "carrier-broker-communication", label: "Перейти к коммуникации с carrier и broker" },
};

const carrierBrokerCommunication = {
  program_slug: "us-logistics-operations",
  lesson_id: "carrier-broker-communication",
  version: "2026-09-01-ru-v1",
  title: "Профессиональный разговор в логистике: пять этапов",
  purpose: "Определять текущий этап профессионального разговора и выбирать полезный следующий вопрос без давления и неподтверждённых обещаний.",
  objectives: [
    "Разделять first-contact clarity, diagnosis, next-step agreement, objection clarification и follow-up.",
    "Задавать релевантный вопрос вместо длинного общего pitch.",
    "Объяснять scope и следующий шаг без обещаний loads, rates, revenue, acceptance, employment или timing.",
    "Уточнять настоящую причину сомнения вместо спора.",
    "Фиксировать текущий этап, next action и unresolved question для human review.",
  ],
  sections: [
    { title: "Этап 1 — ясный первый контакт", summary: "Установите, кто говорит, почему разговор может быть релевантен и готов ли человек продолжить.", actions: ["Сделайте opening достаточно коротким, чтобы собеседник мог ответить.", "Сформулируйте цель простым языком.", "Спросите разрешение продолжить или задайте один простой relevance question.", "Не обещайте guaranteed loads, rates, direct shippers, savings или results."] },
    { title: "Этап 2 — диагностика", summary: "Поймите текущую ситуацию, проблему, влияние, желаемый результат и decision process до предложения следующего шага.", actions: ["Спросите, как работа устроена сегодня.", "Найдите uncertainty, delays, missed follow-up или unnecessary work.", "Уточните, что улучшенный процесс должен сделать проще или понятнее.", "Коротко резюмируйте услышанное до перехода дальше."] },
    { title: "Этап 3 — scope и следующий шаг", summary: "Объясните проверяемый next step, границы ответственности сторон и реально необходимые данные.", actions: ["Назовите, что входит и не входит в scope.", "Отделите данные, нужные сейчас, от чувствительной информации для approved secure route позже.", "Назовите, кто принимает final operating, booking, safety или financial decision.", "Не выдумывайте urgency, acceptance, timing или financial outcomes."] },
    { title: "Этап 4 — уточнение возражения", summary: "Цель — понять причину hesitation и определить, существует ли полезный next step, а не победить человека.", actions: ["Признайте concern без спора.", "Задайте один clarifying question.", "Отвечайте только на заявленную проблему.", "Повторите boundary или вариант и примите ясное «нет»." ] },
    { title: "Этап 5 — follow-up без давления", summary: "Сохраните контекст и выполните согласованное действие без повторяющегося нежелательного контакта.", actions: ["Назовите причину follow-up и кратко напомните прошлый разговор.", "Дайте обещанный resource или один вопрос и один next action.", "Позвольте отказаться или изменить timing.", "Зафиксируйте next action и stop condition; не обходите отказ другой учётной записью или формулировкой." ] },
  ],
  scenario: "Синтетический разговор: carrier заинтересован в улучшении процесса, но неясно, какая проблема для него главная и какой следующий шаг действительно полезен.",
  assignment: { submission_type: "written_reflection", max_words: 250, prompt: "Разберите синтетический разговор по пяти этапам и подготовьте безопасный следующий ответ.", parts: ["Определите текущий этап разговора.", "Напишите один вопрос, который изменит следующее решение.", "Сформулируйте claim-safe ответ без обещания результата.", "Предложите один доступный next step.", "Зафиксируйте status, next action и stop condition."] },
  rubric: [criterion("stage", "Определение этапа", "Этап разговора определён по фактам."), criterion("question", "Следующий вопрос", "Вопрос помогает принять следующее решение."), criterion("scope", "Ясность scope", "Включённое, исключённое и владелец решения понятны."), criterion("objection", "Работа с сомнением", "Нет давления или манипуляции."), criterion("follow_up", "Follow-up", "Есть ясный next step и stop condition."), criterion("claims", "Безопасность обещаний", "Нет неподтверждённых гарантий." )],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "equipment-lane-logic", label: "Перейти к equipment и lane logic" },
};

const equipmentLaneLogic = {
  program_slug: "us-logistics-operations",
  lesson_id: "equipment-lane-logic",
  version: "2026-09-01-ru-v1",
  title: "Equipment и lane logic: проверяйте fit до рекомендации",
  purpose: "Проверять equipment, capacity, deadhead, timing, route и pickup/delivery constraints, не называя opportunity безопасной, прибыльной или готовой к booking до решения carrier.",
  objectives: ["Определять operating facts, необходимые до рекомендации opportunity.", "Разделять equipment fit, route fit, timing fit и commercial information.", "Рассматривать deadhead и pickup/delivery access как review inputs, а не универсальные decision rules.", "Явно маркировать facts, assumptions и unanswered questions.", "Оставлять safety, operating judgment и final approval за carrier."],
  sections: [
    { title: "Проверьте equipment и практическую capacity", summary: "Truck/trailer type, practical capacity, dimensions, specialty capability и restrictions нужно понимать до обсуждения fit.", actions: ["Используйте approved equipment profile carrier, а не догадку по общему truck class.", "Подтвердите capacity/restrictions для opportunity.", "Неясные dimensions, operability или specialty requirements превратите в вопросы." ] },
    { title: "Проверьте route, deadhead и timing", summary: "Route — это не только origin/destination; current location, empty miles, windows и access constraints меняют fit review.", actions: ["Отделяйте current location от pickup и loaded route.", "Подтверждайте pickup/delivery windows или constraints.", "Показывайте deadhead/access без выдуманного universal threshold." ] },
    { title: "Верните решение carrier", summary: "Dispatch support организует facts/conflicts, но carrier контролирует safety, operating cost judgment и final acceptance.", actions: ["Суммируйте confirmed facts.", "Перечислите unresolved questions/material assumptions.", "Не называйте opportunity profitable, safe или approved без evidence/decision." ] },
  ],
  approved_sources: [source("Dispatch Service vs Self-Dispatch", "/logistics/resources/dispatch-service-vs-self-dispatch/")],
  scenario: "Синтетическая opportunity: carrier имеет approved equipment profile/preferred area, но отсутствует один access constraint и learner не знает, подходят ли deadhead/timing.",
  assignment: { submission_type: "written_reflection", max_words: 300, prompt: "Подготовьте fact-assumption-question review fit для synthetic opportunity.", parts: ["Confirmed facts — только известные equipment/route/timing facts.", "Assumptions — что хочется предположить, но нельзя доказать.", "Questions — что нужно подтвердить до рекомендации.", "Carrier decision — какие элементы final approval остаются у carrier.", "Safe summary — как представить opportunity без promise safety/profitability/booking." ] },
  rubric: [criterion("facts", "Подтверждённые факты", "Facts отделены от assumptions."), criterion("questions", "Необходимые вопросы", "Uncertainty превращена в concrete questions."), criterion("equipment_fit", "Проверка equipment fit", "Capacity/restrictions не предполагаются."), criterion("route_timing", "Проверка route и timing", "Deadhead/windows/access рассмотрены."), criterion("carrier_control", "Контроль carrier", "Safety/operating/final approval остаются у carrier."), criterion("claim_safety", "Безопасность формулировки", "Нет claim profit/safety/booking outcome." )],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "broker-setup-packet", label: "Перейти к broker setup packet" },
};

const brokerSetupPacket = {
  program_slug: "us-logistics-operations",
  lesson_id: "broker-setup-packet",
  version: "2026-09-01-ru-v1",
  title: "Broker setup packet: соберите проверяемый и безопасный пакет",
  purpose: "Организовать carrier setup information в контролируемый пакет, проверить freshness/scope и не раскрывать credentials или payment changes без verification.",
  objectives: ["Определять core setup areas.", "Проверять identity/authority/insurance/equipment/payment uncertainty до representation.", "Отправлять только required information через approved secure route.", "Исключать passwords/codes/unnecessary identity data.", "Независимо проверять unexpected payment changes.", "Фиксировать non-sensitive status/refresh triggers."],
  sections: [
    { title: "Соберите проверяемое ядро", summary: "Единый core packet уменьшает conflicting names, expired docs, unclear dispatch authority и лишнее раскрытие.", actions: ["Проверьте business identity/authorized signer.", "Подтвердите authority/insurance через appropriate sources.", "Держите equipment profile/restrictions актуальными.", "Документируйте payment/factoring/communication ownership без слепого доверия неожиданным изменениям." ] },
    { title: "Адаптируйте под запрос broker", summary: "Один packet не гарантирует acceptance и не подходит всем brokers; сравните stated requirements и отправьте только required.", actions: ["Сравните request с controlled core packet.", "Исправьте missing/expired/uncertain items.", "Используйте approved broker portal/controlled route.", "Запишите sent/status/responsible owner." ] },
    { title: "Защитите чувствительные данные", summary: "Setup не должен становиться credential, identity или payment-data dump.", actions: ["Никогда не включайте passwords/API keys/authentication/recovery codes.", "Не добавляйте identity docs/sensitive personal values без approved secure process.", "Независимо проверяйте unexpected banking/payment changes.", "Отделяйте load-specific rate confirmations/transport docs от reusable core setup." ] },
  ],
  approved_sources: [source("Broker Setup Packet Checklist", "/logistics/resources/broker-setup-packet-checklist/")],
  scenario: "Синтетический broker просит setup у carrier: core packet актуален, но insurance document требует обновления и неожиданное сообщение предлагает новые payment instructions.",
  assignment: { submission_type: "written_reflection", max_words: 350, prompt: "Создайте безопасный setup-review plan.", parts: ["Packet areas — relevant core areas.", "Verify — facts/doc versions до submission.", "Secure submission — что/через какой approved route.", "Payment-change control — как обработать unexpected instruction.", "Status record — какие non-sensitive metadata можно записать.", "Refresh rule — trigger для replacement/re-verification." ] },
  rubric: [criterion("packet_scope", "Scope пакета", "Relevant areas определены без assumption universal packet."), criterion("verification", "Проверка", "Identity/authority/insurance/equipment/payment uncertainty resolved."), criterion("secure_submission", "Безопасная отправка", "Только required info через approved route."), criterion("credential_boundary", "Граница credentials", "Passwords/codes/recovery/unnecessary identity data excluded."), criterion("payment_control", "Контроль payment changes", "Unexpected changes требуют independent verification."), criterion("status_refresh", "Status и refresh", "Записаны non-sensitive status metadata и trigger."), criterion("approval_boundary", "Граница approval", "Complete packet не назван guaranteed approval." )],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "negotiation-practice", label: "Перейти к negotiation practice" },
};

const negotiationPractice = {
  program_slug: "us-logistics-operations",
  lesson_id: "negotiation-practice",
  version: "2026-09-01-ru-v1",
  title: "Практика переговоров: уточните возражение",
  purpose: "Применить conversation-stage method к синтетическому objection и подготовить bounded written response для human review.",
  objectives: ["Определить текущий conversation stage.", "Признать concern без атаки existing arrangement.", "Задать один focused diagnostic question.", "Предложить claim-safe next option, сохранив контроль человека."],
  scenario: "Синтетический car-hauling owner-operator говорит, что уже имеет dispatch help, не хочет менять working process, предпочитает direct-shipper freight и не хочет платить дважды за одинаковые responsibilities.",
  assignment: { submission_type: "written_reflection", max_words: 120, prompt: "Напишите один ответ ровно из четырёх частей.", parts: ["Conversation stage — stage и причина.", "Acknowledgment — признайте concern без unsupported claim.", "Next question — один вопрос о primary issue.", "Boundary/option — что можно review дальше без promise direct shippers/rates/savings/revenue/contract." ] },
  rubric: [criterion("stage_identification", "Определение этапа", "Правильно определено objection clarification."), criterion("acknowledgment", "Признание concern", "Нет criticism current provider/false agreement."), criterion("diagnostic_question", "Диагностический вопрос", "Один focused question раскрывает primary concern."), criterion("claim_safety", "Безопасность обещаний", "Нет promise direct shippers/loads/rates/savings/revenue/acceptance/timing."), criterion("control_next_step", "Контроль и следующий шаг", "Offer comparison/review сохраняет final decision у человека."), criterion("tone_length", "Тон и длина", "Professional/respectful и within 120 words." )],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "operating-rhythm", label: "Перейти к operating rhythm" },
};

const operatingRhythm = {
  program_slug: "us-logistics-operations",
  lesson_id: "operating-rhythm",
  version: "2026-09-01-ru-v1",
  title: "Operating rhythm: планируйте, действуйте, фиксируйте, проверяйте, исправляйте",
  purpose: "Превратить day-to-day logistics work в повторяемый control loop с priorities, status, handoffs, evidence и correction вместо зависимости от памяти или activity volume.",
  objectives: ["Определять небольшой набор priorities до начала work.", "Фиксировать status/evidence так, чтобы authorized teammate/reviewer понял их.", "Создавать handoff с owner/context/current state/next action.", "Считать activity metrics signals, а не guarantees quality/outcomes.", "Закрывать loop review ошибок/unresolved items/next improvement."],
  sections: [
    { title: "Планируйте вокруг priorities", summary: "Полезный plan определяет important work, prerequisites и fallback tasks вместо arbitrary counts.", actions: ["Назовите top priorities и reason.", "Определите info/approvals до продвижения.", "Держите fallback task, не скрывая blocker." ] },
    { title: "Делайте status/handoffs проверяемыми", summary: "Teammate должен понять what happened/unresolved/next owner без реконструкции дня из messages.", actions: ["Запишите current state/material evidence.", "Назовите responsible role.", "Сохраните relevant context без unnecessary private data.", "Эскалируйте blockers, требующие carrier/supervisor/human decision." ] },
    { title: "Проверяйте и исправляйте", summary: "Конец loop — не activity report, а решение repeat/change/verify/stop.", actions: ["Сравните intended work с completed/blocked.", "Отделите quantity signals от quality/outcome evidence.", "Найдите recurring error/friction.", "Определите bounded correction и evidence её эффекта." ] },
  ],
  scenario: "Синтетический workday: несколько logistics tasks, одна opportunity blocked missing carrier approval, setup item требует refresh, follow-up требует другую authorized role.",
  boundaries: logisticsPrivacy,
};

const positioningOffer = {
  program_slug: "marketing",
  lesson_id: "positioning-offer",
  version: "2026-09-01-ru-v1",
  title: "Позиционирование и offer: определите полезное следующее действие",
  purpose: "Связать конкретную audience/business problem с bounded service scope, evidence boundary и useful next action без promise outcome.",
  objectives: ["Определять business objective до channel/format.", "Называть specific audience/problem проверяемым языком.", "Отделять useful scope от unsupported promises/assumptions/future possibilities.", "Определять available evidence и human verification gaps.", "Выбирать one next action, который destination реально выполняет."],
  sections: [
    { title: "Начните с business objective", summary: "Channel — не цель. Сначала определите действие, которое нужно бизнесу.", actions: ["Назовите одну primary audience и одну проблему, которую стоит решать.", "Определите useful next action: review, compare, prepare, apply, request или schedule только если destination это поддерживает.", "Не начинайте с posting volume, follower targets или platform tactic." ] },
    { title: "Стройте offer вокруг bounded scope", summary: "Полезный offer объясняет, что можно проверить/сделать, что вне scope и какое решение остаётся за customer/human owner.", actions: ["Опишите service/learning scope простым языком.", "Отделите current capability от future ideas.", "Назовите important exclusion/decision boundary.", "Используйте differentiation, которую можно доказать, а не unverified superlative." ] },
    { title: "Отделите proof от promise", summary: "Evidence поддерживает claim, но не превращает uncertain future result в guarantee.", actions: ["Определите facts в approved source.", "Отметьте assumptions/estimates/unresolved claims для human review.", "Не превращайте historical results/platform behavior/single case в universal promise." ] },
  ],
  scenario: "Синтетический service business имеет website/marketing capability, но message смешивает audience/features/broad outcome claims и несколько CTA.",
  assignment: { submission_type: "written_reflection", max_words: 250, prompt: "Создайте six-part positioning/offer frame для synthetic business.", parts: ["Audience — конкретная audience/problem importance.", "Problem — current friction без exaggeration.", "Useful scope — что offer реально review/build/improve.", "Evidence boundary — supported vs verification needed.", "Differentiation/objection — defensible distinction или concern.", "Next action — один CTA, который destination выполняет сейчас." ] },
  rubric: [criterion("audience_problem", "Audience и problem", "Audience/problem specific/coherent."), criterion("scope_boundary", "Scope boundary", "Useful scope/exclusions clear."), criterion("differentiation", "Defensible differentiation", "Difference concrete, not unverifiable superiority."), criterion("evidence_safety", "Evidence safety", "Facts/assumptions/review claims separated."), criterion("objection_clarity", "Objection clarity", "No pressure/invented urgency/outcome promise."), criterion("cta_fit", "CTA fit", "Next action fits destination readiness." )],
  boundaries: marketingPrivacy,
  next: { lesson_id: "website-first-content", label: "Перейти к website-first content" },
};

const websiteFirstContent = {
  program_slug: "marketing",
  lesson_id: "website-first-content",
  version: "2026-09-01-ru-v1",
  title: "Website-first content: соберите план дистрибуции на неделю",
  purpose: "Превратить approved public website assets в coherent five-record organic distribution plan без disconnected posts/homepage routing.",
  objectives: ["Определять canonical website owner темы.", "Связывать topic с audience/funnel stage.", "Создавать platform-appropriate concepts.", "Писать useful hooks/value statements без unsupported outcomes.", "Выбирать CTA под destination и privacy-safe measurement.", "Flag evidence/entity/freshness/privacy/platform uncertainty."],
  sections: [
    { title: "Начните с canonical destination", summary: "Каждая content record начинается с approved public page, которая владеет темой.", actions: ["Назовите exact public destination до hook.", "Определите audience/funnel stage.", "Выберите один CTA, который destination выполняет." ] },
    { title: "Адаптируйте под platform", summary: "Facebook, Threads и Instagram требуют разной presentation.", actions: ["Facebook: enough context before CTA.", "Threads: observation/tension/useful opinion concise.", "Instagram: visual idea и realistic destination strategy.", "Не публикуйте identical copy across platforms." ] },
    { title: "Сохраняйте privacy-safe measurement", summary: "UTM описывает source/medium/campaign/variant, но не несёт PII/private data.", actions: ["utm_source=facebook|threads|instagram.", "utm_medium=organic_social.", "Controlled campaign value.", "Stable safe variant ID in utm_content.", "No names/emails/phones/private values in URL." ] },
  ],
  scenario: "Synthetic U.S.-market Hermes ecosystem имеет approved public pages и требует one-week organic plan без social credentials/private analytics/real leads/contracts/rates/internal conversations.",
  approved_sources: [source("Dispatch Service vs Self-Dispatch", "/logistics/resources/dispatch-service-vs-self-dispatch/"), source("Broker Setup Packet Checklist", "/logistics/resources/broker-setup-packet-checklist/"), source("Search-to-Inquiry Conversion Checklist", "/resources/search-to-inquiry-conversion-checklist/"), source("Academy — U.S. Logistics Operations", "/academy/us-logistics-operations/"), source("Technical SEO Checklist", "/resources/technical-seo-checklist/")],
  assignment: { submission_type: "written_reflection", prompt: "Создайте ровно пять content records — по одной на approved source page.", parts: ["Day/sequence, direction, canonical destination, audience/funnel stage.", "Primary platform/format, hook, claim-safe value, 3 points, CTA.", "Privacy-safe UTM, evidence status, related asset, KPI, human-review note.", "Существенно варьируйте topics/hooks/formats/CTA." ] },
  rubric: [criterion("five_records", "Ровно пять records", "Five complete records."), criterion("canonical_ownership", "Canonical ownership", "Relevant public page, not homepage/preview/private."), criterion("audience_funnel", "Audience и funnel", "Specific/consistent."), criterion("platform_fit", "Platform fit", "Format/copy fit platform."), criterion("hook_value", "Useful hook/value", "Specific/educational/no clickbait."), criterion("cta_quality", "CTA quality", "Action fits page readiness."), criterion("utm_safety", "UTM safety", "Normalized/allowlisted/no PII."), criterion("evidence_claims", "Evidence и claims", "Facts supported/uncertain flagged."), criterion("non_duplication", "Non-duplication", "Meaningful variation."), criterion("measurement_review", "Measurement/review", "KPI and approval need clear." )],
  boundaries: marketingPrivacy,
  next: { lesson_id: "platform-distribution", label: "Перейти к platform distribution" },
};

const platformDistribution = {
  program_slug: "marketing",
  lesson_id: "platform-distribution",
  version: "2026-09-01-ru-v1",
  title: "Platform distribution: адаптируйте один источник без duplicate cross-posting",
  purpose: "Превратить approved canonical asset в platform-specific concepts, сохраняя source ownership/destination/claim safety/human approval.",
  objectives: ["Разные jobs для platforms.", "Canonical website/asset owner.", "Match hook/format/visual/destination.", "Privacy-safe tracking.", "Detect duplicate/review blockers.", "Keep publication/account access human-controlled."],
  sections: [
    { title: "Дайте каждой platform отдельную задачу", summary: "Каждый derivative соответствует channel context.", actions: ["Facebook: context/discussion.", "Threads: observation/question.", "Instagram: visual proof/reel/story/carousel.", "LinkedIn: professional/process framing.", "X: concise finding after verification.", "Video/email only with rights/consent/destination approved." ] },
    { title: "Сохраняйте canonical owner и destination", summary: "Derivative distributes source rather than replacing it.", actions: ["Relevant page, not generic homepage.", "One CTA.", "Stable privacy-safe variant.", "No submitted/private values in URL." ] },
    { title: "Проверяйте до внешнего действия", summary: "Draft separated from reviewed/approved/manual-export-ready.", actions: ["Source freshness/claim/privacy/entity ownership.", "Detect thin duplicates.", "Flag unsupported platform behavior.", "Human controls real external action." ] },
  ],
  scenario: "Synthetic approved public guide needs channel-specific distribution with no social credentials/customer list/private analytics/ad account/messaging permission.",
  assignment: { submission_type: "written_reflection", max_words: 450, prompt: "Создайте четыре meaningfully different variants.", parts: ["Facebook variant.", "Threads variant.", "Instagram variant.", "One LinkedIn/X/video/email variant + verification condition.", "Canonical source, tracking idea, human-review blocker for all." ] },
  rubric: [criterion("canonical_source", "Canonical source", "Approved public owner/destination preserved."), criterion("platform_roles", "Platform roles", "Defensible role per platform."), criterion("meaningful_adaptation", "Meaningful adaptation", "Hooks/formats differ materially."), criterion("destination_accuracy", "Destination accuracy", "CTA/link strategy realistic."), criterion("tracking_privacy", "Tracking privacy", "Stable non-personal tracking."), criterion("claim_safety", "Claim safety", "No invented results/guarantees."), criterion("duplicate_control", "Duplicate control", "Thin duplicates detected/rejected."), criterion("human_gate", "Human approval gate", "External action human-controlled." )],
  boundaries: marketingPrivacy,
  next: { lesson_id: "lead-journey", label: "Перейти к lead journey" },
};

const leadJourney = {
  program_slug: "marketing",
  lesson_id: "lead-journey",
  version: "2026-09-01-ru-v1",
  title: "Lead journey: соедините внимание с явным human handoff",
  purpose: "Построить privacy-safe path source→destination→CTA→qualification→human owner→next step.",
  objectives: ["Route attention to correct page.", "One CTA fitting stage.", "Minimum qualification.", "Preserve source/campaign/owner/status/next action.", "Keep submitted values out of URLs/analytics.", "Identify journey friction."],
  sections: [
    { title: "Направляйте на правильный destination", summary: "Topic ведёт на relevant service/guide/program/technical owner.", actions: ["Name source/destination separately.", "Confirm CTA fulfillment.", "Avoid homepage/unrelated form." ] },
    { title: "Квалифицируйте только нужное", summary: "Qualification reduces uncertainty without data dump.", actions: ["Only fields needed for routing/review.", "No personal/private values in URL/analytics.", "Explain non-obvious fields." ] },
    { title: "Создайте явный handoff", summary: "Inquiry needs owner/source/status/next action/review/closure.", actions: ["Responsible role.", "Preserve source/campaign.", "Set status/next action.", "Define stop/correction/closure." ] },
  ],
  scenario: "Synthetic visitor finds Hermes resource through organic concept and considers asking for help; learner designs journey without identity/private values.",
  assignment: { submission_type: "written_reflection", max_words: 350, prompt: "Соберите complete source-to-human-handoff journey.", parts: ["Source/entry.", "Destination/CTA.", "Minimum qualification + why.", "Human owner role.", "Status/next action/closure.", "Privacy-safe measurement events." ] },
  rubric: [criterion("source_destination", "Source и destination", "Relevant canonical owner."), criterion("cta_fit", "CTA fit", "CTA fits capability/stage."), criterion("minimal_qualification", "Minimal qualification", "Necessary fields only."), criterion("privacy_boundary", "Privacy boundary", "No submitted values in public telemetry."), criterion("handoff_owner", "Human handoff owner", "Role/status/next action clear."), criterion("closure_path", "Closure path", "Safe decline/close condition."), criterion("friction_measurement", "Friction measurement", "Events locate stage without false causation." )],
  boundaries: marketingPrivacy,
  next: { lesson_id: "sales-follow-up", label: "Перейти к sales follow-up" },
};

const salesFollowUp = {
  program_slug: "marketing",
  lesson_id: "sales-follow-up",
  version: "2026-09-01-ru-v1",
  title: "Sales follow-up: сохраните контекст и один полезный следующий шаг",
  purpose: "Превратить inbound marketing response в concise pressure-free follow-up с source context, focused question и clear next action.",
  objectives: ["Preserve source/CTA/prior response context.", "Ask one focused discovery question.", "Answer supported facts only.", "Offer one next step without pressure.", "Record status/next action/stop condition."],
  sections: [
    { title: "Сохраните marketing context", summary: "Follow-up знает source/page/CTA, чтобы человек не повторял journey.", actions: ["Summarize relevant context.", "Reference actual question/action.", "Do not invent intent from page view/click." ] },
    { title: "Уточняйте до предложения", summary: "One focused question improves next decision.", actions: ["Acknowledge stated concern/goal.", "Ask question changing next action.", "Address stated issue, not every feature." ] },
    { title: "Закройте loop без давления", summary: "End with one clear option + stop/timing condition.", actions: ["Offer only available review/call/resource.", "Allow decline/pause/timing change.", "Record status/next action." ] },
  ],
  scenario: "Synthetic service-business owner reaches marketing intake after website-first resource; already publishes content but cannot identify useful inquiries and doubts value of another project review.",
  assignment: { submission_type: "written_reflection", max_words: 180, prompt: "Подготовьте bounded follow-up и handoff note.", parts: ["Context.", "One discovery question.", "Claim-safe response.", "One useful next action.", "Role-owned status/next action/stop condition." ] },
  rubric: [criterion("context_preserved", "Сохранение контекста", "Source/concern preserved without invented intent."), criterion("discovery_question", "Диагностический вопрос", "Focused question improves next decision."), criterion("claim_safety", "Безопасность обещаний", "No traffic/lead/sales/ranking promise."), criterion("next_step", "Полезный следующий шаг", "One available action without pressure."), criterion("crm_discipline", "Дисциплина handoff", "Status/role/next action/stop reviewable."), criterion("tone_length", "Тон и длина", "Professional/concise/respectful/within 180 words." )],
  boundaries: marketingPrivacy,
  next: { lesson_id: "analytics-improvement", label: "Перейти к analytics и improvement" },
};

const analyticsImprovement = {
  program_slug: "marketing",
  lesson_id: "analytics-improvement",
  version: "2026-09-01-ru-v1",
  title: "Analytics и improvement: измеряйте полный путь",
  purpose: "Использовать privacy-safe evidence по source/landing/CTA/qualification/handoff, чтобы выбрать next improvement без vanity metric/causation errors.",
  objectives: ["Define privacy-safe events across full path.", "Separate indicators from inquiry quality/outcomes.", "Separate observation from causation.", "Identify friction stage.", "Turn repeated failures into specific improvement."],
  sections: [
    { title: "Измеряйте полный path", summary: "Measurement connects source/landing/engagement/CTA/qualification/handoff when lawful attribution exists.", actions: ["Track page view/engagement without submitted values.", "Track CTA and form start separately.", "Track approved handoff/qualified inquiry separately.", "Use reviewed business outcome only when lawful/available." ] },
    { title: "Не останавливайтесь на vanity metrics", summary: "Views/clicks/post volume support diagnosis, not final result.", actions: ["Compare metric to its stage.", "Do not claim causation from correlation.", "Flag missing attribution." ] },
    { title: "Возвращайте evidence в system", summary: "Measurement matters when it changes next review decision.", actions: ["Repeated questions→FAQ/explanation.", "Traffic + weak CTA→clarity/offer review.", "Qualification failure→page/form/audience review.", "Document change + confirming/refuting evidence." ] },
  ],
  scenario: "Synthetic evidence: A has more sessions but weak CTA; B fewer sessions but stronger CTA progression and some human-reviewed qualified inquiries; no revenue attribution/causal experiment.",
  assignment: { submission_type: "written_reflection", max_words: 300, prompt: "Создайте evidence-safe diagnosis и одно next improvement.", parts: ["Event chain.", "Supported observation.", "Vanity-metric boundary.", "One friction hypothesis.", "One bounded improvement.", "Next evidence." ] },
  rubric: [criterion("complete_path", "Complete path", "Covers source/landing/CTA/qualification/handoff."), criterion("privacy_safe", "Privacy-safe events", "No submitted/private/personal values."), criterion("observation_causation", "Observation vs causation", "Facts separated from hypotheses."), criterion("vanity_boundary", "Vanity-metric boundary", "Supporting metrics not final outcome."), criterion("friction_stage", "Friction stage", "Defensible stage identified."), criterion("bounded_improvement", "Bounded improvement", "One controllable element, no result promise."), criterion("next_evidence", "Next evidence", "Evidence can support/refute next decision." )],
  boundaries: marketingPrivacy,
};

export const ACADEMY_LESSON_CONTENT_RU = {
  "us-logistics-operations": {
    "dispatch-foundations": dispatchFoundations,
    "carrier-broker-communication": carrierBrokerCommunication,
    "equipment-lane-logic": equipmentLaneLogic,
    "broker-setup-packet": brokerSetupPacket,
    "negotiation-practice": negotiationPractice,
    "operating-rhythm": operatingRhythm,
  },
  marketing: {
    "positioning-offer": positioningOffer,
    "website-first-content": websiteFirstContent,
    "platform-distribution": platformDistribution,
    "lead-journey": leadJourney,
    "sales-follow-up": salesFollowUp,
    "analytics-improvement": analyticsImprovement,
  },
};

export function getAcademyLessonContentRu(programSlug, lessonId) {
  return ACADEMY_LESSON_CONTENT_RU[String(programSlug || "")]?.[String(lessonId || "")] || null;
}
