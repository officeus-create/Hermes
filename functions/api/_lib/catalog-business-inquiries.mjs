const DELIVERY_STATES = new Set(["pending", "delivered", "failed", "skipped"]);

async function ensureInquiryColumn(db, column, definition) {
  const result = await db.prepare("PRAGMA table_info(catalog_business_inquiries)").all();
  const names = new Set((result?.results ?? []).map((row) => String(row.name || "")));
  if (!names.has(column)) await db.prepare(`ALTER TABLE catalog_business_inquiries ADD COLUMN ${definition}`).run();
}

export async function ensureCatalogBusinessInquirySchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS catalog_business_inquiries (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL UNIQUE,
      payload_hash TEXT NOT NULL,
      catalog_business_id TEXT NOT NULL,
      catalog_profile TEXT NOT NULL,
      catalog_source_ref TEXT,
      shop_id TEXT,
      owner_specialist_id TEXT,
      business_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT,
      contact_whatsapp TEXT,
      contact_telegram TEXT,
      preferred_language TEXT,
      preferred_contact_time TEXT,
      message TEXT NOT NULL,
      services_json TEXT NOT NULL,
      attribution_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new','seen','contacted','closed')),
      internal_delivery_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (internal_delivery_status IN ('pending','delivered','failed')),
      owner_delivery_status TEXT NOT NULL DEFAULT 'skipped'
        CHECK (owner_delivery_status IN ('pending','delivered','failed','skipped')),
      owner_delivery_at TEXT,
      retention_until TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await ensureInquiryColumn(db, "owner_delivery_status", "owner_delivery_status TEXT NOT NULL DEFAULT 'skipped'");
  await ensureInquiryColumn(db, "owner_delivery_at", "owner_delivery_at TEXT");
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_business_inquiries_owner ON catalog_business_inquiries(owner_specialist_id, created_at DESC)"
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_business_inquiries_business ON catalog_business_inquiries(catalog_business_id, created_at DESC)"
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_business_inquiries_retention ON catalog_business_inquiries(retention_until)"
  ).run();
}

async function byRequestId(db, requestId) {
  return db.prepare(`
    SELECT id, request_id, payload_hash, catalog_business_id, catalog_profile, catalog_source_ref,
           shop_id, owner_specialist_id, business_name, contact_name, contact_email, contact_phone,
           contact_whatsapp, contact_telegram, preferred_language, preferred_contact_time, message,
           services_json, attribution_json, status, internal_delivery_status, owner_delivery_status, owner_delivery_at, retention_until,
           created_at, updated_at
    FROM catalog_business_inquiries
    WHERE request_id = ?
    LIMIT 1
  `).bind(requestId).first();
}

export async function saveCatalogBusinessInquiry(db, input) {
  await ensureCatalogBusinessInquirySchema(db);
  const existing = await byRequestId(db, input.requestId);
  if (existing) {
    return {
      created: false,
      conflict: String(existing.payload_hash || "") !== input.payloadHash,
      row: existing,
    };
  }

  const id = "catalog_inquiry_" + crypto.randomUUID();
  try {
    await db.prepare(`
      INSERT INTO catalog_business_inquiries (
        id, request_id, payload_hash, catalog_business_id, catalog_profile, catalog_source_ref,
        shop_id, owner_specialist_id, business_name, contact_name, contact_email, contact_phone,
        contact_whatsapp, contact_telegram, preferred_language, preferred_contact_time, message,
        services_json, attribution_json, status, internal_delivery_status, owner_delivery_status, owner_delivery_at, retention_until,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'pending', ?, NULL, ?, ?, ?)
    `).bind(
      id,
      input.requestId,
      input.payloadHash,
      input.catalogBusinessId,
      input.catalogProfile,
      input.catalogSourceRef || null,
      input.shopId || null,
      input.ownerSpecialistId || null,
      input.businessName,
      input.contactName,
      input.contactEmail,
      input.contactPhone || null,
      input.contactWhatsapp || null,
      input.contactTelegram || null,
      input.preferredLanguage || null,
      input.preferredContactTime || null,
      input.message,
      JSON.stringify(input.services || []),
      JSON.stringify(input.attribution || {}),
      DELIVERY_STATES.has(input.ownerDeliveryStatus) ? input.ownerDeliveryStatus : "skipped",
      input.retentionUntil,
      input.createdAt,
      input.createdAt,
    ).run();
  } catch (error) {
    const raced = await byRequestId(db, input.requestId);
    if (!raced) throw error;
    return {
      created: false,
      conflict: String(raced.payload_hash || "") !== input.payloadHash,
      row: raced,
    };
  }

  return { created: true, conflict: false, row: await byRequestId(db, input.requestId) };
}

export async function markCatalogBusinessInquiryInternalDelivery(db, requestId, state) {
  if (!DELIVERY_STATES.has(state)) throw new Error("invalid_catalog_inquiry_delivery_state");
  await ensureCatalogBusinessInquirySchema(db);
  await db.prepare(`
    UPDATE catalog_business_inquiries
    SET internal_delivery_status = ?, updated_at = ?
    WHERE request_id = ?
  `).bind(state, new Date().toISOString(), requestId).run();
}


export async function markCatalogBusinessInquiryOwnerDelivery(db, requestId, state) {
  if (!DELIVERY_STATES.has(state)) throw new Error("invalid_catalog_inquiry_owner_delivery_state");
  await ensureCatalogBusinessInquirySchema(db);
  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE catalog_business_inquiries
    SET owner_delivery_status = ?, owner_delivery_at = CASE WHEN ? = 'delivered' THEN ? ELSE owner_delivery_at END, updated_at = ?
    WHERE request_id = ?
  `).bind(state, state, now, now, requestId).run();
}
