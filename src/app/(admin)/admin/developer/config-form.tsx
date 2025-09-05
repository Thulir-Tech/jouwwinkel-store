
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { DeveloperConfig } from '@/lib/types';
import { updateDeveloperConfig } from '@/lib/firestore.admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const configFormSchema = z.object({
  customerName: z.string().optional(),
  customerNumber: z.string().optional(),
  customerEmail: z.string().email().or(z.literal('')).optional(),
  customerAddress: z.string().optional(),
  
  productCode: z.string().optional(),
  productName: z.string().optional(),
  buildDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  licenseGeneratedDate: z.string().optional(),
  licenseValidUpto: z.string().optional(),

  developedByName: z.string().optional(),
  developedByYear: z.string().optional(),
  developedByLink: z.string().url().or(z.literal('')).optional(),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

interface ConfigFormProps {
  initialData: DeveloperConfig | null;
}

export function DeveloperConfigForm({ initialData }: ConfigFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      customerName: initialData?.customerName || '',
      customerNumber: initialData?.customerNumber || '',
      customerEmail: initialData?.customerEmail || '',
      customerAddress: initialData?.customerAddress || '',
      productCode: initialData?.productCode || '',
      productName: initialData?.productName || '',
      buildDate: initialData?.buildDate || '',
      lastUpdatedDate: initialData?.lastUpdatedDate || '',
      licenseGeneratedDate: initialData?.licenseGeneratedDate || '',
      licenseValidUpto: initialData?.licenseValidUpto || '',
      developedByName: initialData?.developedByName || '',
      developedByYear: initialData?.developedByYear || '',
      developedByLink: initialData?.developedByLink || '',
    },
  });

  const onSubmit = async (data: ConfigFormValues) => {
    try {
      await updateDeveloperConfig(data);
      toast({ title: 'Developer configuration updated successfully' });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the configuration.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="customerName" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Customer Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="customerNumber" render={({ field }) => ( <FormItem><FormLabel>Number</FormLabel><FormControl><Input placeholder="Customer Number" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="customerEmail" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Customer Email" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="customerAddress" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Customer Address" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="productCode" render={({ field }) => ( <FormItem><FormLabel>Product Code</FormLabel><FormControl><Input placeholder="Product Code" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="productName" render={({ field }) => ( <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="Product Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="buildDate" render={({ field }) => ( <FormItem><FormLabel>Build Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="lastUpdatedDate" render={({ field }) => ( <FormItem><FormLabel>Last Updated Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="licenseGeneratedDate" render={({ field }) => ( <FormItem><FormLabel>License Generated Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="licenseValidUpto" render={({ field }) => ( <FormItem><FormLabel>License Valid Upto</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="developedByName" render={({ field }) => ( <FormItem><FormLabel>Developed By Name</FormLabel><FormControl><Input placeholder="Developer Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="developedByYear" render={({ field }) => ( <FormItem><FormLabel>Year</FormLabel><FormControl><Input placeholder="e.g. 2024" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="developedByLink" render={({ field }) => ( <FormItem><FormLabel>Link to Redirect</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </CardContent>
        </Card>
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
