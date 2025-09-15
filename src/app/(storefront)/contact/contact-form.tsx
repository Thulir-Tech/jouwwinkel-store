
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
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  mobile: z.string().min(10, {
    message: 'Please enter a valid 10-digit mobile number.',
  }),
  product: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
    products: Product[];
}

export function ContactForm({ products }: ContactFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      mobile: '',
      product: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Here you would typically send the data to a backend or a service like Formspree
    console.log('Contact Form Submitted:', data);
    toast({
        title: 'Message Sent!',
        description: "Thank you for reaching out. We'll get back to you soon.",
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input type="tel" placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product for Enquiry (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="general">General Enquiry</SelectItem>
                    {products.map(product => (
                        <SelectItem key={product.id} value={product.title}>
                            {product.title}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
  );
}
