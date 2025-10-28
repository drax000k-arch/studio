'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { CommunityPost, Decision } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { ThumbUp, ThumbDown } from 'lucide-react';
import DecisionMaker from '@/components/decision/decision-maker';
import { useState } from 'react';
import { getCommunityPosts } from '@/lib/placeholder-data';


function CommunityOpinions() {
  const posts = getCommunityPosts().slice(0, 2);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Community Opinions</div>
        <div className="text-xs text-slate-400">Trending</div>
      </div>
      <div className="mt-3 space-y-2">
        {posts.map(post => (
          <div key={post.id} className="flex items-start gap-3">
            <Avatar className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <AvatarImage src={post.author.avatarUrl} />
              <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{post.subject}</div>
              <div className="text-xs text-slate-400">{post.commentCount || 0} comments</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function DecisionTracker() {
   const { user } = useUser();
   const firestore = useFirestore();
   const decisionsQuery = user && firestore ? query(collection(firestore, `users/${user.uid}/decisions`), orderBy('createdAt', 'desc'), limit(2)) : null;
   const { data: decisions, loading } = useCollection<Decision>(decisionsQuery);

  return (
     <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Decision Tracker</div>
        <div className="text-xs text-slate-400">Recent</div>
      </div>
      <div className="mt-3 space-y-3">
       {loading ? <>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted"/>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted"/>
       </> :
        decisions?.map(decision => (
          <div key={decision.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm">{decision.subject}</div>
              <div className="text-xs text-slate-400">AI: {decision.recommendation}</div>
            </div>
            <div className="text-sm font-semibold text-primary">Active</div>
          </div>
        ))}
        {decisions?.length === 0 && !loading && <p className="text-sm text-slate-400">No recent decisions.</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('advice');

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-4">
        <motion.button 
          initial={{ opacity: 0, y: 6 }} 
          animate={{ opacity: 1, y: 0 }} 
          onClick={() => setActiveTab('advice')}
          className="col-span-2 md:col-span-1 bg-gradient-to-r from-[#4A6CF7] to-[#7B5CFF] text-white rounded-xl p-4 shadow-md flex flex-col justify-between h-28 text-left"
        >
          <div className="text-sm opacity-90">AI Advice</div>
          <div className="text-lg font-semibold">Get instant guidance</div>
          <div className="mt-2 text-xs">Confidence meter, quick summary</div>
        </motion.button>
        <CommunityOpinions />
        <DecisionTracker />
      </div>

      {activeTab === 'advice' && (
        <DecisionMaker />
      )}

      <div className="space-y-2">
        <div className="font-semibold">Quick Topics</div>
        <div className="flex gap-3 flex-wrap">
          {['Career', 'Finance', 'Relationships', 'Health', 'Learning', 'Productivity'].map(t => (
            <button key={t} className="px-3 py-1 rounded-full border text-sm text-slate-600 bg-white shadow-sm">{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
