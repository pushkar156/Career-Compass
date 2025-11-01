'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebaseFirestore } from '@/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CareerPathOutput } from '@/ai/flows/career-path-generator';

export interface HistoryItem {
  id: string;
  generatedCareer: string;
  roadmapDetails: CareerPathOutput;
  aiPrompt: string;
  timestamp: Date;
}

export function useHistory() {
  const { user } = useAuth();
  const firestore = useFirebaseFirestore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !firestore) {
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
    }, (err) => {
      console.error("Error fetching history:", err);
      setError('Failed to fetch history. Please check your connection and security rules.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const addHistoryItem = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (!user || !firestore) {
      throw new Error('User is not authenticated or Firestore is not available.');
    }
    const historyCollectionRef = collection(firestore, 'users', user.uid, 'history');
    await addDoc(historyCollectionRef, {
      ...item,
      timestamp: serverTimestamp(),
    });
  }, [user, firestore]);

  return { history, loading, error, addHistoryItem };
}
