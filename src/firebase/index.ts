'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // When in development, always use the local config.
  // In production, App Hosting's automatic initialization will take precedence.
  if (process.env.NODE_ENV === 'development') {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  
  // For production, try the automatic initialization first.
  let firebaseApp;
  try {
    firebaseApp = initializeApp();
  } catch (e) {
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
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './auth/use-user';