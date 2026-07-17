import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlantSummary } from '@/lib/plants-api';
import {
  DAY_MS,
  DEFAULT_FERTILIZE_DAYS,
  parseFertilizingDays,
  parseWateringDays,
} from '@/lib/watering';

const STORAGE_KEY = 'leafy.myplants.v3';

export type SavedPlant = {
  token: string;
  commonName: string;
  scientificName: string;
  imageUrl?: string;
  emoji: string;
  tint: string;
  /** Short watering label, e.g. "Every 1–2 weeks". */
  wateringSummary: string;
  /** Estimated days between waterings, used for reminders. */
  wateringIntervalDays: number;
  /** Timestamp of the last watering (starts at add time). */
  lastWateredAt: number;
  /** Scheduled local-notification id, so it can be cancelled/rescheduled. */
  notificationId?: string;
  /** Short feeding label, e.g. "Every 4–6 weeks in spring and summer". */
  fertilizingSummary: string;
  /** Estimated days between feedings (paused over winter). */
  fertilizingIntervalDays: number;
  /** Timestamp of the last feeding (starts at add time). */
  lastFertilizedAt: number;
  /** Scheduled fertilize-notification id. */
  fertilizingNotificationId?: string;
  /** Which site (room) the plant lives in; undefined = unassigned. */
  siteId?: string;
  addedAt: number;
};

/** Turn a long care sentence into a short chip label (keeps ranges like "1–2 weeks"). */
export function shortenWatering(text?: string): string {
  if (!text) return 'See care guide';
  const clause = text.split(/[,.;(]/)[0].trim();
  return clause || 'See care guide';
}

/** Build a SavedPlant from a catalog summary + (optional) care texts. */
export function toSavedPlant(
  plant: PlantSummary,
  wateringText?: string,
  fertilizingText?: string,
): SavedPlant {
  const now = Date.now();
  const wateringIntervalDays = parseWateringDays(wateringText);
  return {
    token: plant.token,
    commonName: plant.commonName,
    scientificName: plant.scientificName,
    imageUrl: plant.imageUrl,
    emoji: plant.emoji,
    tint: plant.tint,
    wateringSummary: shortenWatering(wateringText),
    wateringIntervalDays,
    // Back-date the last watering by one interval so the plant is due to be
    // watered on the day it's added; the cycle then repeats every interval.
    lastWateredAt: now - wateringIntervalDays * DAY_MS,
    fertilizingSummary: fertilizingText
      ? shortenWatering(fertilizingText)
      : 'Every 6 weeks in the growing season',
    fertilizingIntervalDays: parseFertilizingDays(fertilizingText),
    // Back-dated like watering, so the first feeding is due on the add day
    // and the cycle repeats every interval from there.
    lastFertilizedAt: now - parseFertilizingDays(fertilizingText) * DAY_MS,
    addedAt: now,
  };
}

export async function loadMyPlants(): Promise<SavedPlant[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as SavedPlant[]) : [];
    // Migrate plants saved before fertilizing existed.
    return stored.map((p) => {
      if (!p.fertilizingIntervalDays) {
        return {
          ...p,
          fertilizingSummary: 'Every 6 weeks in the growing season',
          fertilizingIntervalDays: DEFAULT_FERTILIZE_DAYS,
          lastFertilizedAt: p.addedAt - DEFAULT_FERTILIZE_DAYS * DAY_MS,
        };
      }
      // Never fed since being added (old scheme): back-date so the first
      // feeding is due immediately rather than one interval after adding.
      if (p.lastFertilizedAt === p.addedAt) {
        return { ...p, lastFertilizedAt: p.addedAt - p.fertilizingIntervalDays * DAY_MS };
      }
      return p;
    });
  } catch {
    return [];
  }
}

export async function persistMyPlants(plants: SavedPlant[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
  } catch {
    // Ignore write failures; state stays in memory for this session.
  }
}