import {initializeApp, getApps, getApp, type FirebaseApp} from 'firebase/app';
import {getAuth, type Auth} from 'firebase/auth';
import {getFirestore, type Firestore} from 'firebase/firestore';
import {firebaseConfig} from '@/firebase/config';

import {
  useFirebase,
  useFirebaseApp,
  useAuth as useFirebaseAuth,
  useFirestore as useFirebaseFirestore,
} from '@/firebase/provider';
import {useUser} from '@/firebase/auth/use-user';

function initializeFirebase() {
  if (getApps().length > 0) {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return {app, auth, firestore};
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return {app, auth, firestore};
}

export {
  initializeFirebase,
  useFirebase,
  useFirebaseApp,
  useFirebaseAuth,
  useFirebaseFirestore,
  useUser,
};
