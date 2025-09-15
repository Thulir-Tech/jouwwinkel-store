
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
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UiConfig } from '@/lib/types';
import { updateUiConfig } from '@/lib/firestore.admin';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const bannerItemSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  link: z.string().url({ message: "Please enter a valid link URL." }),
});

const offersFormSchema = z.object({
  offerBanner: z.object({
    enabled: z.boolean().optional(),
    banners: z.array(bannerItemSchema).optional(),
  }).optional(),
  siteWideOffer: z.object({
    enabled: z.boolean().optional(),
    percentage: z.coerce.number().min(0).max(100).optional(),
  }).optional(),
});

type OffersFormValues = z.infer<typeof offersFormSchema>;

interface OffersFormProps {
  initialData: UiConfig | null;
}

export function OffersForm({ initialData }: OffersFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<OffersFormValues>({
    resolver: zodResolver(offersFormSchema),
    defaultValues: {
      offerBanner: {
        enabled: initialData?.offerBanner?.enabled ?? false,
        banners: initialData?.offerBanner?.banners || [],
      },
      siteWideOffer: {
        enabled: initialData?.siteWideOffer?.enabled ?? false,
        percentage: initialData?.siteWideOffer?.percentage || 0,
      }
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'offerBanner.banners',
  });

  const onSubmit = async (data: OffersFormValues) => {
    try {
      await updateUiConfig({ 
        offerBanner: data.offerBanner,
        siteWideOffer: data.siteWideOffer,
       });
      toast({ title: 'Offers & Banners configuration updated successfully' });
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
          <CardHeader><CardTitle>Site-Wide Offer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteWideOffer.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Site-Wide Offer</FormLabel>
                      <FormDescription>
                        Apply a percentage discount to all products.
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
                  name="siteWideOffer.percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 10" {...field} />
                      </FormControl>
                      <FormDescription>Enter a value between 0 and 100.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader><CardTitle>Homepage Popup Banner</CardTitle></CardHeader>
           <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="offerBanner.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Popup Banner</FormLabel>
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
                              src={form.watch(`offerBanner.banners.${index}.imageUrl`) || 'https://placehold.co/128x128.png'}
                              alt={`Banner image ${index + 1}`}
                              width={128}
                              height={128}
                              className="rounded-md object-cover w-32 h-32 self-center"
                          />
                          <FormField
                            control={form.control}
                            name={`offerBanner.banners.${index}.imageUrl`}
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
                            name={`offerBanner.banners.${index}.link`}
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
          </CardContent>
        </Card>
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
