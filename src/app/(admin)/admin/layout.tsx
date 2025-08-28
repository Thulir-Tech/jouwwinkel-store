
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
  useSidebar,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Package, Shapes, Home, ShoppingCart, Users, LineChart, Settings, Truck, Palette, ClipboardList, Gift } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from './auth-guard';
import { useAuth } from '@/hooks/use-auth';
import React from 'react';


export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, signOut } = useAuth();
  
  React.useEffect(() => {
    document.body.classList.add('admin-theme');

    return () => {
        document.body.classList.remove('admin-theme');
    }
  }, []);


  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  // Do not render the standard layout for the printable shipping slip page
  if (pathname.endsWith('/slip')) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
        <div className="flex min-h-screen w-full flex-col bg-background">
        <div className="flex flex-1">
        <Sidebar collapsible="icon">
            <SidebarHeader>
              <Button variant="ghost" className="h-10 w-full justify-center px-2" asChild>
                  <Link href="/admin" onClick={handleLinkClick}>
                    <Home />
                    <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                  </Link>
              </Button>
            </SidebarHeader>
            <SidebarContent>
            <SidebarMenu className="pl-2">
                <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/products"
                    isActive={isActive('/admin/products')}
                    asChild
                >
                    <Link href="/admin/products" onClick={handleLinkClick}>
                    <ClipboardList />
                    <span>Products</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/combos"
                    isActive={isActive('/admin/combos')}
                    asChild
                >
                    <Link href="/admin/combos" onClick={handleLinkClick}>
                    <Gift />
                    <span>Combos</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/inventory"
                    isActive={isActive('/admin/inventory')}
                    asChild
                >
                    <Link href="/admin/inventory" onClick={handleLinkClick}>
                    <Package />
                    <span>Inventory</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/categories"
                    isActive={isActive('/admin/categories')}
                    asChild
                >
                    <Link href="/admin/categories" onClick={handleLinkClick}>
                    <Shapes />
                    <span>Categories & Variants</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/orders"
                    isActive={isActive('/admin/orders')}
                    asChild
                >
                    <Link href="/admin/orders" onClick={handleLinkClick}>
                    <ShoppingCart />
                    <span>Orders</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/shipping-partners"
                    isActive={isActive('/admin/shipping-partners')}
                    asChild
                >
                    <Link href="/admin/shipping-partners" onClick={handleLinkClick}>
                    <Truck />
                    <span>Shipping Partners</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/customers"
                    isActive={isActive('/admin/customers')}
                    asChild
                >
                    <Link href="/admin/customers" onClick={handleLinkClick}>
                    <Users />
                    <span>Customers</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    href="/admin/analytics"
                    isActive={isActive('/admin/analytics')}
                    asChild
                >
                    <Link href="/admin/analytics" onClick={handleLinkClick}>
                    <LineChart />
                    <span>Analytics</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarSeparator />
                <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/ui-config"
                        isActive={isActive('/admin/ui-config')}
                        asChild
                    >
                        <Link href="/admin/ui-config" onClick={handleLinkClick}>
                            <Palette />
                            <span>UI Configuration</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/settings"
                        isActive={isActive('/admin/settings')}
                        asChild
                    >
                        <Link href="/admin/settings" onClick={handleLinkClick}>
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
            <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    {user && (
                        <Button variant="outline" size="sm" onClick={signOut}>Logout</Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href="/">
                        <Home className="mr-2" />
                        Go to Storefront
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
        </div>
        </div>
    </AuthGuard>
  );
}
