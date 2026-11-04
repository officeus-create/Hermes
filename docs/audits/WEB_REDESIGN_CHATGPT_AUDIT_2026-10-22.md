# Независимый аудит Claude: работа ChatGPT по Hermes WEB Redesign 21–22.10.2026

- Дата: 2026-10-22. Автор: Claude Code (визуальный владелец Home по #1989 и решению CEO от 21.10).
- Входные данные: Drive-папка `1wKZ6IfJZhjx93LMvfjxfAQqTosi4ztaW` — START HERE, MASTER и PLUGIN SOURCE прочитаны полностью. Из DESIGN DECISIONS + LESSONS прочитаны только записи от 21–22.10 (документ на 205 тыс. символов целиком не читался).
- Сверка с репозиторием: `officeus-create/Hermes` `main` = `3da10e7a4bc56b9b65539a7f152613c2358532a1` (#1995), свежий fetch 22.10. Активной визуальной ветки Claude для Home нет, так что конкурирующая ветка этим аудитом не создаётся.
- Метод: чтение кода, `ffprobe`/`ffmpeg` по всем медиа Home (детекция склеек, битрейт, размер), раскадровка кадров, сверка тестов и CI-воркфлоу. Production-браузер вручную не открывался: runtime-доказательство уже даёт #1995 (production run 39700977027).

Формат каждого решения: **РЕШЕНИЕ → ПОЧЕМУ → ИЗМЕНЕНИЕ → ВЛАДЕЛЕЦ → ФАЙЛ → ТЕСТ**.

---

## Δ Обновление 22.10: сверка с живым сайтом и Claude Design (поправки к этому отчёту)

**Чем проверял:**
- Продакшен `hermeslogisticsus.com` на десктопе — через подключённый браузер Opera (из контейнера сайт закрыт прокси).
- Мобильная версия 390 и десктоп 1440 — на локальной сборке того же SHA `3da10e7`, который задеплоен и LIVE_VERIFIED по #1995.
- Эталон Claude Design — «START HERE — Claude Code (Hermes Lead Designer) 22.10.2026», «Home v3 release v1.1», «03 Video Sources», распакованный `Claude_Design_Hermes_Home_v3_OWNER_EXPORT_2026-10-20.zip` (компонент Logistics Live Window).

**Поправки к выводам выше:**
1. **Набор клипов для multi-shot уже выбран в Claude Design.** Это не нужно придумывать, как в §H:
   - Logistics: `golden-v1` + Pexels 9339061 / 18749847 / 9339073. Смена каждые 5–8 с, кроссфейд 1,4 с, общий цветовой грейд.
   - Technology: 6804117 (код, pos 42% 50%) → 6804109 (команда, pos 58% 50%).
   - Academy: 7413799 (pos 45% 28%) → 9034497 (pos 70% 50%).
   - Marketing: без изменений.

   Правильное продолжение — **соединить текущие клипы сайта с клипами Claude Design**, ничего не удаляя. Шоты из §H.2–H.5 считать запасными.
2. **Marketing 6774593 — это утверждённый владельцем «Planning wall».** Рекомендацию §B.2/G2 «заменить» снимаю. Смысловое пересечение с Academy остаётся замечанием дизайнера, но не блокером. Чтобы окно стало multi-shot, вторым планом лучше взять собственную альтернативу владельца 7652729 («Team meeting»). Решает владелец.
3. **Полоса «Not sure which direction fits?» на живом сайте уже есть** (почта, «Describe your request», 4 маршрута). Пункт START HERE 22.10 «отсутствует» устарел.
4. **Подписи окон по START HERE** («Dealers · shippers · carriers · dispatch service» и др.) я **не применял**. Они убирают «Car hauling» — главный коммерческий сигнал, который охраняют `homepage-deferred-feature-css.test.mjs` и `validate-build.mjs`. Нужно решение владельца и проверка SEO-владельцем.
5. **Сборка монтажей в этом контейнере заблокирована.** Сетевая политика окружения не пускает на `videos.pexels.com` (403), поэтому исходники скачать нельзя. Чтобы собрать монтажи, нужно добавить хост в Allowed domains окружения или положить мастер-файлы на Drive.

**Что видно на живом сайте и в эталоне:**

| Элемент | Живой сайт / `main` | Claude Design 22.10 | Статус |
|---|---|---|---|
| Шапка, Products, языки, Contact | есть | есть | ✅ DONE |
| H1 + travel-dot | точка d→r→c→i каждые 5,2 с | F → i → e → i → конец, 5,6/9 с, полоска в меню вздрагивает | PARTIAL |
| Подзаголовок | «… business. One Hermes ecosystem.», переносится на 2 строки | «… business — one Hermes ecosystem.» в одну строку | **исправлено в этом PR** |
| Окна | общая полоса без зазоров, видео во всё окно, снизу градиент тона | отдельные окна radius 34, видео — верхние 66%, низ — тон | PARTIAL (нужно превью 1440/390) |
| Смена клипов в окне | 0 склеек во всех 4 | Logistics 4 сцены, Tech 2, Academy 2, Marketing 1 | **P0 MISSING** |
| Contact-полоса | есть | есть | ✅ DONE |
| Footer | 1 длинная колонка из 24 ссылок, соцсети текстом | 3 колонки (Directions / Products / Company & Legal), значки соцсетей | PARTIAL |
| Мобильная 390 | 4 окна по 4:5 подряд, видео играет в видимом окне, нет переполнения | то же + 66/34 | ✅ работает |
| Вес видео | Logistics 3,59 МБ | ≤ 2,5 МБ на окно | **исправлено в этом PR → 1,0 МБ** |

**Исправлено в этом PR** (визуальный владелец Claude; до мержа нужен визуальный аппрув владельца):
- `logistics-golden-v1-540.mp4`: тот же утверждённый план, 540×968, CRF 26. Было 3,59 МБ → стало 0,99 МБ (−72%), SSIM 0,964 относительно оригинала. Новое имя файла — из-за immutable-кэша. Старый `logistics-golden-v1.mp4` не удалён: на него ссылается прототип Claude Design.
- Подзаголовок приведён к утверждённому тексту, на десктопе в одну строку (`max-width: 92ch`, `text-wrap: balance`).
- Убраны 7 вызовов `.focus()` перед проверкой проигрывания в 5 spec-файлах. `.focus()` в тесте клавиатурной навигации оставлен намеренно.
- Бюджет размера Logistics в тесте ужат с 8 МБ до 1,5 МБ, чтобы тяжёлый файл не вернулся.

---

## 0. Вердикт коротко

1. Видео **проигрывается**: это LIVE_VERIFIED, и чинил ChatGPT правильно. Но **живой Home ещё не готов**. Во всех четырёх MP4 детектор находит **0 склеек** (`select='gt(scene,0.3)'`), то есть все четыре окна сейчас one-shot.
2. Главные дефекты, которых в MASTER нет:
   - **Окно Marketing показывает тренинг у флипчарта** («Tools to success»), окно Academy — спикера у доски. Два соседних окна одного жанра, и в Marketing нет «движения внимания».
   - **Logistics — это AI-ролик HeyGen** (image-to-video, см. `docs/design/HOME_LIVING_REALITY_SCENE_RECIPES_2026-10-16.md`), а не реальная съёмка, как требует #1986. При этом у него **5,4 Мбит/с, 3,59 МБ, 768×1376**, что составляет ~75% всех видеобайтов Home.
   - **HD-ветка из #1991 мёртвая.** Условие `ширина ≥ 600 CSS px && fine pointer` не выполняется ни в одной раскладке: в четыре колонки ширина ≤ 368 px, в две ≤ ~480 px, а мобильные устройства coarse. Три файла `*-720.mp4` (4,15 МБ) никогда не отдаются. HD при этом нужен ровно там, где его блокирует фильтр по pointer: iPad/touch 701–820 px, где карточка занимает всю ширину.
   - **Хрупкость теста из #1991 исправлена только в одном файле.** `.focus()` перед проверкой проигрывания всё ещё стоит в 6 местах в 5 spec-файлах (§B.4).
   - **Path-фильтр visual-evidence не покрывает runtime Home.** `public/scripts/home-marketing-video.js` и `public/media/home/**` в фильтр не входят, поэтому #1994 вообще не запускал визуальную проверку Home.
   - **Источник истины One Brain устарел.** В DESIGN DECISIONS запись от 22.10 всё ещё называет hover-активацию из #1991 «RUNTIME FIX», а следующим шагом указан закрытый #1993.
3. Медленность в основном вызвана тем, что **правил стало слишком много**, а не недостатком правил: 7 разных лестниц статусов, 9 разных форматов квитанций, 5 релизов Design Hub за сутки (§C, §D).

---

## A. Что ChatGPT сделал правильно (KEEP)

| # | Что | Почему верно |
|---|---|---|
| A1 | Классификация инцидента (ASSET / RUNTIME / CSS / CODEC / CACHE / TEST / POLICY) и вывод, что MP4 на месте, а сломано поведение | Причина найдена с первого захода, без случайных правок медиа |
| A2 | #1994: автономное проигрывание видимых окон, пауза offscreen/hidden, poster для Save-Data и reduced-motion | Это верное прочтение «живых окон». Hover может быть только дополнением |
| A3 | #1995: production-верификатор только на чтение (206 + Content-Range, decode, `currentTime`, разница кадров, политики) | Сильная и нужная страховка. Оставить |
| A4 | Ослабление правила Accept-Ranges (достаточно 206 + Content-Range) | Технически корректно для Cloudflare |
| A5 | Правило неизменяемых `/media/*`: новые байты получают новое имя файла | Верно. Обязательно и для монтажей |
| A6 | Закрытие устаревших веток #1978/#1980/#1982/#1984/#1990/#1993 | Снижает риск, что вернётся старое поведение |
| A7 | Разделение «видео играет» и «multi-shot готов» | Верно. Но разделение остановилось на словах (§B.1) |
| A8 | Чистый replay #1976/#1942 на текущий `main` одним коммитом | Верный приём для устаревших PR |

## B. Что понято неправильно или усложнено

**B.1 Покадровая разница принята за «окно живое».** Верификатор засчитывает ~400 изменившихся пикселей за 1,5 с. Так проходит любой one-shot, проходит и AI-ролик. Покадровая проверка ничего не говорит ни о количестве планов, ни о смысле кадра. В MASTER признано, что «runtime ≠ дизайн», но **автоматического сигнала для multi-shot не появилось**. → Нужен машинный тест «≥ 2 склейки на окно» (§H.6).

**B.2 Смысловой конфликт Marketing и Academy.** Раскадровка `marketing-team-v1.mp4`: тренер пишет на флипчарте «Tools to success», слушатели сидят. Раскадровка `academy-claude-v3.mp4`: спикер у доски перед аудиторией. Получается два одинаковых «урока» рядом. Доктрина Hermes требует «Marketing = movement of attention», а в кадре этого нет. ChatGPT сделал 14 runtime-проверок, но ни разу не посмотрел на кадр как дизайнер. → Это первый кандидат на замену (§H).

**B.3 Logistics: AI-источник и лишние байты.** По `HOME_LIVING_REALITY_SCENE_RECIPES` ролик сгенерирован в HeyGen, а #1986 требует «authentic … real motion shots». Файл не перекодирован после генерации: 5,4 Мбит/с против ~0,34 у остальных окон, 768×1376 при отрисовке ≤ 368 CSS px. Правило «не грузить HD из-за DPR» ChatGPT написал, а самый тяжёлый файл не заметил.

**B.4 Тестовый урок применён частично.** #1991 добавил `.focus()` перед проверкой проигрывания в:
`tests/home-claude-v3-media.spec.ts:21` (с комментарием «Keyboard focus activates the video»), `tests/home-approved-20260930.spec.ts` (2×), `tests/home-marketing-journey.spec.ts`, `tests/home-marketing-living-window.spec.ts`, `tests/home-marketing-source-lock.spec.ts`.
#1994 исправил только `homepage-responsive-hero.spec.ts`. Плагин требует «тест, который вызывает hover/focus до проверки, не доказывает автономность», а в репозитории этот запрет не выполнен.

**B.5 «Адаптивный HD» на практике не работает.** См. §0. На деле получилось 4,15 МБ мёртвых ассетов плюс неверный фильтр по pointer.

**B.6 Два независимых runtime для одной задачи.**
- Logistics использует inline TS в `HomeMasterScene.astro`: порог IO 0,2, нет проверки слабой сети.
- Остальные три окна используют `public/scripts/home-marketing-video.js`: порог IO 0,15, regex-allowlist, проверка сети.

Политики расходятся, а проверка в CI идёт по разным селекторам на каждую полосу (`check-home-video-production.mjs`).

**B.7 Синтетическая «жизнь» Logistics осталась.** Погодная тонировка `sun/fog/dusk/rain` каждые 5,2 с поверх солнечного кадра — это ровно та «fake weather», которую запрещает #1986. Кроме того, `pointerenter`/`focusin` подталкивает погоду, то есть связка с hover пережила #1994. Шесть стоп-кадров техники крутятся только при отказе видео.

**B.8 Скрытый legacy-DOM и лишняя работа JS.** «Example workflow» ×4, Marketing journey, Technology system cards и Academy workflow отрисовываются в HTML, но скрыты `display:none`. Для них работают три IntersectionObserver. Тест `home-approved-20260930` при этом проверяет наличие скрытого DOM. Для SEO эти узлы ничего не дают: они `aria-hidden` и `display:none`, а смысл маршрута уже есть в `aria-label` ссылки.

**B.9 Нарушение границы владения названо неточно.** В MASTER сказано, что #1991 «crossed too close». На деле решение CEO от 21.10 прямо запрещает ChatGPT править `HomeMasterScene.astro`, cinema-ассеты и header, а #1991 после этого добавил 3 медиафайла и правил `HomeMasterScene.astro` и `SiteHeader.astro` (меню Products). Это **нарушение**, а не пограничный случай. Механической защиты от него до сих пор нет (§J.3).

**B.10 «CI слишком широкий» — только половина правды.** Для Home CI одновременно **слишком широкий** (правка Home запускает Connect Option 02, Academy-RU, Repair-RU и скриншоты всех маршрутов) и **слишком узкий** (правка runtime JS и медиа Home вообще не запускает доказательство движения).

**B.11 Конфликтующие правила в репозитории.** В `docs/ERROR_REGISTER.md:678` записано «preserve the one-video maximum», а утверждённый контракт — четыре одновременных видео. Правило не снято.

## C. Почему работа шла медленно (корневые причины)

1. **Слишком много обязательных лестниц статусов.** Coordinator (9 состояний), web-home gate (8), Design Hub instructions (11), proof-and-release (10), AE evidence (6), TechDev truth ladder (7), spec-to-verified (10). Каждый навык требует свою квитанцию: `VISIBLE_CHANGE…`, `OWNER_INTENT|MAIN/LIVE|…`, `LANE|URL|…`, `HEAD|CHECK_STATE|…`, `VISIBLE_DELTA|…` и ещё четыре формата. Агент тратит цикл на заполнение форм.
2. **Обучение плагинов во время P0.** Design Hub дошёл с 0.2.49 до 0.2.53 за одни сутки, остальные три плагина тоже обновлялись. Это невидимая для владельца работа, которая шла прямо в середине инцидента.
3. **Нет известной длительности CI.** Без ожидаемого времени завершения агент опрашивает статус, а не ждёт. Правило «не опрашивать» без числа превращается в «опросить ещё раз, но с оправданием».
4. **Неверная граница владения.** ChatGPT взялся за визуальную задачу (#1991), сделал ошибку и потом сам её чинил (#1994, #1995). Если бы с первого шага задача ушла к Claude, двух циклов из трёх не было бы.
5. **Path-фильтр CI** (§B.10): медленные проверки запускались на нерелевантных правках, а релевантные проверки не запускались вовсе.

---

## D. Плагины и skills: KEEP / MODIFY / DELETE / SPLIT / MERGE

Принцип: **один канонический источник на правило.** Остальные навыки ссылаются на него одной строкой и не копируют текст.

| Плагин / skill | Решение | Почему |
|---|---|---|
| **Coordinator** `instructions` | MODIFY | Лестницу статусов заменить ссылкой на каноническую (§E.1). Убрать «KEEP/IMPROVE/REVERT/…»: 7 вариантов выбора без критериев |
| Coordinator `visible-progress-orchestration` | **MERGE → канон** `web-delivery-loop` (§E.2) | Почти дословно дублируется в Design Hub `visible-progress-delivery`, TechDev `web-delivery-efficiency` и AE `ci-polling-efficiency` |
| Coordinator `web-home-visual-release-gate` | **SPLIT** | Runtime-правила 1–9 — копия Design Hub `home-video-runtime-release-gate`, их удалить. Маршрутизация «кто пишет Home» → одно правило в Coordinator (§E.3). Визуальная приёмка → Claude (этот документ, §H) |
| Coordinator `ci-release-council` | **SPLIT + DELETE частей** | Убрать «Historical examples» (#1908, 15.10): это история, а не правило. «Cross-form privacy gate» перенести в Sales/Privacy skill. «Schedule ≠ cron» уже есть в `github-scheduled-workflow-recovery`. Оставить классификацию упавшей job и «what did we miss» |
| **Design Hub** `instructions` | MODIFY | Фраза «Design Hub owns visual decisions» противоречит #1989. Новый текст в §E.3 |
| Design Hub `visible-progress-delivery` | MERGE → `web-delivery-loop` | Дубль |
| Design Hub `home-video-runtime-release-gate` | **MODIFY + MOVE в TechDev** (`home-film-runtime-gate`) | Это инженерия runtime, а не дизайн. Сократить на ~60%: убрать историю инцидента, добавить три недостающих правила (§E.4) |
| Design Hub `design-code-drift-control` | **DELETE** (оставить 6 строк классов дрейфа в `instructions`) | Это исследовательская заметка о CodeFerry, а не операционное правило. Тянет на «snapshot-контракты», которых никто не ведёт |
| Design Hub `proof-and-release` | MERGE → AE `evidence-and-completion` | Пятая копия лестницы статусов |
| **AE** `instructions` | KEEP | Короткий и верный |
| AE `ci-polling-efficiency` | MERGE → `web-delivery-loop` (раздел «Ожидание CI») | Дубль. Числа ожидания — в каноне |
| AE `release-qa` | KEEP для HAE; раздел «Stale-main replay gate» → MERGE в TechDev `release-readiness` | Replay описан дважды по-разному |
| AE `evidence-and-completion` | **KEEP как владелец канонической лестницы** (§E.1) | Самый короткий и точный |
| **TechDev** `instructions` | MODIFY | Добавить защиту путей Claude (§E.3) |
| TechDev `web-delivery-efficiency` | MERGE → `web-delivery-loop` | Дубль |
| TechDev `release-readiness` | MODIFY | Длинный рассказ про #1903 сжать в 4 строки правила (§E.5) |
| TechDev `spec-to-verified-release` | MODIFY: сузить область | 5 гейтов и blueprint для каждой веб-правки — главный тормоз. Применять только к **новым продуктам и фичам**, а не к багфиксам ≤ 3 файлов |

### Ответы на 10 вопросов PLUGIN SOURCE

1. Решения по каждому навыку — в таблице выше.
2. **Слишком строго:** spec-to-verified для багфиксов. Матрица QA web-home gate «390/430/768/1024/1440 + 701/820 + RM + Save-Data + keyboard + CLS» для **любой** правки Home: для runtime-правки достаточно 390 + 1440 + RM; полная матрица нужна только для визуальных изменений.
3. **Слишком расплывчато:** «poll again on meaningful transition» (не сказано, когда именно); «owner visual review when visuals changed» (не сказано, кто решает, изменилась ли визуальная часть: решает Claude); «replay smallest valid delta».
4. **Замедляет:** 7 лестниц и 9 квитанций, обучение плагинов во время P0, полная матрица на каждую правку.
5. **Ведёт к визуальному дрейфу:** Design Hub `instructions` («Design Hub owns visual decisions»); Coordinator «Read the latest CEO decision from Design Hub when the job is visual»: источник визуальной истины для Home теперь Claude, а не Design Hub в ChatGPT.
6. **Дублирует:** visible-progress ×4, runtime gate ×2, лестницы ×7, replay ×2.
7. **Принадлежит Claude:** выбор кадров, кроп, ритм, переходы, шов цикла, постеры, раскладка, header/Products, вопрос «изменилось ли визуальное», визуальная приёмка, #1981, #1985.
8. **Что предотвратило бы #1991:** (а) механическая защита путей Claude в CI (§J.3); (б) правило «узкая формулировка владельца не сужает действующий контракт: реализуй аддитивное прочтение, а при сомнении спроси владельца артефакта» (§E.3); (в) правило «сначала падающий тест действующего контракта» (§E.4).
9. **Что предотвратило бы час невидимой работы:** запрет на релизы плагинов во время P0 (не больше одного релиза на плагин в сутки, только в конце сессии); опрос CI по ожидаемому времени (§E.2); после того как production-верификатор PASS, ручная повторная проверка того же состояния запрещена.
10. Тексты замен — §E.

---

## E. Точные тексты замен

### E.1 Каноническая лестница (AE `evidence-and-completion`, единственный источник; остальные навыки ссылаются на неё одной строкой)

```text
## Canonical status ladder (single source for all Hermes plugins)
CODED → CI_GREEN(exact head) → VISUAL_APPROVED(only if pixels changed; decided by Claude + CEO) → MERGED → DEPLOYED(exact SHA) → LIVE_VERIFIED → MEASURED.
A head change resets CI_GREEN and VISUAL_APPROVED. Never infer a later state from an earlier one.
One receipt line per checkpoint:
STATE | PR/HEAD | WHAT THE USER NOW SEES (or NONE + blocker) | NEXT ACTION
Other skills must reference this ladder and must not define their own.
```

### E.2 Новый канонический навык Coordinator `web-delivery-loop` (заменяет 4 visible-progress/polling навыка)

```text
---
name: web-delivery-loop
description: The only WEB execution loop for Hermes. Delivery first, assurance in parallel, no idle polling.
---
# WEB delivery loop
Loop: CURRENT MAIN → ONE USER-VISIBLE TARGET → SMALLEST PATCH → FAST GATE (build + focused spec) → PR → NEXT TARGET while full CI runs.
Priority: broken UX → conversion → mobile/tap/overflow → approved visual gap → search → polish. Outage/security/privacy preempts.

## Waiting on CI
- Record the workflow's typical duration once (Website checks ≈ its last successful run time). Check once at that time. Do not check before it unless a failure notification arrives.
- Never re-verify a state already proven by an automated gate (e.g. production Home video verifier PASS).

## Budgets
- A P0 gets at most one assurance pass after its fix is LIVE_VERIFIED; then return to delivery.
- No plugin/skill releases during an active P0 or delivery cycle. Batch learning at session end, max one release per plugin per day.
- One planning document per task, max.

## Ownership
Before editing, check the path guard (TechDev instructions). Claude-owned path → do not edit; open an issue with selector, expected behavior, and test.
```

### E.3 Владение визуалом (заменяет абзац Ownership в Design Hub `instructions`; одна и та же строка добавляется в Coordinator и TechDev)

```text
## Visual ownership (CEO decision 2026-10-21, #1989)
Claude is the sole visual writer and visual decision-maker for Home and shared visual surfaces.
Claude-owned paths (ChatGPT/Codex must not edit; propose via issue instead):
src/components/HomeMasterScene.astro, src/components/HomeFilmWindow.astro, src/data/home-films.ts,
public/media/home/**, public/scripts/home-*.js, src/styles/home*.css, src/styles/hermes-direction-colors.css,
src/components/SiteHeader.astro, src/components/SiteFooter.astro (visual layout), brand/logo assets, locale page visuals (#1985).
ChatGPT Design Hub role = independent visual QA + contract keeper, not decision-maker.
If an owner request seems to narrow an existing approved contract (e.g. "live on hover" vs "windows are alive"),
implement the additive reading (contract stays, request adds on top) or route to the artifact owner; never silently replace the contract.
Runtime incidents on Claude-owned paths: ChatGPT may ship a bounded runtime fix only with an explicit CEO incident override, must not change composition/media, and must hand back to Claude in the same session.
```

### E.4 TechDev `home-film-runtime-gate` (перенос и сокращение Design Hub `home-video-runtime-release-gate`)

```text
---
name: home-film-runtime-gate
description: Runtime proof for Home film windows. Proves playback, not design.
---
# Home film runtime gate
Proof per lane (Logistics, Technology, Academy, Marketing): 206 + valid Content-Range; decoded dimensions > 0; paused=false
without any hover/focus/click; currentTime advances; visible layer; frames differ. Reduced-motion and Save-Data: poster only, no source attached.
Offscreen/hidden: paused. /media/* immutable: new bytes = new filename.
Quality: choose HD by rendered width × devicePixelRatio ≥ 900 device px AND acceptable network, regardless of pointer type.

## Test contract rules (prevent #1991)
1. Write the failing test of the standing contract first (no interaction → plays), then change code.
2. Any spec that calls hover()/focus()/click() before asserting playback is invalid. When fixing such a regression, grep ALL specs (`rg "\.(hover|focus)\(\)" tests/home*`) and fix every occurrence in the same PR.
3. CI path filters must include every file that changes the behavior under test (component, runtime JS, media, manifest, CSS). Verify the PR actually triggered the Home motion workflow.
4. This gate never proves multi-shot or visual quality. Multi-shot = scripts/home-films.test.mjs (≥2 scene cuts per montage) + Claude/CEO visual approval.
```

### E.5 TechDev `release-readiness` (рассказ про #1903 заменяется правилом)

```text
## PR branch replay rule
Never move an open PR's branch to a commit equal to its base (GitHub auto-closes the PR).
Replay = one new commit on fresh main containing the full intended diff, then one force-with-lease ref update.
If a PR closes unexpectedly: verify the diff still exists, reopen the SAME PR, do not open a duplicate.
Old green CI never transfers to a new head.
```

---

## F. Что ChatGPT прекращает трогать (принадлежит Claude)

**РЕШЕНИЕ:** полная остановка правок на путях из §E.3 (компоненты, медиа, runtime JS Home, CSS Home и цветов направлений, SiteHeader/SiteFooter, логотипы, визуал локалей #1985, replay #1981). **ПОЧЕМУ:** #1991 показал цену двух писателей. **Исключение:** #1976 и #1942 уже в работе и ограничены по объёму. ChatGPT их завершает, но мерж только после того, как Claude посмотрит скриншоты 390/1440. Это визуальная приёмка, а не повторная работа.

---

## G. Визуальные разрывы текущего `main` относительно утверждённого Claude Home v3

| # | Разрыв | Серьёзность | Что делаем |
|---|---|---|---|
| G1 | Все 4 окна one-shot (0 склеек) | P0 (#1986) | §H |
| G2 | Marketing ≈ Academy по жанру (флипчарт vs доска) | P0 по смыслу | Новый S1 для Marketing — создание контента (§H) |
| G3 | Logistics: AI-ролик, жёлто-«золотой» сток-вид, 3,59 МБ | P1 | Перекодировать сейчас, заменить реальной съёмкой в монтаже |
| G4 | Погодная тонировка Logistics поверх видео | P1 | Удалить вместе с переходом на монтаж |
| G5 | Постер Marketing 281×500 (размыт на 368 px × DPR2) | P2 | Постер 540×960 из первого кадра монтажа |
| G6 | HD не отдаётся на iPad/touch 701–820, где карточка во всю ширину | P2 | Исправить гейт качества (§E.4) |
| G7 | Скрытый legacy-DOM + 3 observer'а | P2 (вес/INP) | Удалить, тесты обновить |
| G8 | #1981 (iPhone, левая колонка + пустота справа) | неизвестно | Сначала воспроизвести на текущем `main` (WebKit 390/430 + физический iPhone). Ветку 21.10 не мержить: блоки 700/701–820 в `main` могли уже закрыть дефект |
| G9 | Порядок направлений и заголовок | ✅ совпадают | Logistics → Technology → Academy → Marketing, «Four directions. Choose yours.», бегающая точка над `i` есть, не дублировать |
| G10 | Header/Products справа (#1991) | ✅ принять | Проверить на 390 в рамках V4 |

---

## H. План четырёх действительно живых multi-shot окон

### H.1 Архитектура (подтверждаю рекомендацию #1986 с уточнениями)
- **Один локальный монтаж MP4 на окно, 3 плана по ~4–5 с.** Склейки — жёсткие, «на движении» (match on action и сохранённый вектор движения). Без кросс-фейдов людей и машин.
- **Склейки окон не совпадают по времени.** Длительности 12,0 / 13,2 / 14,4 / 15,6 с: при одновременном старте четыре окна никогда не режутся одновременно, и экран не выглядит как слайд-шоу. **В #1986 этого нет.**
- **Шов цикла:** последний план заканчивается на действии, которое продолжается в первом плане (жёсткий cut). Постер равен кадру 0 первого плана, чтобы при старте не было скачка.
- **Кодирование:** H.264 High, CRF 26–28, 24 fps, `-an`, `+faststart`, GOP 48, keyframe на каждой склейке.
- **Варианты:** SD 540×960 ≤ **1,0 МБ**; HD 720×1280 ≤ **1,8 МБ** (только по гейту §E.4).
- **Бюджет:** четыре окна SD на десктопе ≤ 4 МБ суммарно (сейчас 4,75 МБ при одном плане). На мобильном играет только видимое окно.
- **Имена:** `/media/home/{lane}-montage-v1-540.mp4`, `…-720.mp4`, `{lane}-montage-v1-poster.{webp,jpg}`.

### H.2 Logistics — «движение в пространстве»
| План | Тип | Источник |
|---|---|---|
| S1 | Высокий ракурс: автовоз идёт по трассе, камера статична | Временно Golden v1 (AI, помечен в манифесте). Цель — реальный дрон-кадр |
| S2 | Уровень дороги: автовоз проходит мимо камеры / tracking shot | Реальный сток (Pexels/Pixabay) с проверкой лицензии |
| S3 | Погрузка: машина заезжает по рампе на трейлер у дилера | Реальный сток или собственная съёмка Hermes |

Кроп по центру с вертикальным смещением 60–66%, чтобы грузовик был в нижней трети под подписью. Мобильный кроп тот же.

### H.3 Technology — «движение информации»
| План | Тип | Источник |
|---|---|---|
| S1 | Пара разработчиков у монитора | Утверждённый 6804109 |
| S2 | Крупно: клавиатура → экран с реальным интерфейсом Hermes Connect или Website Factory | **Собственная запись экрана**, санитизированная, без PII. Права наши, это правда о продукте |
| S3 | Телефон в руке: сайт отвечает или бронь пришла на 390 px | Собственная съёмка или запись экрана устройства |

### H.4 Academy — «движение способностей»
| План | Тип | Источник |
|---|---|---|
| S1 | Ментор объясняет | Утверждённый 7413799 |
| S2 | Ученик практикуется за ноутбуком, ревью один на один (крупно) | Сток, кандидат 9034497, лицензию и людей проверить |
| S3 | Ученик сам показывает результат или работает за рабочим местом | Сток |

Без дипломов и обещаний трудоустройства.

### H.5 Marketing — «движение внимания» (заменить S1)
| План | Тип | Источник |
|---|---|---|
| S1 | Съёмка контента: телефон на стабилизаторе или свет на продукте | Сток. 6774593 (флипчарт) из Marketing убрать |
| S2 | Монтаж или дизайн: таймлайн на экране | Сток |
| S3 | Лента соцсети и прокрутка, публикация, реакции | Сток или собственная запись экрана, **без цифр и фейковой аналитики** |

Конвейер Content → Discovery → Website → Inquiry сохраняется как смысл, теперь в видеоряде, а не в скрытых карточках.

### H.6 Код и проверки
- `src/data/home-films.ts` — манифест: `lane`, `shots[] {source, license, url, in, out, crop, aiGenerated}`, `files {sd, hd, poster}`, `sha256`, `durationS`.
- `scripts/build-home-films.mjs` — офлайн-сборка через FFmpeg из мастеров, хранящихся **вне репозитория**. Выходные файлы и манифест коммитятся.
- `scripts/home-films.test.mjs` — для каждой полосы: файл существует, sha совпадает, размер в бюджете, длительность ±0,2 с, **≥ 2 склейки по `ffmpeg scene>0.3`** (если ffmpeg недоступен, тест пропускается с явным сообщением). Подключается в `npm test`.
- `src/components/HomeFilmWindow.astro` — одна разметка на окно (`data-home-film="{lane}"`), вместо четырёх веток `if`.
- `public/scripts/home-films.js` — один runtime вместо inline-кода Logistics и `home-marketing-video.js`. Порог IO 0,2, гейт качества по §E.4.
- `tests/home-films.spec.ts` — проигрывание без взаимодействия; на offscreen — пауза; RM и Save-Data дают постер; DPR 2 при четырёх колонках не даёт HD; touch 768 даёт HD; **наблюдаются ≥ 2 разных плана** (seek на середины планов, хеши кадров различаются). Старые разрозненные home-video spec'и консолидировать сюда.
- `scripts/check-home-video-production.mjs` — селекторы перевести на `[data-home-film]` **в том же PR**, что и разметку, иначе после деплоя упадёт release.

---

## I. Порядок файлов и задач на текущем `main` (пишет Claude, одна визуальная полоса)

**PR-V1 — «быстрее, без изменения вида» (сразу)**
1. Перекодировать `logistics-golden-v1.mp4` в `logistics-golden-v2-540.mp4` (CRF 27, ожидается ≈ 0,4–0,6 МБ).
2. `public/scripts/home-films.js`: единый runtime, верный гейт качества.
3. `HomeMasterScene.astro`: data-атрибуты `data-home-film`, убрать inline-runtime Logistics, убрать привязку погоды к hover.
4. Тесты: убрать все 6 вызовов `.focus()`-предусловий, добавить негативный тест `rg`-класса.
5. `scripts/check-home-video-production.mjs`: селекторы.

Видимый эффект: Home грузится примерно на 3 МБ легче, вид не меняется.

**PR-V2 — превью для CEO (до мержа):** офлайн-рендер четырёх монтажей, превью-страница 1440 и 390 с запуском на нормальной скорости. Только **после одобрения CEO** — PR-V3.

**PR-V3 — монтажи в продакшен:** `home-films.ts`, `build-home-films.mjs`, `home-films.test.mjs`, медиа, `HomeFilmWindow.astro`, удаление legacy-DOM (explainer/journey/system/academy/weather/echo) и связанных observer'ов. Удаление `*-720.mp4` старых one-shot и `logistics-living/*` при отказе от fallback — **только с явного согласия владельца на удаление** (CLAUDE.md). Снять «one-video maximum» в `ERROR_REGISTER`, обновить `HOME_CLAUDE_V3_MEDIA_SOURCE_LOCK`.

**PR-V4 — адаптив:** матрица 390/430/701/768/820/1024/1440, решение по #1981 (закрыть или минимальный replay), физический iPhone Safari.

**Дальше:** P1 нижняя часть страницы (#1986 P1) → P2 `/paths/logistics/` как представительная страница → #1985 локали.

---

## J. CI и workflow: убрать лишнее, сохранить покрытие (реализует ChatGPT, это не визуальная работа)

1. **Новый `home-visual-evidence.yml`.** Paths: `src/pages/index.astro`, `src/components/Home*.astro`, `src/components/SiteHeader.astro`, `src/data/home-films.ts`, `src/data/public-paths.ts`, `public/scripts/home-*.js`, `public/media/home/**`, `src/styles/home*.css`, `tests/home*.spec.ts`, `scripts/capture-home-motion-evidence.mjs`, `scripts/home-films.test.mjs`. Jobs: build → `home-films.test.mjs` → Playwright `tests/home*.spec.ts` → motion evidence 1440/390.
2. **Из `hermes-connect-visual-evidence.yml`** убрать `HomeMasterScene.astro` и шаг Home motion evidence. Шаги Academy-RU и Repair-RU контрактов запускать только при совпадении их собственных путей (отдельная job с `if:` по `git diff --name-only` против базы, без новых сторонних action'ов). Website checks (`ci.yml`) не трогать: это обязательный гейт.
3. **Защита путей Claude — `scripts/visual-owner-guard.mjs` + job в `ci.yml`.** Если PR затрагивает пути §E.3, job падает, пока у PR нет label `visual-owner:claude`. Label ставит Claude или CEO. Механически предотвращает повторение #1991.
4. **Production-верификатор #1995** остаётся как есть (post-deploy). После PR-V3 добавить в него проверку, что `currentSrc` указывает на файл из манифеста.

---

## K. Handoff обратно ChatGPT

### РЕАЛИЗОВАТЬ (ChatGPT, отдельные PR, не на путях Claude)
1. **J.3** — защита путей Claude (`visual-owner-guard`) в `ci.yml`.
2. **J.1 + J.2** — `home-visual-evidence.yml` и сужение `hermes-connect-visual-evidence.yml`.
3. **Плагины по §D/§E:** четыре навыка слить в `web-delivery-loop`, оставить одну лестницу, перенести runtime gate в TechDev, удалить `design-code-drift-control`, сократить `ci-release-council` и `release-readiness`. Релиз — один раз, в конце сессии.
4. **One Brain / DESIGN DECISIONS:** исправить запись от 22.10 (#1991 = регрессия, #1994 = исправление, #1995 = гейт, #1993 закрыт), добавить ссылку на этот аудит.
5. Довести #1942 и #1976 до зелёного CI. Мерж только после того, как Claude посмотрит скриншоты 390/1440.
6. Дальше — свой бэклог: SEO/GEO, Load Board, #1992, без правок Home.

### ТОЛЬКО ПРОВЕРЯТЬ (независимый QA PR-V1…V4 от Claude)
- runtime-доказательство по каждой полосе, Lighthouse (LCP/CLS/INP) и переданные байты до/после;
- паритет SEO главной: title/description, canonical/hreflang, JSON-LD (три сущности), внутренние ссылки на `/paths/*`;
- a11y (контраст подписей ≥ 4.5:1, клавиатура, `aria-label` маршрутов);
- production-верификатор после деплоя и статус LIVE_VERIFIED;
- замечания — комментарием в PR Claude с селектором и ожидаемым поведением, **без коммитов в ветку Claude**.

### НЕ ТРОГАТЬ
Все пути из §E.3. Выбор кадров, кроп, ритм, постеры, Header/Products, #1981, #1985, медиа в `public/media/home/**`. Никаких «маленьких runtime-фиксов» Home без явного incident override от CEO.

### ТОЧНЫЙ ПОРЯДОК
1. **Claude:** PR-V1 (перекодирование Logistics + единый runtime + чистка тестов + селекторы верификатора).
2. **ChatGPT параллельно:** J.3 guard → J.1/J.2 workflow → чистка плагинов → правка One Brain.
3. **ChatGPT:** QA PR-V1 → мерж владельцем → деплой → LIVE_VERIFIED через #1995.
4. **Claude:** PR-V2 (превью четырёх монтажей) → **решение CEO**.
5. **Claude:** PR-V3 (монтажи + манифест + `HomeFilmWindow` + удаление legacy) → **ChatGPT** QA → мерж → LIVE.
6. **Claude:** PR-V4 (адаптив, #1981, iPhone) → **ChatGPT** QA.
7. Затем нижняя часть страницы → `/paths/logistics/` → #1985. SEO-контракт для каждого шага готовит ChatGPT заранее, в виде issue.

---

## L. Какую модель Claude выбрать

| Задача | Модель | Почему |
|---|---|---|
| PR-V1…V4: визуальная сборка Home, монтаж через FFmpeg, раскадровка, адаптив, тесты | **Claude Opus 5.5** (`claude-opus-5-5`), effort `high`/`xhigh` | Многофайловая правка Astro/JS/CSS плюс зрительная оценка кадров. Лучшее соотношение качества и цены ($4/$20 за 1M токенов); в Claude Code это модель по умолчанию |
| Разовое арт-решение, если превью не принято с первого раза (альтернативы планов, ритм) | Claude Fable 5.1 (`claude-fable-5-1`) | Самая сильная модель, но в 2,5 раза дороже Opus 5.5. Только для точечного ревью, не для сборки |
| CI-воркфлоу, guard-скрипт, обновление тестов по готовой спецификации, правки текстов плагинов | Claude Sonnet 5.5 (`claude-sonnet-5-5`) | Быстрее и в 2 раза дешевле Opus, достаточно для работы по точному ТЗ |
| Массовые механические проверки (ffprobe-отчёты, сверка размеров и sha) | Claude Haiku 5.5 (`claude-haiku-5-5`) | Самая дешёвая, для работы по шаблону |

**Итог:** вся визуальная линия Home ведётся на **Opus 5.5**. Fable 5.1 подключается только для одного арт-ревью, если CEO отклонит превью.
