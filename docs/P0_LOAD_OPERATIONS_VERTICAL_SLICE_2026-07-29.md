# P0 Load Operations — Safe Vertical Slice

Date: 2026-07-29

## Implemented

- Manual CSV adapters for synthetic shipment history and offers.
- Normalized offers with separate posted, negotiated, and booked rates.
- Canonical opportunity grouping that retains every source record.
- Freshness and expiry; expired opportunities are excluded from active role feeds.
- Transparent gross, loaded RPM, total-mile RPM, total miles, deadhead miles, and deadhead percentage.
- Closed-data read models for dispatcher and carrier roles.
- Carrier read model hides raw source records and negotiated/booked rates.
- Manual booking handoff only; it performs no booking, message, negotiation, or external write.
- Public route export is hard-disabled and returns no records.
- CSV adapter rejects common PII and carrier/customer identity columns.
- Import preview accepts only the exact safe offer schema with synthetic `SYN-*`/`MOCK-*` or sanitized `CLEAN-*` identifiers and Mock/Synthetic/Cleaned source labels.
- Import preview reports accepted, duplicate candidates, expired, rejected, and needs-review counts without writing anywhere.
- Quarantine retains only CSV row numbers, outcome categories, and non-PII reason codes; it does not retain raw rejected rows.
- Invalid schemas, forbidden columns, and non-synthetic identifiers stop before row classification.
- `completed`, `verified`, and `published` require confirmed delivery, BOL/POD or manual operational confirmation, and cancellation/claims review. A paid flag is not accepted as completion evidence.

## Not implemented or claimed

- No real load board, Carrier Master Sheet, CRM, TMS, or historical file is connected.
- The `OFFICE 374 2026` workbook is not connected and no row, company, person, contact, MC, order, invoice, BOL/POD reference, address, rate, commission, or comment from it is copied.
- No real carrier, customer, broker, route, rate, contact, authority, VIN, or address data is used.
- No scraping, automated booking, messaging, negotiation, ranking, or public route publication exists.
- `completed` and `verified` remain internal. Only a later privacy-reviewed `published` state could be considered for SEO, and public export is still disabled.
- No public page or static bundle exposes the synthetic operational feed.

## Exact real-data blocker

The exact approved Carrier Master Sheet, CRM/TMS endpoint, or historical file has not been identified with:

1. a named source owner;
2. confirmed read rights and provider terms;
3. an approved field list without prohibited PII;
4. update time and TTL;
5. recovery and source-removal rules;
6. authority/equipment verification ownership.

Until those items are approved, the module must remain synthetic and local.

## Audit sources

- `/Users/progressopro/Documents/Отдел маркетинга/ОПЕРАЦИОННЫЕ_МАРШРУТЫ_КАК_ИСТОЧНИК_SEO_2026-07-29.md`
- https://drive.google.com/file/d/1QApJ3RmInXjDItr9i4azBqHIGzGZvKb9/view
- https://docs.google.com/document/d/1lpVqsS81CR6aLroUhCYuHExLcnaQ9_oDxpWOknTt04o/edit
