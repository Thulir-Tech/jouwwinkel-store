
'use client';

import { Suspense } from 'react';
import { ProductsPageClient } from './products-page-client';
import { Skeleton } from '@/components/ui/skeleton';

function ProductsPageSkeleton() {
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

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4 font-headline">All Products</h1>
      <p className="text-center text-muted-foreground mb-8">
        Discover our curated collection of style essentials.
      </p>
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsPageClient />
      </Suspense>
    </div>
  );
}
