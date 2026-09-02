import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACADEMY_LESSON_CONTENT,
  getAcademyLessonContent,
} from "../functions/api/_lib/academy-content.mjs";
import {
  ACADEMY_LESSON_CONTENT_RU,
  getAcademyLessonContentRu,
} from "../functions/api/_lib/academy-content-ru.mjs";
import {
  normalizeLocalizedLessonIdentity,
  projectLocalizedLessonShape,
  resolveAcademyLessonLocale,
  resolveRussianLessonSourceId,
} from "../functions/api/_lib/academy-lesson-localization.mjs";

const expected = {
  "us-logistics-operations": [
    "dispatch-foundations",
    "carrier-broker-communication",
    "equipment-lane-logic",
    "documents-setup",
    "negotiation-practice",
    "operating-rhythm",
  ],
  marketing: [
    "positioning-offer",
    "website-first-content",
    "platform-distribution",
    "lead-journey",
    "sales-follow-up",
    "analytics-improvement",
  ],
};

const hasCyrillic = (value) => /[А-Яа-яЁё]/.test(String(value || ""));

function assertSameShape(base, localized, path = "lesson") {
  if (Array.isArray(base)) {
    assert.ok(Array.isArray(localized), `${path} must remain an array`);
    assert.equal(localized.length, base.length, `${path} array length must stay canonical`);
    base.forEach((value, index) => assertSameShape(value, localized[index], `${path}[${index}]`));
    return;
  }

  if (base && typeof base === "object") {
    assert.ok(localized && typeof localized === "object" && !Array.isArray(localized), `${path} must remain an object`);
    assert.deepEqual(Object.keys(localized).sort(), Object.keys(base).sort(), `${path} keys must stay canonical`);
    for (const key of Object.keys(base)) assertSameShape(base[key], localized[key], `${path}.${key}`);
    return;
  }

  assert.equal(typeof localized, typeof base, `${path} primitive type must stay canonical`);
}

test("Russian Academy content covers every current canonical lesson", () => {
  assert.deepEqual(Object.keys(ACADEMY_LESSON_CONTENT_RU).sort(), Object.keys(expected).sort());
  assert.deepEqual(Object.keys(ACADEMY_LESSON_CONTENT).sort(), Object.keys(expected).sort());

  for (const [program, lessons] of Object.entries(expected)) {
    assert.deepEqual(Object.keys(ACADEMY_LESSON_CONTENT[program]).sort(), [...lessons].sort());

    for (const lessonId of lessons) {
      const base = getAcademyLessonContent(program, lessonId);
      const russianSourceId = resolveRussianLessonSourceId(program, lessonId);
      const rawRu = getAcademyLessonContentRu(program, russianSourceId);
      const normalizedRu = normalizeLocalizedLessonIdentity(base, rawRu);
      assert.ok(base, `${program}/${lessonId} English source missing`);
      assert.ok(rawRu, `${program}/${lessonId} Russian source missing (resolved source: ${russianSourceId})`);

      const ru = projectLocalizedLessonShape(base, normalizedRu);
      assertSameShape(base, ru, `${program}/${lessonId}`);
      assert.equal(ru.program_slug, base.program_slug);
      assert.equal(ru.lesson_id, base.lesson_id);
      assert.ok(hasCyrillic(ru.title), `${program}/${lessonId} title must be Russian`);
      assert.ok(hasCyrillic(ru.purpose), `${program}/${lessonId} purpose must be Russian`);
      assert.ok(Array.isArray(ru.objectives) && ru.objectives.length > 0);
      assert.ok(ru.objectives.every(hasCyrillic), `${program}/${lessonId} objectives must be Russian`);
      assert.ok(Array.isArray(ru.boundaries) && ru.boundaries.length === base.boundaries.length);
      assert.ok(ru.boundaries.every(hasCyrillic), `${program}/${lessonId} boundaries must be Russian`);

      if (base.sections) {
        assert.equal(ru.sections.length, base.sections.length);
        for (const section of ru.sections) {
          assert.ok(hasCyrillic(section.title));
          assert.ok(hasCyrillic(section.summary));
          assert.ok(section.actions.every(hasCyrillic));
        }
      }

      if (base.assignment) {
        assert.equal(ru.assignment.submission_type, base.assignment.submission_type);
        assert.equal(ru.assignment.max_words, base.assignment.max_words);
        assert.ok(hasCyrillic(ru.assignment.prompt));
        assert.equal(ru.assignment.parts.length, base.assignment.parts.length);
        assert.ok(ru.assignment.parts.every(hasCyrillic));
      }

      if (base.rubric) {
        assert.equal(ru.rubric.length, base.rubric.length);
        for (let index = 0; index < base.rubric.length; index += 1) {
          assert.equal(ru.rubric[index].key, base.rubric[index].key);
          assert.ok(hasCyrillic(ru.rubric[index].label));
          assert.ok(hasCyrillic(ru.rubric[index].pass));
        }
      }

      if (base.next) {
        assert.equal(ru.next.lesson_id, base.next.lesson_id);
        assert.ok(hasCyrillic(ru.next.label));
      }
    }
  }

  assert.equal(
    resolveRussianLessonSourceId("us-logistics-operations", "documents-setup"),
    "broker-setup-packet",
    "legacy Russian source must be explicitly mapped to the current canonical documents-setup lesson",
  );
});

test("Russian lesson locale is explicit and safely falls back to English", () => {
  const directRu = new Request("https://example.com/api/academy/lesson?program=marketing&lesson=positioning-offer&lang=ru");
  assert.equal(resolveAcademyLessonLocale(directRu, new URL(directRu.url)), "ru");

  const refererRu = new Request("https://example.com/api/academy/lesson?program=marketing&lesson=positioning-offer", {
    headers: { referer: "https://example.com/services/hermes-connect/academy/lesson/?program=marketing&lesson=positioning-offer&lang=ru" },
  });
  assert.equal(resolveAcademyLessonLocale(refererRu, new URL(refererRu.url)), "ru");

  const english = new Request("https://example.com/api/academy/lesson?program=marketing&lesson=positioning-offer");
  assert.equal(resolveAcademyLessonLocale(english, new URL(english.url)), "en");
});

test("lesson API uses the canonical English lesson as the schema owner", async () => {
  const source = await readFile(new URL("../functions/api/academy/lesson.ts", import.meta.url), "utf8");
  assert.match(source, /getAcademyLessonContentRu/);
  assert.match(source, /resolveAcademyLessonLocale/);
  assert.match(source, /resolveRussianLessonSourceId/);
  assert.match(source, /normalizeLocalizedLessonIdentity/);
  assert.match(source, /projectLocalizedLessonShape\(baseLesson, localizedLesson\)/);
  assert.match(source, /locale === "ru"/);
  assert.match(source, /locale,/);
});
