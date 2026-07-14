import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlantSummary } from '@/lib/plants-api';
import { parseWateringDays } from '@/lib/watering';

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

/** Build a SavedPlant from a catalog summary + (optional) watering text. */
export function toSavedPlant(plant: PlantSummary, wateringText?: string): SavedPlant {
  const now = Date.now();
  return {
    token: plant.token,
    commonName: plant.commonName,
    scientificName: plant.scientificName,
    imageUrl: plant.imageUrl,
    emoji: plant.emoji,
    tint: plant.tint,
    wateringSummary: shortenWatering(wateringText),
    wateringIntervalDays: parseWateringDays(wateringText),
    lastWateredAt: now,
    addedAt: now,
  };
}

export async function loadMyPlants(): Promise<SavedPlant[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPlant[]) : [];
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