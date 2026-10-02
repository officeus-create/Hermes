import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  filterHermesGridRows,
  nextHermesGridSort,
  paginateHermesGridRows,
  sortHermesGridRows,
} from "../src/lib/hermes-connect-data-grid";

type Row = { name: string; company: string; created_at: string; synthetic?: boolean };

const rows: Row[] = [
  { name: "Zulu", company: "Kittle's Garage", created_at: "2026-10-02T10:00:00Z" },
  { name: "Alpha", company: "North Star Auto", created_at: "2026-09-30T10:00:00Z" },
  { name: "Beta", company: "Kittle's Garage", created_at: "2026-10-01T10:00:00Z" },
];

test("shared Hermes Connect grid filters across multiple tokens", () => {
  const result = filterHermesGridRows(rows, "kittle beta", (row) => [row.name, row.company]);
  expect(result.map((row) => row.name)).toEqual(["Beta"]);
});

test("shared Hermes Connect grid keeps sort stable and supports dates", () => {
  const byName = sortHermesGridRows(rows, (row) => row.name, "asc");
  expect(byName.map((row) => row.name)).toEqual(["Alpha", "Beta", "Zulu"]);

  const newest = sortHermesGridRows(rows, (row) => row.created_at, "desc");
  expect(newest.map((row) => row.name)).toEqual(["Zulu", "Beta", "Alpha"]);
});

test("shared Hermes Connect grid bounds page size and page number", () => {
  const many = Array.from({ length: 513 }, (_, index) => ({ ...rows[index % rows.length], name: `Row ${index}` }));
  const result = paginateHermesGridRows(many, 999, 100);
  expect(result.pageCount).toBe(6);
  expect(result.page).toBe(6);
  expect(result.start).toBe(501);
  expect(result.end).toBe(513);
  expect(result.rows).toHaveLength(13);

  const bounded = paginateHermesGridRows(many, 1, 10_000);
  expect(bounded.pageSize).toBe(200);
  expect(bounded.rows).toHaveLength(200);
});

test("sort toggle changes direction only for the active column", () => {
  expect(nextHermesGridSort("created_at", "desc", "name")).toEqual({ key: "name", direction: "asc" });
  expect(nextHermesGridSort("name", "asc", "name")).toEqual({ key: "name", direction: "desc" });
});

test("owner registrations adopts the shared grid without weakening access boundary", async () => {
  const source = await readFile("src/pages/services/hermes-connect/internal/registrations/index.astro", "utf8");
  expect(source).toContain("filterHermesGridRows");
  expect(source).toContain("paginateHermesGridRows");
  expect(source).toContain("HERMES_INTERNAL_OWNER");
  expect(source).toContain('robots="noindex,nofollow"');
  expect(source).toContain('data-page-size');
  expect(source).toContain('data-sort="created_at"');
  expect(source).not.toContain("innerHTML");
});
