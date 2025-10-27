
'use client';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Note: The Firebase config is exposed to the client.
// This is not a security risk, as it's used to initialize the client-side SDK.
// Security is handled by Firestore Security Rules and App Check.
import firebaseConfig from './config';
import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';

function initializeFirebase(config: FirebaseOptions = firebaseConfig) {
  if (getApps().length > 0) {
    return {
      firebaseApp: getApp(),
      firestore: getFirestore(),
      auth: getAuth(),
    };
  }

  const firebaseApp = initializeApp(config);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  // If you want to use the emulators, uncomment the following lines
  // if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  //   connectFirestoreEmulator(firestore, 'localhost', 8080);
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  // }
  
  return { firebaseApp, firestore, auth };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
