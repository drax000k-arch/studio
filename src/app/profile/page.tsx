'use client';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Decision, CommunityPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ label, value, isLoading }: { label: string; value: number | undefined; isLoading: boolean }) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
      {isLoading ? (
        <Skeleton className="h-6 w-8 mx-auto" />
      ) : (
        <div className="font-semibold">{value ?? 0}</div>
      )}
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const decisionsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'users', user.uid, 'decisions')) : null),
    [user, firestore]
  );
  const { data: decisions, isLoading: decisionsLoading } = useCollection<Decision>(decisionsQuery);

  const postsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'community-posts'), where('author.uid', '==', user.uid)) : null),
    [user, firestore]
  );
  const { data: posts, isLoading: postsLoading } = useCollection<CommunityPost>(postsQuery);
  

  if (userLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20 rounded-2xl text-2xl">
          <AvatarImage src={user.photoURL ?? ''} />
          <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-lg">{user.displayName}</div>
          <div className="text-sm text-slate-500">Member since 2024</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Decisions Tracked" value={decisions?.length} isLoading={decisionsLoading} />
        <StatCard label="Posts" value={posts?.length} isLoading={postsLoading} />
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm space-y-1">
        <Button variant="ghost" className="w-full justify-start">Saved Advice</Button>
        <Button variant="ghost" className="w-full justify-start">Notifications</Button>
        <Button variant="ghost" className="w-full justify-start">Settings</Button>
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={() => signOut(auth)}>
          Logout
        </Button>
      </div>
    </div>
  );
}
