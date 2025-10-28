'use client';

import React, { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BarChart2, User, Plus } from 'lucide-react';
import { AppHeader } from './app-header';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

function BottomNav() {
  const pathname = usePathname();
  const items = [
    { id: '/', icon: <Home size={20} />, label: 'Home' },
    { id: '/community', icon: <MessageSquare size={20} />, label: 'Community' },
    { id: '/', icon: <Plus size={24} />, label: 'Ask', isCentral: true },
    { id: '/history', icon: <BarChart2 size={20} />, label: 'Tracker' },
    { id: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent z-40">
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-2 flex justify-around items-center ring-1 ring-black/5">
        {items.map((it, index) => {
           const isActive = pathname === it.id && !it.isCentral;
           if (it.isCentral) {
             return (
                <Link href={it.id} key={it.id} className="-mt-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#7B5CFF] text-white flex items-center justify-center shadow-lg">
                    <Plus size={28}/>
                  </div>
                </Link>
             )
           }
          return (
            <Link
              href={it.id}
              key={it.id}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-slate-400 hover:text-primary'
              )}
            >
              {it.icon}
              <div className={cn('text-[11px] font-medium', isActive ? 'text-primary' : 'text-slate-400')}>
                {it.label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto pt-2 pb-28">
        <AppHeader />
         <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 bg-transparent rounded-lg"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
