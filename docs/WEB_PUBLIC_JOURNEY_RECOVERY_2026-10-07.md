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
