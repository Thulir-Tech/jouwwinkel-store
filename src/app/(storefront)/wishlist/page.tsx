
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getProductsByIds } from '@/lib/firestore';
import type { Product } from '@/lib/types';
import ProductGrid from '@/components/product-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function WishlistPageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[200px] sm:h-[300px] w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/wishlist');
      return;
    }

    async function fetchWishlistProducts() {
      if (user?.wishlist && user.wishlist.length > 0) {
        try {
          setLoadingProducts(true);
          const products = await getProductsByIds(user.wishlist);
          setWishlistProducts(products);
        } catch (error) {
          console.error("Failed to fetch wishlist products:", error);
        } finally {
          setLoadingProducts(false);
        }
      } else {
        setLoadingProducts(false);
      }
    }

    if (user) {
      fetchWishlistProducts();
    }
  }, [user, authLoading, router]);

  if (authLoading || loadingProducts) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 font-headline">My Wishlist</h1>
        <WishlistPageSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 font-headline">My Wishlist</h1>
      {wishlistProducts.length > 0 ? (
        <ProductGrid products={wishlistProducts} />
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <Heart className="mx-auto h-16 w-16 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="mb-6">Looks like you haven't added anything to your wishlist yet.</p>
          <Button asChild>
            <Link href="/products">Start Exploring</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
