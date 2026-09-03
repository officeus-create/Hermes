const RUSSIAN_CANONICAL_FALLBACKS = new Map([
  [
    "Self-tracked completion is not reviewer acceptance, Academy completion, employment, certification, income or permission to work with live operations.",
    "Самостоятельно отмеченное завершение урока не означает принятие reviewer, завершение Academy, трудоустройство, сертификацию, доход или разрешение работать с реальными операциями.",
  ],
  [
    "Packet areas — identify which of the eight core areas are relevant to the request.",
    "Области пакета — определите, какие из восьми основных областей относятся к этому запросу.",
  ],
  [
    "Create a synthetic operating plan and end-of-cycle review using the same control loop.",
    "Создайте синтетический операционный план и итоговый разбор цикла, используя тот же контрольный контур.",
  ],
  [
    "Priorities — choose three tasks and identify the prerequisite or decision owner for each.",
    "Приоритеты — выберите три задачи и укажите prerequisite или владельца решения для каждой.",
  ],
  [
    "Status format — show how completed, blocked and waiting states will be recorded.",
    "Формат статуса — покажите, как будут фиксироваться состояния выполнено, заблокировано и ожидание.",
  ],
  [
    "Handoff — write one role-based handoff with context, current state and next action.",
    "Передача задачи — составьте один handoff по роли с контекстом, текущим состоянием и следующим действием.",
  ],
  [
    "Evidence — name what can demonstrate that work occurred without exposing private records.",
    "Доказательства — укажите, чем можно подтвердить выполненную работу без раскрытия приватных записей.",
  ],
  [
    "Review — identify one friction point and one correction for the next cycle.",
    "Разбор — определите одну точку трения и одно исправление для следующего цикла.",
  ],
  [
    "Metric boundary — explain why activity volume alone does not prove quality, acceptance or business outcome.",
    "Граница метрик — объясните, почему объём активности сам по себе не доказывает качество, принятие работы или бизнес-результат.",
  ],
  ["Priority clarity", "Ясность приоритетов"],
  [
    "Tasks are ordered by a defensible operating reason rather than arbitrary activity volume.",
    "Задачи упорядочены по обоснованной операционной причине, а не по произвольному объёму активности.",
  ],
  ["State visibility", "Видимость состояний"],
  [
    "Completed, blocked and waiting work can be distinguished.",
    "Выполненную, заблокированную и ожидающую работу можно однозначно различить.",
  ],
  ["Handoff quality", "Качество передачи задачи"],
  [
    "Responsible role, context, current state and next action are clear.",
    "Ответственная роль, контекст, текущее состояние и следующее действие понятны.",
  ],
  ["Evidence boundary", "Граница доказательств"],
  [
    "Useful evidence is named without exposing live carrier, shipment or customer data.",
    "Полезные доказательства указаны без раскрытия реальных данных перевозчика, груза или клиента.",
  ],
  ["Correction loop", "Контур исправления"],
  [
    "One friction point leads to a specific next-cycle correction.",
    "Одна точка трения приводит к конкретному исправлению в следующем цикле.",
  ],
  ["Metric interpretation", "Интерпретация метрик"],
  [
    "Activity counts are treated as signals, not proof of quality, revenue or progression.",
    "Количество действий рассматривается как сигнал, а не как доказательство качества, выручки или прогресса.",
  ],
  ["Packet scope", "Объём пакета"],
  [
    "Relevant setup areas are identified without assuming one universal broker packet.",
    "Определены релевантные области setup без предположения, что существует один универсальный пакет для всех брокеров.",
  ],
  ["Verification", "Проверка"],
  [
    "Identity, authority, insurance, equipment or payment uncertainty is resolved before representation.",
    "Неопределённость по identity, authority, insurance, equipment или payment устраняется до представления информации от имени carrier.",
  ],
  ["Secure submission", "Безопасная передача"],
  [
    "Only required information is routed through an approved secure process.",
    "Через одобренный безопасный процесс передаётся только действительно необходимая информация.",
  ],
  ["Credential boundary", "Граница credentials"],
  [
    "Passwords, codes, recovery information and unnecessary identity data are excluded.",
    "Пароли, коды, данные восстановления доступа и ненужные identity-данные исключены.",
  ],
  ["Payment control", "Контроль платежных изменений"],
  [
    "Unexpected payment changes require independent verification.",
    "Неожиданные изменения платёжных реквизитов требуют независимой проверки.",
  ],
  ["Status and refresh", "Статус и обновление"],
  [
    "The learner records non-sensitive status metadata and defines a refresh trigger.",
    "Учащийся фиксирует нечувствительные метаданные статуса и определяет условие для повторной проверки или обновления.",
  ],
  ["Approval boundary", "Граница одобрения"],
  [
    "A complete packet is not described as guaranteed broker approval.",
    "Полный пакет не описывается как гарантия одобрения брокером.",
  ],
  [
    "A learner draft remains inside the existing Evidence and Progression workflow until a separately authorized person makes any real publication decision.",
    "Учебный draft остаётся внутри существующего workflow Evidence и Progression, пока отдельно авторизованный человек не примет решение о любой реальной публикации.",
  ],
]);

// Some of the original Russian curriculum drafts intentionally mixed Russian
// terminology with English operating vocabulary. That is acceptable where the
// sentence itself is Russian. These entries cover only legacy strings that are
// still entirely English, so learners never receive an English-only assignment,
// action, scenario or rubric inside an explicitly Russian lesson.
const RUSSIAN_LEGACY_TEXT_FALLBACKS = new Map([
  ["Evidence boundary — supported vs verification needed.", "Граница доказательств — укажите, что подтверждено, а что ещё требует проверки."],
  ["Audience/problem specific/coherent.", "Аудитория и проблема сформулированы конкретно и согласованно."],
  ["Useful scope/exclusions clear.", "Полезный scope и исключения сформулированы ясно."],
  ["Difference concrete, not unverifiable superiority.", "Отличие конкретное и не основано на непроверяемом превосходстве."],
  ["Facts/assumptions/review claims separated.", "Факты, предположения и claims, требующие проверки, разделены."],
  ["No pressure/invented urgency/outcome promise.", "Нет давления, выдуманной срочности или обещаний результата."],
  ["Next action fits destination readiness.", "Следующее действие соответствует реальной готовности destination."],
  ["Flag evidence/entity/freshness/privacy/platform uncertainty.", "Отмечайте неопределённость по evidence, entity, актуальности, privacy и поведению платформы."],
  ["Facebook: enough context before CTA.", "Facebook: дайте достаточно контекста до CTA."],
  ["Threads: observation/tension/useful opinion concise.", "Threads: кратко используйте наблюдение, напряжение проблемы или полезное мнение."],
  ["utm_source=facebook|threads|instagram.", "Поле utm_source используйте только для разрешённых значений facebook, threads или instagram."],
  ["utm_medium=organic_social.", "Для органической дистрибуции используйте utm_medium=organic_social."],
  ["Controlled campaign value.", "Используйте контролируемое значение campaign."],
  ["Stable safe variant ID in utm_content.", "Используйте стабильный безопасный ID варианта в utm_content."],
  ["No names/emails/phones/private values in URL.", "Не помещайте имена, email, телефоны или приватные значения в URL."],
  ["Day/sequence, direction, canonical destination, audience/funnel stage.", "Укажите день или последовательность, направление, canonical destination и этап audience/funnel."],
  ["Primary platform/format, hook, claim-safe value, 3 points, CTA.", "Укажите основную платформу и формат, hook, безопасную по claims ценность, три тезиса и CTA."],
  ["Privacy-safe UTM, evidence status, related asset, KPI, human-review note.", "Укажите privacy-safe UTM, статус evidence, связанный asset, KPI и примечание для human review."],
  ["Five complete records.", "Подготовлены пять полных записей."],
  ["Relevant public page, not homepage/preview/private.", "Использована релевантная публичная страница, а не homepage, preview или private surface."],
  ["Specific/consistent.", "Формулировка конкретная и последовательная."],
  ["Format/copy fit platform.", "Формат и текст соответствуют платформе."],
  ["Specific/educational/no clickbait.", "Hook конкретный, полезный и без clickbait."],
  ["Action fits page readiness.", "Действие соответствует реальной готовности страницы."],
  ["Normalized/allowlisted/no PII.", "UTM нормализованы, ограничены allowlist и не содержат PII."],
  ["Facts supported/uncertain flagged.", "Факты подтверждены, а неопределённость явно отмечена."],
  ["Meaningful variation.", "Варианты содержательно различаются."],
  ["KPI and approval need clear.", "KPI и необходимость approval сформулированы ясно."],
  ["Canonical website/asset owner.", "Сохраняйте canonical website или asset как основной источник."],
  ["Match hook/format/visual/destination.", "Согласуйте hook, формат, визуал и destination между собой."],
  ["Privacy-safe tracking.", "Используйте tracking без персональных и приватных данных."],
  ["Detect duplicate/review blockers.", "Выявляйте дубли и блокеры, требующие review."],
  ["Keep publication/account access human-controlled.", "Оставляйте публикацию и доступ к аккаунтам под контролем авторизованного человека."],
  ["Facebook: context/discussion.", "Facebook: дайте контекст и основу для обсуждения."],
  ["Threads: observation/question.", "Threads: используйте наблюдение или вопрос."],
  ["Instagram: visual proof/reel/story/carousel.", "Instagram: используйте визуальное доказательство, reel, story или carousel."],
  ["LinkedIn: professional/process framing.", "LinkedIn: подавайте материал через профессиональный или процессный контекст."],
  ["X: concise finding after verification.", "X: публикуйте краткий вывод только после проверки."],
  ["Video/email only with rights/consent/destination approved.", "Видео или email используйте только при подтверждённых правах, согласии и approved destination."],
  ["Derivative distributes source rather than replacing it.", "Derivative распространяет исходный материал, а не заменяет его."],
  ["Draft separated from reviewed/approved/manual-export-ready.", "Черновик отделён от состояний reviewed, approved и готовности к manual export."],
  ["Relevant page, not generic homepage.", "Ведите на релевантную страницу, а не на общий homepage."],
  ["One CTA.", "Используйте один CTA."],
  ["Stable privacy-safe variant.", "Используйте стабильный privacy-safe идентификатор варианта."],
  ["No submitted/private values in URL.", "Не помещайте отправленные или приватные значения в URL."],
  ["Source freshness/claim/privacy/entity ownership.", "Проверяйте актуальность source, claims, privacy и владельца entity."],
  ["Detect thin duplicates.", "Выявляйте поверхностные дубли."],
  ["Flag unsupported platform behavior.", "Отмечайте неподтверждённое поведение платформы."],
  ["Human controls real external action.", "Реальное внешнее действие контролирует человек."],
  ["Synthetic approved public guide needs channel-specific distribution with no social credentials/customer list/private analytics/ad account/messaging permission.", "Синтетический одобренный публичный guide требует channel-specific дистрибуции без social credentials, customer list, private analytics, ad account или разрешения на messaging."],
  ["Facebook variant.", "Подготовьте вариант для Facebook."],
  ["Threads variant.", "Подготовьте вариант для Threads."],
  ["Instagram variant.", "Подготовьте вариант для Instagram."],
  ["One LinkedIn/X/video/email variant + verification condition.", "Подготовьте один вариант для LinkedIn, X, video или email и укажите условие проверки."],
  ["Canonical source, tracking idea, human-review blocker for all.", "Для всех вариантов укажите canonical source, идею tracking и blocker для human review."],
  ["Approved public owner/destination preserved.", "Одобренные публичные owner и destination сохранены."],
  ["Defensible role per platform.", "Для каждой платформы определена обоснованная роль."],
  ["Hooks/formats differ materially.", "Hooks и форматы содержательно различаются."],
  ["CTA/link strategy realistic.", "Стратегия CTA и ссылок реалистична."],
  ["Stable non-personal tracking.", "Tracking стабилен и не содержит персональных данных."],
  ["No invented results/guarantees.", "Нет выдуманных результатов или гарантий."],
  ["Thin duplicates detected/rejected.", "Поверхностные дубли выявляются и отклоняются."],
  ["External action human-controlled.", "Внешнее действие остаётся под контролем человека."],
  ["Route attention to correct page.", "Направляйте внимание на правильную страницу."],
  ["One CTA fitting stage.", "Используйте один CTA, соответствующий этапу."],
  ["Minimum qualification.", "Собирайте минимально необходимую qualification."],
  ["Preserve source/campaign/owner/status/next action.", "Сохраняйте source, campaign, owner, status и next action."],
  ["Keep submitted values out of URLs/analytics.", "Не передавайте введённые значения в URL или analytics."],
  ["Identify journey friction.", "Определяйте точку трения в journey."],
  ["Qualification reduces uncertainty without data dump.", "Qualification уменьшает неопределённость без избыточного сбора данных."],
  ["Inquiry needs owner/source/status/next action/review/closure.", "Inquiry должен иметь owner, source, status, next action, review и понятное closure."],
  ["Name source/destination separately.", "Указывайте source и destination отдельно."],
  ["Confirm CTA fulfillment.", "Проверяйте, что destination действительно выполняет обещанное CTA."],
  ["Avoid homepage/unrelated form.", "Не ведите на homepage или несвязанную форму."],
  ["Only fields needed for routing/review.", "Собирайте только поля, необходимые для routing и review."],
  ["No personal/private values in URL/analytics.", "Не помещайте персональные или приватные значения в URL и analytics."],
  ["Explain non-obvious fields.", "Объясняйте назначение неочевидных полей."],
  ["Responsible role.", "Укажите ответственную роль."],
  ["Preserve source/campaign.", "Сохраняйте source и campaign."],
  ["Set status/next action.", "Фиксируйте status и next action."],
  ["Define stop/correction/closure.", "Определите условия stop, correction и closure."],
  ["Synthetic visitor finds Hermes resource through organic concept and considers asking for help; learner designs journey without identity/private values.", "Синтетический посетитель находит ресурс Hermes через organic concept и рассматривает обращение за помощью; учащийся проектирует journey без identity или private values."],
  ["Source/entry.", "Укажите source и точку входа."],
  ["Destination/CTA.", "Укажите destination и CTA."],
  ["Minimum qualification + why.", "Укажите минимальную qualification и объясните зачем она нужна."],
  ["Human owner role.", "Укажите роль human owner."],
  ["Status/next action/closure.", "Опишите status, next action и closure."],
  ["Privacy-safe measurement events.", "Опишите privacy-safe события measurement."],
  ["Relevant canonical owner.", "Использован релевантный canonical owner."],
  ["CTA fits capability/stage.", "CTA соответствует capability и этапу."],
  ["Necessary fields only.", "Используются только необходимые поля."],
  ["No submitted values in public telemetry.", "Введённые значения не попадают в публичную telemetry."],
  ["Role/status/next action clear.", "Роль, status и next action сформулированы ясно."],
  ["Safe decline/close condition.", "Определено безопасное условие decline или close."],
  ["Events locate stage without false causation.", "События помогают определить этап без ложного вывода о causation."],
  ["Preserve source/CTA/prior response context.", "Сохраняйте контекст source, CTA и предыдущего ответа."],
  ["Ask one focused discovery question.", "Задавайте один сфокусированный discovery-вопрос."],
  ["Answer supported facts only.", "Отвечайте только подтверждёнными фактами."],
  ["Offer one next step without pressure.", "Предлагайте один следующий шаг без давления."],
  ["Record status/next action/stop condition.", "Фиксируйте status, next action и stop condition."],
  ["One focused question improves next decision.", "Один сфокусированный вопрос улучшает следующее решение."],
  ["End with one clear option + stop/timing condition.", "Завершайте одним понятным вариантом и условием stop или timing."],
  ["Summarize relevant context.", "Кратко резюмируйте релевантный контекст."],
  ["Reference actual question/action.", "Ссылайтесь на реальный вопрос или действие человека."],
  ["Do not invent intent from page view/click.", "Не выдумывайте намерение на основании просмотра страницы или клика."],
  ["Acknowledge stated concern/goal.", "Признайте заявленную проблему или цель."],
  ["Ask question changing next action.", "Задайте вопрос, который может изменить next action."],
  ["Address stated issue, not every feature.", "Отвечайте на заявленную проблему, а не перечисляйте все features."],
  ["Offer only available review/call/resource.", "Предлагайте только реально доступные review, call или resource."],
  ["Allow decline/pause/timing change.", "Позвольте отказаться, поставить процесс на паузу или изменить timing."],
  ["Record status/next action.", "Фиксируйте status и next action."],
  ["Synthetic service-business owner reaches marketing intake after website-first resource; already publishes content but cannot identify useful inquiries and doubts value of another project review.", "Синтетический владелец service business приходит в marketing intake после website-first resource; он уже публикует content, но не может определить полезные inquiries и сомневается в ценности ещё одного project review."],
  ["Context.", "Сохраните контекст."],
  ["One discovery question.", "Задайте один discovery-вопрос."],
  ["Claim-safe response.", "Подготовьте claim-safe ответ."],
  ["One useful next action.", "Предложите один полезный next action."],
  ["Role-owned status/next action/stop condition.", "Зафиксируйте role-owned status, next action и stop condition."],
  ["Source/concern preserved without invented intent.", "Source и concern сохранены без выдуманного intent."],
  ["Focused question improves next decision.", "Сфокусированный вопрос улучшает следующее решение."],
  ["No traffic/lead/sales/ranking promise.", "Нет обещаний traffic, leads, sales или ranking."],
  ["One available action without pressure.", "Предложено одно доступное действие без давления."],
  ["Status/role/next action/stop reviewable.", "Status, role, next action и stop можно проверить при review."],
  ["Professional/concise/respectful/within 180 words.", "Ответ профессиональный, краткий, уважительный и укладывается в 180 слов."],
  ["Define privacy-safe events across full path.", "Определяйте privacy-safe события по всему пути."],
  ["Separate indicators from inquiry quality/outcomes.", "Отделяйте indicators от качества inquiry и outcomes."],
  ["Separate observation from causation.", "Отделяйте наблюдение от causation."],
  ["Identify friction stage.", "Определяйте этап, на котором возникает friction."],
  ["Turn repeated failures into specific improvement.", "Превращайте повторяющиеся ошибки в конкретное improvement."],
  ["Measurement connects source/landing/engagement/CTA/qualification/handoff when lawful attribution exists.", "Measurement связывает source, landing, engagement, CTA, qualification и handoff там, где существует допустимая attribution."],
  ["Views/clicks/post volume support diagnosis, not final result.", "Views, clicks и объём posts помогают диагностике, но не являются конечным результатом."],
  ["Measurement matters when it changes next review decision.", "Measurement полезен, когда он меняет следующее решение при review."],
  ["Track page view/engagement without submitted values.", "Отслеживайте page view и engagement без введённых пользователем значений."],
  ["Track CTA and form start separately.", "Отслеживайте CTA и начало формы отдельно."],
  ["Track approved handoff/qualified inquiry separately.", "Отслеживайте approved handoff и qualified inquiry отдельно."],
  ["Use reviewed business outcome only when lawful/available.", "Используйте проверенный business outcome только когда это допустимо и данные доступны."],
  ["Compare metric to its stage.", "Сопоставляйте metric с её этапом journey."],
  ["Do not claim causation from correlation.", "Не делайте вывод о causation только из correlation."],
  ["Flag missing attribution.", "Отмечайте отсутствие attribution."],
  ["Repeated questions→FAQ/explanation.", "Повторяющиеся вопросы направляют к улучшению FAQ или объяснения."],
  ["Traffic + weak CTA→clarity/offer review.", "Traffic при слабом CTA направляет к review ясности и offer."],
  ["Qualification failure→page/form/audience review.", "Проблемы qualification направляют к review страницы, формы или audience."],
  ["Document change + confirming/refuting evidence.", "Документируйте изменение и evidence, которое его подтверждает или опровергает."],
  ["Synthetic evidence: A has more sessions but weak CTA; B fewer sessions but stronger CTA progression and some human-reviewed qualified inquiries; no revenue attribution/causal experiment.", "Синтетические evidence: вариант A имеет больше sessions, но слабый CTA; вариант B — меньше sessions, но более сильное продвижение по CTA и несколько qualified inquiries после human review; revenue attribution и causal experiment отсутствуют."],
  ["Event chain.", "Опишите цепочку событий."],
  ["Supported observation.", "Сформулируйте подтверждённое наблюдение."],
  ["Vanity-metric boundary.", "Опишите границу vanity metrics."],
  ["One friction hypothesis.", "Сформулируйте одну гипотезу friction."],
  ["One bounded improvement.", "Предложите одно ограниченное improvement."],
  ["Next evidence.", "Укажите следующее evidence."],
  ["Covers source/landing/CTA/qualification/handoff.", "Путь охватывает source, landing, CTA, qualification и handoff."],
  ["No submitted/private/personal values.", "Нет введённых, приватных или персональных значений."],
  ["Facts separated from hypotheses.", "Факты отделены от гипотез."],
  ["Supporting metrics not final outcome.", "Вспомогательные metrics не выдаются за конечный outcome."],
  ["Defensible stage identified.", "Определён обоснованный этап friction."],
  ["One controllable element, no result promise.", "Выбран один контролируемый элемент без обещания результата."],
  ["Evidence can support/refute next decision.", "Evidence позволяет подтвердить или опровергнуть следующее решение."],
]);

const RUSSIAN_LESSON_SOURCE_ALIASES = new Map([
  ["us-logistics-operations:documents-setup", "broker-setup-packet"],
]);

const HAS_CYRILLIC = /[А-Яа-яЁё]/;

// Localized sources may translate human-readable copy, but they must never own
// canonical curriculum identity or progression mechanics. These values remain
// sourced from the English Academy model even when an older localized source
// still contains a historical ID/key.
const CANONICAL_STRUCTURE_FIELDS = new Set([
  "program_slug",
  "lesson_id",
  "key",
  "submission_type",
  "max_words",
]);

export function resolveAcademyLessonLocale(request, url) {
  const direct = String(url.searchParams.get("lang") || "").trim().toLowerCase();
  if (direct === "ru") return "ru";

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererLocale = String(new URL(referer).searchParams.get("lang") || "").trim().toLowerCase();
      if (refererLocale === "ru") return "ru";
    } catch {
      // Ignore malformed external referers and keep the canonical English fallback.
    }
  }

  return "en";
}

export function resolveRussianLessonSourceId(programSlug, lessonId) {
  const program = String(programSlug || "");
  const lesson = String(lessonId || "");
  return RUSSIAN_LESSON_SOURCE_ALIASES.get(`${program}:${lesson}`) || lesson;
}

export function normalizeLocalizedLessonIdentity(base, localized) {
  if (!localized || typeof localized !== "object" || !base || typeof base !== "object") return localized;
  return {
    ...localized,
    program_slug: base.program_slug,
    lesson_id: base.lesson_id,
  };
}

export function projectLocalizedLessonShape(base, localized) {
  if (Array.isArray(base)) {
    const candidate = Array.isArray(localized) ? localized : [];
    return base.map((value, index) => projectLocalizedLessonShape(value, candidate[index]));
  }

  if (base && typeof base === "object") {
    const candidate = localized && typeof localized === "object" && !Array.isArray(localized) ? localized : {};
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [
        key,
        CANONICAL_STRUCTURE_FIELDS.has(key) ? value : projectLocalizedLessonShape(value, candidate[key]),
      ]),
    );
  }

  if (typeof localized === "string" && !HAS_CYRILLIC.test(localized) && RUSSIAN_LEGACY_TEXT_FALLBACKS.has(localized)) {
    return RUSSIAN_LEGACY_TEXT_FALLBACKS.get(localized);
  }
  if (typeof base === "string" && RUSSIAN_CANONICAL_FALLBACKS.has(base)) {
    const translatedFallback = RUSSIAN_CANONICAL_FALLBACKS.get(base);
    if (typeof localized !== "string" || !HAS_CYRILLIC.test(localized)) return translatedFallback;
  }
  if (typeof localized === typeof base) return localized;
  return base;
}
