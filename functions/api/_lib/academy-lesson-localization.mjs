const RUSSIAN_CANONICAL_FALLBACKS = new Map([
  [
    "Self-tracked completion is not reviewer acceptance, Academy completion, employment, certification, income or permission to work with live operations.",
    "Самостоятельно отмеченное завершение урока не означает принятие reviewer, завершение Academy, трудоустройство, сертификацию, доход или разрешение работать с реальными операциями.",
  ],
]);

const RUSSIAN_LESSON_SOURCE_ALIASES = new Map([
  ["us-logistics-operations:documents-setup", "broker-setup-packet"],
]);

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
    if (!Array.isArray(localized)) return base;
    return base.map((value, index) => projectLocalizedLessonShape(value, localized[index]));
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

  if (typeof localized === typeof base) return localized;
  if (typeof base === "string" && RUSSIAN_CANONICAL_FALLBACKS.has(base)) {
    return RUSSIAN_CANONICAL_FALLBACKS.get(base);
  }
  return base;
}
