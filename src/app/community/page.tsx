import { AppHeader } from '@/components/layout/app-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { getCommunityPosts } from '@/lib/placeholder-data';
import { PostCard } from '@/components/community/post-card';

export default async function CommunityPage() {
  const posts = getCommunityPosts();

  return (
    <SidebarInset>
      <AppHeader title="Community Decisions" />
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </SidebarInset>
  );
}
