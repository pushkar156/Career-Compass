'use client';

import {useState, useEffect, type ReactNode} from 'react';
import {initializeApp, type FirebaseApp} from 'firebase/app';
import {getAuth, type Auth} from 'firebase/auth';
import {getFirestore, type Firestore} from 'firebase/firestore';

import {firebaseConfig} from '@/firebase/config';
import {FirebaseProvider, type FirebaseContextType} from '@/firebase/provider';

type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({children}: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setFirebase({
      app,
      auth,
      firestore,
    });
  }, []);

  if (!firebase) {
    // You can show a loading indicator here
    return <div>Loading Firebase...</div>;
  }

  return <FirebaseProvider {...firebase}>{children}</FirebaseProvider>;
}
