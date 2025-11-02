'use client';

import React, { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BarChart2, User, Plus, Lock } from 'lucide-react';
import { AppHeader } from './app-header';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/firebase';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const items = [
    { id: '/', icon: <Home size={20} />, label: 'Home' },
    { id: '/community', icon: <MessageSquare size={20} />, label: 'Community', requiresAuth: true },
    { id: '/ask', icon: <Plus size={24} />, label: 'Ask', isCentral: true },
    { id: '/history', icon: <BarChart2 size={20} />, label: 'Tracker', requiresAuth: true },
    { id: '/profile', icon: <User size={20} />, label: 'Profile', requiresAuth: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent z-40">
      <TooltipProvider>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-2 flex justify-around items-center ring-1 ring-black/5">
          {items.map((it) => {
             const isActive = pathname === it.id && !it.isCentral;
             const isLocked = it.requiresAuth && !user;

             if (it.isCentral) {
               return (
                  <Link href={'/'} key={it.id} className="-mt-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#7B5CFF] text-white flex items-center justify-center shadow-lg">
                      <Plus size={28}/>
                    </div>
                  </Link>
               )
             }

             const navIcon = isLocked ? <Lock size={20} /> : it.icon;
             const navLabel = isLocked ? 'Locked' : it.label;
             const navPath = isLocked ? '/login' : it.id;
             const tooltipContent = isLocked ? 'Please log in to access' : it.label;

            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={navPath}
                    key={it.id}
                    className={cn(
                      'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                      isActive ? 'text-primary' : 'text-slate-400',
                      isLocked ? 'text-slate-300 cursor-not-allowed' : 'hover:text-primary',
                    )}
                  >
                    {navIcon}
                    <div className={cn('text-[11px] font-medium', isActive ? 'text-primary' : isLocked ? 'text-slate-300' : 'text-slate-400')}>
                      {navLabel}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noHeaderPaths = ['/login'];
  const showHeader = !noHeaderPaths.includes(pathname);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto pt-2 pb-28">
        {showHeader && <AppHeader />}
         <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn('bg-transparent rounded-lg', showHeader && 'mt-4' )}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
       {showHeader && <BottomNav />}
    </div>
  );
}
