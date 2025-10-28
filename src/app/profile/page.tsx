'use client';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
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

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="font-semibold">12</div>
          <div className="text-xs text-slate-400">Advice Given</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="font-semibold">5</div>
          <div className="text-xs text-slate-400">Posts</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="font-semibold">87</div>
          <div className="text-xs text-slate-400">Helpful Votes</div>
        </div>
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
