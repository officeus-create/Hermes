const PENDING_BUSINESS_PREFIX = "pending:";

const nowIso = () => new Date().toISOString();

export async function ensureServiceContextSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_business_contexts (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      vertical_key TEXT NOT NULL,
      business_id TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(owner_specialist_id, vertical_key, business_id)
    )
  `).run();
  await db.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_hermes_business_context_default
    ON hermes_business_contexts(owner_specialist_id, vertical_key)
    WHERE is_default = 1
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_hermes_business_context_owner
    ON hermes_business_contexts(owner_specialist_id, vertical_key, business_id)
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_service_contexts (
      service_id TEXT PRIMARY KEY,
      context_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_hermes_service_context_context
    ON hermes_service_contexts(context_id)
  `).run();
}

export async function getOwnedBusinessContext(db, ownerId, contextId) {
  await ensureServiceContextSchema(db);
  return db.prepare(`
    SELECT id,owner_specialist_id,vertical_key,business_id,is_default,created_at,updated_at
    FROM hermes_business_contexts
    WHERE id = ? AND owner_specialist_id = ?
    LIMIT 1
  `).bind(contextId, ownerId).first();
}

export async function ensureDefaultBusinessContext(db, { ownerId, verticalKey, businessId }) {
  await ensureServiceContextSchema(db);
  const current = await db.prepare(`
    SELECT id,owner_specialist_id,vertical_key,business_id,is_default,created_at,updated_at
    FROM hermes_business_contexts
    WHERE owner_specialist_id = ? AND vertical_key = ? AND is_default = 1
    LIMIT 1
  `).bind(ownerId, verticalKey).first();

  if (current) {
    const oldBusinessId = String(current.business_id || "");
    const nextBusinessId = String(businessId || "");
    const mayPromotePending = oldBusinessId.startsWith(PENDING_BUSINESS_PREFIX)
      && nextBusinessId
      && !nextBusinessId.startsWith(PENDING_BUSINESS_PREFIX);
    if (mayPromotePending) {
      const updatedAt = nowIso();
      await db.prepare(`
        UPDATE hermes_business_contexts
        SET business_id = ?, updated_at = ?
        WHERE id = ? AND owner_specialist_id = ?
      `).bind(nextBusinessId, updatedAt, current.id, ownerId).run();
      return { ...current, business_id: nextBusinessId, updated_at: updatedAt };
    }
    return current;
  }

  const matching = await db.prepare(`
    SELECT id,owner_specialist_id,vertical_key,business_id,is_default,created_at,updated_at
    FROM hermes_business_contexts
    WHERE owner_specialist_id = ? AND vertical_key = ? AND business_id = ?
    LIMIT 1
  `).bind(ownerId, verticalKey, businessId).first();
  if (matching) {
    const updatedAt = nowIso();
    await db.prepare(`
      UPDATE hermes_business_contexts SET is_default = 1, updated_at = ?
      WHERE id = ? AND owner_specialist_id = ?
    `).bind(updatedAt, matching.id, ownerId).run();
    return { ...matching, is_default: 1, updated_at: updatedAt };
  }

  const id = `ctx-${crypto.randomUUID()}`;
  const createdAt = nowIso();
  try {
    await db.prepare(`
      INSERT INTO hermes_business_contexts
        (id,owner_specialist_id,vertical_key,business_id,is_default,created_at,updated_at)
      VALUES (?,?,?,?,1,?,?)
    `).bind(id, ownerId, verticalKey, businessId, createdAt, createdAt).run();
  } catch (error) {
    const raced = await db.prepare(`
      SELECT id,owner_specialist_id,vertical_key,business_id,is_default,created_at,updated_at
      FROM hermes_business_contexts
      WHERE owner_specialist_id = ? AND vertical_key = ? AND is_default = 1
      LIMIT 1
    `).bind(ownerId, verticalKey).first();
    if (raced) return raced;
    throw error;
  }

  return {
    id,
    owner_specialist_id: ownerId,
    vertical_key: verticalKey,
    business_id: businessId,
    is_default: 1,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

const serviceScopeSql = (extraWhere = "") => `
  SELECT s.id,s.name,s.duration_minutes,s.owner_specialist_id
  FROM services s
  LEFT JOIN hermes_service_contexts sc ON sc.service_id = s.id
  WHERE s.owner_specialist_id = ?
    AND (sc.context_id = ? OR (? = 1 AND sc.context_id IS NULL))
    ${extraWhere}
`;

export async function listServicesForContext(db, { ownerId, contextId, includeLegacyUnmapped = false }) {
  await ensureServiceContextSchema(db);
  const result = await db.prepare(`${serviceScopeSql()} ORDER BY s.name COLLATE NOCASE ASC`)
    .bind(ownerId, contextId, includeLegacyUnmapped ? 1 : 0)
    .all();
  return result?.results ?? [];
}

export async function findServiceForContext(db, { ownerId, contextId, serviceId, includeLegacyUnmapped = false }) {
  await ensureServiceContextSchema(db);
  return db.prepare(`${serviceScopeSql("AND s.id = ?")} LIMIT 1`)
    .bind(ownerId, contextId, includeLegacyUnmapped ? 1 : 0, serviceId)
    .first();
}

export async function findDuplicateServiceForContext(db, { ownerId, contextId, name, includeLegacyUnmapped = false }) {
  await ensureServiceContextSchema(db);
  return db.prepare(`${serviceScopeSql("AND lower(s.name) = lower(?)")} LIMIT 1`)
    .bind(ownerId, contextId, includeLegacyUnmapped ? 1 : 0, name)
    .first();
}

export async function createServiceForContext(db, { ownerId, contextId, name, durationMinutes }) {
  await ensureServiceContextSchema(db);
  const id = `service-${crypto.randomUUID()}`;
  const createdAt = nowIso();
  const insertService = db.prepare(
    "INSERT INTO services (id,name,duration_minutes,owner_specialist_id) VALUES (?,?,?,?)",
  ).bind(id, name, durationMinutes, ownerId);
  const mapService = db.prepare(`
    INSERT INTO hermes_service_contexts (service_id,context_id,created_at) VALUES (?,?,?)
  `).bind(id, contextId, createdAt);

  if (typeof db.batch === "function") {
    await db.batch([insertService, mapService]);
  } else {
    await insertService.run();
    try {
      await mapService.run();
    } catch (error) {
      await db.prepare("DELETE FROM services WHERE id = ? AND owner_specialist_id = ?")
        .bind(id, ownerId)
        .run();
      throw error;
    }
  }

  return { id, name, duration_minutes: durationMinutes, owner_specialist_id: ownerId };
}

export async function deleteServiceForContext(db, { ownerId, serviceId }) {
  await ensureServiceContextSchema(db);
  const deleteMapping = db.prepare("DELETE FROM hermes_service_contexts WHERE service_id = ?").bind(serviceId);
  const deleteService = db.prepare("DELETE FROM services WHERE id = ? AND owner_specialist_id = ?").bind(serviceId, ownerId);
  if (typeof db.batch === "function") {
    await db.batch([deleteMapping, deleteService]);
  } else {
    await deleteMapping.run();
    await deleteService.run();
  }
}
