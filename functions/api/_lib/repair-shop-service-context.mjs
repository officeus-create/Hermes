import { ensureRepairShopProfileSchema } from "./repair-shop-schema.mjs";
import { ensureRepairShopBookingsSchema } from "./repair-shop-bookings-schema.mjs";
import { ensureDefaultBusinessContext } from "./service-context.mjs";

export const REPAIR_SHOP_SERVICE_VERTICAL = "repair_shop";

async function tableExists(db, name) {
  const row = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
  ).bind(name).first();
  return Boolean(row?.name);
}

export async function resolveDefaultRepairShopServiceContext(db, ownerId, knownShop = null) {
  await ensureRepairShopProfileSchema(db);
  const shop = knownShop?.id
    ? knownShop
    : await db.prepare(
        "SELECT id,owner_specialist_id FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1",
      ).bind(ownerId).first();
  const businessId = shop?.id ? String(shop.id) : `pending:${ownerId}`;
  const context = await ensureDefaultBusinessContext(db, {
    ownerId,
    verticalKey: REPAIR_SHOP_SERVICE_VERTICAL,
    businessId,
  });
  return { context, shop: shop || null, includeLegacyUnmapped: true };
}

export async function repairShopServiceHasUsage(db, ownerId, serviceId) {
  let legacyBooking = null;
  if (await tableExists(db, "bookings")) {
    legacyBooking = await db.prepare(
      "SELECT id FROM bookings WHERE service_id = ? LIMIT 1",
    ).bind(serviceId).first();
  }

  await ensureRepairShopBookingsSchema(db);
  const repairBooking = await db.prepare(
    "SELECT id FROM repair_shop_bookings WHERE service_id = ? AND owner_specialist_id = ? LIMIT 1",
  ).bind(serviceId, ownerId).first();

  return Boolean(legacyBooking || repairBooking);
}
