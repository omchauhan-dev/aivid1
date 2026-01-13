'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  FileVideo,
  Captions,
  Megaphone,
  PenSquare,
  Sparkles,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    href: '/viral-hooks',
    label: 'Viral Hooks',
    icon: Flame,
  },
  {
    href: '/reel-scripts',
    label: 'Reel Scripts',
    icon: FileVideo,
  },
  {
    href: '/captions-hashtags',
    label: 'Captions & Hashtags',
    icon: Captions,
  },
  {
    href: '/call-to-actions',
    label: 'Call to Actions',
    icon: Megaphone,
  },
  {
    href: '/rewrite-tool',
    label: 'Rewrite Tool',
    icon: PenSquare,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <SidebarTrigger>
              <Sparkles />
            </SidebarTrigger>
          </Button>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
             <Sparkles className="text-primary h-6 w-6" />
            <h1 className="text-lg font-bold font-headline">ReelGenius</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
