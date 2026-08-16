# Hermes Connect Repair Shops — First-5 Manual Access Runbook

Parent: #592

## Purpose

Close the first paying Repair Shop customers without waiting for Stripe/PayPal or a billing-admin UI.

The commercial flow remains:

`paid activation intent → human confirmation → invoice/payment decision → bounded D1 access-state update → owner dashboard reflects state`

This runbook is intentionally temporary for the first shops.

## Allowed states

- `trialing`
- `founding`
- `active`
- `past_due`
- `cancelled`
- `comped`

Current plan id: `repair_shop_founding`.

## Before any update

Privately confirm all of the following outside GitHub:
- the exact repair shop/account being updated;
- commercial decision (`paid`, `founding`, `comped`, etc.);
- effective date;
- period end when applicable;
- the operator is using the production Hermes Connect D1 database, not preview/test.

Do not paste customer contact details, invoice data, payment screenshots, or account identifiers into GitHub.

## Read current state

Use an authenticated D1 console/approved operator path and identify the shop by a privately verified shop id or slug.

Read-only example:

```sql
SELECT r.id, r.slug, a.access_state, a.plan_id, a.started_at, a.current_period_end, a.updated_at
FROM repair_shops r
LEFT JOIN repair_shop_access a ON a.shop_id = r.id
WHERE r.slug = ?
LIMIT 1;
```

If the shop cannot be uniquely identified, stop. Do not guess.

## Apply the first commercial state

Use an exact verified `shop_id`. Example for a founding paid shop:

```sql
INSERT INTO repair_shop_access (
  shop_id,
  access_state,
  plan_id,
  started_at,
  current_period_end,
  updated_at
)
VALUES (?, 'founding', 'repair_shop_founding', ?, ?, ?)
ON CONFLICT(shop_id) DO UPDATE SET
  access_state = excluded.access_state,
  plan_id = excluded.plan_id,
  current_period_end = excluded.current_period_end,
  updated_at = excluded.updated_at;
```

Use ISO-8601 timestamps. Do not overwrite `started_at` on later status changes unless the commercial relationship is intentionally restarted.

For a comped founding user, use `comped`; for a normal active paid user after the founding phase, use `active`.

## Verify immediately after update

```sql
SELECT shop_id, access_state, plan_id, started_at, current_period_end, updated_at
FROM repair_shop_access
WHERE shop_id = ?
LIMIT 1;
```

Then sign in as/with the approved test path for that shop and verify the owner access endpoint returns the expected public-safe state.

## Failure / correction

If the wrong state was entered, update that same row to the verified intended state. Do not delete shop/profile/booking/customer data as part of access correction.

## Upgrade trigger

Replace this manual procedure with an authorized billing/admin workflow after one of these becomes true:
- manual updates become frequent enough to create operating errors;
- more than the first small cohort needs recurring status changes;
- online subscription billing is approved;
- support needs self-service renewal/payment recovery.

Until then, keep the close path simple and measurable.
