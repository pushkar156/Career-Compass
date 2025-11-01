'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { type User } from 'firebase/auth';

// Define the shape of the context value
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

// Create the context with an undefined initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This provider is no longer used directly. All logic has been moved to FirebaseClientProvider.
// This file now only defines the context and the useAuth hook.
export function AuthProvider({ children }: { children: ReactNode }) {
    // This is a placeholder and should not be used. The real provider is FirebaseClientProvider.
    console.error("AuthProvider is deprecated. Use FirebaseClientProvider at the root.");
    return <>{children}</>;
}


// The custom hook to consume the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseClientProvider');
  }
  return context;
}
