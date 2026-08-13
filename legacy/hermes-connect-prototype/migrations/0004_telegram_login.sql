-- Adds optional Telegram-linked login. Nullable + unique so existing
-- email/password specialists are unaffected; a specialist can have at most
-- one linked Telegram account.

ALTER TABLE specialists ADD COLUMN telegram_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_specialists_telegram_id ON specialists(telegram_id) WHERE telegram_id IS NOT NULL;
