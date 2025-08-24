'use client';

import { useEffect, useState } from 'react';
import { productRecommendations } from '@/ai/flows/product-recommendations';
import type { Product, ProductRecommendation } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';

interface ProductRecommendationsProps {
  product: Product;
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function ProductRecommendations({ product }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!product) return;
      setLoading(true);
      try {
        const result = await productRecommendations({
          productId: product.id,
          productTitle: product.title,
          productDescription: product.description || '',
          productCategory: product.categoryId || '',
          limit: 6,
        });
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
    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <RecommendationSkeleton />
         <RecommendationSkeleton />
         <RecommendationSkeleton />
       </div>
    )
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {recommendations.map((rec) => (
          <CarouselItem key={rec.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
              <Card className="flex flex-col h-full overflow-hidden">
                <CardHeader className="p-0">
                  <Image
                    src={`https://placehold.co/400x300.png`} // Placeholder, as we don't have images for AI-generated products
                    alt={rec.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    data-ai-hint="product lifestyle"
                  />
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <CardTitle className="font-headline text-lg mb-2">{rec.title}</CardTitle>
                  <p className="text-sm text-muted-foreground flex-grow">{rec.reason}</p>
                   <Button asChild className="mt-4 w-full">
                      <Link href={`/products/${rec.slug}`}>View Product</Link>
                   </Button>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
