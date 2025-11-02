'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // When in a development environment, we always want to use the explicit
  // config object to ensure we're connecting to the correct project.
  if (process.env.NODE_ENV === 'development') {
    if (getApps().length > 0) {
      return getSdks(getApp());
    }
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  
  // If an app is already initialized, return the existing instance's SDKs.
  if (getApps().length > 0) {
    return getSdks(getApp());
  }
  
  // For production environments (like App Hosting), Firebase should be
  // automatically initialized. We'll attempt that first.
  let firebaseApp;
  try {
    // This will succeed if the app is deployed to a Firebase environment
    // and the auto-initialization script is present.
    firebaseApp = initializeApp();
  } catch (e) {
    // If auto-init fails (e.g., running prod build locally), fall back to our config.
    console.warn('Automatic Firebase initialization failed, falling back to local config.', e);
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);
  const messaging = typeof window !== 'undefined' ? getMessaging(firebaseApp) : null;

  return {
    firebaseApp,
    auth,
    firestore,
    storage,
    messaging
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
export * from './auth/use-user';
