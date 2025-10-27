'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase/provider';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

type UserState = {
  user: User | null;
  loading: boolean;
};

// This hook is adapted from https://github.com/firebase/firebase-js-sdk/issues/2873#issuecomment-1102989737
export function useUser() {
  const [userState, setUserState] = useState<UserState>({ user: null, loading: true });
  const app = useFirebaseApp();

  useEffect(() => {
    if (app === null) {
      return;
    }
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // If the user document doesn't exist, create it.
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        }

        setUserState({ user, loading: false });
      } else {
        // User is signed out
        setUserState({ user: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, [app]);

  return userState;
}
