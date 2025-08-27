
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { formatCurrency } from '@/lib/format';
import { Separator } from '@/components/ui/separator';
import VariantSelector from './variant-selector';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { getProduct } from '@/lib/firestore';

interface AddToCartDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DialogSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="space-y-2 flex-grow">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                </div>
            </div>
            <Separator />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}

export default function AddToCartDialog({ product: initialProduct, open, onOpenChange }: AddToCartDialogProps) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  // Fetch full product details if only partial data is passed
  useEffect(() => {
    async function fetchProductDetails() {
      if (open && (!product.variants || product.variants.length === 0)) {
        setLoading(true);
        const fullProduct = await getProduct(product.id);
        if (fullProduct) {
          setProduct(fullProduct);
        }
        setLoading(false);
      }
    }
    fetchProductDetails();
  }, [open, product.id, product.variants]);

  const allVariantsSelected = product.hasVariants ? 
    product.variants.length === Object.keys(selectedVariants).length : true;

  const handleAddToCart = () => {
    if (!allVariantsSelected) {
      toast({
        title: 'Please select all options',
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
    });
    toast({
      title: 'Added to cart',
      description: `${product.title} ${variantLabel ? `(${variantLabel})` : ''} has been added.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Options</DialogTitle>
          <DialogDescription>Choose your preferences for {product.title}</DialogDescription>
        </DialogHeader>
        {loading ? <DialogSkeleton /> : (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Image
                        src={product.images?.[0] || 'https://placehold.co/100x100.png'}
                        alt={product.title}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                        data-ai-hint="product image"
                    />
                    <div>
                        <h3 className="font-semibold text-lg">{product.title}</h3>
                        <p className="text-lg font-sans font-bold text-primary">₹{formatCurrency(product.price)}</p>
                    </div>
                </div>
                <Separator />
                <VariantSelector
                    product={product}
                    selectedVariants={selectedVariants}
                    onVariantChange={setSelectedVariants}
                />
            </div>
        )}
        <DialogFooter>
          <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={!allVariantsSelected || loading}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

