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
import { Package, Shapes, Home, ShoppingCart, Users, Settings, Truck, Palette, ClipboardList, Gift, Ticket, Star, Code, Megaphone, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from './auth-guard';
import { useAuth } from '@/hooks/use-auth';
import React from 'react';


export function AdminLayoutClient({
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
                        href="/admin/orders"
                        isActive={isActive('/admin/orders')}
                        tooltip="Orders"
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
                        href="/admin/reviews"
                        isActive={isActive('/admin/reviews')}
                        tooltip="Reviews"
                        asChild
                    >
                        <Link href="/admin/reviews" onClick={handleLinkClick}>
                        <Star />
                        <span>Reviews</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/customers"
                        isActive={isActive('/admin/customers')}
                        tooltip="Customers"
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
                        href="/admin/inquiries"
                        isActive={isActive('/admin/inquiries')}
                        tooltip="Inquiries"
                        asChild
                    >
                        <Link href="/admin/inquiries" onClick={handleLinkClick}>
                        <Phone />
                        <span>Inquiries</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarSeparator />
                <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/products"
                        isActive={isActive('/admin/products')}
                        tooltip="Products"
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
                        tooltip="Combos"
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
                        tooltip="Inventory"
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
                        tooltip="Categories & Variants"
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
                        href="/admin/coupons"
                        isActive={isActive('/admin/coupons')}
                        tooltip="Coupons"
                        asChild
                    >
                        <Link href="/admin/coupons" onClick={handleLinkClick}>
                        <Ticket />
                        <span>Coupons</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/shipping-partners"
                        isActive={isActive('/admin/shipping-partners')}
                        tooltip="Shipping Partners"
                        asChild
                    >
                        <Link href="/admin/shipping-partners" onClick={handleLinkClick}>
                        <Truck />
                        <span>Shipping Partners</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarSeparator />
                <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/offers-banners"
                        isActive={isActive('/admin/offers-banners')}
                        tooltip="Offers & Banners"
                        asChild
                    >
                        <Link href="/admin/offers-banners" onClick={handleLinkClick}>
                            <Megaphone />
                            <span>Offers & Banners</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/ui-config"
                        isActive={isActive('/admin/ui-config')}
                        tooltip="UI Configuration"
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
                        tooltip="Settings"
                        asChild
                    >
                        <Link href="/admin/settings" onClick={handleLinkClick}>
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        href="/admin/developer"
                        isActive={isActive('/admin/developer')}
                        tooltip="Developer Configuration"
                        asChild
                    >
                        <Link href="/admin/developer" onClick={handleLinkClick}>
                            <Code />
                            <span>Developer Configuration</span>
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
