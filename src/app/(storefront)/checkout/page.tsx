
'use client';

import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addCheckout } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { getUser, getProduct, getProductsByIds } from '@/lib/firestore';
import { cn } from '@/lib/utils';
import type { ShippingAddress } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, Copy } from 'lucide-react';


const checkoutFormSchema = z.object({
    email: z.string().email(),
    mobile: z.string().min(10, { message: "Please enter a valid mobile number." }),
    shippingAddress: z.object({
        name: z.string().min(2),
        address: z.string().min(5),
        city: z.string().min(2),
        state: z.string().min(2),
        zip: z.string().min(5),
        country: z.string().min(2),
    }),
    paymentMethod: z.enum(['cod', 'upi'], {
        required_error: 'Please select a payment method.',
    }),
    utrNumber: z.string().optional(),
}).refine(data => {
    if (data.paymentMethod === 'upi') {
        return !!data.utrNumber && data.utrNumber.length > 5;
    }
    return true;
}, {
    message: 'Please enter a valid UTR number.',
    path: ['utrNumber'],
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

function CheckoutSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    const { 
        items, 
        total, 
        count, 
        clearCart,
        couponCode,
        discountAmount,
        totalAfterDiscount,
    } = useCartStore();
    const { user, loading, uiConfig } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            email: '',
            mobile: '',
            shippingAddress: {
                name: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: 'India',
            },
            utrNumber: '',
        },
    });

    const paymentMethod = useWatch({ control: form.control, name: 'paymentMethod' });

    useEffect(() => {
        if (!loading && user) {
            form.setValue('email', user.email || '');
            form.setValue('shippingAddress.name', user.displayName || '');
            form.setValue('mobile', user.mobile || '');
            if (user.shippingAddress) {
                form.setValue('shippingAddress', user.shippingAddress);
            }
        }
    }, [user, loading, form]);
    
    useEffect(() => {
        if (!loading && count === 0) {
            router.replace('/products');
        }
    }, [count, loading, router]);


    const onSubmit = async (data: CheckoutFormValues) => {
        try {
            const checkoutData: any = {
                ...data,
                items,
                total: totalAfterDiscount, // Use the discounted total for the order total
                userId: user?.uid,
                paymentStatus: data.paymentMethod === 'upi' ? 'pending' : 'completed',
            };

            if (data.paymentMethod === 'cod') {
                delete checkoutData.utrNumber;
            }

            // Add coupon details if a coupon is applied
            if (couponCode) {
                checkoutData.couponCode = couponCode;
                checkoutData.discountAmount = discountAmount;
                checkoutData.totalAfterDiscount = totalAfterDiscount;
            } else {
                 checkoutData.totalAfterDiscount = total;
            }
            
            await addCheckout(checkoutData);

            toast({
                title: 'Order placed successfully!',
                description: 'Thank you for your purchase.',
            });
            clearCart();
            router.push('/');
        } catch (error)
        {
            console.error(error);
            toast({
                title: 'Error',
                description: 'There was an issue placing your order. Please try again.',
                variant: 'destructive',
            });
        }
    };
    
    const handleCopyUpiId = () => {
        if (uiConfig?.paymentMethods?.upiId) {
            navigator.clipboard.writeText(uiConfig.paymentMethods.upiId);
            toast({ title: 'UPI ID copied to clipboard' });
        }
    }

    const cardColorClass = uiConfig?.cardColor === 'theme' ? 'bg-card' : 'bg-white';

    const enabledPaymentMethods = [
        { id: 'cod', name: 'Cash on Delivery', enabled: uiConfig?.paymentMethods?.cod ?? true },
        { id: 'upi', name: 'UPI', enabled: uiConfig?.paymentMethods?.upi ?? true },
    ].filter(method => method.enabled);

    if (loading || count === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <CheckoutSkeleton />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
             <h1 className="text-4xl font-bold text-center mb-8 font-headline">Checkout</h1>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                           {/* Contact Information */}
                            <Card className={cardColorClass}>
                                <CardContent className="pt-6">
                                    <h2 className="text-xl font-semibold mb-4 font-headline">Contact Information</h2>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="you@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="mobile"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mobile Number</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" placeholder="e.g. 9876543210" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                             <Card className={cardColorClass}>
                                <CardContent className="pt-6">
                                    <h2 className="text-xl font-semibold mb-4 font-headline">Shipping Address</h2>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="shippingAddress.city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="shippingAddress.state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="shippingAddress.zip" render={({ field }) => (<FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="ZIP Code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="shippingAddress.country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                             {/* Payment Method */}
                             {enabledPaymentMethods.length > 0 && (
                                <Card className={cardColorClass}>
                                    <CardContent className="pt-6">
                                        <h2 className="text-xl font-semibold mb-4 font-headline">Payment Method</h2>
                                        <FormField
                                            control={form.control}
                                            name="paymentMethod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Payment Option</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a payment method" />
                                                        </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {enabledPaymentMethods.map(method => (
                                                                <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {paymentMethod === 'upi' && uiConfig?.paymentMethods?.upiId && (
                                            <div className="mt-4 space-y-4">
                                                <Alert>
                                                    <Info className="h-4 w-4" />
                                                    <AlertTitle>Instructions for UPI Payment</AlertTitle>
                                                    <AlertDescription>
                                                        Please pay <span className="font-semibold font-sans">₹{formatCurrency(totalAfterDiscount)}</span> to the UPI ID below. After payment, enter the UTR number to complete your order.
                                                    </AlertDescription>
                                                </Alert>
                                                <div className="text-center p-3 bg-muted rounded-md flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Pay to UPI ID:</p>
                                                        <p className="font-semibold text-lg">{uiConfig.paymentMethods.upiId}</p>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" onClick={handleCopyUpiId}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="utrNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>UTR / Transaction Reference Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter your transaction reference number" {...field} />
                                                            </FormControl>
                                                            <FormDescription>You can find this number in your payment app's history.</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                             )}
                        </div>
                        <div className="lg:col-span-1">
                            <Card className={cn("sticky top-24", cardColorClass)}>
                               <CardContent className="pt-6">
                                <h2 className="text-xl font-semibold mb-4 font-headline">Order Summary</h2>
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <Image src={item.image || 'https://placehold.co/64x64.png'} alt={item.title} width={64} height={64} className="rounded-md object-cover" data-ai-hint="product image" />
                                            <div className="flex-grow">
                                                <p className="font-medium">{item.title}</p>
                                                {item.variantLabel && <p className="text-sm text-muted-foreground capitalize">{item.variantLabel}</p>}
                                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-sans">₹{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-4" />
                                <div className="space-y-2 font-sans">
                                     <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{formatCurrency(total)}</span>
                                    </div>
                                    {couponCode && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({couponCode})</span>
                                            <span>- ₹{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                     <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{formatCurrency(totalAfterDiscount)}</span>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full mt-6" size="lg" disabled={form.formState.isSubmitting || enabledPaymentMethods.length === 0}>
                                    {form.formState.isSubmitting ? 'Placing Order...' : (enabledPaymentMethods.length === 0 ? "No payment methods available" : "Place Order")}
                                </Button>
                               </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

    