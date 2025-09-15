
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { updateUserProfile } from '@/lib/firestore.admin';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase.client';
import { Separator } from '@/components/ui/separator';

const addressSchema = z.object({
    name: z.string().min(2, "Name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip: z.string().min(5, "ZIP code is required"),
    country: z.string().min(2, "Country is required"),
});

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  mobile: z.string().optional(),
  shippingAddress: addressSchema.optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const { uiConfig } = useAuth();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user.displayName || '',
      email: user.email || '',
      mobile: user.mobile || '',
      shippingAddress: user.shippingAddress || {
        name: user.displayName || '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'India'
      }
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Not authenticated");

        // Update Firebase Auth display name if it has changed
        if (currentUser.displayName !== data.displayName) {
            await updateProfile(currentUser, { displayName: data.displayName });
        }

        // Update Firestore profile
        await updateUserProfile(user.uid, {
            displayName: data.displayName,
            mobile: data.mobile,
            shippingAddress: data.shippingAddress,
        });

      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating your profile.',
        variant: 'destructive',
      });
    }
  };
  
  const cardColorClass = uiConfig?.cardColor === 'theme' ? 'bg-card' : 'bg-white';


  return (
    <Card className={cardColorClass}>
        <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your name, contact details, and address.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="you@example.com" {...field} disabled />
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

                <Separator />
                
                <div>
                    <h3 className="text-lg font-medium mb-4">Default Shipping Address</h3>
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
                </div>

                <Button type="submit">Save Changes</Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
