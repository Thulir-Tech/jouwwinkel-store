
'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag, Info, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { validateAndApplyCoupon } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    total, 
    count, 
    applyCoupon, 
    removeCoupon,
    couponCode,
    discountAmount,
    totalAfterDiscount
  } = useCartStore();
  const { user, uiConfig } = useAuth();
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setLoadingCoupon(true);
    try {
        const { coupon, discountAmount } = await validateAndApplyCoupon(couponInput, total, user?.uid);
        applyCoupon(coupon, discountAmount);
        toast({ title: "Success", description: `Coupon "${coupon.code}" applied.`});
        setCouponInput('');
    } catch(error: any) {
        toast({ title: "Error", description: error.message, variant: 'destructive'});
    } finally {
        setLoadingCoupon(false);
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast({ title: "Coupon removed." });
  }

  const cardColorClass = uiConfig?.cardColor === 'white' ? 'bg-white' : 'bg-card';

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
      
      {!user && (
         <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 !text-blue-600" />
            <AlertTitle className="text-blue-800">Have an account?</AlertTitle>
            <AlertDescription className="text-blue-700">
                <Link href="/login" className="font-medium underline">Login</Link> for a better experience.
            </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg", cardColorClass)}>
              <Image
                src={item.image || 'https://placehold.co/100x100.png'}
                alt={item.title}
                width={100}
                height={100}
                className="rounded-md object-cover flex-shrink-0"
                data-ai-hint="product image"
              />
              <div className="flex-grow">
                <h2 className="font-semibold font-headline">{item.title}</h2>
                {item.variantLabel && <p className="text-sm text-muted-foreground capitalize">{item.variantLabel}</p>}
                <p className="text-sm text-muted-foreground font-sans">₹{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-4 ml-auto">
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
                <div className="flex items-center gap-2">
                    <p className="font-semibold w-20 text-right font-sans">₹{formatCurrency(item.price * item.quantity)}</p>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className={cn("p-6 border rounded-lg sticky top-24", cardColorClass)}>
            <h2 className="text-xl font-bold mb-4 font-headline">Order Summary</h2>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-sans">₹{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                 {couponCode && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount ({couponCode})</span>
                        <span className="font-sans">- ₹{formatCurrency(discountAmount)}</span>
                    </div>
                )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span className="font-sans">₹{formatCurrency(totalAfterDiscount)}</span>
            </div>
            
            {!couponCode ? (
                 <div className="flex items-center gap-2 mb-4">
                    <Input 
                        placeholder="Coupon Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-grow"
                    />
                    <Button onClick={handleApplyCoupon} disabled={loadingCoupon}>
                        {loadingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-between p-2 rounded-md bg-green-50 text-green-700 border border-green-200 mb-4">
                    <p className="text-sm font-medium">Coupon "{couponCode}" applied!</p>
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveCoupon}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
