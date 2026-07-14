import * as Notifications from 'expo-notifications';

import type { SavedPlant } from '@/lib/my-plants';
import { nextWaterAt } from '@/lib/watering';

/**
 * Controls how notifications appear while the app is foregrounded.
 * Called once at app startup.
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Requests notification permission if not already granted.
 * Returns true when the app is allowed to send notifications.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const request = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return (
    request.granted ||
    request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

/**
 * Schedule a one-time watering reminder for a plant at its next due date.
 * Returns the notification id (to cancel later), or undefined if not scheduled
 * (permission denied, or the plant is already due/overdue).
 */
export async function scheduleWateringReminder(plant: SavedPlant): Promise<string | undefined> {
  const permission = await Notifications.getPermissionsAsync();
  const allowed =
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!allowed) return undefined;

  const date = new Date(nextWaterAt(plant));
  if (date.getTime() <= Date.now()) return undefined; // already due; shown in-app instead

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to water 💧',
      body: `${plant.commonName} is ready for a drink.`,
      data: { token: plant.token },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

/** Cancel a previously scheduled reminder. */
export async function cancelWateringReminder(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already fired or removed; nothing to do.
  }
}
