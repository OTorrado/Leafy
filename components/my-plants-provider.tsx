import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loadMyPlants, persistMyPlants, type SavedPlant } from '@/lib/my-plants';
import { cancelWateringReminder, scheduleWateringReminder } from '@/lib/notifications';

type MyPlantsContextValue = {
  /** True until the stored plants have loaded from disk. */
  isLoading: boolean;
  plants: SavedPlant[];
  /** Add a plant (no-op if its token is already saved). */
  addPlant: (plant: SavedPlant) => void;
  removePlant: (token: string) => void;
  /** Mark a plant watered now and reschedule its reminder. */
  waterPlant: (token: string) => void;
  isSaved: (token: string) => boolean;
};

const MyPlantsContext = createContext<MyPlantsContextValue | null>(null);

export function MyPlantsProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [plants, setPlants] = useState<SavedPlant[]>([]);

  useEffect(() => {
    let active = true;
    loadMyPlants().then((stored) => {
      if (!active) return;
      setPlants(stored);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const addPlant = useCallback(async (plant: SavedPlant) => {
    const notificationId = await scheduleWateringReminder(plant);
    setPlants((prev) => {
      if (prev.some((p) => p.token === plant.token)) return prev;
      const next = [{ ...plant, notificationId }, ...prev];
      void persistMyPlants(next);
      return next;
    });
  }, []);

  const removePlant = useCallback((token: string) => {
    setPlants((prev) => {
      const target = prev.find((p) => p.token === token);
      void cancelWateringReminder(target?.notificationId);
      const next = prev.filter((p) => p.token !== token);
      void persistMyPlants(next);
      return next;
    });
  }, []);

  const waterPlant = useCallback(async (token: string) => {
    // Read current plant, reschedule outside setState, then commit.
    const current = await new Promise<SavedPlant | undefined>((resolve) => {
      setPlants((prev) => {
        resolve(prev.find((p) => p.token === token));
        return prev;
      });
    });
    if (!current) return;

    await cancelWateringReminder(current.notificationId);
    const watered: SavedPlant = { ...current, lastWateredAt: Date.now() };
    const notificationId = await scheduleWateringReminder(watered);

    setPlants((prev) => {
      const next = prev.map((p) =>
        p.token === token ? { ...watered, notificationId } : p,
      );
      void persistMyPlants(next);
      return next;
    });
  }, []);

  const isSaved = useCallback((token: string) => plants.some((p) => p.token === token), [plants]);

  const value = useMemo(
    () => ({ isLoading, plants, addPlant, removePlant, waterPlant, isSaved }),
    [isLoading, plants, addPlant, removePlant, waterPlant, isSaved],
  );

  return <MyPlantsContext.Provider value={value}>{children}</MyPlantsContext.Provider>;
}

export function useMyPlants() {
  const ctx = useContext(MyPlantsContext);
  if (!ctx) {
    throw new Error('useMyPlants must be used within a MyPlantsProvider');
  }
  return ctx;
}