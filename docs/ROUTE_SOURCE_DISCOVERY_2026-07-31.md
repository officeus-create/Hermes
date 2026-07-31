# Historical Route Source Discovery — 2026-07-31

## Purpose

Resolve task 23 of Issue #18 without inventing carrier lanes, search demand, or ranking opportunities.

## Sources checked

### GitHub

- Open PR #19 and its growth documentation.
- Open technical SEO PR #13 for file overlap and route-page work.
- Repository code search and current branch documentation.

No complete historical `origin → destination` carrier movement export was found in the repository.

### ChatGPT File Library

Searches covered:

- historical carrier routes;
- origin/destination lane exports;
- car-hauling movements;
- route and load-history terminology.

Results contained carrier agreements, carrier lead databases, training materials, website handoff documents, and one anonymized inbound transportation-request example. None contained a complete historical movement table suitable for lane-frequency analysis.

### Connected Google Drive

Drive searches covered:

- `carrier routes`;
- `load history`;
- `pickup delivery`.

Candidate spreadsheets inspected included:

- `HL40_BACKUP_2026-07-23_13-21`;
- Hermes carrier-database templates and backups;
- HL 40 sales-team database backups.

The inspected `HL40_BACKUP_2026-07-23_13-21` workbook is a carrier-lead and CRM-management database. Its visible `BASE` headers include company, MC, DOT, city, state, phone, contact, equipment, status, notes, normalized identifiers, CRM match, sync decision, and data-quality fields. It does **not** contain pickup origin, delivery destination, movement date, or completed-load history fields.

## Explicit exclusions

The following must not be used as historical lane evidence:

1. carrier home city/state;
2. preferred lanes stated in a lead note without completed movement evidence;
3. a customer inquiry that was not proven completed;
4. example routes written in a content brief;
5. website location pages;
6. carrier sales databases;
7. broker or load-board demo data;
8. private addresses, VINs, phone numbers, customer names, or carrier credentials.

A documented inbound request involving pickup near JFK Airport and delivery to Wilmington, North Carolina is useful as demand-intake evidence only. It is not proof of a completed Hermes carrier movement and must not be counted in historical lane frequency.

## Minimum acceptable source for task 23

A source is acceptable only when it contains, directly or through a documented join:

- origin city/state or ZIP;
- destination city/state or ZIP;
- pickup, delivery, booking, or movement date;
- evidence that the movement was booked or completed;
- equipment type or capacity when known;
- stable internal row/load identifier;
- source workbook/file and tab name;
- review status.

Carrier and customer identifiers must remain private and be removed from any public derivative.

## Validation sequence after a valid source is found

1. Copy the source into a read-only analysis dataset.
2. Remove personal and customer-identifying fields.
3. Normalize state, city, ZIP, dates, and equipment.
4. Reject rows missing either endpoint.
5. Separate booked, completed, cancelled, demo, and inquiry-only records.
6. Deduplicate repeated records by source ID and movement fingerprint.
7. Aggregate directional and reverse-direction frequency.
8. Flag deadhead/backhaul hypotheses as hypotheses until operationally reviewed.
9. Validate current search demand and competition separately.
10. Apply the 7/10 publication gate.
11. Publish no location or lane page without unique operational value and internal approval.

## Result

Task 23 remains blocked, but the source-discovery step is complete and reproducible. No route shortlist was created because the connected sources do not yet contain a qualifying historical movement export.
