const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const toMinutes = (value) => {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
};
const fromMinutes = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

export function normalizeRepairShopCapacity(value) {
  const capacity = Number(value);
  return Number.isInteger(capacity) ? Math.max(1, Math.min(capacity, 10)) : 1;
}

export function saturatedRepairShopIntervals(rows, capacityInput) {
  const capacity = normalizeRepairShopCapacity(capacityInput);
  const events = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const start = String(row?.start_time ?? "");
    const end = String(row?.end_time ?? "");
    if (!TIME_RE.test(start) || !TIME_RE.test(end)) continue;
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);
    if (endMinutes <= startMinutes) continue;
    const startEvent = events.get(startMinutes) || { starts: 0, ends: 0 };
    startEvent.starts += 1;
    events.set(startMinutes, startEvent);
    const endEvent = events.get(endMinutes) || { starts: 0, ends: 0 };
    endEvent.ends += 1;
    events.set(endMinutes, endEvent);
  }

  const points = [...events.keys()].sort((a, b) => a - b);
  const saturated = [];
  let active = 0;
  let previous = null;
  for (const point of points) {
    if (previous !== null && point > previous && active >= capacity) {
      const last = saturated[saturated.length - 1];
      if (last && last.end === previous) last.end = point;
      else saturated.push({ start: previous, end: point });
    }
    const event = events.get(point);
    active -= Number(event?.ends || 0);
    active += Number(event?.starts || 0);
    previous = point;
  }

  return saturated.map((interval) => ({
    start_time: fromMinutes(interval.start),
    end_time: fromMinutes(interval.end),
  }));
}
