
'use client';

import Link from 'next/link';
import { ShoppingBag, User, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { SidebarSheet } from './sidebar-sheet';
import { SearchDialog } from './search-dialog';
import { useAuth } from '@/hooks/use-auth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getUiConfig } from '@/lib/firestore';
import type { UiConfig } from '@/lib/types';
import Image from 'next/image';
import HeaderCaption from './header-caption';


function UserNav() {
    const { user, signOut } = useAuth();
  
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || 'Welcome'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/orders">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/login">
          <User className="h-6 w-6" />
          <span className="sr-only">Login</span>
        </Link>
      </Button>
    );
  }

export default function Header() {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<UiConfig | null>(null);
  const { count } = useCartStore();

  useEffect(() => {
    setIsClient(true);
    async function fetchConfig() {
      const uiConfig = await getUiConfig();
      setConfig(uiConfig);
    }
    fetchConfig();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <HeaderCaption config={config} />
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarSheet />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {config?.brandLogoUrl ? (
                <Link href="/">
                    <Image src={config.brandLogoUrl} alt="Brand Logo" width={120} height={60} className="object-contain h-12" />
                </Link>
            ) : (
                <Link href="/" className="text-2xl font-bold font-headline tracking-tight">
                    Jouwwinkel
                </Link>
            )}
        </div>
        <div className="flex items-center gap-1">
          <SearchDialog />
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingBag className="h-6 w-6" />
              {isClient && count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {count}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
