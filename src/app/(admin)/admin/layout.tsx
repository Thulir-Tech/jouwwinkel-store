'use client';

import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Package, Settings, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Button variant="ghost" className="h-10 w-full justify-start px-2 text-lg font-bold" asChild>
            <Link href="/admin">Jouwwinkel</Link>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/admin/products"
                isActive={isActive('/admin/products')}
                asChild
              >
                <Link href="/admin/products">
                  <Package />
                  <span>Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/admin/settings"
                isActive={isActive('/admin/settings')}
                asChild
              >
                <Link href="/admin/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger />
          <div className="w-full flex-1">
            {/* Can add search here */}
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2" />
              Go to Storefront
            </Link>
          </Button>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </div>
  );
}
