'use client';

import { useMessaging } from '@/firebase';
import { getToken } from 'firebase/messaging';

/**
 * Requests permission to receive push notifications and returns the device token.
 * @param vapidKey - The VAPID key for web push notifications.
 * @returns A promise that resolves with the device token.
 */
export async function requestNotificationPermission(vapidKey: string): Promise<string | null> {
  const messaging = useMessaging();
  try {
    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      // You might want to show a UI element to request permission here.
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
}
