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
import type { UiConfig } from '@/lib/types';
import { updateUiConfig } from '@/lib/firestore.admin';
import { Separator } from '@/components/ui/separator';

const configFormSchema = z.object({
  headerCaption: z.string().optional(),
  footerHeading: z.string().optional(),
  instagramLink: z.string().url().or(z.literal('')).optional(),
  whatsappLink: z.string().url().or(z.literal('')).optional(),
  storeAddress: z.string().optional(),
  heroText1: z.string().optional(),
  heroText2: z.string().optional(),
  heroText3: z.string().optional(),
  ourStoryContent: z.string().optional(),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

interface ConfigFormProps {
  initialData: UiConfig | null;
}

export function ConfigForm({ initialData }: ConfigFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      headerCaption: initialData?.headerCaption || '',
      footerHeading: initialData?.footerHeading || '',
      instagramLink: initialData?.instagramLink || '',
      whatsappLink: initialData?.whatsappLink || '',
      storeAddress: initialData?.storeAddress || '',
      heroText1: initialData?.heroText1 || '',
      heroText2: initialData?.heroText2 || '',
      heroText3: initialData?.heroText3 || '',
      ourStoryContent: initialData?.ourStoryContent || '',
    },
  });

  const onSubmit = async (data: ConfigFormValues) => {
    try {
      await updateUiConfig(data);
      toast({ title: 'Configuration updated successfully' });
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
        <div className="space-y-4">
            <h3 className="text-lg font-medium">General</h3>
            <FormField
            control={form.control}
            name="headerCaption"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Header Caption</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Pan India Free Shipping" {...field} />
                </FormControl>
                <FormDescription>The text displayed in the announcement bar below the main header.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="footerHeading"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Footer Heading Text</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Jouwwinkel" {...field} />
                </FormControl>
                <FormDescription>The main brand name displayed in the footer.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Separator />
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Hero Section</h3>
             <FormField
            control={form.control}
            name="heroText1"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hero Text 1 (Subheading)</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Make Your Own" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="heroText2"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hero Text 2 (Main Heading)</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Elevate your style" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="heroText3"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hero Text 3 (Description)</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g. Discover a world of elegance..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Separator />
         <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact & Social</h3>
            <FormField
            control={form.control}
            name="instagramLink"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Instagram Link</FormLabel>
                <FormControl>
                    <Input placeholder="https://instagram.com/your-store" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="whatsappLink"
            render={({ field }) => (
                <FormItem>
                <FormLabel>WhatsApp Link</FormLabel>
                <FormControl>
                    <Input placeholder="https://wa.me/your-number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="storeAddress"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Store Address</FormLabel>
                <FormControl>
                    <Textarea placeholder="123 Main Street, Anytown, AT 12345" {...field} />
                </FormControl>
                <FormDescription>Your physical store address, if applicable.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <Separator />
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Pages</h3>
            <FormField
            control={form.control}
            name="ourStoryContent"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Our Story Page Content</FormLabel>
                <FormControl>
                    <Textarea rows={8} placeholder="Tell your customers about your brand..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
