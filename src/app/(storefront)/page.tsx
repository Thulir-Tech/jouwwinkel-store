import Hero from '@/components/hero';
import ProductGrid from '@/components/product-grid';
import ProductRecommendations from '@/components/product-recommendations';
import { getActiveProducts } from '@/lib/firestore';
import type { Product } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-static';
export const revalidate = 60;

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <div className="bg-primary text-primary-foreground text-center text-sm p-2 font-headline">
        Pan India shipping available
      </div>
      <Hero />
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Products</h2>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGridLoader />
        </Suspense>
      </section>
      <section className="bg-background/80 py-12">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">You Might Also Like</h2>
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductRecommendationsLoader />
            </Suspense>
         </div>
      </section>
    </div>
  );
}

async function ProductGridLoader() {
  const products = await getActiveProducts(8);
  return <ProductGrid products={products} />;
}

async function ProductRecommendationsLoader() {
  const products = await getActiveProducts(1);
  if (products.length === 0) {
    return null;
  }
  return <ProductRecommendations product={products[0]} />;
}
