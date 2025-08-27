'use client';

import { useEffect, useState } from 'react';
import { getCheckouts } from '@/lib/firestore';
import type { Checkout } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface UserOrdersProps {
  userId: string;
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
          <CardHeader className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <p className="text-sm font-semibold">Order Placed</p>
              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Total</p>
              <p className="text-sm text-muted-foreground font-sans">₹{formatCurrency(order.total)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Ship To</p>
              <p className="text-sm text-muted-foreground truncate">{order.shippingAddress.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Order ID</p>
              <p className="text-xs text-muted-foreground truncate font-mono">{order.orderId || order.id}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    Status: <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                </h3>
            </div>
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <Image
                  src={item.image || 'https://placehold.co/100x100.png'}
                  alt={item.title}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                  data-ai-hint="product image"
                />
                <div className="flex-grow">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold font-sans">₹{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
