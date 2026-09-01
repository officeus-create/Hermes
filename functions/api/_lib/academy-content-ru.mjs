const source = (title, path) => ({ title, path });
const criterion = (key, label, pass) => ({ key, label, pass });

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
    {
      title: "Этап 1 — ясный первый контакт",
      summary: "Установите, кто говорит, почему разговор может быть релевантен и готов ли человек продолжить.",
      actions: ["Сделайте opening достаточно коротким, чтобы собеседник мог ответить.", "Сформулируйте цель простым языком.", "Спросите разрешение продолжить или задайте один простой relevance question.", "Не обещайте guaranteed loads, rates, direct shippers, savings или results."],
    },
    {
      title: "Этап 2 — диагностика",
      summary: "Поймите текущую ситуацию, проблему, влияние, желаемый результат и decision process до предложения следующего шага.",
      actions: ["Спросите, как работа устроена сегодня.", "Найдите uncertainty, delays, missed follow-up или unnecessary work.", "Уточните, что улучшенный процесс должен сделать проще или понятнее.", "Коротко резюмируйте услышанное до перехода дальше."],
    },
    {
      title: "Этап 3 — scope и следующий шаг",
      summary: "Объясните проверяемый next step, границы ответственности сторон и реально необходимые данные.",
      actions: ["Назовите, что входит и не входит в scope.", "Отделите данные, нужные сейчас, от чувствительной информации для approved secure route позже.", "Назовите, кто принимает final operating, booking, safety или financial decision.", "Не выдумывайте urgency, acceptance, timing или financial outcomes."],
    },
    {
      title: "Этап 4 — уточнение возражения",
      summary: "Цель — понять причину hesitation и определить, существует ли полезный next step, а не победить человека.",
      actions: ["Признайте concern без спора.", "Задайте один clarifying question.", "Отвечайте только на заявленную проблему.", "Повторите boundary или вариант и примите ясное «нет»."],
    },
    {
      title: "Этап 5 — follow-up без давления",
      summary: "Сохраните контекст и выполните согласованное действие без повторяющегося нежелательного контакта.",
      actions: ["Назовите причину follow-up и кратко напомните прошлый разговор.", "Дайте обещанный resource или один вопрос и один next action.", "Позвольте отказаться или изменить timing.", "Зафиксируйте next action и stop condition; не обходите отказ другой учётной записью или формулировкой."],
    },
  ],
  scenario: "Синтетический разговор: carrier заинтересован в улучшении процесса, но неясно, какая проблема для него главная и какой следующий шаг действительно полезен.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 250,
    prompt: "Разберите синтетический разговор по пяти этапам и подготовьте безопасный следующий ответ.",
    parts: ["Определите текущий этап разговора.", "Напишите один вопрос, который изменит следующее решение.", "Сформулируйте claim-safe ответ без обещания результата.", "Предложите один доступный next step.", "Зафиксируйте status, next action и stop condition."],
  },
  rubric: [
    criterion("stage", "Определение этапа", "Этап разговора определён по фактам."),
    criterion("question", "Следующий вопрос", "Вопрос помогает принять следующее решение."),
    criterion("scope", "Ясность scope", "Включённое, исключённое и владелец решения понятны."),
    criterion("objection", "Работа с сомнением", "Нет давления или манипуляции."),
    criterion("follow_up", "Follow-up", "Есть ясный next step и stop condition."),
    criterion("claims", "Безопасность обещаний", "Нет неподтверждённых гарантий."),
  ],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "equipment-lane-logic", label: "Перейти к equipment и lane logic" },
};

const equipmentLaneLogic = {
  program_slug: "us-logistics-operations",
  lesson_id: "equipment-lane-logic",
  version: "2026-09-01-ru-v1",
  title: "Equipment и lane logic: проверяйте fit до рекомендации",
  purpose: "Проверять equipment, capacity, deadhead, timing, route и pickup/delivery constraints, не называя opportunity безопасной, прибыльной или готовой к booking до решения carrier.",
  objectives: ["Определять operating facts, необходимые до рекомендации opportunity.", "Разделять equipment fit, route fit, timing fit и commercial information.", "Рассматривать deadhead и pickup/delivery access как review inputs, а не универсальные decision rules.", "Явно отмечать facts, assumptions и unanswered questions.", "Оставлять safety, operating judgment и final approval за carrier."],
  sections: [
    { title: "Проверьте equipment и практическую capacity", summary: "Truck/trailer type, practical capacity, dimensions, specialty capability и restrictions должны быть понятны до обсуждения fit.", actions: ["Используйте approved equipment profile carrier вместо предположений по общему truck class.", "Подтвердите capacity и relevant restrictions.", "Неизвестные dimensions, operability или specialty requirements превращайте в вопросы."] },
    { title: "Проверьте route, deadhead и timing", summary: "Route — это не только origin/destination; current location, empty miles, windows и access могут изменить fit review.", actions: ["Отделите current location от pickup и loaded route.", "Подтвердите pickup/delivery windows или constraints, если они доступны.", "Покажите deadhead/access considerations без выдуманного universal threshold."] },
    { title: "Верните решение carrier", summary: "Dispatch support организует факты и конфликты, но carrier контролирует safety, operating-cost judgment и final acceptance.", actions: ["Суммируйте confirmed facts.", "Перечислите unresolved questions и material assumptions.", "Не называйте opportunity profitable, safe или approved без соответствующего evidence и решения."] },
  ],
  approved_sources: [source("Dispatch Service vs Self-Dispatch", "/logistics/resources/dispatch-service-vs-self-dispatch/")],
  scenario: "Синтетическая opportunity: approved equipment profile и preferred operating area известны, но отсутствует одно access constraint и неизвестно, подходят ли carrier текущие deadhead и timing.",
  assignment: { submission_type: "written_reflection", max_words: 300, prompt: "Составьте fact-assumption-question fit review для синтетической opportunity.", parts: ["Confirmed facts — перечислите только реально известные equipment, route и timing данные.", "Assumptions — отметьте всё, что хочется предположить, но нельзя доказать.", "Questions — составьте минимальный список вопросов для equipment, route, access и timing fit.", "Carrier decision — укажите, какое решение остаётся у carrier до booking.", "Recommendation wording — напишите одну безопасную формулировку без profitable, guaranteed или approved claim."] },
  rubric: [criterion("equipment_facts", "Equipment facts", "Equipment и capacity основаны на approved profile, а не на догадке."), criterion("route_timing", "Route и timing", "Deadhead, area, windows и access рассматриваются как отдельные review inputs."), criterion("fact_assumption", "Fact vs assumption", "Unknowns не выдаются за факты."), criterion("useful_questions", "Полезные вопросы", "Questions необходимы и достаточно конкретны для устранения uncertainty."), criterion("carrier_decision", "Решение carrier", "Safety, operating judgment и final approval остаются у carrier."), criterion("claim_safety", "Безопасность обещаний", "Нет profitability, rate, utilization, safety или booking guarantee.")],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "documents-setup", label: "Перейти к documents и setup" },
};

const documentsSetup = {
  program_slug: "us-logistics-operations",
  lesson_id: "documents-setup",
  version: "2026-09-01-ru-v1",
  title: "Документы и setup: проверить, передать, зафиксировать, обновить",
  purpose: "Понять, как готовить и поддерживать controlled carrier setup packet, не превращая workflow в хранилище credentials, лишних personal data или непроверенных payment changes.",
  objectives: ["Распознавать setup areas: business identity, tax, authority, insurance, equipment, payment/factoring, communication ownership и document control.", "Использовать controlled core packet и отдельно проверять requirements каждого broker.", "Следовать циклу verify → request review → secure submission → status record → refresh.", "Распознавать информацию, которой не место в setup packet, public URL, analytics event или ordinary learner fixture.", "Сохранять carrier authorization и final responsibility явными."],
  sections: [
    { title: "Создайте проверенный core packet", summary: "Единый core packet уменьшает conflicting business names, expired certificates, incorrect payment instructions и unnecessary data exposure.", actions: ["Проверьте business identity и authorized signer role.", "Подтвердите authority и insurance status через подходящие sources.", "Поддерживайте equipment profile и operating restrictions актуальными.", "Документируйте payment/factoring и communication ownership, не доверяя неожиданным changes вслепую."] },
    { title: "Адаптируйте пакет под broker request", summary: "Один packet не гарантирует acceptance и не удовлетворяет автоматически каждого broker.", actions: ["Сравните request с controlled core packet.", "Устраните missing, expired или uncertain items.", "Используйте approved portal или controlled route для required documents.", "Зафиксируйте, что отправлено, current status и responsible owner."] },
    { title: "Защитите чувствительную информацию", summary: "Setup work не должен превращаться в credential, identity или payment-data dump.", actions: ["Никогда не включайте passwords, API keys, authentication/recovery codes.", "Не добавляйте identity documents или sensitive personal values без конкретного approved secure process.", "Независимо проверяйте неожиданные banking/payment changes.", "Отделяйте load-specific rate confirmations и transport documents от reusable core setup packet."] },
  ],
  approved_sources: [source("Broker Setup Packet Checklist", "/logistics/resources/broker-setup-packet-checklist/")],
  scenario: "Синтетический кейс: broker запрашивает setup у carrier. Core packet содержит актуальные business/authority данные, но insurance document нужно обновить, а неожиданное сообщение предлагает новые payment instructions.",
  assignment: { submission_type: "written_reflection", max_words: 350, prompt: "Создайте безопасный setup-review plan для синтетического запроса.", parts: ["Packet areas — определите, какие core areas относятся к запросу.", "Verify — назовите facts/document versions, которые нужно проверить до submission.", "Secure submission — укажите, что передаётся и через какой approved route.", "Payment-change control — объясните, как обработать неожиданное instruction до любого изменения.", "Status record — определите non-sensitive metadata, которые можно хранить без private documents.", "Refresh rule — укажите trigger для replacement/re-verification."] },
  rubric: [criterion("packet_scope", "Scope пакета", "Relevant setup areas определены без предположения об одном universal broker packet."), criterion("verification", "Проверка", "Identity, authority, insurance, equipment или payment uncertainty устранены до representation."), criterion("secure_submission", "Secure submission", "Только required information передаётся approved secure process."), criterion("credential_boundary", "Credential boundary", "Passwords, codes, recovery info и unnecessary identity data исключены."), criterion("payment_control", "Payment control", "Unexpected payment changes требуют independent verification."), criterion("status_refresh", "Status и refresh", "Learner хранит non-sensitive status metadata и определяет refresh trigger."), criterion("approval_boundary", "Approval boundary", "Complete packet не описывается как guaranteed broker approval.")],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "negotiation-practice", label: "Перейти к negotiation practice" },
};

const negotiationPractice = {
  program_slug: "us-logistics-operations",
  lesson_id: "negotiation-practice",
  version: "2026-09-01-ru-v1",
  title: "Практика переговоров: уточните возражение",
  purpose: "Применить метод conversation stages к синтетическому objection и подготовить ограниченный письменный ответ для human review.",
  objectives: ["Определять current conversation stage и объяснять почему.", "Признавать concern без атаки на текущую схему работы.", "Задавать один focused diagnostic question.", "Предлагать claim-safe next option, сохраняя контроль у собеседника."],
  scenario: "Синтетический кейс: car-hauling owner-operator говорит, что уже получает dispatch help, не хочет менять рабочий процесс, предпочитает direct-shipper freight и не хочет платить дважды за одинаковую ответственность.",
  assignment: { submission_type: "written_reflection", max_words: 120, prompt: "Напишите один ответ ровно из четырёх частей.", parts: ["Conversation stage — определите этап и объясните его одним предложением.", "Acknowledgment — признайте concern без согласия с неподтверждённым claim.", "Next question — задайте один вопрос, выявляющий primary issue за objection.", "Boundary and option — объясните, что можно проверить дальше без обещаний direct shippers, rates, savings, revenue или contract."] },
  rubric: [criterion("stage_identification", "Определение этапа", "Правильно определён objection clarification и дана defensible причина."), criterion("acknowledgment", "Acknowledgment", "Concern признан без критики current provider и ложного согласия."), criterion("diagnostic_question", "Diagnostic question", "Один focused question раскрывает primary concern."), criterion("claim_safety", "Claim safety", "Нет обещаний direct shippers, loads, rates, savings, revenue, acceptance, timing или outcomes."), criterion("control_next_step", "Контроль и next step", "Предлагается comparison/reviewed option, final decision остаётся у человека."), criterion("tone_length", "Тон и длина", "Ответ профессиональный, уважительный и до 120 слов.")],
  boundaries: logisticsPrivacy,
  next: { lesson_id: "operating-rhythm", label: "Перейти к operating rhythm" },
};

const operatingRhythm = {
  program_slug: "us-logistics-operations",
  lesson_id: "operating-rhythm",
  version: "2026-09-01-ru-v1",
  title: "Операционный ритм: планировать, действовать, подтверждать, проверять, исправлять",
  purpose: "Превратить ежедневную логистическую работу в повторяемый control loop с priorities, status, handoff, evidence и correction вместо зависимости от памяти или объёма активности.",
  objectives: ["Определять небольшой набор priorities до начала работы.", "Фиксировать status и evidence так, чтобы другой authorized teammate/reviewer понял ситуацию.", "Использовать handoff с owner, context, current state и next action.", "Рассматривать activity metrics как signals, а не гарантии quality/business outcomes.", "Закрывать цикл review ошибок, unresolved items и next improvement target."],
  sections: [
    { title: "Планируйте вокруг priorities", summary: "Полезный plan показывает важную работу, prerequisites и fallback tasks, а не заполняет расписание случайными activity counts.", actions: ["Назовите top operating priorities и почему они важны.", "Определите information/approvals, необходимые до продвижения каждой priority.", "Держите fallback task для blocked work, не скрывая blocker."] },
    { title: "Сделайте status и handoff проверяемыми", summary: "Teammate должен понять, что произошло, что unresolved и кто владеет next action, не восстанавливая день по сообщениям.", actions: ["Запишите current state и material evidence.", "Назовите responsible role для next action.", "Сохраните relevant context без лишних private data.", "Эскалируйте blockers, требующие carrier, supervisor или другого authorized human decision."] },
    { title: "Проверяйте и исправляйте", summary: "Конец loop — не отчёт об активности, а решение, что повторить, изменить, проверить или остановить дальше.", actions: ["Сравните intended work с completed и blocked work.", "Разделите quantity signals и quality/outcome evidence.", "Найдите один recurring error/friction point.", "Определите одну bounded correction и evidence, которое покажет её эффект."] },
  ],
  scenario: "Синтетический рабочий день: несколько logistics tasks запланированы, одна opportunity блокируется missing carrier approval, setup требует refreshed information, а follow-up должен выполнить другой authorized role.",
  assignment: { submission_type: "written_reflection", max_words: 350, prompt: "Создайте synthetic operating plan и end-of-cycle review по одному control loop.", parts: ["Priorities — выберите три tasks и укажите prerequisite/decision owner для каждого.", "Status format — покажите, как фиксируются completed, blocked и waiting states.", "Handoff — напишите один role-based handoff с context, current state и next action.", "Evidence — назовите доказательство выполненной работы без private records.", "Review — найдите один friction point и одну correction для следующего цикла.", "Metric boundary — объясните, почему activity volume сам по себе не доказывает quality, acceptance или business outcome."] },
  rubric: [criterion("priority_clarity", "Ясность priorities", "Tasks упорядочены по defensible operating reason, а не arbitrary activity volume."), criterion("state_visibility", "Видимость state", "Completed, blocked и waiting work различимы."), criterion("handoff_quality", "Качество handoff", "Responsible role, context, current state и next action ясны."), criterion("evidence_boundary", "Граница evidence", "Useful evidence названо без live carrier/shipment/customer data."), criterion("correction_loop", "Correction loop", "Один friction point приводит к конкретной next-cycle correction."), criterion("metric_interpretation", "Интерпретация metrics", "Activity counts — signals, а не proof качества, revenue или progression.")],
  boundaries: logisticsPrivacy,
};

const positioningOffer = {
  program_slug: "marketing",
  lesson_id: "positioning-offer",
  version: "2026-09-01-ru-v1",
  title: "Позиционирование и offer: определите полезный следующий шаг",
  purpose: "Связать конкретную аудиторию и бизнес-проблему с ограниченным service scope, evidence boundary и полезным next action без обещания результата.",
  objectives: ["Определять business objective до выбора channel/format.", "Называть конкретную audience и problem языком, который можно проверить по approved offer.", "Отделять useful scope от unsupported promises, assumptions и future possibilities.", "Понимать, какое evidence доступно и что требует human verification.", "Выбирать один next action, который destination реально может выполнить."],
  sections: [
    { title: "Начните с business objective", summary: "Channel — не цель. Сначала определите действие, которое нужно бизнесу.", actions: ["Назовите одну primary audience и одну проблему, которую стоит решать.", "Определите useful next action: review, compare, prepare, apply, request или schedule только если destination это поддерживает.", "Не начинайте с posting volume, follower targets или platform tactic."] },
    { title: "Стройте offer вокруг bounded scope", summary: "Полезный offer объясняет, что можно проверить/сделать, что вне scope и какое решение остаётся за customer/human owner.", actions: ["Опишите service/learning scope простым языком.", "Отделите current capability от future ideas.", "Назовите важное exclusion/decision boundary.", "Используйте differentiation, которую можно доказать, а не непроверяемый superlative."] },
    { title: "Отделите proof от promise", summary: "Evidence поддерживает claim, но не превращает неопределённый future result в гарантию.", actions: ["Определите facts, видимые в approved source.", "Отметьте assumptions, estimates и unresolved claims для human review.", "Не превращайте historical results, platform behavior или один case в universal promise."] },
  ],
  scenario: "Синтетический service business имеет полезный сайт и marketing capability, но его message смешивает audience, features, broad outcome claims и несколько конкурирующих CTA.",
  assignment: { submission_type: "written_reflection", max_words: 250, prompt: "Создайте six-part positioning/offer frame для синтетического бизнеса.", parts: ["Audience — одна конкретная audience и почему проблема важна.", "Problem — текущая friction без преувеличения.", "Useful scope — что offer реально помогает review/build/improve.", "Evidence boundary — что поддержано и что требует verification.", "Differentiation or objection — одна defensible разница или вероятный concern.", "Next action — один CTA, который destination может выполнить сейчас."] },
  rubric: [criterion("audience_problem", "Audience и problem", "Audience/problem конкретны, coherent и не раздуты."), criterion("scope_boundary", "Scope boundary", "Useful scope и important exclusions ясны."), criterion("differentiation", "Defensible differentiation", "Разница конкретна и не основана на unverifiable superiority claims."), criterion("evidence_safety", "Evidence safety", "Supported facts, assumptions и review-needed claims разделены."), criterion("objection_clarity", "Objection clarity", "Concern обработан без pressure, invented urgency или outcome promises."), criterion("cta_fit", "CTA fit", "Next action соответствует destination и current readiness.")],
  boundaries: marketingPrivacy,
  next: { lesson_id: "website-first-content", label: "Перейти к website-first content" },
};

const websiteFirstContent = {
  program_slug: "marketing",
  lesson_id: "website-first-content",
  version: "2026-09-01-ru-v1",
  title: "Website-first content: соберите план дистрибуции на неделю",
  purpose: "Превратить approved public website assets в связный organic distribution plan из пяти записей, а не создавать несвязанные посты или отправлять всю аудиторию на homepage.",
  objectives: ["Определять правильный canonical website owner темы.", "Связывать каждую тему с audience и funnel stage.", "Создавать platform-appropriate concepts вместо копии одного поста.", "Писать useful hooks/value statements без unsupported outcome claims.", "Выбирать один CTA под destination page и privacy-safe measurement path.", "Отмечать evidence, entity, freshness, privacy или platform uncertainty для human review."],
  sections: [
    { title: "Начните с canonical destination", summary: "Каждая content record начинается с approved public page, которая владеет темой.", actions: ["Назовите exact public destination до hook.", "Определите audience/funnel stage для этой page.", "Выберите один CTA, который destination реально выполняет."] },
    { title: "Адаптируйте под platform", summary: "Facebook, Threads и Instagram требуют разной подачи даже для одного canonical source.", actions: ["Facebook: дайте достаточно context до CTA.", "Threads: начните с наблюдения, tension или useful opinion и объясняйте кратко.", "Instagram: начните с visual idea и realistic destination strategy, не предполагая, что любой caption link кликабелен.", "Не публикуйте identical copy на всех платформах и не считайте смену emoji новой версией."] },
    { title: "Сохраняйте privacy-safe measurement", summary: "UTM описывает source, medium, campaign и stable variant, но не должен нести personal/private operational data.", actions: ["Используйте utm_source=facebook|threads|instagram.", "Используйте utm_medium=organic_social.", "Используйте controlled campaign value по business direction.", "Используйте stable safe variant ID в utm_content.", "Не помещайте names, emails, phones, identifiers, private routes, budgets или free-text messages в URL."] },
  ],
  scenario: "Синтетический U.S.-market ecosystem Logistics/Marketing/Technology/Academy имеет approved public pages и нуждается в one-week organic content plan. Learner не получает social credentials, customer data, private analytics, real leads, private routes, contracts, rates или internal conversations.",
  approved_sources: [source("Dispatch Service vs Self-Dispatch", "/logistics/resources/dispatch-service-vs-self-dispatch/"), source("Broker Setup Packet Checklist", "/logistics/resources/broker-setup-packet-checklist/"), source("Search-to-Inquiry Conversion Checklist", "/resources/search-to-inquiry-conversion-checklist/"), source("Academy — U.S. Logistics Operations", "/academy/us-logistics-operations/"), source("Technical SEO Checklist", "/resources/technical-seo-checklist/")],
  assignment: { submission_type: "written_reflection", prompt: "Создайте ровно пять content records — по одной для каждого approved source page.", parts: ["Для каждой record укажите day/sequence, business direction, canonical destination, target audience и funnel stage.", "Выберите primary platform/format; напишите hook, claim-safe value statement, три key points и один CTA.", "Добавьте privacy-safe UTM, evidence/claim status, related website asset, KPI to observe и одну human-review note.", "Существенно варьируйте topics, hooks, formats и CTA; не повторяйте один template пять раз."] },
  rubric: [criterion("five_records", "Ровно пять records", "Пять полных records, по одной на approved source page."), criterion("canonical_ownership", "Canonical ownership", "Каждая record ведёт на relevant public page, а не homepage/preview/private route."), criterion("audience_funnel", "Audience и funnel", "Audience/stage конкретны и согласованы с source/CTA."), criterion("platform_fit", "Platform fit", "Format/copy соответствуют platform и не предполагают невозможное link behavior."), criterion("hook_value", "Useful hook/value", "Hook/value конкретны и educational без clickbait/unsupported outcomes."), criterion("cta_quality", "CTA quality", "Одно action соответствует page readiness."), criterion("utm_safety", "UTM safety", "UTM normalized/allowlisted и без PII/private data."), criterion("evidence_claims", "Evidence и claims", "Facts видимы в approved source или framed как general education; uncertain claims flagged."), criterion("non_duplication", "Non-duplication", "Topics/hooks/formats/CTA отличаются по сути."), criterion("measurement_review", "Measurement/review", "KPI поддерживает business path, human-review note указывает реальную approval need.")],
  boundaries: marketingPrivacy,
  next: { lesson_id: "platform-distribution", label: "Перейти к platform distribution" },
};

const platformDistribution = {
  program_slug: "marketing",
  lesson_id: "platform-distribution",
  version: "2026-09-01-ru-v1",
  title: "Platform distribution: адаптируйте один источник без duplicate cross-posting",
  purpose: "Превратить один approved canonical asset в platform-specific distribution concepts, сохраняя source ownership, destination accuracy, claim safety и human approval.",
  objectives: ["Давать каждой platform отдельную задачу вместо копии universal post.", "Сохранять website/approved public asset canonical source полного объяснения.", "Связывать hook, format, visual idea и destination strategy с platform context.", "Использовать normalized privacy-safe tracking без personal/operational values в URL.", "Распознавать duplicate distribution и review blockers до внешнего действия.", "Оставлять publication, account access и external communication за authorized human."],
  sections: [
    { title: "Дайте каждой platform разную задачу", summary: "Один source может поддерживать несколько channels, но каждый derivative должен соответствовать тому, как channel показывает context, discussion или visual information.", actions: ["Facebook: context и discussion вокруг problem/next action.", "Threads: sharp observation, tension или useful question.", "Instagram: visual proof idea, demonstration, Reel, Story или carousel и realistic destination strategy.", "LinkedIn: professional context, process insight или decision-maker framing при approved account/format.", "X: concise finding только после verification account ownership/format/destination behavior.", "Video/email: substantial explanation или owned-audience follow-up только при approved rights, consent и destination."] },
    { title: "Сохраняйте canonical owner и tracked destination", summary: "Derivative должен распространять source asset, а не становиться его unreviewed replacement.", actions: ["Ведите на relevant service/resource/program/approved intake, а не generic homepage.", "Используйте один CTA под destination.", "Используйте stable privacy-safe variant identifier.", "Не помещайте submitted values, names, contacts, private routes, budgets или messages в URL params."] },
    { title: "Review до внешнего действия", summary: "Hermes отделяет generated drafts от reviewed/approved/manual-export-ready states; Academy сохраняет ту же границу.", actions: ["Проверьте source freshness, claim approval, privacy и entity ownership.", "Найдите thin duplicate variants до review.", "Flag unsupported platform behavior вместо guess.", "Academy может подготовить draft; реальный post/message/ad/account action контролирует человек."] },
  ],
  scenario: "Синтетический approved public guide требует channel-specific distribution. Learner не имеет social account, publishing credential, customer list, private analytics, ad account или external messaging permission.",
  assignment: { submission_type: "written_reflection", max_words: 450, prompt: "Создайте четыре существенно разные distribution variants для одного approved public asset.", parts: ["Facebook variant: context, format, CTA и destination strategy.", "Threads variant: observation/question, а не copied Facebook text.", "Instagram variant: visual-first concept и realistic profile/Story/destination behavior.", "Один дополнительный variant для LinkedIn, X, video или email и condition для verification до use.", "Для всех четырёх назовите canonical source, privacy-safe tracking idea и human-review blocker."] },
  rubric: [criterion("canonical_source", "Canonical source", "Все variants сохраняют один approved public owner/relevant destination."), criterion("platform_roles", "Platform roles", "У каждой platform defensible role, а не copied purpose."), criterion("meaningful_adaptation", "Meaningful adaptation", "Hooks/formats/presentation отличаются по сути."), criterion("destination_accuracy", "Destination accuracy", "CTA/link strategy учитывают realistic platform behavior/page readiness."), criterion("tracking_privacy", "Tracking privacy", "Tracking использует stable non-personal values без private operational data."), criterion("claim_safety", "Claim safety", "Нет invented results/platform guarantees/unverifiable evidence."), criterion("duplicate_control", "Duplicate control", "Learner объясняет, как thin cross-post duplicates будут detected/rejected."), criterion("human_gate", "Human approval gate", "Real publication/account access/external action остаются human-controlled.")],
  boundaries: marketingPrivacy,
  next: { lesson_id: "lead-journey", label: "Перейти к lead journey" },
};

const leadJourney = {
  program_slug: "marketing",
  lesson_id: "lead-journey",
  version: "2026-09-01-ru-v1",
  title: "Lead journey: соедините внимание с явным human handoff",
  purpose: "Построить privacy-safe path от source/distribution к правильному destination, одному CTA, минимальной qualification, ответственному human owner и измеримому next step.",
  objectives: ["Направлять attention на page, которая владеет promise, а не generic destination.", "Выбирать один CTA, создающий следующее полезное decision без unnecessary friction.", "Собирать только minimum information для next human action.", "Сохранять source, campaign, owner, status и next action через handoff.", "Не помещать submitted values в URLs, analytics и public fixtures.", "Определять, где journey friction должна изменить page, form, targeting или handoff process."],
  sections: [
    { title: "Направляйте внимание на правильный destination", summary: "Service topic ведёт на relevant service/guide, education — на relevant program, technical workflow — на approved technical owner.", actions: ["Назовите source asset и destination отдельно.", "Проверьте, что destination умеет выполнить CTA.", "Не отправляйте всех на homepage или unrelated form."] },
    { title: "Квалифицируйте только то, что нужно следующему решению", summary: "Qualification должна уменьшать uncertainty для human decision, не превращая form/analytics event в private-data dump.", actions: ["Запрашивайте только поля для routing/review.", "Не помещайте personal/private operational values в URLs/analytics payloads.", "Объясняйте, зачем поле нужно, если это не очевидно."] },
    { title: "Создайте явный handoff", summary: "Каждая inquiry нуждается в responsible owner, source context, current status, next action, review history и safe closure/correction path.", actions: ["Назовите responsible business direction или human owner role.", "Сохраните source page/campaign context.", "Задайте current status и один next action.", "Определите stop/correction/closure path вместо endless follow-up."] },
  ],
  scenario: "Синтетический visitor находит полезный Hermes resource через organic social concept, читает страницу и думает попросить помощь. Learner проектирует journey без реальной identity/private values visitor.",
  assignment: { submission_type: "written_reflection", max_words: 350, prompt: "Нарисуйте полный source-to-human-handoff journey для синтетического visitor.", parts: ["Source/entry — canonical asset и distribution context.", "Destination/CTA — exact destination и один next action.", "Qualification — minimum fields для next human decision и зачем они нужны.", "Human owner — responsible direction/role, не private individual.", "Status/next action — initial status, next step и closure/stop condition.", "Measurement — privacy-safe events, показывающие progress/break point."] },
  rubric: [criterion("source_destination", "Source и destination", "Canonical source/destination релевантны и не сведены к generic homepage."), criterion("cta_fit", "CTA fit", "Один CTA соответствует current capability destination и stage visitor."), criterion("minimal_qualification", "Minimal qualification", "Fields необходимы для next decision и не собирают лишнее sensitive detail."), criterion("privacy_boundary", "Privacy boundary", "Submitted values не попадают в URLs, analytics, screenshots/public fixtures."), criterion("handoff_owner", "Human handoff owner", "Responsible role, status и next action explicit."), criterion("closure_path", "Closure path", "Journey имеет safe correction/decline/close condition."), criterion("friction_measurement", "Friction measurement", "Events находят broken stage без false causation/revenue claim.")],
  boundaries: marketingPrivacy,
  next: { lesson_id: "sales-follow-up", label: "Перейти к sales follow-up" },
};

const salesFollowUp = {
  program_slug: "marketing",
  lesson_id: "sales-follow-up",
  version: "2026-09-01-ru-v1",
  title: "Sales follow-up: сохраните контекст и один полезный следующий шаг",
  purpose: "Превратить inbound marketing response в короткий follow-up без давления, сохранив source context, useful question и clear next action.",
  objectives: ["Использовать source page, CTA и prior response как context вместо generic pitch с нуля.", "Задавать один focused discovery question до предположения buyer need.", "Отвечать только на supported information и flag всё, что требует human verification.", "Предлагать один next step без invented urgency/pressure.", "Фиксировать useful status, next action и stop condition."],
  sections: [
    { title: "Сохраните marketing context", summary: "Follow-up должен знать source/page/CTA, которые создали разговор, чтобы человеку не приходилось повторять journey.", actions: ["Кратко суммируйте relevant context.", "Ссылайтесь на реальный вопрос/action человека.", "Не выдумывайте intent из page view/click alone."] },
    { title: "Уточняйте до предложения", summary: "Один focused question должен прояснить ситуацию до detailed next step.", actions: ["Признайте stated concern/goal.", "Задайте question, который меняет полезный next action.", "Отвечайте на stated issue вместо списка всех service features."] },
    { title: "Закройте loop без давления", summary: "Follow-up заканчивается одной clear option и видимым stop/timing condition.", actions: ["Предлагайте review/comparison/call/brief/resource только если он реально доступен.", "Позвольте decline/pause/change timing.", "Запишите current status/next action, чтобы follow-up не зависел от памяти."] },
  ],
  scenario: "Синтетический service-business owner приходит в approved marketing intake после website-first resource. Он уже публикует content, но не понимает, какая активность создаёт useful inquiries, и сомневается, стоит ли review нового marketing project.",
  assignment: { submission_type: "written_reflection", max_words: 180, prompt: "Подготовьте bounded follow-up и короткую handoff note для synthetic inquiry.", parts: ["Context — source и stated concern в 1–2 предложениях.", "Discovery — один focused question, меняющий recommended next step.", "Claim-safe response — что можно review без promise result.", "Next action — один useful option с сохранением контроля человека.", "Handoff note — role-owned status, next action и stop condition без private identifiers."] },
  rubric: [criterion("context_preserved", "Context preserved", "Response использует known source/concern без invented intent."), criterion("discovery_question", "Discovery question", "Focused question существенно улучшает next decision."), criterion("claim_safety", "Claim safety", "Нет обещаний traffic, leads, sales, ranking или других unsupported outcomes."), criterion("next_step", "Useful next step", "Доступное action предложено без pressure/invented urgency."), criterion("crm_discipline", "Handoff discipline", "Status, responsible role, next action и stop condition reviewable."), criterion("tone_length", "Tone/length", "Professional, concise, respectful и до 180 слов.")],
  boundaries: marketingPrivacy,
  next: { lesson_id: "analytics-improvement", label: "Перейти к analytics и improvement" },
};

const analyticsImprovement = {
  program_slug: "marketing",
  lesson_id: "analytics-improvement",
  version: "2026-09-01-ru-v1",
  title: "Analytics и improvement: измеряйте полный путь",
  purpose: "Использовать privacy-safe evidence по source, landing, CTA, qualification и human handoff для next improvement, не считая vanity metrics или correlation доказательством business outcome.",
  objectives: ["Определять privacy-safe events для полного path от source до reviewed handoff.", "Отделять supporting indicators (views/clicks) от inquiry quality и human-reviewed outcomes.", "Различать observation и causal explanation.", "Использовать source/page/CTA/stage evidence для поиска friction.", "Превращать repeated questions/failures в specific content/form/targeting/handoff improvement."],
  sections: [
    { title: "Измеряйте полный path", summary: "Полезный measurement plan связывает source/landing с engagement, CTA, qualification, handoff и approved business outcome, когда lawful attribution действительно существует.", actions: ["Track page view/meaningful engagement без submitted values.", "Track CTA action и form/application start как разные stages.", "Track approved handoff/qualified inquiry отдельно от clicks.", "Используйте human-reviewed business outcome только при lawful/available attribution."] },
    { title: "Не останавливайтесь на vanity metrics", summary: "Followers, views, clicks и posting volume помогают diagnosis, но не являются final business result.", actions: ["Сравнивайте metric с stage, который он представляет.", "Не утверждайте causation, если evidence показывает только correlation.", "Flag missing attribution вместо заполнения gap assumption."] },
    { title: "Возвращайте evidence в content system", summary: "Measurement полезен, когда меняет следующее review decision.", actions: ["Repeated questions превращайте в FAQ/explanation improvements.", "Pages с traffic, но weak CTA engagement, проверяйте на clarity/offer mismatch.", "Repeated qualification failure используйте для review page/form/audience/program description.", "Документируйте change и evidence, которое подтвердит/опровергнет hypothesis."] },
  ],
  scenario: "Синтетическое evidence: Content A привлекает больше sessions, но мало людей доходит до CTA. Content B получает меньше sessions, но больше посетителей доходит до CTA и несколько — до human-reviewed qualified inquiry. Revenue attribution и causal experiment отсутствуют.",
  assignment: { submission_type: "written_reflection", max_words: 300, prompt: "Создайте evidence-safe measurement diagnosis и одно next improvement для synthetic scenario.", parts: ["Event chain — privacy-safe stages от source до human handoff.", "Observation — что evidence реально поддерживает без causal claim.", "Vanity-metric boundary — почему highest traffic не автоматически best outcome.", "Friction hypothesis — один stage для review, объяснение пометьте hypothesis.", "Next improvement — одна bounded page/CTA/qualification/handoff change.", "Next evidence — observation, которое поддержит или оспорит improvement decision."] },
  rubric: [criterion("complete_path", "Complete path", "Measurement покрывает source, landing, CTA, qualification и human handoff."), criterion("privacy_safe", "Privacy-safe events", "Events не содержат submitted values/private messages/personal identifiers."), criterion("observation_causation", "Observation vs causation", "Observed facts отделены от hypotheses."), criterion("vanity_boundary", "Vanity-metric boundary", "Supporting metrics не выдаются за final business result."), criterion("friction_stage", "Friction stage", "Diagnosis определяет defensible journey stage для review."), criterion("bounded_improvement", "Bounded improvement", "Recommendation меняет один controllable element без promise result."), criterion("next_evidence", "Next evidence", "Определено evidence, которое может подтвердить/оспорить next decision.")],
  boundaries: marketingPrivacy,
};

export const ACADEMY_LESSON_CONTENT_RU = {
  "us-logistics-operations": {
    "dispatch-foundations": dispatchFoundations,
    "carrier-broker-communication": carrierBrokerCommunication,
    "equipment-lane-logic": equipmentLaneLogic,
    "documents-setup": documentsSetup,
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
  const program = ACADEMY_LESSON_CONTENT_RU[String(programSlug || "")];
  return program?.[String(lessonId || "")] || null;
}
