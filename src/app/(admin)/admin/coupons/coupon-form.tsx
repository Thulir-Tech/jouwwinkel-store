
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Coupon } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { addCoupon, updateCoupon } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const couponFormSchema = z.object({
  code: z.string().min(3, {
    message: 'Coupon code must be at least 3 characters.',
  }).toUpperCase(),
  discountType: z.enum(['percentage', 'flat'], { required_error: 'You must select a discount type.'}),
  discountValue: z.coerce.number().min(0.01, { message: 'Discount value must be positive.' }),
  active: z.boolean(),
  minOrderValue: z.coerce.number().optional(),
  maxDiscountAmount: z.coerce.number().optional(),
  firstOrderOnly: z.boolean(),
  prepaidOnly: z.boolean(),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

interface CouponFormProps {
  coupon?: Coupon;
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || '',
      discountType: coupon?.discountType || 'percentage',
      discountValue: coupon?.discountValue || 0,
      active: coupon?.active ?? true,
      minOrderValue: coupon?.minOrderValue,
      maxDiscountAmount: coupon?.maxDiscountAmount,
      firstOrderOnly: coupon?.firstOrderOnly ?? false,
      prepaidOnly: coupon?.prepaidOnly ?? false,
    },
  });

  const discountType = form.watch('discountType');

  const onSubmit = async (data: CouponFormValues) => {
    try {
      const couponData = { ...data };
      if (coupon) {
        await updateCoupon(coupon.id, couponData);
        toast({ title: 'Coupon updated successfully' });
      } else {
        await addCoupon(couponData);
        toast({ title: 'Coupon created successfully' });
      }
      router.push('/admin/coupons');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the coupon.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Coupon Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SUMMER10" {...field} />
                      </FormControl>
                       <FormDescription>Customers will enter this code at checkout.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Discount Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="percentage" />
                                </FormControl>
                                <FormLabel className="font-normal">Percentage (%)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="flat" />
                                </FormControl>
                                <FormLabel className="font-normal">Flat Amount (₹)</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormDescription>
                        The percentage or flat amount to discount.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">Application Rules</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="minOrderValue"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Order Value (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g. 500" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormDescription>Coupon will only apply if cart total is above this amount.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {discountType === 'percentage' && (
                        <FormField
                            control={form.control}
                            name="maxDiscountAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Discount Amount (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 100" {...field} value={field.value ?? ''}/>
                                    </FormControl>
                                    <FormDescription>Set a cap on the discount amount for percentage-based coupons.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <Separator />
                    <FormField
                        control={form.control}
                        name="firstOrderOnly"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                <FormLabel>For First-Time Customers Only</FormLabel>
                                <FormDescription>
                                    If checked, this coupon can only be used once by new customers.
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="prepaidOnly"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                <FormLabel>For Prepaid Orders Only</FormLabel>
                                <FormDescription>
                                    If checked, this coupon won't apply to Cash on Delivery (COD) orders.
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Customers can use this coupon.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <Button type="submit">
          {coupon ? 'Save Changes' : 'Create Coupon'}
        </Button>
      </form>
    </Form>
  );
}
