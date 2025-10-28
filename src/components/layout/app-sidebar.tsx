'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Home, LogIn, LogOut, Users, History } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { getAuth, signOut } from 'firebase/auth';

const menuItems = [
  {
    href: '/',
    label: 'Decision Maker',
    icon: Home,
  },
  {
    href: '/community',
    label: 'Community',
    icon: Users,
  },
   {
    href: '/history',
    label: 'History',
    icon: History,
    requiresAuth: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = getAuth();

  const displayedMenuItems = menuItems.filter(item => !item.requiresAuth || user);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="size-6 text-primary" />
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              'group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0'
            )}
          >
            <h2 className="font-semibold text-lg">Advisify AI</h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {displayedMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                as={Link}
                href={item.href}
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        {user ? (
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              <p className="text-sm font-semibold truncate">{user.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden"
                onClick={() => signOut(auth)}
                title="Log out"
              >
                <LogOut />
              </Button>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as={Link} href="/login" tooltip="Log In">
                <LogIn />
                <span>Log In</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
