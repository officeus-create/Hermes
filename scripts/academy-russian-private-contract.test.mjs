import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const runtimeUrl = new URL('../src/components/AcademyLocaleRuntime.astro', import.meta.url);
const launcherUrl = new URL('../src/components/HermesConnectLauncher.astro', import.meta.url);

async function loadRuntime() {
  return readFile(runtimeUrl, 'utf8');
}

test('Academy Russian runtime is mounted once through the canonical Connect header launcher', async () => {
  const launcher = await readFile(launcherUrl, 'utf8');
  assert.match(launcher, /AcademyLocaleRuntime/);
  assert.match(launcher, /isHermesConnectRoute && variant === "header" && <AcademyLocaleRuntime \/>/);
  assert.doesNotMatch(launcher, /HermesConnectDomReadyCore/);
});

test('Academy Russian runtime is query-locale driven and private-route scoped', async () => {
  const source = await loadRuntime();
  assert.match(source, /startsWith\("\/services\/hermes-connect\/academy"\)/);
  assert.match(source, /URLSearchParams\(window\.location\.search\)/);
  assert.match(source, /locale !== "ru"/);
  assert.match(source, /document\.documentElement\.lang = "ru"/);
});

test('Academy Russian runtime covers auth, learner, evidence, progression, support and reviewer UI', async () => {
  const source = await loadRuntime();
  for (const phrase of [
    'Используйте один аккаунт Hermes во всей экосистеме.',
    'Панель ученика',
    'Отправьте работу на проверку человеком.',
    'Все ваши учебные результаты в одном месте.',
    'Вопросы и поддержка',
    'Приватная очередь проверки работ.',
  ]) assert.match(source, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('Academy Russian runtime protects lesson payload and private human text from shell translation', async () => {
  const source = await loadRuntime();
  assert.match(source, /data-lesson-title/);
  assert.match(source, /data-lesson-purpose/);
  assert.match(source, /data-objectives/);
  assert.match(source, /data-assignment-prompt/);
  assert.match(source, /data-rubric-list/);
  assert.match(source, /academy-review-evidence/);
  assert.match(source, /academy-review-feedback span/);
  assert.match(source, /closest\(protectedContentSelectors\)/);
});

test('Academy Russian runtime translates asynchronous UI insertions', async () => {
  const source = await loadRuntime();
  assert.match(source, /new MutationObserver/);
  assert.match(source, /mutation\.addedNodes/);
  assert.match(source, /translateTree\(added\)/);
  assert.match(source, /Participation model:/);
  assert.match(source, /Lesson version/);
  assert.match(source, /Human review/);
});
