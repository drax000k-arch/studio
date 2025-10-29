'use client';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { CommunityPost } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

function PostCard({ post }: { post: CommunityPost }) {
  // Ensure createdAt is a valid date, defaulting to now if it's not.
  const postedAtDate = post.createdAt ? new Date(post.createdAt) : new Date();
  const postedAt = formatDistanceToNow(postedAtDate, { addSuffix: true });
  
  const authorAvatar = post.author.avatarUrl;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={authorAvatar ?? undefined} alt={post.author.name ?? 'User'} />
            <AvatarFallback>{post.author.name?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{post.author.name}</div>
            <div className="text-xs text-slate-400">{postedAt}</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">{post.commentCount || 0} comments</div>
      </div>
       <div className="mt-3 text-sm font-medium text-slate-800">{post.subject}</div>
      <div className="mt-3 flex items-center gap-3">
        {post.options.map((option, index) => (
           <button key={index} className="px-3 py-1 text-sm rounded-md bg-slate-100 hover:bg-slate-200">{option}</button>
        ))}
        <button className="ml-auto text-sm text-slate-500 hover:text-slate-800">Comment</button>
      </div>
    </div>
  );
}


export default function CommunityPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [newPost, setNewPost] = useState('');
  
  const postsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'community-posts'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: posts, isLoading } = useCollection<CommunityPost>(postsQuery);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in to post.',
      });
      return;
    }
    
    const postsCollection = collection(firestore, 'community-posts');
    const postData = {
         author: {
            name: user.displayName || 'Anonymous',
            avatarUrl: user.photoURL || '',
            uid: user.uid,
          },
          subject: newPost,
          options: ['Yes', 'No'], // Simplified for now
          aiRecommendation: 'N/A',
          aiJustification: 'N/A',
          createdAt: new Date().toISOString(), // Use ISO string for server timestamp
          commentCount: 0,
      };
      
      addDocumentNonBlocking(postsCollection, postData);
      setNewPost('');
      toast({ title: 'Posted to community!' });
  };


  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Input 
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your decision or question..." 
          className="flex-1 rounded-lg p-3 bg-white shadow-sm" 
        />
        <Button onClick={handlePost} className="bg-primary text-white px-4 py-2 rounded-lg h-auto">Post</Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : posts && posts.length > 0 ? (
          posts.map(p => (
            <PostCard key={p.id} post={p} />
          ))
        ) : (
          <div className="text-center py-16">
            <h3 className="font-semibold">No community posts yet.</h3>
            <p className="text-slate-500 text-sm mt-2">Be the first to share a decision!</p>
          </div>
        )}
      </div>
    </div>
  );
}
