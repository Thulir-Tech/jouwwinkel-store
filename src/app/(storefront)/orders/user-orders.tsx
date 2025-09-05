
'use client';

import { useEffect, useState } from 'react';
import { getCheckouts, getProductsByIds, getReviewsForUserAndProducts, getShippingPartner } from '@/lib/firestore';
import type { Checkout, ShippingPartner, Review, CartItem, Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import ReviewDialog from './review-dialog'; 
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { FaCheckCircle } from 'react-icons/fa';

interface UserOrdersProps {
  userId: string;
}

function TrackShipmentButton({ order }: { order: Checkout }) {
  const { toast } = useToast();
  const [partner, setPartner] = useState<ShippingPartner | null>(null);

  useEffect(() => {
    async function fetchPartner() {
      if (order.shippingPartnerId) {
        const p = await getShippingPartner(order.shippingPartnerId);
        setPartner(p);
      }
    }
    fetchPartner();
  }, [order.shippingPartnerId]);

  const handleTrack = () => {
    if (!order.consignmentNumber || !partner?.trackingUrl) {
      toast({ title: 'Tracking information not available yet.', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(order.consignmentNumber);
    toast({ title: 'Copied to clipboard!', description: 'Consignment number has been copied.' });
    
    const trackingUrl = partner.trackingUrl.replace('{consignment_number}', order.consignmentNumber);
    window.open(trackingUrl, '_blank');
  };
  
  if (!order.consignmentNumber) return null;

  return (
    <Button variant="outline" size="sm" onClick={handleTrack}>
        <Truck className="mr-2 h-4 w-4" />
        Copy Consignment & Track Shipment
    </Button>
  );
}

function OrderItem({ item, orderStatus, onOpenReviewDialog, hasReview }: { item: CartItem | Product, orderStatus: string, onOpenReviewDialog: (productId: string, productTitle: string) => void, hasReview: (productId: string) => boolean }) {
    const isProduct = 'slug' in item; // Check if it's a full Product object
    const id = isProduct ? item.id : item.id;
    const image = isProduct ? item.images?.[0] : item.image;
    const title = item.title;
    const quantity = isProduct ? 1 : item.quantity;
    const price = item.price;

    const isReviewable = orderStatus === 'delivered' && !('isCombo' in item && item.isCombo);

    return (
        <div key={id} className="flex items-center gap-4">
            <Image
                src={image || 'https://placehold.co/100x100.png'}
                alt={title}
                width={80}
                height={80}
                className="rounded-md object-cover w-20 h-20"
                data-ai-hint="product image"
            />
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                {isReviewable && (
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-primary"
                        onClick={() => onOpenReviewDialog(id, title)}
                        disabled={hasReview(id)}
                    >
                        {hasReview(id) ? 'Review Submitted' : 'Write a review'}
                    </Button>
                )}
            </div>
            <p className="font-semibold font-sans self-start">₹{formatCurrency(price * quantity)}</p>
        </div>
    );
}

function ExpandedComboItems({ item, orderStatus, onOpenReviewDialog, hasReview }: { item: CartItem, orderStatus: string, onOpenReviewDialog: (productId: string, productTitle: string) => void, hasReview: (productId: string) => boolean }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchComboProducts() {
            if (item.isCombo && item.productIds) {
                const fetchedProducts = await getProductsByIds(item.productIds);
                setProducts(fetchedProducts);
            }
            setLoading(false);
        }
        fetchComboProducts();
    }, [item]);

    if (loading) {
        return (
            <div className="pl-12 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }

    if (!products.length) return null;

    return (
        <div className="pl-4 border-l ml-4 space-y-4">
            {products.map(product => (
                <OrderItem 
                    key={product.id}
                    item={product}
                    orderStatus={orderStatus}
                    onOpenReviewDialog={onOpenReviewDialog}
                    hasReview={hasReview}
                />
            ))}
        </div>
    )
}


export default function UserOrders({ userId }: UserOrdersProps) {
  const [orders, setOrders] = useState<Checkout[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ productId: string; productTitle: string } | null>(null);
  const { uiConfig } = useAuth();

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const userOrders = await getCheckouts(userId);
      setOrders(userOrders);

      if (userOrders.length > 0) {
        const productIds = userOrders.flatMap(o => o.items.map(i => i.isCombo ? (i.productIds || []) : i.productId)).flat().filter(Boolean) as string[];
        const uniqueProductIds = [...new Set(productIds)];
        const userReviews = await getReviewsForUserAndProducts(userId, uniqueProductIds);
        setReviews(userReviews);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [userId]);

  const hasReview = (productId: string) => {
    return reviews.some(review => review.productId === productId);
  }

  const handleOpenReviewDialog = (productId: string, productTitle: string) => {
    setSelectedProduct({ productId, productTitle });
    setReviewDialogOpen(true);
  };
  
  const cardColorClass = uiConfig?.cardColor === 'white' ? 'bg-white' : 'bg-card';

  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
  }

  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground">You have no orders yet.</p>;
  }

  return (
    <>
      {selectedProduct && (
        <ReviewDialog
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            productId={selectedProduct.productId}
            productTitle={selectedProduct.productTitle}
            userId={userId}
            onReviewSubmitted={fetchOrderData}
        />
      )}
      <div className="space-y-6 max-w-4xl mx-auto">
        {orders.map(order => (
          <Card key={order.id} className={cn("overflow-hidden", cardColorClass)}>
            <CardHeader className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 bg-muted/50">
              <div>
                <p className="text-sm font-semibold">Order Placed</p>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Total</p>
                <p className="text-sm text-muted-foreground font-sans">₹{formatCurrency(order.totalAfterDiscount || order.total)}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-sm font-semibold">Ship To</p>
                <p className="text-sm text-muted-foreground truncate">{order.shippingAddress.name}</p>
              </div>
              <div className="col-span-2 md:col-span-1 md:text-right">
                <p className="text-sm font-semibold">Order ID</p>
                <p className="text-xs text-muted-foreground truncate font-mono">{order.orderId || order.id}</p>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 md:p-6 space-y-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                      {order.status === 'delivered' ? <FaCheckCircle className="text-green-500"/> : null}
                      Status: <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                  </h3>
                  {order.status === 'shipped' && (
                      <TrackShipmentButton order={order} />
                  )}
              </div>
              <div className="space-y-4">
                {order.items.map(item => (
                    <div key={item.id}>
                        <OrderItem 
                            item={item}
                            orderStatus={order.status}
                            onOpenReviewDialog={handleOpenReviewDialog}
                            hasReview={hasReview}
                        />
                        {item.isCombo && (
                            <ExpandedComboItems
                                item={item}
                                orderStatus={order.status}
                                onOpenReviewDialog={handleOpenReviewDialog}
                                hasReview={hasReview}
                            />
                        )}
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
