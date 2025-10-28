'use client';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Decision } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

function DecisionHistoryCard({ decision }: { decision: Decision }) {
  const decisionDate = decision.createdAt ? new Date(decision.createdAt) : null;
  const postedAt = decisionDate ? formatDistanceToNow(decisionDate, { addSuffix: true }) : 'just now';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{decision.subject}</CardTitle>
        <CardDescription>{postedAt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Options Considered</h4>
          <ul className="space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
            {decision.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
         <div>
           <h4 className="text-sm font-semibold mb-2">AI Recommendation</h4>
           <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">{decision.recommendation}</Badge>
           <p className="text-sm text-muted-foreground mt-2">{decision.justification}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const decisionsCollection = user && firestore
    ? query(collection(firestore, 'users', user.uid, 'decisions'), orderBy('createdAt', 'desc'))
    : null;

  const { data: decisions, loading: decisionsLoading } = useCollection<Decision>(decisionsCollection);
  
  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarInset>
      <AppHeader title="My Decision History" />
      <main className="flex-1 p-4 sm:p-6">
        {decisionsLoading ? (
           <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
             <Skeleton className="h-64 w-full" />
             <Skeleton className="h-64 w-full" />
             <Skeleton className="h-64 w-full" />
           </div>
        ) : decisions && decisions.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {decisions.map((decision) => (
              <DecisionHistoryCard key={decision.id} decision={decision} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold">No history yet</h2>
              <p className="text-muted-foreground mt-2">Your past decisions will appear here.</p>
            </div>
          </div>
        )}
      </main>
    </SidebarInset>
  );
}
