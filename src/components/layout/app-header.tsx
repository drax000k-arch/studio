'use client';
import { Search } from 'lucide-react';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export function AppHeader() {
  const { user } = useUser();

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-transparent">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4A6CF7] to-[#7B5CFF] flex items-center justify-center text-white font-bold text-2xl">A</div>
        <div>
          <div className="text-sm text-slate-500">Welcome back</div>
          <div className="font-semibold">{user?.displayName?.split(' ')[0] || 'User'}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
          <Search size={16} />
          <span className="text-sm text-slate-600 hidden md:inline">Ask for advice or explore</span>
        </button>
        <Link href="/profile">
          <Avatar className="h-10 w-10 border cursor-pointer">
            <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
            <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
}
