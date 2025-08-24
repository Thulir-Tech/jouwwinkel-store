'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    });
    toast({
      title: 'Added to cart',
      description: `${product.title} has been added to your cart.`,
    });
  };

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart}>
      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  );
}
