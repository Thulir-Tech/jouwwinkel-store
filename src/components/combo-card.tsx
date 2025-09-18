
'use client';

import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Zap } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

interface ComboCardProps {
  combo: Combo;
}

export default function ComboCard({ combo }: ComboCardProps) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const { uiConfig, user, isProductInWishlist, handleToggleWishlist } = useAuth();
  const router = useRouter();
  
  const showCompareAtPrice = combo.compareAtPrice && combo.compareAtPrice > combo.price;
  const showBuyNow = uiConfig?.showBuyNowButton ?? false;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addToCart({
      productId: combo.id,
      title: combo.title,
      price: combo.price,
      quantity: 1,
      image: combo.images[0],
      isCombo: true,
      productIds: combo.productIds,
      revenuePerUnit: combo.revenuePerUnit,
      profitPerUnit: combo.profitPerUnit,
    });
    toast({
      title: "Added to cart",
      description: `${combo.title} has been added to your cart.`,
    });
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addToCart({
      productId: combo.id,
      title: combo.title,
      price: combo.price,
      quantity: 1,
      image: combo.images[0],
      isCombo: true,
      productIds: combo.productIds,
      revenuePerUnit: combo.revenuePerUnit,
      profitPerUnit: combo.profitPerUnit,
    });
    router.push('/checkout');
  };

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) {
        router.push('/login');
        return;
    }
    handleToggleWishlist(combo.id);
    toast({
        title: isProductInWishlist(combo.id) ? 'Removed from wishlist' : 'Added to wishlist',
    });
  }

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const comboUrl = `${window.location.origin}/combos/${combo.slug}`;
    const shareText = uiConfig?.productShareText
      ? uiConfig.productShareText.replace('{productName}', combo.title)
      : `Check out this combo: ${combo.title}`;

    if (navigator.share) {
        navigator.share({
            title: combo.title,
            text: shareText,
            url: comboUrl,
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        });
    } else {
        navigator.clipboard.writeText(`${shareText}\n${comboUrl}`);
        toast({ title: 'Link copied to clipboard!'});
    }
  }

  const cardColorClass = uiConfig?.cardColor === 'theme' ? 'bg-card' : 'bg-white';
  const isInWishlist = user ? isProductInWishlist(combo.id) : false;

  return (
    <Card className={cn("flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl group/card", cardColorClass)}>
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
              {combo.title}
            </CardTitle>
            <div className="flex items-baseline gap-2 font-sans">
              <p className="text-2xl font-bold text-primary">₹{formatCurrency(combo.price)}</p>
              {showCompareAtPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  ₹{formatCurrency(combo.compareAtPrice!)}
                </p>
              )}
            </div>
          </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
            <Button className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            {showBuyNow && (
                <Button variant="secondary" className="w-full" onClick={handleBuyNow}>
                    <Zap className="mr-2 h-4 w-4" /> Buy Now
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
