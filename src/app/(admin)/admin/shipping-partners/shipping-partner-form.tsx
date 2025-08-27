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
import { addShippingPartner } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Partner name must be at least 2 characters.',
  }),
  trackingUrl: z.string().url({ message: "Please enter a valid URL." })
});

type FormValues = z.infer<typeof formSchema>;

export function ShippingPartnerForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      trackingUrl: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await addShippingPartner(data);
      toast({ title: 'Shipping partner added successfully' });
      form.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while adding the partner.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-semibold">Add New Partner</h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partner Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. ST Courier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trackingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/track?id={consignment_number}" {...field} />
              </FormControl>
              <FormDescription>
                Use {'{consignment_number}'} as a placeholder.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Partner</Button>
      </form>
    </Form>
  );
}
