'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseClientContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] =
    useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    // initialize firebase on the client
    setFirebase(initializeFirebase());
  }, []);

  if (!firebase) {
    // show a loader or fallback while firebase is initializing
    return null; 
  }

  return (
    <FirebaseClientContext.Provider value={firebase}>
      <FirebaseProvider
        firebaseApp={firebase.firebaseApp}
        auth={firebase.auth}
        firestore={firebase.firestore}
      >
        {children}
      </FirebaseProvider>
    </FirebaseClientContext.Provider>
  );
}

export const useFirebaseClient = () => useContext(FirebaseClientContext);