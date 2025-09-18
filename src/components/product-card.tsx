
'use client';

import Image from 'next/image';
import { Star, ShoppingCart, Heart, Share2, Zap } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const { uiConfig, user, isProductInWishlist, handleToggleWishlist } = useAuth();
  const router = useRouter();
  
  const getPrice = () => {
    const offer = uiConfig?.siteWideOffer;
    if (offer?.enabled && offer.percentage && offer.percentage > 0) {
      const discountedPrice = product.price * (1 - offer.percentage / 100);
      return { price: discountedPrice, compareAtPrice: product.price };
    }
    return { price: product.price, compareAtPrice: product.compareAtPrice };
  };

  const { price, compareAtPrice } = getPrice();
  const showCompareAtPrice = compareAtPrice && compareAtPrice > price;
  const showBuyNow = uiConfig?.showBuyNowButton ?? false;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // prevent link navigation when clicking button
    if (product.hasVariants) {
        setIsDialogOpen(true);
    } else {
        addToCart({
            productId: product.id,
            title: product.title,
            price: price,
            quantity: 1,
            image: product.images[0],
            revenuePerUnit: product.revenuePerUnit,
            profitPerUnit: product.profitPerUnit,
        });
        toast({
            title: "Added to cart",
            description: `${product.title} has been added to your cart.`,
        });
    }
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (product.hasVariants) {
      setIsDialogOpen(true);
    } else {
      addToCart({
        productId: product.id,
        title: product.title,
        price: price,
        quantity: 1,
        image: product.images[0],
        revenuePerUnit: product.revenuePerUnit,
        profitPerUnit: product.profitPerUnit,
      });
      router.push('/checkout');
    }
  };
  
  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) {
        router.push('/login');
        return;
    }
    handleToggleWishlist(product.id);
    toast({
        title: isProductInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist',
    });
  }

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const productUrl = `${window.location.origin}/products/${product.slug}`;
    const shareText = uiConfig?.productShareText
      ? uiConfig.productShareText.replace('{productName}', product.title)
      : `Check out this product: ${product.title}`;

    if (navigator.share) {
        navigator.share({
            title: product.title,
            text: shareText,
            url: productUrl,
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        });
    } else {
        navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
        toast({ title: 'Link copied to clipboard!'});
    }
  }

  const cardColorClass = uiConfig?.cardColor === 'theme' ? 'bg-card' : 'bg-white';
  const isInWishlist = user ? isProductInWishlist(product.id) : false;

  return (
    <>
      {product.hasVariants && (
        <AddToCartDialog
          product={{...product, price: price}}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
      <Card className={cn("flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl group/card min-w-[150px]", cardColorClass)}>
        <Link href={`/products/${product.slug}`} className="block h-full">
            <CardHeader className="p-0 relative">
                <Image
                  src={product.images[0] || 'https://placehold.co/400x400.png'}
                  alt={product.title}
                  width={400}
                  height={400}
                  className="aspect-square w-full object-cover"
                  data-ai-hint="product photo"
                />
              {(product.onSale || (compareAtPrice && compareAtPrice > price)) && (
                <Badge className="absolute top-2 left-2" variant="destructive">
                  Sale
                </Badge>
              )}
               <div className="absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-8 w-8"
                        onClick={handleWishlistClick}
                        aria-label="Add to wishlist"
                    >
                        <Heart className={cn("h-4 w-4", isInWishlist && "fill-destructive text-destructive")} />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-8 w-8"
                        onClick={handleShareClick}
                        aria-label="Share product"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 space-y-2">
              <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 font-headline">
                {product.title}
              </CardTitle>
              {product.rating && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < (product.rating || 0) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  ({product.reviewsCount || 0})
                </div>
              )}
              <div className="flex items-baseline gap-2 font-sans">
                <p className="text-2xl font-bold text-primary">₹{formatCurrency(price)}</p>
                {showCompareAtPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    ₹{formatCurrency(compareAtPrice!)}
                  </p>
                )}
              </div>
            </CardContent>
        </Link>
        <CardFooter className="p-4 pt-0">
          <div className="flex w-full gap-2">
            <Button className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            {showBuyNow && (
              <Button variant="secondary" className="flex-shrink-0" onClick={handleBuyNow}>
                <Zap className="mr-2 h-4 w-4" /> Buy Now
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
