
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActiveProducts, getCategories } from '@/lib/firestore';
import type { Product, Category } from '@/lib/types';
import ProductCard from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[200px] sm:h-[300px] w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function ProductsPageClient() {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getActiveProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        
        if (categoryQuery) {
            const categoryFromUrl = categoriesData.find(c => c.slug === categoryQuery);
            if (categoryFromUrl) {
                setSelectedCategory(categoryFromUrl.id);
            }
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryQuery]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      }
    });
  }, [products, searchTerm, selectedCategory, sortOrder]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={setSortOrder} defaultValue="newest">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 justify-center gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {!loading && filteredAndSortedProducts.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full mt-8">No products found.</p>
      )}
    </>
  );
}
