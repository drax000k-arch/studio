'use client';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
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
import { Badge } from '@/components/ui/badge';

function ExpandableText({ text, maxLength = 100 }: { text: string; maxLength?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTooLong = text.length > maxLength;

  const displayText = isExpanded ? text : `${text.slice(0, maxLength)}${isTooLong ? '...' : ''}`;

  return (
    <>
      <p className="whitespace-pre-wrap">{displayText}</p>
      {isTooLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-primary text-xs font-semibold mt-1"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </>
  );
}


function PostCard({ post }: { post: CommunityPost }) {
  const firestore = useFirestore();
  const postedAtDate = post.createdAt ? new Date(post.createdAt) : new Date();
  const postedAt = formatDistanceToNow(postedAtDate, { addSuffix: true });
  const { user } = useUser();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);

  const totalVotes = Object.values(post.votes || {}).reduce((sum, count) => sum + count, 0);
  const userVote = user ? post.voters?.[user.uid] : null;
  
  const authorAvatar = post.author.avatarUrl;

  const handleVote = async (option: string) => {
    if (!user || !firestore) {
       toast({
        variant: 'destructive',
        title: 'Please log in to vote.',
      });
      return;
    }
    if (userVote) {
        toast({
            variant: 'destructive',
            title: 'Already Voted',
            description: `You have already voted for "${userVote}".`,
        });
        return;
    }
    
    const postRef = doc(firestore, 'community-posts', post.id);
    
    // Using dot notation for nested fields
    const newVotes = { ...post.votes, [option]: (post.votes[option] || 0) + 1 };
    const newVoters = { ...post.voters, [user.uid]: option };
    
    try {
        await updateDoc(postRef, {
            votes: newVotes,
            voters: newVoters,
        });
        toast({ title: "Vote cast successfully!"});
    } catch (error) {
        console.error("Error casting vote:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not cast your vote."});
    }
  }
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={authorAvatar ?? undefined} alt={post.author.name ?? 'User'} />
          <AvatarFallback>{post.author.name?.charAt(0) ?? 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm">{post.author.name}</div>
          <div className="text-xs text-slate-400">{postedAt}</div>
        </div>
      </div>

       <div className="text-md font-semibold text-slate-800">{post.subject}</div>

        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400">AI Recommendation</h4>
            <div className="text-sm text-slate-600">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mr-2">{post.aiRecommendation}</Badge>
                 <ExpandableText text={post.aiJustification} />
            </div>
        </div>

      <div className="space-y-2">
         <h4 className="text-xs font-semibold text-slate-400">Cast your vote</h4>
        {post.options.map((option, index) => {
           const voteCount = post.votes?.[option] || 0;
           const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
           return (
             <button key={index} onClick={() => handleVote(option)} 
                className="w-full px-3 py-2 text-sm text-left rounded-md bg-slate-100 hover:bg-slate-200 transition-colors relative disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={!!userVote}>
                <div className="flex justify-between items-center">
                  <span>{option}</span>
                   {userVote && <span className="font-bold">{percentage}%</span>}
                </div>
                 {userVote && (
                    <div className="absolute top-0 left-0 h-full rounded-md bg-primary/10" style={{ width: `${percentage}%` }}></div>
                )}
            </button>
           )
        })}
      </div>
       <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
         <div>{post.commentCount || 0} comments</div>
         <button className="hover:text-slate-800" onClick={() => setShowComments(!showComments)}>
           {showComments ? 'Hide Comments' : 'Comment'}
         </button>
      </div>

      {showComments && (
        <div className="border-t pt-4 mt-4">
            <p className="text-sm text-slate-500">Comments feature coming soon.</p>
        </div>
      )}
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
          aiJustification: 'This is a manually created post with a default AI justification.',
          createdAt: new Date().toISOString(),
          commentCount: 0,
          votes: { Yes: 0, No: 0 },
          voters: {},
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
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
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
