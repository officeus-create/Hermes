# Technology — WEB Сайт: восстановление публичных сценариев

Дата: 7 октября 2026. База: main `6fb10af76014da10897a4688e92f837472273896`, merge PR #1746. Изменения ниже подготовлены к ревью, не опубликованы.

## Исходная бизнес-логика и границы доказательств

Изучены два переданных проектных handoff-файла от 1–2 октября, актуальный репозиторий, история релизов, открытые PR, публичные страницы и Lighthouse artifact. Это не экспорт всей переписки проекта. Исторические задачи #1602–1612 не открываются заново без нового дефекта.

Главная — вход в четыре направления; Technology — витрина разработки и реальных продуктовых сценариев; Website Development — коммерческий маршрут заказа сайта; Academy — выбор образовательного направления, отдельно от доступных enrollment-программ; Connect Repair Shop — текущий продуктовый pilot. Географические страницы помогают клиенту выбрать услугу в своём рынке, а не доказывают наличие физического офиса. Слабая индексация не является причиной удаления или noindex.

## Реализованные изменения

| URL | Дефект и назначение | Результат и приёмка |
|---|---|---|
| /company-information/ и страницы с общим SiteHeader | CTA `#contact` без соответствующей секции ломал контактный сценарий | По умолчанию CTA ведёт на /contacts/; существующие локальные формы сохраняют #contact через явный prop. Проверка сгенерированного HTML подтверждает существование каждого header-target. |
| /paths/academy/#academy-it, #academy-sales, #academy-operations | Входящие ссылки на направления не имели якорей | Видимые карточки с описаниями и правильными ID; кнопка выбирает нужный интерактивный track; отдельный mailto-запрос. Не подставляются неподдерживаемые параметры формы /academy/apply/. |
| /paths/technology/ и общая навигация направления Marketing | Общая услуга сайта/SEO направляла посетителей на London owner | Общие CTA ведут на /services/website-development/ и /services/seo/. Локальная лондонская услуга сохраняется. |
| /paths/technology/ | Connect-карточка описывала прежний prototype и отправляла в общий contact | Честное обозначение текущего Repair Shop pilot и прямая ссылка /services/hermes-connect/repair-shops/. |
| /, /paths/technology/, /paths/marketing/, /paths/academy/ и остальные публичные страницы | Глобально загружался repair-owner-runtime-fixes.js | Скрипт подключается только на семи явных owner-маршрутах Repair Shop. На публичном входе отсутствует запрос; dashboard сохраняет его. |
| Production Lighthouse workflow | Запуск на push конкурировал с deploy | Запуск после успешного deploy workflow; проверка успешной deployment-квитанции того же SHA и текущего main; устаревшие/неуспешные ревизии отклоняются. |

## Скорость: что действительно известно

PR #1746 содержит локальный lab-результат Performance 85 / LCP 3,93 с. Это не production-измерение. Production Lighthouse run 37673789507 снял home в 19:21:14 UTC, а deploy run 37673789553 подтвердил публикацию в 19:23:07 UTC. Поэтому Performance 79 / LCP 4,98 с относится к прежней выдаче: в artifact ещё присутствует car-hauler-887.webp. Нельзя объявлять это регрессией или успехом #1746.

В этом прежнем artifact BaseLayout CSS занимает 243333 raw bytes / 44953 transfer bytes; 78,47% не использовано в измеренном первом экране; Lighthouse оценил потенциальную экономию LCP около 340 мс. Это диагностическая оценка, не обещание ускорения. Общие стили остаются кандидатом на отдельную оптимизацию. Данных CrUX недостаточно; field-победа не заявляется.

## Точное ТЗ на следующий bounded patch

Общие BaseLayout, SiteFooter и Catalog сейчас изменяет открытый PR #1744: следующий patch следует делать после сверки его точного head, без перезаписи i18n-работы.

| Приоритет, URL | Причина и бизнес-цель | Ожидаемое изменение | Критерии приёмки |
|---|---|---|---|
| P0: /, /paths/technology/, /paths/marketing/, /paths/academy/, /services/website-development/ | Общий BaseLayout импортирует стили workspace и repair-company-schedule независимо от публичного назначения | Разделить общие shell-стили и стили конкретных owner-компонентов; перенести owner-only CSS к компонентам. Не делать indiscriminate async CSS, вызывающий FOUC | Указанные публичные URL не загружают owner-only CSS; визуальное сравнение 390/768/1440 px, reduced-motion, menu, consent и формы без регрессий. Три последовательных mobile Lighthouse после успешного exact-SHA deploy; сравнить медианы LCP/FCP/CLS, transfer и blocking CSS при одинаковом consent. Проверить live srcset 768 из #1746 и отсутствие прежнего eager 887 изображения. Не заявлять улучшение до readback. |
| P1: /contacts/, /download/, /opportunities/, /load-board/ и все URL приложения ниже | Footer #top без цели; skip-link #main-content без main-ID | В согласованном общем layout обеспечить один top target и один main-content target; проверить существующие ID во всех owners | Ноль отсутствующих #top/#main-content целей в индексируемом build; клавиатурный skip переносит фокус в main; back-to-top работает на mobile. Якорь # сам по себе не считать сломанной страницей: проверить JS-сценарий. |
| P1: /paths/academy/, /academy/apply/, /academy/countries/* | Пять направлений витрины не тождественны двум доступным application-программам | Объяснить разницу между интересом к направлению и текущими программами набора; направлять eligible program на существующую форму, прочие направления на запрос информации | Ни одного неизвестного program value; запрос не теряется; success соответствует реальному backend receipt; нет выдуманных дат старта, оплаты, трудоустройства или cohorts. |
| P1: /services/website-development/, /paths/technology/ | Витрина должна вести к заказу и объяснять результат, сохраняя утверждённый дизайн | Проверить первый mobile-экран: аудитория, результат, scope услуги, основной CTA; завершить переходы showcase→service→контакт | CTA доступен без hover; читаемый контраст и отсутствие обрезки 390 px; валидный запрос в существующий канал; нет нового неподтверждённого SLA/цен/кейсов. |
| P1: /academy/countries/* и региональные service owners | Schema должна отражать фактический вид страницы, а не создавать локальный офис или открытый курс | Сопоставить visible content с JSON-LD: информационная подборка — CollectionPage/ItemList с реальными program owners; Course/Offer только при подтверждённых учебных условиях; Organization/Service без фиктивных LocalBusiness адресов | Валидный JSON-LD, стабильные @id, ссылки на существующие canonical owners, отсутствие неподтверждённых rating/review/offer/address; rich-result eligibility не обещается. |
| P2: все indexable owners из sitemap | Сохранить уникальную семантику для Google/Bing/AI | Purpose-aware audit title/H1/description, answer-first абзац, чёткая услуга/аудитория/география, контекстные внутренние ссылки; сравнить с текущими владельцами intent | Один содержательный H1; уникальные непустые title/description; canonical 200, согласован sitemap и breadcrumbs. Ни удаления, ни noindex только из-за GSC discovered/crawled-not-indexed. В build дублей title/description у индексируемых страниц уже не обнаружено — массовая перепись не нужна. |

## Проверки и ограничения

`npm run build`: PASS (399 Astro routes). `npm test`: PASS, включая новые static journey и deployment-gate fixtures. `git diff --check`: PASS. Добавлены 10 Playwright сценариев для desktop/mobile. Локальный браузерный прогон не завершён успешно: окружение не смогло установить Chromium, первая попытка preview также завершилась раньше теста. Browser PASS и production-изменения не заявляются; CI должен выполнить новый набор перед merge. Публикация и merge не выполнялись.

## Полный список остаточных fragment-целей

Список получен из сгенерированного indexable HTML новой ветки. Это проверка целевых ID, а не доказательство падения всего сценария на production. #top и #main-content требуют общего исправления после согласования #1744.

| URL | Отсутствующие цели |
|---|---|
| https://hermeslogisticsus.com/load-board/ | #top |
| https://hermeslogisticsus.com/download/ | #top |
| https://hermeslogisticsus.com/businesses/ | #main-content, #top |
| https://hermeslogisticsus.com/opportunities/ | #top |
| https://hermeslogisticsus.com/contacts/ | #top |
| https://hermeslogisticsus.com/academy/countries/morocco/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/vietnam/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/moldova/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/romania/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/tajikistan/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/philippines/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/morocco/en/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/vietnam/en/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/moldova/en/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/romania/en/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/tajikistan/en/ | #main-content, #top |
| https://hermeslogisticsus.com/academy/countries/philippines/en/ | #main-content, #top |
| https://hermeslogisticsus.com/load-board/equipment/car-hauler/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/ | #top |
| https://hermeslogisticsus.com/logistics/carrier/ | #top |
| https://hermeslogisticsus.com/logistics/milwaukee-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/wisconsin-auction-vehicle-pickup/ | #top |
| https://hermeslogisticsus.com/logistics/dealer-vehicle-transportation/ | #top |
| https://hermeslogisticsus.com/logistics/apply/ | #top |
| https://hermeslogisticsus.com/logistics/open-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/green-bay-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/wisconsin-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/multi-car-transport/ | #top |
| https://hermeslogisticsus.com/logistics/waukesha-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/oshkosh-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/wisconsin-dealer-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/agency/ | #top |
| https://hermeslogisticsus.com/logistics/racine-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/fleet-owner-dispatch-support/ | #top |
| https://hermeslogisticsus.com/logistics/shipper-dealer/ | #top |
| https://hermeslogisticsus.com/logistics/direct-vehicle-transport-network/ | #top |
| https://hermeslogisticsus.com/logistics/enclosed-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/wisconsin-multi-vehicle-dealer-transport/ | #top |
| https://hermeslogisticsus.com/logistics/kenosha-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/broker/ | #top |
| https://hermeslogisticsus.com/logistics/fond-du-lac-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/sheboygan-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauling-dispatch/ | #top |
| https://hermeslogisticsus.com/logistics/port-vehicle-pickup/ | #top |
| https://hermeslogisticsus.com/logistics/wisconsin-enclosed-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/inoperable-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/auction-vehicle-pickup/ | #top |
| https://hermeslogisticsus.com/logistics/careers/ | #top |
| https://hermeslogisticsus.com/logistics/la-crosse-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/new-authority-car-hauler-support/ | #top |
| https://hermeslogisticsus.com/logistics/madison-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/owner-operator-dispatch-support/ | #top |
| https://hermeslogisticsus.com/logistics/eau-claire-wi-vehicle-transport/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/lynnwood-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/pueblo-co/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/kansas-city-mo-ks/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/colorado-springs-co/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/aurora-co/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/auburn-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/commerce-city-co/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/seattle-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/bridgeton-mo/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/graham-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/renton-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/denver-co/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/topeka-ks/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/fountain-co/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/marysville-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/tacoma-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/rogersville-mo/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/chicago-heights-il/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/puyallup-wa/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/fremont-ca/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/st-louis-mo/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/springfield-mo/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/university-park-il/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/brighton-co/ | #top |
| https://hermeslogisticsus.com/logistics/car-hauler-loads/chicago-il/ | #top |
| https://hermeslogisticsus.com/businesses/arkansas/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/ukraine/ | #top |
| https://hermeslogisticsus.com/businesses/illinois/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/california/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/arkansas/guy/clendenins-auto-repair/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/arkansas/little-rock/smart-bubble-mobile-auto-body-repair/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/arkansas/sherwood/seans-autopro-mobile/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/arkansas/cedarville/the-dapper-wrench/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/ukraine/chaiky/ | #top |
| https://hermeslogisticsus.com/businesses/ukraine/irpin/cvit-vyshni/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/ukraine/chaiky/trimmo-ii/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/ukraine/chaiky/mangal-i-kazan/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/ukraine/chaiky/chayka-store/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/iowa/bedford/hawhee-truck-repair-bedford/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/illinois/crystal-lake/carss-crystal-lake/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/illinois/east-dundee/dieselhub-service-east-dundee/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/oklahoma/tulsa/holt-truck-centers-tulsa/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/texas/dallas/legacy-toyota-of-dallas/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/south-dakota/mitchell/ag-diesel-mitchell/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/wyoming/glenrock/iron-nation-services/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/alaska/palmer/gold-standard-diesel-and-fleet/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/california/colton/westrux-international-colton/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/california/riverside/freightfix-riverside-county/ | #main-content, #top |
| https://hermeslogisticsus.com/businesses/alabama/brookwood/diamondback-truck-trailer-repair-brookwood/ | #main-content, #top |
| https://hermeslogisticsus.com/services/hermes-connect/ | #top |
| https://hermeslogisticsus.com/services/hermes-connect/support/ | #top |
| https://hermeslogisticsus.com/services/hermes-connect/repair-shops/ | #top |
| https://hermeslogisticsus.com/services/hermes-connect/repair-shops/plan/ | #top |
| https://hermeslogisticsus.com/gb/london/ | #top |
| https://hermeslogisticsus.com/gb/london/beauty-salon-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/marketing-audit/ | #top |
| https://hermeslogisticsus.com/gb/london/cleaning-company-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/ | #top |
| https://hermeslogisticsus.com/gb/london/google-business-profile/ | #top |
| https://hermeslogisticsus.com/gb/london/dental-clinic-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/home-services-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/meta-ads/ | #top |
| https://hermeslogisticsus.com/gb/london/restaurant-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/us-logistics-training/ | #top |
| https://hermeslogisticsus.com/gb/london/seo-services/ | #top |
| https://hermeslogisticsus.com/gb/london/logistics-company-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/social-media-management/ | #top |
| https://hermeslogisticsus.com/gb/london/local-seo/ | #top |
| https://hermeslogisticsus.com/gb/london/auto-repair-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/car-detailing-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/it-web-development/ | #top |
| https://hermeslogisticsus.com/gb/london/marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/professional-services-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/website-development/ | #top |
| https://hermeslogisticsus.com/gb/london/contractor-marketing/ | #top |
| https://hermeslogisticsus.com/gb/london/landing-page-development/ | #top |
| https://hermeslogisticsus.com/gb/london/content-reels-scripts/ | #top |
| https://hermeslogisticsus.com/gb/london/crm-automation/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/english-readiness/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/shipper-dealer-sales-training/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/apply/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/us-logistics-course/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/carrier-sales-training/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/how-training-works/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/freight-dispatcher-training/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/faq/ | #top |
| https://hermeslogisticsus.com/gb/london/academy/load-planner-training/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/training-curriculum/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/website-seo-funnel/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/small-business-website-guide/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/meta-ads-expectations/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/us-logistics-roles/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/b2-english-us-logistics/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/local-seo-london/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/social-media-strategy/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/dispatcher-vs-load-planner/ | #top |
| https://hermeslogisticsus.com/gb/london/guides/digital-growth-system/ | #top |
| https://hermeslogisticsus.com/careers/car-hauling-dispatcher/ | #top |
| https://hermeslogisticsus.com/careers/wisconsin-owner-operators/ | #top |
| https://hermeslogisticsus.com/ru/gb/london/ | #top |
| https://hermeslogisticsus.com/ru/gb/london/us-logistics-training/ | #top |
| https://hermeslogisticsus.com/ru/gb/london/it-web-development/ | #top |
| https://hermeslogisticsus.com/ru/gb/london/marketing/ | #top |
| https://hermeslogisticsus.com/paths/logistics/drivers/ | #top |
| https://hermeslogisticsus.com/paths/logistics/shippers-dealers/ | #top |
| https://hermeslogisticsus.com/paths/logistics/guidance/ | #top |
| https://hermeslogisticsus.com/paths/logistics/find-your-path/ | #top |
| https://hermeslogisticsus.com/paths/logistics/agency-partners/ | #top |
| https://hermeslogisticsus.com/paths/logistics/carriers/direct-freight-development/ | #top |
| https://hermeslogisticsus.com/paths/logistics/carriers/owner-operators/ | #top |
| https://hermeslogisticsus.com/paths/logistics/carriers/fleet-owners/ | #top |
| https://hermeslogisticsus.com/paths/logistics/carriers/new-authority/ | #top |
| https://hermeslogisticsus.com/paths/logistics/carriers/trusted-carrier-network/ | #top |
| https://hermeslogisticsus.com/paths/logistics/brokers/carrier-capacity/ | #top |
| https://hermeslogisticsus.com/paths/logistics/customers/vehicle-transport/ | #top |
| https://hermeslogisticsus.com/paths/logistics/customers/port-pickup/ | #top |
| https://hermeslogisticsus.com/paths/logistics/customers/luxury-classic-vehicle/ | #top |
| https://hermeslogisticsus.com/ua/gb/london/ | #top |
| https://hermeslogisticsus.com/ua/gb/london/us-logistics-training/ | #top |
| https://hermeslogisticsus.com/ua/gb/london/it-web-development/ | #top |
| https://hermeslogisticsus.com/ua/gb/london/marketing/ | #top |


## Остаточная mobile-производительность после #1747 — bounded evidence, 2026-10-07 UTC

Статус: IMPLEMENTED / TARGET_VERIFIED, draft release gate pending. Это продолжение существующей Technology — WEB Сайт задачи, а не новый backlog. Ожидание deploy #1747 завершено; предыдущий EVENT_WAIT ниже/выше — исторический.

### Точная ревизия и production evidence

Свежий readback main = merge #1747 `d82279a8d81f5415137cefef4ac3cc656df52086`. Merge: 2026-10-07 21:01:04 UTC. [Deploy 37686365007](https://github.com/officeus-create/Hermes/actions/runs/37686365007) SUCCESS, updated 21:04:32 UTC; [production Lighthouse 37686780431](https://github.com/officeus-create/Hermes/actions/runs/37686780431) SUCCESS, 21:04:34–21:08:45 UTC. MERGED отдельно от LIVE: реальные HTML/asset GET и новые lab reports сняты после публикации.

Три свежих production mobile-прогона для каждого при одинаковых настройках Lighthouse 13.4.1 / Chrome headless shell 155.0.8059.39: simulated mobile, CPU 4x, RTT 150 ms, throughput 1638.4 kbps, 412×823, DPR 1.75; холодный профиль, consent untouched, без кликов. HTTPS proxy/certificate flag одинаковые во всех шести. `configSettings` SHA256 `f2b0f3fa0bad310eaa856b7e9ddb94cc71b0aae3969c34eccceac0db73e3457a`. Первые два разведочных прогона заменены после окончания параллельных unit tests; финальная серия без concurrent build/test нагрузки.

| Production owner / run | fetchTime UTC 2026-10-07 | Performance | LCP ms | TBT ms |
| --- | --- | ---: | ---: | ---: |
| Home 1 | 21:23:25.484 | 91 | 2071.636 | 0 |
| Home 2 | 21:21:49.101 | 90 | 1979.232 | 0 |
| Home 3 | 21:22:38.997 | 89 | 2072.2565 | 0 |
| **Home median** | after #1747, before this patch | **90** | **2071.636** | **0** |
| Dealer 1 | 21:23:48.906 | 79 | 2535.600 | 8 |
| Dealer 2 | 21:21:24.965 | 79 | 2609.516 | 0 |
| Dealer 3 | 21:22:13.442 | 84 | 2579.6585 | 0 |
| **Dealer median** | after #1747, before this patch | **79** | **2579.6585** | **0** |

SEO = 100 in all six. GitHub single-run Home 57 / LCP 3.7 s / TBT 3000 ms, Dealer 59 / 3.4 s / 3130 ms are valid earlier observations, not stable medians and not directly comparable across hosts/browser versions. Owner-provided other single observations from 37686780431: LoadBoard 83 / 3.5 s / 190 ms; dispatch 85 / 3.8 s / 0 ms; /services/seo/ 98 / 1.8 s / 50 ms. These remain single results; no three-run medians claimed for those routes. Workflow 37674883076 / main 6fb10af is pre-#1747 and never used as its effect.

### Trace findings and bounded decision

All three Home LCP nodes: `nav#paths > a.home-master-route > span.home-portal-art > img`, logistics scene imagery. All three Dealer LCP nodes: `div.shell > div.commercial-hero-grid > div > p.commercial-lead`, text, not hero image. Multisecond scripting/TBT is not sustained in these traces. Long-task URL alone does not identify a function; no repeatable expensive concrete call-stack justifies another runtime patch. Raw observed trace timings and simulated LCP timings are different measurement layers, not interchangeable.

BaseLayout CSS still about 44,055 compressed transfer bytes, render-blocking estimate ~300–310 ms in inspected reports. Estimate is not guaranteed savings. Active #1744 owns overlapping global layout/locale work and #1679 Home scene work; no global CSS/Home/runtime edits or duplicated #1747 TreeWalker/runtime-scope work. Main-thread rendering totals are not TBT. No field-CWV/conversion claim.

### Confirmed stale edge image and implemented correction

Unversioned `/images/path-logistics-system.jpg` returned **222,111 body bytes** (old GitHub 222,741 transfer includes headers) after successful deploy, CF HIT with long cache lifetime. Exact d822 main image is **90,337 bytes**. Query `?revision=d82279a8` returns that exact optimized payload. Repeated three GET pairs at 21:28:26/33, 21:28:39/46, 21:28:53/59 UTC confirm the same mismatch; all successful, HIT. New production Dealer reports also observe resourceSize 222,111 (transfer varies 222,716–222,748).

Old payload SHA256: `4ec293290e5e3a1188bdb16f81e99a6f4fa30c048db265c4fb82e04e531a831d`.
Optimized/main/candidate SHA256: `9d965fe79dadec6075549ce07538056c60ec7952275e6a2a482a9e2061b4cb6c`.
Reduction **131,774 bytes / 59.33%**. This proves stale delivery, not an independent TBT root cause.

Scoped implementation: bundle the same approved 90,337-byte image through Astro, producing `/_astro/path-logistics-system.dXZ0XwNU.jpg`; use one hashed URL consistently for hero, preload, social and Service schema image. Source pixels, title/H1, schema identity, text, CTA receivers, forms, dimensions and eager/high priority remain unchanged. Other custom images and legacy public URL remain valid. Media provenance remains NEEDS_OWNER_PROVENANCE; no invented rights or expanded placement. Source implementation commit `ad8dc5eb551ac746460ca911c25fbd9be474815a`.

### Comparable before/after, controlled local replay — NOT production after

Three interleaved pairs, same URL/host/browser/settings and cold profiles, after all tests stopped. Before = untouched d822 source build with only disposable generated hero replaced by exact captured stale edge payload; after = candidate build. Static HTTP transport serves CSS/JS uncompressed in both. This reproduces payload contention, but differs from production; absolute scores must not be compared with production medians.

| Dealer local replay | Performance | LCP ms | TBT ms |
| --- | ---: | ---: | ---: |
| Before 1 | 65 | 5663.2875 | 4 |
| After 1 | 67 | 5035.2165 | 0 |
| Before 2 | 70 | 5573.493 | 0 |
| After 2 | 72 | 4964.466 | 4 |
| Before 3 | 65 | 5649.966 | 2 |
| After 3 | 67 | 5036.991 | 0 |
| **Before median** | **65** | **5649.966** | **2** |
| **After median** | **67** | **5035.2165** | **0** |

LCP median improvement **614.7495 ms / 10.88%**; each paired after improves (~609–628 ms). LCP stays the same lead paragraph. Network trace proves hero resourceSize 222,111 → 90,337 and transfer 222,302 → 90,527. TBT 2 → 0 ms is negligible, not a heavy-TBT fix. No Home after claim because Home is unchanged. No after-fix production median exists until a separately authorized release.

### Validation, remaining gate and NEXT

Build/typecheck PASS: 399 routes, 0 errors/0 warnings (116 hints). Full npm test PASS. New static media/hash/preload/schema/CTA contracts PASS. Final focused browser checks PASS 4/4 (Dealer/dispatch × desktop/mobile). Reduced-motion screenshots/readbacks at 390/768/1440 confirm no horizontal overflow and unchanged CTA destinations; no lead submit.

Full local browser suite: **1965 passed, 25 failed, 16 skipped**. One new test initially failed because a legitimate repeated CTA made its selector ambiguous; selector narrowed and final focused 4/4 passed. Six unrelated failures reproduced on untouched d822 with same harness: Academy Ukraine 390 funnel, Catalog V4 readability, internal AI RU390, Connect Hub persisted RU, private AI responsive matrix, London RU responsive. Ten other selected failures passed on baseline replay; remaining failures are UNRESOLVED/flaky/harness candidates, not all declared pre-existing. Local harness uses headless shell and same-invocation static server because normal Chrome profile/preview server are unavailable. Full green browser acceptance is not claimed or waived.

NEXT: reviewer checks narrow cache-delivery diff; current-head CI must resolve/validate required browser gate. No merge/deploy performed. After separately approved successful exact-SHA deploy, verify hashed asset 90,337 bytes at edge and repeat comparable three-run production Dealer/Home control. Global CSS/Home improvements remain with current writers. Existing task measurement/implementation portion is bounded complete; release acceptance remains pending. Direct ChatGPT Page task update is ACCESS_GAP: two targeted Pages searches returned only unrelated guide, so no unrelated Page or duplicate task was modified.

Evidence bundle: `Hermes_Mobile_Evidence_2026-10-08.zip` contains production reports, controlled replay reports, devtools network logs, trace evidence, GET hashes and visual readbacks. Traces omit only Screenshot events to reduce size; timing/stacks/network events retained. Original single-run artifacts are provenance, not median inputs.
