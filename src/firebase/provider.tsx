'use client';
import {createContext, useContext, ReactNode} from 'react';
import type {FirebaseApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';

export type FirebaseContextType = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

type FirebaseProviderProps = {
  children: ReactNode;
} & FirebaseContextType;

export function FirebaseProvider({
  children,
  ...value
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}
export function useAuth() {
  return useFirebase().auth;
}
export function useFirestore() {
  return useFirebase().firestore;
}
