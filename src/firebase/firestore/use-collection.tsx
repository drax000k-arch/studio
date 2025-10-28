'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Query, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// Helper to create a stable query key
const createQueryKey = (query: Query): string => {
  if (query) {
    // @ts-ignore
    return query._query.canonicalId;
  }
  return '';
};
export function useCollection<T>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queryKey = useMemo(() => query ? createQueryKey(query as Query<DocumentData>) : '', [query]);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: (query as any)._query.path.toString(),
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err); // Still set local error for component-level handling if needed
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { data, loading, error };
}
