'use client';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { PostCard } from '@/components/community/post-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { CommunityPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
  const firestore = useFirestore();
  const postsCollection = firestore ? query(collection(firestore, 'community-posts'), orderBy('createdAt', 'desc')) : null;
  const { data: posts, loading } = useCollection<CommunityPost>(postsCollection as any);

  return (
    <SidebarInset>
      <AppHeader title="Community Decisions" />
      <main className="flex-1 p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </SidebarInset>
  );
}
