export type CapacityEquipment = "dry_van" | "reefer" | "flatbed" | "step_deck" | "hotshot" | "car_hauler" | "other";

export interface CapacityRecord {
  sourceId: string;
  sourceMessageId: string;
  sourceName: string;
  equipment: CapacityEquipment;
  origin: string;
  destination?: string;
  availabilityText?: string;
  team?: boolean;
  receivedAt: string;
  expiresAt: string;
}

export interface ParsedCapacityFeed {
  sourceName: string;
  sourceMessageId: string;
  receivedAt: string;
  records: CapacityRecord[];
}

const CITY_STATE = /\b([A-Za-z .'-]+),\s*([A-Z]{2})\b/g;

function normalizeEquipment(line: string, fallback: CapacityEquipment): CapacityEquipment {
  const upper = line.toUpperCase();
  if (upper.includes("REEFER")) return "reefer";
  if (upper.includes("FLATBED")) return "flatbed";
  if (upper.includes("STEP DECK")) return "step_deck";
  if (upper.includes("HOTSHOT")) return "hotshot";
  if (upper.includes("CAR HAUL") || upper.includes("AUTO TRANSPORT")) return "car_hauler";
  if (upper.includes("DRY VAN") || upper.includes('53"')) return "dry_van";
  return fallback;
}

function ttlHoursForAvailability(text: string): number {
  const upper = text.toUpperCase();
  if (upper.includes("READY NOW") || upper.includes("READY")) return 18;
  if (upper.includes("APPT") || upper.includes("AM") || upper.includes("PM")) return 24;
  return 24;
}

export function parseTruckAvailabilityEmail(input: {
  sourceId: string;
  sourceMessageId: string;
  sourceName: string;
  subject: string;
  body: string;
  receivedAt: string;
}): ParsedCapacityFeed {
  const received = new Date(input.receivedAt);
  const bodyLines = input.body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let defaultEquipment: CapacityEquipment = /REEFER/i.test(input.body) ? "reefer" : "dry_van";
  const records: CapacityRecord[] = [];

  for (const line of bodyLines) {
    if (/empty\s+53[”\"]?\s+dry\s+vans?/i.test(line)) {
      defaultEquipment = "dry_van";
      continue;
    }

    const matches = [...line.matchAll(CITY_STATE)];
    if (!matches.length) continue;

    const equipment = normalizeEquipment(line, defaultEquipment);
    const origin = `${matches[0][1].trim()}, ${matches[0][2]}`;
    const destination = matches[1] ? `${matches[1][1].trim()}, ${matches[1][2]}` : undefined;
    const availabilityText = line.split("-").slice(1).join("-").trim() || undefined;
    const ttlHours = ttlHoursForAvailability(availabilityText ?? line);
    const expires = new Date(received.getTime() + ttlHours * 60 * 60 * 1000);

    records.push({
      sourceId: input.sourceId,
      sourceMessageId: input.sourceMessageId,
      sourceName: input.sourceName,
      equipment,
      origin,
      destination,
      availabilityText,
      team: /\bTEAM\b/i.test(line),
      receivedAt: received.toISOString(),
      expiresAt: expires.toISOString(),
    });
  }

  return {
    sourceName: input.sourceName,
    sourceMessageId: input.sourceMessageId,
    receivedAt: received.toISOString(),
    records,
  };
}

export function toPublicCapacityRecord(record: CapacityRecord) {
  return {
    source: record.sourceName,
    equipment: record.equipment,
    origin: record.origin,
    destination: record.destination ?? null,
    availability: record.availabilityText ?? null,
    team: Boolean(record.team),
    receivedAt: record.receivedAt,
    expiresAt: record.expiresAt,
  };
}
