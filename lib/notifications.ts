import * as Notifications from 'expo-notifications';

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
