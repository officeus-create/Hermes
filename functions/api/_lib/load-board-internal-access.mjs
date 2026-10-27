import { ensureInternalAiSchema } from "./internal-ai.mjs";

export async function ensureLoadBoardInternalAccessSchema(db) {
  await ensureInternalAiSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_board_internal_dispatchers (
      specialist_id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('active','revoked')),
      identity_verified INTEGER NOT NULL DEFAULT 0 CHECK(identity_verified IN (0,1)),
      granted_by_specialist_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      note TEXT
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_load_board_internal_dispatchers_status
    ON hermes_load_board_internal_dispatchers(status, reviewed_at DESC)
  `).run();
}

export async function internalLoadBoardCapability(db, specialistId) {
  if (!db || !specialistId) return { allowed: false, owner: false, dispatcher: false };
  await ensureLoadBoardInternalAccessSchema(db);
  const id = String(specialistId);
  const owner = await db.prepare(`
    SELECT specialist_id
    FROM hermes_internal_owner_access
    WHERE specialist_id = ? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER'
    LIMIT 1
  `).bind(id).first();
  if (owner) return { allowed: true, owner: true, dispatcher: true };
  const dispatcher = await db.prepare(`
    SELECT specialist_id
    FROM hermes_load_board_internal_dispatchers
    WHERE specialist_id = ? AND status = 'active' AND identity_verified = 1
    LIMIT 1
  `).bind(id).first();
  return { allowed: Boolean(dispatcher), owner: false, dispatcher: Boolean(dispatcher) };
}

export async function specialistHasInternalLoadBoardAccess(db, specialistId) {
  return Boolean((await internalLoadBoardCapability(db, specialistId)).allowed);
}
