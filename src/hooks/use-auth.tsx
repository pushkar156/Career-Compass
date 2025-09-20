
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut as firebaseSignOut, 
    type User, 
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
    return result;
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // Manually update user state to reflect display name
    const currentUser = getAuth(app).currentUser;
    setUser(currentUser);
    return userCredential;
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    return result;
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/login');
  };

  const updateUserProfile = async (profile: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, profile);
      // Manually update the user state to reflect changes immediately
      const currentUser = getAuth(app).currentUser;
      setUser(currentUser);
    }
  };

  const deleteAccount = async () => {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
      setUser(null);
      router.push('/');
    } else {
      throw new Error("No user is currently signed in.");
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut, updateUserProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
