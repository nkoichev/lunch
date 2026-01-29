import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register for push notifications and return the Expo push token
 */
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Нови поръчки',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'ad7dc7e4-12aa-4b7a-bc17-8bd0ea2e55e4',
  });

  return tokenData.data;
}

/**
 * Send push token to Apps Script for storage
 */
export async function sendTokenToServer(token) {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMemAOfK39uZKbRMWpCoJfSTGPtGM6Wup4VGXdqjzwmLb1Qy7eJEH2N4ro8jPFyVOekw/exec';

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
}
