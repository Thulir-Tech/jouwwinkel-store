'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCategories } from '@/lib/firestore';
import type { Category } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export function SidebarSheet() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    fetchCategories();
  }, []);
  
  const closeSheet = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-2xl font-headline">Jouwwinkel</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-2">
          <Button variant="ghost" className="justify-start text-lg" asChild>
            <Link href="/" onClick={closeSheet}>Home</Link>
          </Button>
          <Button variant="ghost" className="justify-start text-lg" asChild>
            <Link href="/products" onClick={closeSheet}>All Products</Link>
          </Button>
          <Separator className="my-2" />
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="py-2 px-4 text-lg font-semibold hover:no-underline">
                Categories
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="flex flex-col gap-1 pl-4">
                  {categories.map(cat => (
                    <Button key={cat.id} variant="ghost" className="justify-start" asChild>
                      <Link href={`/products?category=${cat.slug}`} onClick={closeSheet}>{cat.name}</Link>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator className="my-2" />
          <Button variant="ghost" className="justify-start text-lg">Contact</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
