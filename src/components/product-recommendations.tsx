'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { getProductsByIds } from '@/lib/firestore';
import ProductCard from './product-card';
import Autoplay from "embla-carousel-autoplay";

interface ProductRecommendationsProps {
  product: Product;
}

function RecommendationSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

export default function ProductRecommendations({ product }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!product || !product.relatedProductIds || product.relatedProductIds.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await getProductsByIds(product.relatedProductIds);
        setRecommendations(result);
      } catch (error) {
        console.error('Failed to fetch product recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [product]);

  if (loading) {
    return <RecommendationSkeleton />;
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent>
        {recommendations.map((rec) => (
          <CarouselItem key={rec.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="p-1 h-full">
              <ProductCard product={rec} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
