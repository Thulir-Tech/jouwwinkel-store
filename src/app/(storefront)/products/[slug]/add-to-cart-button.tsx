

'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
  selectedVariants: Record<string, string>;
  isSelectionComplete: boolean;
}

export default function AddToCartButton({ product, selectedVariants, isSelectionComplete }: AddToCartButtonProps) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!isSelectionComplete && product.hasVariants) {
      toast({
        title: 'Please make a selection',
        description: 'You need to choose an option for each variant.',
        variant: 'destructive',
      });
      return;
    }
    
    const variantId = product.hasVariants ? Object.values(selectedVariants).map(s => s.toLowerCase()).join('-') : undefined;
    const variantLabel = product.hasVariants ? Object.values(selectedVariants).join(' / ') : undefined;

    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      variantId,
      variantLabel,
      revenuePerUnit: product.revenuePerUnit,
      profitPerUnit: product.profitPerUnit,
    });
    toast({
      title: 'Added to cart',
      description: `${product.title} ${variantLabel ? `(${variantLabel})` : ''} has been added to your cart.`,
    });
  };

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={!isSelectionComplete && product.hasVariants}>
      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  );
}
