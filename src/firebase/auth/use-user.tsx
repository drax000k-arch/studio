'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase/provider';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
      setUserState({ user: null, loading: false });
      return;
    }
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userRef = doc(firestore, 'users', user.uid);
        
        try {
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            // If the user document doesn't exist, create it.
            const profileData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            };
            // Use setDoc with a .catch block for robust error handling
            setDoc(userRef, profileData)
              .catch(async (serverError) => {
                  const permissionError = new FirestorePermissionError({
                      path: userRef.path,
                      operation: 'create',
                      requestResourceData: profileData
                  });
                  errorEmitter.emit('permission-error', permissionError);
                  // Even if creating the profile fails, the user is still logged in.
                  // We can proceed to set the user state.
              });
          }
          setUserState({ user, loading: false });
        } catch (error) {
            console.error("Error fetching user document:", error);
            // If there's an error (e.g., network, permissions), we still set the user,
            // but the profile might not be fully synced.
            setUserState({ user, loading: false });
        }
      } else {
        // User is signed out
        setUserState({ user: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, [app]);

  return userState;
}
