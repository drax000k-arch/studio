import { AppHeader } from '@/components/layout/app-header';
import { SidebarInset } from '@/components/ui/sidebar';
import DecisionMaker from '@/components/decision/decision-maker';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  return (
    <SidebarInset>
      <AppHeader title="Decision Maker" />
      <main className="p-4 lg:p-6">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <DecisionMaker />
        </Suspense>
      </main>
    </SidebarInset>
  );
}
