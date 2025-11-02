'use server';

import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // The service account is automatically available in the App Hosting environment.
  // No need to manage a private key file.
  const credential = admin.credential.applicationDefault();

  return admin.initializeApp({
    credential,
    // The databaseURL is not required for Firestore in recent Admin SDK versions
    // if it's the default database in the project.
  });
}

export async function saveDecisionToFirestore(userId: string, decisionData: any) {
  try {
    const app = initializeFirebaseAdmin();
    const firestore = admin.firestore(app);
    
    const decisionsCollection = firestore.collection('users').doc(userId).collection('decisions');
    
    await decisionsCollection.add({
      ...decisionData,
      createdAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Failed to save decision using Admin SDK:", error);
    // Re-throw or handle as needed, so the calling action knows about the failure.
    throw new Error("Failed to save the decision to the database.");
  }
}
