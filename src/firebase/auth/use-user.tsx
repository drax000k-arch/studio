'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase/provider';
import { doc, getDoc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore';
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
      // Defer setting loading to false to avoid flashes of logged-out state
      return;
    }
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, update state immediately for a responsive UI
        setUserState({ user, loading: false });
        
        // Ensure firestore is initialized before use
        const firestore = getFirestore(app);

        // Now, handle Firestore profile in the background
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
              createdAt: new Date().toISOString(),
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
                  // Log the error but don't disrupt the user's session
                  console.error("Failed to create user profile in Firestore:", permissionError);
              });
          }
        } catch (error) {
            console.error("Error fetching or creating user document:", error);
            // If there's an error (e.g., network, permissions), we still logged the user in.
            // The profile might not be synced, but the app is usable.
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
