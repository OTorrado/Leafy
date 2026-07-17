import type { SavedPlant } from '@/lib/my-plants';

export const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_INTERVAL_DAYS = 7;

/**
 * Estimate a watering interval (in days) from a care sentence such as
 * "Every 1–2 weeks…" or "About once a week…". Falls back to a weekly cadence.
 */
export function parseWateringDays(text?: string): number {
  if (!text) return DEFAULT_INTERVAL_DAYS;
  const t = text.toLowerCase();

  const range = t.match(/(\d+)\s*[–-]\s*(\d+)/);
  const single = t.match(/(\d+)/);
  let amount: number;
  if (range) amount = (parseInt(range[1], 10) + parseInt(range[2], 10)) / 2;
  else if (single) amount = parseInt(single[1], 10);
  else amount = 1; // e.g. "once a week"

  let unit = 7; // default to weeks
  if (t.includes('month')) unit = 30;
  else if (t.includes('week')) unit = 7;
  else if (t.includes('day')) unit = 1;

  return Math.max(1, Math.round(amount * unit));
}

/** Timestamp (ms) when the plant is next due for watering. */
export function nextWaterAt(plant: SavedPlant): number {
  return plant.lastWateredAt + plant.wateringIntervalDays * DAY_MS;
}

/** Midnight (local) of the given timestamp. */
export function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** True when both timestamps fall on the same calendar day. */
export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

/** Whole calendar days from today until `timestamp` (negative = overdue). */
export function daysUntil(timestamp: number): number {
  return Math.round((startOfDay(timestamp) - startOfDay(Date.now())) / DAY_MS);
}

/**
 * The days this plant should be watered within a given month, projecting its
 * interval forward. Overdue plants roll to today, so nothing is scheduled in
 * the past. Returns midnight timestamps.
 */
export function wateringDaysInMonth(
  plant: SavedPlant,
  year: number,
  month: number,
): number[] {
  const interval = plant.wateringIntervalDays * DAY_MS;
  const today = startOfDay(Date.now());
  const base = Math.max(startOfDay(nextWaterAt(plant)), today);
  const monthStart = startOfDay(new Date(year, month, 1).getTime());
  const monthEnd = startOfDay(new Date(year, month + 1, 0).getTime());

  const days: number[] = [];
  let k = Math.max(0, Math.floor((monthStart - base) / interval));
  for (let guard = 0; guard < 400; guard++, k++) {
    const t = base + k * interval;
    if (t > monthEnd) break;
    if (t >= monthStart) days.push(t);
  }
  return days;
}

export type WateringTone = 'overdue' | 'today' | 'soon' | 'later';

export type WateringStatus = {
  label: string;
  tone: WateringTone;
  /** Whole days until due (negative when overdue). */
  days: number;
};

/** Human-readable watering status for a saved plant. */
export function wateringStatus(plant: SavedPlant): WateringStatus {
  const days = daysUntil(nextWaterAt(plant));
  if (days < 0) {
    const n = Math.abs(days);
    return { label: n === 1 ? 'Overdue by 1 day' : `Overdue by ${n} days`, tone: 'overdue', days };
  }
  if (days === 0) return { label: 'Water today', tone: 'today', days };
  if (days === 1) return { label: 'Water tomorrow', tone: 'soon', days };
  return { label: `Water in ${days} days`, tone: days <= 2 ? 'soon' : 'later', days };
}