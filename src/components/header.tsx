'use client';

import Link from 'next/link';
import { Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { SidebarSheet } from './sidebar-sheet';
import { SearchDialog } from './search-dialog';

export default function Header() {
  const [isClient, setIsClient] = useState(false);
  const { count } = useCartStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarSheet />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="text-2xl font-bold font-headline tracking-tight">
            Jouwwinkel
          </Link>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
