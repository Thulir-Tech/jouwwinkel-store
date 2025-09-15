
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UiConfig, OfferBannerItem } from '@/lib/types';
import { updateUiConfig } from '@/lib/firestore.admin';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const bannerItemSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  link: z.string().url({ message: "Please enter a valid link URL." }),
});

const bannerFormSchema = z.object({
  enabled: z.boolean().optional(),
  banners: z.array(bannerItemSchema).optional(),
});

type BannerFormValues = z.infer<typeof bannerFormSchema>;

interface BannerFormProps {
  initialData: UiConfig['offerBanner'] | null;
}

export function BannerForm({ initialData }: BannerFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      enabled: initialData?.enabled ?? false,
      banners: initialData?.banners || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'banners',
  });

  const onSubmit = async (data: BannerFormValues) => {
    try {
      await updateUiConfig({ offerBanner: data });
      toast({ title: 'Offer banner configuration updated successfully' });
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
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Offer Banner</FormLabel>
                <FormDescription>
                  Show the promotional banner popup on the homepage.
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

        <div className="space-y-6">
            <h3 className="text-base font-medium">Banner Images</h3>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 p-4 border rounded-lg bg-background relative">
                   <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Image
                        src={form.watch(`banners.${index}.imageUrl`) || 'https://placehold.co/128x128.png'}
                        alt={`Banner image ${index + 1}`}
                        width={128}
                        height={128}
                        className="rounded-md object-cover w-32 h-32 self-center"
                    />
                    <FormField
                      control={form.control}
                      name={`banners.${index}.imageUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`banners.${index}.link`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Link URL</FormLabel>
                          <FormControl>
                            <Input placeholder="/products/some-product" {...field} />
                          </FormControl>
                          <FormDescription>The page to go to when the button is clicked.</FormDescription>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ imageUrl: '', link: '' })}
            >
              Add Banner
            </Button>
        </div>
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
