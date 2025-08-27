

'use client';

import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';
import AddToCartDialog from './add-to-cart-dialog';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  
  const showCompareAtPrice = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // prevent link navigation when clicking button
    if (product.hasVariants) {
        setIsDialogOpen(true);
    } else {
        addToCart({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
            image: product.images[0],
        });
        toast({
            title: "Added to cart",
            description: `${product.title} has been added to your cart.`,
        });
    }
  };

  return (
    <>
      {product.hasVariants && (
        <AddToCartDialog
          product={product}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
      <Card className="flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
        <Link href={`/products/${product.slug}`} className="block h-full">
            <CardHeader className="p-0 relative">
                <Image
                  src={product.images[0] || 'https://placehold.co/400x400.png'}
                  alt={product.title}
                  width={400}
                  height={400}
                  className="h-64 w-full object-cover"
                  data-ai-hint="product photo"
                />
              {product.onSale && (
                <Badge className="absolute top-2 left-2" variant="destructive">
                  Sale
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <CardTitle className="mb-2 h-14 text-lg font-semibold leading-tight line-clamp-2 font-headline">
                {product.title}
              </CardTitle>
              {product.rating && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < (product.rating || 0) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  ({product.reviewsCount || 0})
                </div>
              )}
              <div className="flex items-baseline gap-2 font-sans">
                <p className="text-xl font-bold text-primary">₹{formatCurrency(product.price)}</p>
                {showCompareAtPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    ₹{formatCurrency(product.compareAtPrice!)}
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
    </>
  );
}
