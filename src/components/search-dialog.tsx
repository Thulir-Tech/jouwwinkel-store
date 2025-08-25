'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getActiveProducts } from '@/lib/firestore';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { ScrollArea } from './ui/scroll-area';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchAllProducts() {
      const products = await getActiveProducts();
      setAllProducts(products);
    }
    fetchAllProducts();
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredProducts([]);
      return;
    }
    const filtered = allProducts.filter(p =>
      p.title.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [allProducts]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setFilteredProducts([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Search className="h-6 w-6" />
          <span className="sr-only">Search products</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Search Products</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for watches, shirts, etc."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="h-72">
          {filteredProducts.length > 0 ? (
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <Link
                  href={`/products/${product.slug}`}
                  key={product.id}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  <Image
                    src={product.images[0] || 'https://placehold.co/64x64.png'}
                    alt={product.title}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                    data-ai-hint="product image"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm text-muted-foreground">₹{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            searchTerm && <p className="text-center text-muted-foreground pt-4">No products found.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
