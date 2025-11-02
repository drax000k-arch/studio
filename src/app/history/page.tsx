'use client';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Decision } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function TrackerItem({ decision }: { decision: Decision }) {
  const decisionDate = decision.createdAt ? new Date(decision.createdAt) : null;
  const timeAgo = decisionDate ? formatDistanceToNow(decisionDate, { addSuffix: true }) : 'just now';

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
      <div>
        <div className="font-medium">{decision.subject}</div>
        <div className="text-xs text-slate-400">AI: {decision.recommendation} • {timeAgo}</div>
      </div>
      <div className="text-sm font-semibold text-primary">Active</div>
    </div>
  );
}

export default function TrackerPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const decisionsCollection = useMemoFirebase(() => 
    user && firestore
      ? query(collection(firestore, 'users', user.uid, 'decisions'), orderBy('createdAt', 'desc'))
      : null,
    [user, firestore]
  );

  const { data: decisions, isLoading: decisionsLoading } = useCollection<Decision>(decisionsCollection);

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="font-semibold text-lg">Decision Tracker</div>
      <div className="space-y-3">
        {decisionsLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : decisions && decisions.length > 0 ? (
          decisions.map((decision) => (
            <TrackerItem key={decision.id} decision={decision} />
          ))
        ) : (
           <div className="text-center py-16">
            <h3 className="font-semibold">No decisions tracked yet.</h3>
            <p className="text-slate-500 text-sm mt-2">Your past decisions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
