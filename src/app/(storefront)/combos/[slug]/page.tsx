
'use client';

import { getComboBySlug, getProductsByIds } from '@/lib/firestore';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import ProductGrid from '@/components/product-grid';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FaCheckCircle } from 'react-icons/fa';
import { ShoppingCart } from 'lucide-react';
import type { Combo, Product } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

function ComboPageSkeleton() {
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

function AddToCartButton({ combo }: { combo: Combo }) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      productId: combo.id,
      title: combo.title,
      price: combo.price,
      quantity: 1,
      image: combo.images[0],
      isCombo: true,
      revenuePerUnit: combo.revenuePerUnit,
      profitPerUnit: combo.profitPerUnit,
    });
    toast({
      title: 'Added to cart',
      description: `${combo.title} has been added to your cart.`,
    });
  };

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart}>
      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  );
}


export default function ComboPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [combo, setCombo] = useState<Combo | null>(null);
  const [productsInCombo, setProductsInCombo] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCombo() {
      if (!slug) return;
      setLoading(true);
      const fetchedCombo = await getComboBySlug(slug);
      if (!fetchedCombo) {
        notFound();
      }
      setCombo(fetchedCombo);
      
      if (fetchedCombo?.productIds) {
        const products = await getProductsByIds(fetchedCombo.productIds);
        setProductsInCombo(products);
      }
      
      setLoading(false);
    }
    fetchCombo();
  }, [slug]);


  if (loading || !combo) {
      return (
        <div className="container mx-auto px-4 py-8">
            <ComboPageSkeleton />
        </div>
      )
  }

  const showCompareAtPrice = combo.compareAtPrice && combo.compareAtPrice > combo.price;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Image
            src={combo.images[0] || 'https://placehold.co/600x600.png'}
            alt={combo.title}
            width={600}
            height={600}
            className="w-full rounded-lg object-cover"
            data-ai-hint="combo photo"
          />
        </div>
        <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold font-headline mb-2">{combo.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
                <p className="text-2xl font-bold text-primary font-sans">₹{formatCurrency(combo.price)}</p>
                {showCompareAtPrice && (
                <p className="text-lg text-muted-foreground line-through font-sans">
                    ₹{formatCurrency(combo.compareAtPrice!)}
                </p>
                )}
                {combo.onSale && <Badge variant="destructive">Sale</Badge>}
            </div>
            
            <p className="text-muted-foreground text-sm mb-6">{combo.description}</p>

            {combo.hasHighlights && combo.highlights && combo.highlights.length > 0 && (
                <ul className="space-y-2 mb-6 text-muted-foreground">
                    {combo.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm">
                            <FaCheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{highlight}</span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-auto space-y-4 pt-6">
                <AddToCartButton combo={combo} />
            </div>
        </div>
      </div>
      
      <Separator className="my-12" />

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">What's Inside</h2>
        <ProductGrid products={productsInCombo} />
      </section>

    </div>
  );
}
