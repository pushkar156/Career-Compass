'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    type Auth,
    onAuthStateChanged,
    type User,
    signOut as firebaseSignOut,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseProvider, type FirebaseContextType } from '@/firebase/provider';
import { AuthContext, type AuthContextType } from '@/hooks/use-auth'; // Import AuthContext

type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize Firebase App
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setFirebase({ app, auth, firestore });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  if (!firebase) {
    // You can show a loading indicator here
    return null;
  }

  const { auth } = firebase;
  const googleProvider = new GoogleAuthProvider();

  // Define auth methods
  const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    const currentUser = auth.currentUser;
    setUser(currentUser); // Manually update state
    return userCredential;
  };
  
  const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
  };

  const updateUserProfile = async (profile: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, profile);
      const currentUser = auth.currentUser;
      setUser(currentUser); // Manually update state
    }
  };

  const deleteAccount = async () => {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
      router.push('/');
    } else {
      throw new Error("No user is currently signed in.");
    }
  }

  const authContextValue: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    updateUserProfile,
    deleteAccount,
  };


  return (
    <FirebaseProvider {...firebase}>
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    </FirebaseProvider>
  );
}
