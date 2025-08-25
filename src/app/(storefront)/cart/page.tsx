'use client';

import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, count } = useCartStore();

  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold font-headline">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 font-headline">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
              <Image
                src={item.image || 'https://placehold.co/100x100.png'}
                alt={item.title}
                width={100}
                height={100}
                className="rounded-md object-cover"
                data-ai-hint="product image"
              />
              <div className="flex-grow">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">₹{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="h-8 w-14 text-center"
                  min="1"
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="font-semibold w-24 text-right">₹{formatCurrency(item.price * item.quantity)}</p>
              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg bg-card sticky top-24">
            <h2 className="text-xl font-bold mb-4 font-headline">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal ({count} items)</span>
              <span>₹{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>₹{formatCurrency(total)}</span>
            </div>
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
