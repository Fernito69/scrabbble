import { useState, useEffect } from 'react';
import { DocumentData, QueryConstraint } from 'firebase/firestore';
import { firestoreService } from '@/services/firestore';

export function useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await firestoreService.getCollection<T>(
          collectionName,
          ...queryConstraints
        );
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, ...queryConstraints]);

  return { data, loading, error };
}

export function useFirestoreDocument<T = DocumentData>(
  collectionName: string,
  documentId: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await firestoreService.getDocument<T>(
          collectionName,
          documentId
        );
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, documentId]);

  return { data, loading, error };
}
