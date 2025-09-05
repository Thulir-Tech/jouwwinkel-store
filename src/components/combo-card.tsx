
'use client';

import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import type { Combo } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface ComboCardProps {
  combo: Combo;
}

export default function ComboCard({ combo }: ComboCardProps) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const { uiConfig } = useAuth();
  
  const showCompareAtPrice = combo.compareAtPrice && combo.compareAtPrice > combo.price;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
      title: "Added to cart",
      description: `${combo.title} has been added to your cart.`,
    });
  };

  const cardColorClass = uiConfig?.cardColor === 'white' ? 'bg-white' : 'bg-card';

  return (
    <Card className={cn("flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl", cardColorClass)}>
      <Link href={`/combos/${combo.slug}`} className="block h-full">
          <CardHeader className="p-0 relative">
              <Image
                src={combo.images[0] || 'https://placehold.co/400x400.png'}
                alt={combo.title}
                width={400}
                height={400}
                className="aspect-square w-full object-cover"
                data-ai-hint="combo photo"
              />
            {combo.onSale && (
              <Badge className="absolute top-2 left-2" variant="destructive">
                Sale
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-grow p-4 space-y-2">
            <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 font-headline">
              {combo.title}
            </CardTitle>
            <div className="flex items-baseline gap-2 font-sans">
              <p className="text-xl font-bold text-primary">₹{formatCurrency(combo.price)}</p>
              {showCompareAtPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  ₹{formatCurrency(combo.compareAtPrice!)}
                </p>
              )}
            </div>
          </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
