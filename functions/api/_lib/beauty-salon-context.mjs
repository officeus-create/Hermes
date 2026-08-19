import { ensureBeautySalonSchema } from "./beauty-salon-schema.mjs";
import { ensureDefaultBusinessContext } from "./service-context.mjs";

export const BEAUTY_SALON_SERVICE_VERTICAL = "beauty_salon";

export async function getOwnedBeautySalon(db, ownerId) {
  await ensureBeautySalonSchema(db);
  return db.prepare(`
    SELECT id,owner_specialist_id,name,slug,phone,website,address_line1,city,region,postal_code,country_code,timezone,created_at,updated_at
    FROM beauty_salons
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(ownerId).first();
}

export async function ensureBeautySalonServiceContext(db, ownerId, salon = null) {
  const ownedSalon = salon?.id ? salon : await getOwnedBeautySalon(db, ownerId);
  if (!ownedSalon) return null;
  const context = await ensureDefaultBusinessContext(db, {
    ownerId,
    verticalKey: BEAUTY_SALON_SERVICE_VERTICAL,
    businessId: String(ownedSalon.id),
  });
  return { salon: ownedSalon, context };
}
