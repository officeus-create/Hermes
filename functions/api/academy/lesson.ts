import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  ensureAcademySchema,
  getAcademyEnrollment,
  isAcademyLesson,
  isAcademyProgram,
} from "../_lib/academy.mjs";
import { getAcademyLessonContent } from "../_lib/academy-content.mjs";
import { getAcademyLessonContentRu } from "../_lib/academy-content-ru.mjs";

type Env = { DB?: any };

function resolveLessonLocale(request: Request, url: URL) {
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

function projectLocalizedShape(base: any, localized: any): any {
  if (Array.isArray(base)) {
    if (!Array.isArray(localized)) return base;
    return base.map((value, index) => projectLocalizedShape(value, localized[index]));
  }

  if (base && typeof base === "object") {
    const candidate = localized && typeof localized === "object" && !Array.isArray(localized) ? localized : {};
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [key, projectLocalizedShape(value, candidate[key])]),
    );
  }

  return typeof localized === typeof base ? localized : base;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const url = new URL(request.url);
  const programSlug = String(url.searchParams.get("program") || "").trim();
  const lessonId = String(url.searchParams.get("lesson") || "").trim();
  const locale = resolveLessonLocale(request, url);

  if (!isAcademyProgram(programSlug)) return jsonResponse(400, { success: false, error: "program_invalid" });
  if (!isAcademyLesson(programSlug, lessonId)) return jsonResponse(400, { success: false, error: "lesson_invalid" });

  await ensureAcademySchema(env.DB);
  const enrollment = await getAcademyEnrollment(env.DB, specialist.id, programSlug);
  if (!enrollment) return jsonResponse(404, { success: false, error: "enrollment_not_found" });
  if (enrollment.state !== "enrolled") {
    return jsonResponse(409, {
      success: false,
      error: "enrollment_not_active",
      enrollment_state: enrollment.state,
    });
  }

  const baseLesson = getAcademyLessonContent(programSlug, lessonId);
  if (!baseLesson) return jsonResponse(404, { success: false, error: "lesson_content_not_ready" });

  const localizedLesson = locale === "ru" ? getAcademyLessonContentRu(programSlug, lessonId) : null;
  const lesson = localizedLesson ? projectLocalizedShape(baseLesson, localizedLesson) : baseLesson;

  return jsonResponse(200, {
    success: true,
    locale,
    enrollment: { program_slug: programSlug, state: enrollment.state },
    lesson,
  });
}
