# Восстановительная выкладка почтового Worker — 2026-09-08

Причина: итоговая проверка рабочего сайта после PR #1162 подтвердила актуальную страницу, но тестовое обращение получило HTTP 503 от внутреннего контура доставки письма.

Этот файл не меняет код, секреты, адресатов или бизнес-логику. Его единственная цель — безопасно запустить канонический процесс повторной выкладки `hermes-lead-email` из текущей основной ветки с существующей конфигурацией и сохранением закрытых переменных окружения.

После успешной выкладки требуется повторить итоговую проверку рабочего сайта и подтвердить: первое тестовое обращение принято, повторная отправка с тем же идентификатором подавлена.

For the Car Hauling commercial lead route, keep Telegram credentials server-side only. Configure `CAR_HAULING_TELEGRAM_BOT_TOKEN` and `CAR_HAULING_TELEGRAM_SALES_CHAT_ID` as Worker secrets/bindings; never commit their values to this repository.

After redeploy, verify both paths: a known synthetic carrier smoke must arrive only as `[HERMES TEST]` in the primary Sales inbox, while a real Car Hauling carrier must reach primary Sales, Dispatch Truck 107, Volkogon, and the approved Sales Telegram group. Replaying the same request ID must not create duplicate notifications.
