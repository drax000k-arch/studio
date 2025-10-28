'use client';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { CommunityPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

function PostCard({ post }: { post: CommunityPost }) {
  const postedAt = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'just now';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
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

  const postsCollection = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'community-posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  
  const { data: posts, loading } = useCollection<CommunityPost>(postsCollection);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in to post.',
      });
      return;
    }
    
    // A bit of a simplification: we'll create a dummy post from the text.
    // A real app would have a more structured input.
    await addDoc(collection(firestore, 'community-posts'), {
       author: {
          name: user.displayName,
          avatarUrl: user.photoURL,
          uid: user.uid,
        },
        subject: newPost,
        options: ['Yes', 'No'],
        aiRecommendation: 'N/A',
        aiJustification: 'N/A',
        createdAt: serverTimestamp(),
        commentCount: 0,
    });
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
        {loading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : (
          posts?.map(p => (
            <PostCard key={p.id} post={p} />
          ))
        )}
      </div>
    </div>
  );
}
