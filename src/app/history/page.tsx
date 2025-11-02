'use client';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Decision } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AddDecisionDialog } from '@/components/decision/add-decision-dialog';
import { StatusSelector } from '@/components/decision/status-selector';

function DecisionCard({ decision }: { decision: Decision }) {
  const decisionDate = decision.createdAt ? new Date(decision.createdAt) : null;
  const formattedDate = decisionDate ? format(decisionDate, 'MMM d, yyyy') : 'just now';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{formattedDate}</span>
        <StatusSelector decision={decision} />
      </div>
      <div>
        <div className="font-medium text-slate-800">{decision.subject}</div>
        <div className="text-sm text-slate-500 mt-1">
          <span className="font-semibold text-primary">AI says:</span> {decision.recommendation}
        </div>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const decisionsCollection = useMemoFirebase(
    () =>
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
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">Decision Tracker</div>
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Decision
          </Button>
        </div>

        <div className="space-y-3">
          {decisionsLoading ? (
            <>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </>
          ) : decisions && decisions.length > 0 ? (
            decisions.map((decision) => <DecisionCard key={decision.id} decision={decision} />)
          ) : (
            <div className="text-center py-16">
              <h3 className="font-semibold">No decisions tracked yet.</h3>
              <p className="text-slate-500 text-sm mt-2">
                Use the "Add Decision" button to save your first one.
              </p>
            </div>
          )}
        </div>
      </div>
      <AddDecisionDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
}
