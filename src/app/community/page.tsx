'use client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { CommunityPost } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCommunityPosts } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function PostCard({ post }: { post: CommunityPost }) {
  const postedAtDate = post.createdAt ? new Date(post.createdAt) : new Date(post.postedAt || Date.now());
  const postedAt = formatDistanceToNow(postedAtDate, { addSuffix: true });
  
  const authorAvatar = post.author.avatarUrl || PlaceHolderImages.find(img => img.id === `avatar${post.id}`)?.imageUrl;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={authorAvatar} alt={post.author.name} />
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
  
  // Use placeholder data to prevent flickering and show a populated UI
  const posts = getCommunityPosts();

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in to post.',
      });
      return;
    }
    
    try {
      await addDoc(collection(firestore, 'community-posts'), {
         author: {
            name: user.displayName || 'Anonymous',
            avatarUrl: user.photoURL || '',
            uid: user.uid,
          },
          subject: newPost,
          options: ['Yes', 'No'], // Simplified for now
          aiRecommendation: 'N/A',
          aiJustification: 'N/A',
          createdAt: serverTimestamp(),
          commentCount: 0,
      });
      setNewPost('');
      toast({ title: 'Posted to community!' });
    } catch(error) {
       console.error("Error posting to community:", error);
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not post your decision. Please try again.',
      });
    }
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
        {posts.map(p => (
            <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
