const RUSSIAN_CANONICAL_FALLBACKS = new Map([
  [
    "Self-tracked completion is not reviewer acceptance, Academy completion, employment, certification, income or permission to work with live operations.",
    "Самостоятельно отмеченное завершение урока не означает принятие reviewer, завершение Academy, трудоустройство, сертификацию, доход или разрешение работать с реальными операциями.",
  ],
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

export function projectLocalizedLessonShape(base, localized) {
  if (Array.isArray(base)) {
    if (!Array.isArray(localized)) return base;
    return base.map((value, index) => projectLocalizedLessonShape(value, localized[index]));
  }

  if (base && typeof base === "object") {
    const candidate = localized && typeof localized === "object" && !Array.isArray(localized) ? localized : {};
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [key, projectLocalizedLessonShape(value, candidate[key])]),
    );
  }

  if (typeof localized === typeof base) return localized;
  if (typeof base === "string" && RUSSIAN_CANONICAL_FALLBACKS.has(base)) {
    return RUSSIAN_CANONICAL_FALLBACKS.get(base);
  }
  return base;
}