import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
};

export function initializeFirebaseAdmin() {
  if (getApps().length <= 0) {
    initializeApp(firebaseAdminConfig);
  }
  return getAuth();
}

export const adminAuth = initializeFirebaseAdmin();