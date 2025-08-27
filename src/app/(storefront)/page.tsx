import Hero from '@/components/hero';
import ProductGrid from '@/components/product-grid';
import { getActiveProducts } from '@/lib/firestore';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-static';
export const revalidate = 60;

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[200px] sm:h-[300px] w-full" />
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
        Pan India Free Shipping
      </div>
      <Hero />
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Products</h2>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGridLoader />
        </Suspense>
      </section>
    </div>
  );
}

async function ProductGridLoader() {
  const products = await getActiveProducts(8);
  return <ProductGrid products={products} />;
}
