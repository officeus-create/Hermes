import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEEKDAY_INDEX = Object.freeze({
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
});

export const TERMINAL_NON_ZERO_STATUSES = Object.freeze([
  "UNKNOWN",
  "DEFERRED",
  "BLOCKED_AUTH",
  "FAILED",
  "NEEDS_REVIEW",
]);

function assertTimeZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.length === 0) {
    throw new TypeError("timeZone must be a non-empty IANA timezone string");
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date(0));
  } catch {
    throw new RangeError(`Unsupported IANA timezone: ${timeZone}`);
  }
}

function asDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError("now must be a valid Date or ISO timestamp");
  }
  return date;
}

function parseLocalTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) throw new TypeError(`Invalid local_time: ${value}`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    throw new RangeError(`Invalid local_time: ${value}`);
  }
  return { hour, minute, minuteOfDay: hour * 60 + minute };
}

export function getLocalClock(now, timeZone) {
  assertTimeZone(timeZone);
  const instant = asDate(now);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  const weekday = parts.weekday;

  if (!(weekday in WEEKDAY_INDEX)) {
    throw new Error(`Unable to resolve weekday for timezone ${timeZone}`);
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    weekday,
    weekdayIndex: WEEKDAY_INDEX[weekday],
    minuteOfDay: hour * 60 + minute,
    dateKey: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    timeZone,
  };
}

export function validateRegistry(registry) {
  if (!registry || registry.schema_version !== 1 || !Array.isArray(registry.jobs)) {
    throw new TypeError("Marketing automation registry must use schema_version 1 and contain jobs[]");
  }

  const seen = new Set();
  for (const job of registry.jobs) {
    if (!job?.id || seen.has(job.id)) {
      throw new Error(`Job IDs must be unique and non-empty: ${job?.id || "<missing>"}`);
    }
    seen.add(job.id);

    if (!job.capability || !job.permission_class || !job.schedule) {
      throw new Error(`Job ${job.id} is missing capability, permission_class, or schedule`);
    }

    if (!(job.permission_class in (registry.permission_classes || {}))) {
      throw new Error(`Job ${job.id} uses unknown permission_class ${job.permission_class}`);
    }

    parseLocalTime(job.schedule.local_time);
    if (!["daily", "weekly", "monthly"].includes(job.schedule.cadence)) {
      throw new Error(`Job ${job.id} uses unsupported cadence ${job.schedule.cadence}`);
    }

    if (job.schedule.cadence === "weekly") {
      if (!Array.isArray(job.schedule.days_of_week) || job.schedule.days_of_week.length === 0) {
        throw new Error(`Weekly job ${job.id} requires days_of_week`);
      }
      for (const day of job.schedule.days_of_week) {
        if (!(day in WEEKDAY_INDEX)) throw new Error(`Weekly job ${job.id} uses invalid weekday ${day}`);
      }
    }

    if (job.schedule.cadence === "monthly") {
      if (!Array.isArray(job.schedule.days_of_month) || job.schedule.days_of_month.length === 0) {
        throw new Error(`Monthly job ${job.id} requires days_of_month`);
      }
      for (const day of job.schedule.days_of_month) {
        if (!Number.isInteger(day) || day < 1 || day > 31) {
          throw new Error(`Monthly job ${job.id} uses invalid day_of_month ${day}`);
        }
      }
    }

    if (job.public_write && job.permission_class !== "LIVE_WRITE_GATED") {
      throw new Error(`Public-write job ${job.id} must use LIVE_WRITE_GATED`);
    }
  }

  return registry;
}

export function isJobDue(job, now, timeZone, pollWindowMinutes = 15) {
  if (!Number.isInteger(pollWindowMinutes) || pollWindowMinutes < 1 || pollWindowMinutes > 60) {
    throw new RangeError("pollWindowMinutes must be an integer from 1 to 60");
  }

  const local = getLocalClock(now, timeZone);
  const scheduled = parseLocalTime(job.schedule.local_time);
  const delta = local.minuteOfDay - scheduled.minuteOfDay;

  if (delta < 0 || delta >= pollWindowMinutes) return false;

  if (job.schedule.cadence === "daily") return true;
  if (job.schedule.cadence === "weekly") {
    return job.schedule.days_of_week.includes(local.weekday);
  }
  if (job.schedule.cadence === "monthly") {
    return job.schedule.days_of_month.includes(local.day);
  }

  return false;
}

export function createIdempotencyKey({ businessId, locationId, job, now, timeZone }) {
  if (!businessId || !locationId || !job?.id) {
    throw new TypeError("businessId, locationId, and job.id are required");
  }
  const local = getLocalClock(now, timeZone);
  const scheduled = parseLocalTime(job.schedule.local_time);
  const slot = `${String(scheduled.hour).padStart(2, "0")}${String(scheduled.minute).padStart(2, "0")}`;
  return [
    "marketing",
    String(businessId),
    String(locationId),
    job.id,
    local.dateKey,
    slot,
  ].join(":");
}

export function selectDueJobs({
  registry,
  businessId,
  locationId,
  timeZone,
  now = new Date(),
  pollWindowMinutes,
}) {
  validateRegistry(registry);
  assertTimeZone(timeZone);
  if (!businessId || !locationId) {
    throw new TypeError("businessId and locationId are required tenant scope");
  }

  const windowMinutes = pollWindowMinutes ?? registry.default_poll_window_minutes ?? 15;
  const local = getLocalClock(now, timeZone);

  return registry.jobs
    .filter((job) => isJobDue(job, now, timeZone, windowMinutes))
    .map((job) => ({
      job_id: job.id,
      capability: job.capability,
      permission_class: job.permission_class,
      consumes_budget: Boolean(job.consumes_budget),
      public_write: Boolean(job.public_write),
      provider_preferences: [...(job.provider_preferences || [])],
      scheduled_local_time: job.schedule.local_time,
      business_id: String(businessId),
      location_id: String(locationId),
      time_zone: timeZone,
      local_date: local.dateKey,
      idempotency_key: createIdempotencyKey({
        businessId,
        locationId,
        job,
        now,
        timeZone,
      }),
      done_condition: job.done_condition,
    }));
}

export function normalizeObservationStatus(status) {
  if (!status) return "UNKNOWN";
  const normalized = String(status).trim().toUpperCase();
  if (normalized === "0") {
    throw new Error("Numeric/string zero is not a valid evidence status. Use ZERO only when the source explicitly measured zero.");
  }
  return normalized;
}

export function loadRegistry(
  registryPath = path.join(process.cwd(), "config", "marketing-automation-capabilities.json"),
) {
  return validateRegistry(JSON.parse(fs.readFileSync(registryPath, "utf8")));
}

function readFlag(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] ?? null;
}

function runCli() {
  const args = process.argv.slice(2);
  const timeZone = readFlag(args, "--timezone");
  const businessId = readFlag(args, "--business");
  const locationId = readFlag(args, "--location");
  const now = readFlag(args, "--now") || new Date().toISOString();

  if (!timeZone || !businessId || !locationId) {
    process.stderr.write(
      "Usage: node scripts/marketing-automation-scheduler.mjs --timezone <IANA> --business <id> --location <id> [--now <ISO>]\n",
    );
    process.exitCode = 2;
    return;
  }

  const registry = loadRegistry();
  const due = selectDueJobs({
    registry,
    businessId,
    locationId,
    timeZone,
    now,
  });
  process.stdout.write(`${JSON.stringify({ now, timeZone, due }, null, 2)}\n`);
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) runCli();
