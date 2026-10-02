export type HermesGridSortDirection = "asc" | "desc";

export type HermesGridPage<Row> = {
  rows: Row[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
};

const text = (value: unknown) => String(value ?? "").trim().toLowerCase();

export function normalizeHermesGridQuery(value: unknown) {
  return text(value).replace(/\s+/g, " ");
}

export function filterHermesGridRows<Row>(
  rows: readonly Row[],
  query: unknown,
  values: (row: Row) => readonly unknown[],
) {
  const term = normalizeHermesGridQuery(query);
  if (!term) return [...rows];

  const tokens = term.split(" ").filter(Boolean);
  return rows.filter((row) => {
    const haystack = values(row).map(text).join(" ");
    return tokens.every((token) => haystack.includes(token));
  });
}

function compareValues(left: unknown, right: unknown) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (typeof left === "number" && typeof right === "number") return left - right;
  if (typeof left === "boolean" && typeof right === "boolean") return Number(left) - Number(right);

  const isoDate = /^\d{4}-\d{2}-\d{2}(?:[T ][0-9:.+-]+Z?)?$/;
  const leftDate = typeof left === "string" && isoDate.test(left) ? Date.parse(left) : Number.NaN;
  const rightDate = typeof right === "string" && isoDate.test(right) ? Date.parse(right) : Number.NaN;
  if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) return leftDate - rightDate;

  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
}

export function sortHermesGridRows<Row>(
  rows: readonly Row[],
  value: (row: Row) => unknown,
  direction: HermesGridSortDirection,
) {
  const multiplier = direction === "desc" ? -1 : 1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const compared = compareValues(value(a.row), value(b.row));
      return compared === 0 ? a.index - b.index : compared * multiplier;
    })
    .map(({ row }) => row);
}

export function paginateHermesGridRows<Row>(
  rows: readonly Row[],
  requestedPage: number,
  requestedPageSize: number,
): HermesGridPage<Row> {
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(200, Math.max(10, Math.trunc(requestedPageSize)))
    : 50;
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Number.isFinite(requestedPage)
    ? Math.min(pageCount, Math.max(1, Math.trunc(requestedPage)))
    : 1;
  const startIndex = (page - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);

  return {
    rows: pageRows,
    page,
    pageSize,
    pageCount,
    total,
    start: total === 0 ? 0 : startIndex + 1,
    end: Math.min(total, startIndex + pageRows.length),
  };
}

export function nextHermesGridSort(
  currentKey: string,
  currentDirection: HermesGridSortDirection,
  requestedKey: string,
) {
  if (currentKey !== requestedKey) return { key: requestedKey, direction: "asc" as const };
  return { key: requestedKey, direction: currentDirection === "asc" ? "desc" as const : "asc" as const };
}
