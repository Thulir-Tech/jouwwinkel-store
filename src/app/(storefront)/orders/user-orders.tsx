
'use client';

import { useEffect, useState } from 'react';
import { getCheckouts } from '@/lib/firestore';
import type { Checkout } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface UserOrdersProps {
  userId: string;
}

function TrackShipmentButton({ consignmentNumber }: { consignmentNumber: string }) {
  const { toast } = useToast();

  const handleTrack = () => {
    navigator.clipboard.writeText(consignmentNumber);
    toast({ title: 'Copied to clipboard!', description: 'Consignment number has been copied.' });
    window.open('https://stcourier.com/track/shipment', '_blank');
  };

  return (
    <Button variant="outline" size="sm" onClick={handleTrack}>
        <Truck className="mr-2 h-4 w-4" />
        Copy Consignment & Track Shipment
    </Button>
  );
}


export default function UserOrders({ userId }: UserOrdersProps) {
  const [orders, setOrders] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const userOrders = await getCheckouts(userId);
        setOrders(userOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [userId]);

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {orders.map(order => (
        <Card key={order.id}>
          <CardHeader className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6">
            <div>
              <p className="text-sm font-semibold">Order Placed</p>
              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Total</p>
              <p className="text-sm text-muted-foreground font-sans">₹{formatCurrency(order.total)}</p>
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
                <h3 className="text-lg font-semibold capitalize">
                    Status: <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                </h3>
                {order.status === 'shipped' && order.consignmentNumber && (
                    <TrackShipmentButton consignmentNumber={order.consignmentNumber} />
                )}
            </div>
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <Image
                  src={item.image || 'https://placehold.co/100x100.png'}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="rounded-md object-cover w-20 h-20"
                  data-ai-hint="product image"
                />
                <div className="flex-grow">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold font-sans self-start">₹{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
