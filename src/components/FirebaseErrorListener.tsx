'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // This is a client-side-only module.
      // We throw the error here to make it visible in the Next.js development error overlay.
      // This provides a rich debugging experience for Firestore Security Rules.
      // NOTE: This should only be active in development environments.
      if (process.env.NODE_ENV === 'development') {
        console.error("Caught a Firestore permission error. Throwing for visibility in dev overlay.", error.context);
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.removeListener('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
