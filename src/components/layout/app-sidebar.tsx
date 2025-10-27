'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Home, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

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
];

export function AppSidebar() {
  const pathname = usePathname();

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
          {menuItems.map((item) => (
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
    </Sidebar>
  );
}
