'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebaseFirestore } from '@/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CareerPathOutput } from '@/ai/flows/career-path-generator';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export interface HistoryItem {
  id: string;
  generatedCareer: string;
  roadmapDetails: CareerPathOutput;
  aiPrompt: string;
  timestamp: Date;
}

export type HistoryItemForSaving = Omit<HistoryItem, 'id' | 'timestamp'>;


export function useHistory() {
  const { user } = useAuth();
  const firestore = useFirebaseFirestore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !firestore) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const historyCollectionRef = collection(firestore, 'users', user.uid, 'history');
    const q = query(historyCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData: HistoryItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      } as HistoryItem));
      setHistory(historyData);
      setLoading(false);
      setError(null);
    }, (err) => {
      const permissionError = new FirestorePermissionError({
          path: historyCollectionRef.path,
          operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError('Failed to fetch history. Check security rules.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const addHistoryItem = useCallback(async (item: HistoryItemForSaving) => {
    if (!user || !firestore) {
      throw new Error('User is not authenticated or Firestore is not available.');
    }
    const historyCollectionRef = collection(firestore, 'users', user.uid, 'history');
    
    // Do not await. Chain a .catch() to handle permission errors.
    addDoc(historyCollectionRef, {
      ...item,
      timestamp: serverTimestamp(),
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: historyCollectionRef.path,
            operation: 'create',
            requestResourceData: item,
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [user, firestore]);

  return { history, loading, error, addHistoryItem };
}
