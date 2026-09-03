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

  if (typeof base === "string" && RUSSIAN_CANONICAL_FALLBACKS.has(base)) {
    const translatedFallback = RUSSIAN_CANONICAL_FALLBACKS.get(base);
    if (typeof localized !== "string" || !HAS_CYRILLIC.test(localized)) return translatedFallback;
  }
  if (typeof localized === typeof base) return localized;
  return base;
}
