

'use client';

import { getProductBySlug } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import ProductRecommendations from '@/components/product-recommendations';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AddToCartButton from './add-to-cart-button';
import { FaWhatsapp } from 'react-icons/fa';
import { Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import VariantSelector from '@/components/variant-selector';

type ProductPageProps = {
  params: {
    slug: string;
  };
};

function ProductPageSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div>
                <Skeleton className="w-full h-[400px] md:h-[600px] rounded-lg" />
            </div>
            <div className="flex flex-col space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full mt-auto" />
            </div>
        </div>
    )
}

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

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const fetchedProduct = await getProductBySlug(params.slug);
      if (!fetchedProduct) {
        notFound();
      }
      setProduct(fetchedProduct);
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug]);


  if (loading || !product) {
      return (
        <div className="container mx-auto px-4 py-8">
            <ProductPageSkeleton />
        </div>
      )
  }

  const isSelectionComplete = product.hasVariants ? product.variants.every(v => selectedVariants[v.variantName]) : true;
  const showCompareAtPrice = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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
            
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {product.hasHighlights && product.highlights && product.highlights.length > 0 && (
                <ul className="space-y-3 mb-6 text-muted-foreground">
                    {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{highlight}</span>
                        </li>
                    ))}
                </ul>
            )}

            <VariantSelector 
                product={product}
                selectedVariants={selectedVariants}
                onVariantChange={setSelectedVariants}
            />

            <div className="mt-auto space-y-4 pt-6">
                <AddToCartButton 
                    product={product} 
                    selectedVariants={selectedVariants}
                    isSelectionComplete={isSelectionComplete}
                />
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
        <FaWhatsapp size={32} />
      </a>
    </div>
  );
}
