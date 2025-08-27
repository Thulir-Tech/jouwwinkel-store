

import { getProductBySlug } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import ProductRecommendations from '@/components/product-recommendations';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AddToCartButton from './add-to-cart-button';

type ProductPageProps = {
  params: {
    slug: string;
  };
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);
  

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const showCompareAtPrice = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.images[0] || 'https://placehold.co/600x600.png'}
            alt={product.title}
            width={600}
            height={600}
            className="w-full rounded-lg object-cover"
            data-ai-hint="product photo"
          />
        </div>
        <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold font-headline mb-4">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
                <p className="text-3xl font-bold text-primary font-sans">₹{formatCurrency(product.price)}</p>
                {showCompareAtPrice && (
                <p className="text-xl text-muted-foreground line-through font-sans">
                    ₹{formatCurrency(product.compareAtPrice!)}
                </p>
                )}
                {product.onSale && <Badge variant="destructive">Sale</Badge>}
            </div>

            <p className="text-muted-foreground mb-6 flex-grow">{product.description}</p>
            
            <div className="space-y-4">
                <AddToCartButton product={product} />
                <Button variant="outline" className="w-full">Size Guide</Button>
            </div>
        </div>
      </div>
      <section className="bg-background/80 py-16 mt-12">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">You Might Also Like</h2>
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductRecommendations product={product} />
            </Suspense>
         </div>
      </section>
      <a href="#" className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-colors z-50">
        <WhatsAppIcon />
      </a>
    </div>
  );
}
