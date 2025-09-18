

'use client';

import { getProductBySlug, getApprovedReviewsForProduct } from '@/lib/firestore';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import ProductRecommendations from '@/components/product-recommendations';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AddToCartButton from './add-to-cart-button';
import { FaWhatsapp, FaCheckCircle } from 'react-icons/fa';
import { ShoppingBag, Truck, MapPin, ChevronLeft, ChevronRight, Star, Heart, Share2, Zap } from 'lucide-react';
import type { Product, Review } from '@/lib/types';
import VariantSelector from '@/components/variant-selector';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store';

function ProductPageSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div>
                <Skeleton className="w-full h-[400px] md:h-[600px] rounded-lg" />
                 <div className="flex gap-2 mt-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <Skeleton className="w-20 h-20 rounded-lg" />
                </div>
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

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

function DeliveryInfo() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [deliveryDates, setDeliveryDates] = useState({ ordered: '', shipped: '', delivered: '' });

    useEffect(() => {
        const calculateDeliveryDates = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
            
            const orderedDate = new Date(now);
            const shippedDate = new Date(now);
            shippedDate.setDate(now.getDate() + 1);
            
            const deliveredDate = new Date(now);
            deliveredDate.setDate(now.getDate() + 4); // Approx 3-4 days for delivery

            setDeliveryDates({
                ordered: orderedDate.toLocaleDateString('en-US', options),
                shipped: shippedDate.toLocaleDateString('en-US', options),
                delivered: deliveredDate.toLocaleDateString('en-US', options),
            })
        }
        
        calculateDeliveryDates();

        const timer = setInterval(() => {
            const now = new Date();
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            
            const diff = endOfDay.getTime() - now.getTime();
            
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            
            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="border rounded-lg p-4 my-6 space-y-4 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">
                Get it by <span className="font-bold">{deliveryDates.delivered}</span>
            </div>
            <p>
                Order within the next <span className="text-foreground font-semibold">{String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s</span> for dispatch tomorrow.
            </p>
             <div className="flex justify-between items-start text-center border-t pt-4">
                <div className="flex flex-col items-center flex-1">
                    <ShoppingBag className="h-6 w-6 mb-1 text-primary"/>
                    <p className="font-semibold text-xs text-foreground">Ordered</p>
                    <p className="text-xs">{deliveryDates.ordered}</p>
                </div>
                <div className="flex-1 border-t border-dashed mt-3 mx-2"></div>
                <div className="flex flex-col items-center flex-1">
                    <Truck className="h-6 w-6 mb-1 text-primary"/>
                    <p className="font-semibold text-xs text-foreground">Shipped</p>
                    <p className="text-xs">{deliveryDates.shipped}</p>
                </div>
                 <div className="flex-1 border-t border-dashed mt-3 mx-2"></div>
                <div className="flex flex-col items-center flex-1">
                    <MapPin className="h-6 w-6 mb-1 text-primary"/>
                    <p className="font-semibold text-xs text-foreground">Delivered</p>
                    <p className="text-xs">{deliveryDates.delivered}</p>
                </div>
            </div>
        </div>
    )
}

function ProductImageCarousel({ images }: { images: string[] }) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const handleThumbClick = (index: number) => {
        api?.scrollTo(index);
    }
    
    return (
         <div>
            <Carousel setApi={setApi} className="group relative">
                <CarouselContent>
                    {images.map((img, index) => (
                        <CarouselItem key={index}>
                            <Image
                                src={img || 'https://placehold.co/600x600.png'}
                                alt={`Product image ${index + 1}`}
                                width={600}
                                height={600}
                                className="w-full h-auto aspect-square object-cover rounded-lg"
                                data-ai-hint="product photo"
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => api?.scrollPrev()}
                    disabled={!api?.canScrollPrev()}
                >
                    <ChevronLeft />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => api?.scrollNext()}
                    disabled={!api?.canScrollNext()}
                >
                    <ChevronRight />
                </Button>
            </Carousel>
             <div className="flex gap-2 mt-4">
                {images.map((img, index) => (
                    <button key={index} onClick={() => handleThumbClick(index)}>
                        <Image
                            src={img || 'https://placehold.co/100x100.png'}
                            alt={`Thumbnail ${index + 1}`}
                            width={100}
                            height={100}
                            className={cn(
                                'w-20 h-20 object-cover rounded-lg border-2 transition-all',
                                index === current ? 'border-primary' : 'border-transparent opacity-60'
                            )}
                            data-ai-hint="product photo"
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}

function ReviewsSection({ reviews }: { reviews: Review[] }) {
    if (reviews.length === 0) {
      return null;
    }
  
    return (
      <section className="mt-12">
        <Separator />
        <div className="py-12">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">Customer Reviews</h2>
            <div className="space-y-8 max-w-3xl mx-auto">
            {reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                <Avatar>
                    <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.userName}</p>
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                key={i}
                                className={`h-4 w-4 ${
                                    i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                </div>
                </div>
            ))}
            </div>
        </div>
      </section>
    );
  }

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  
  const { toast } = useToast();
  const { user, uiConfig, isProductInWishlist, handleToggleWishlist } = useAuth();
  const { addToCart } = useCartStore();
  
  useEffect(() => {
    setIsClient(true);
    async function fetchProductData() {
      if (!slug) return;
      setLoading(true);
      const fetchedProduct = await getProductBySlug(slug);
      if (!fetchedProduct) {
        notFound();
      }
      setProduct(fetchedProduct);
      const fetchedReviews = await getApprovedReviewsForProduct(fetchedProduct.id);
      setReviews(fetchedReviews);
      setLoading(false);
    }
    fetchProductData();
  }, [slug]);

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user || !product) {
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
    if (!product) return;
    
    const shareText = uiConfig?.productShareText
      ? uiConfig.productShareText.replace('{productName}', product.title)
      : `Check out this product: ${product.title}`;

    if (navigator.share) {
        navigator.share({
            title: product.title,
            text: shareText,
            url: window.location.href,
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error)
            }
        });
    } else {
        navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        toast({ title: 'Link copied to clipboard!'});
    }
  }

  const getPrice = () => {
    if (!product) return { price: 0, compareAtPrice: undefined };
    const offer = uiConfig?.siteWideOffer;
    if (offer?.enabled && offer.percentage && offer.percentage > 0) {
      const discountedPrice = product.price * (1 - offer.percentage / 100);
      return { price: discountedPrice, compareAtPrice: product.price };
    }
    return { price: product.price, compareAtPrice: product.compareAtPrice };
  };

  const { price, compareAtPrice } = getPrice();

  if (loading || !product) {
      return (
        <div className="container mx-auto px-4 py-8">
            <ProductPageSkeleton />
        </div>
      )
  }

  const isSelectionComplete = product.hasVariants ? product.variants.every(v => selectedVariants[v.variantName]) : true;
  const showCompareAtPrice = compareAtPrice && compareAtPrice > price;
  const isInWishlist = user ? isProductInWishlist(product.id) : false;
  const showBuyNow = uiConfig?.showBuyNowButton ?? false;

  const handleBuyNow = () => {
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
      price: price,
      quantity: 1,
      image: product.images[0],
      variantId,
      variantLabel,
      revenuePerUnit: product.revenuePerUnit,
      profitPerUnit: product.profitPerUnit,
    });
    router.push('/checkout');
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <ProductImageCarousel images={product.images.length > 0 ? product.images : ['https://placehold.co/600x600.png']} />
        <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold font-headline mb-2">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
                <p className="text-3xl font-bold text-primary font-sans">₹{formatCurrency(price)}</p>
                {showCompareAtPrice && (
                <p className="text-xl text-muted-foreground line-through font-sans">
                    ₹{formatCurrency(compareAtPrice!)}
                </p>
                )}
                {(product.onSale || (compareAtPrice && compareAtPrice > price)) && <Badge variant="destructive">Sale</Badge>}
            </div>
            
            <p className="text-muted-foreground text-sm mb-6">{product.description}</p>

            {product.hasHighlights && product.highlights && product.highlights.length > 0 && (
                <ul className="space-y-2 mb-6 text-muted-foreground">
                    {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm">
                            <FaCheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{highlight}</span>
                        </li>
                    ))}
                </ul>
            )}
            
            {isClient && <DeliveryInfo />}

            <VariantSelector 
                product={product}
                selectedVariants={selectedVariants}
                onVariantChange={setSelectedVariants}
            />

            <div className="mt-auto space-y-4 pt-6">
                <div className="flex gap-2">
                    <AddToCartButton 
                        product={{...product, price: price}}
                        selectedVariants={selectedVariants}
                        isSelectionComplete={isSelectionComplete}
                    />
                    {showBuyNow && (
                        <Button
                            size="lg"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleBuyNow}
                            disabled={!isSelectionComplete && product.hasVariants}
                        >
                            <Zap className="mr-2 h-5 w-5" /> Buy Now
                        </Button>
                    )}
                </div>
                <div className="flex justify-center gap-2">
                     <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleWishlistClick}
                        aria-label="Add to wishlist"
                        className="text-muted-foreground"
                    >
                        <Heart className={cn("mr-2 h-4 w-4", isInWishlist && "fill-destructive text-destructive")} />
                        {isInWishlist ? 'Wishlisted' : 'Wishlist'}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleShareClick}
                        aria-label="Share product"
                        className="text-muted-foreground"
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <ReviewsSection reviews={reviews} />
      
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductRecommendations product={product} />
      </Suspense>
      <a href="#" className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-colors z-50">
        <FaWhatsapp size={32} />
      </a>
    </div>
  );
}
