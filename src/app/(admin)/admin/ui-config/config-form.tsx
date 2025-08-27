
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UiConfig } from '@/lib/types';
import { updateUiConfig } from '@/lib/firestore.admin';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '../products/image-uploader';

const configFormSchema = z.object({
  headerCaptionType: z.enum(['static', 'carousel']).optional(),
  headerCaptionStatic: z.string().optional(),
  headerCaptionCarousel: z.array(z.string().min(1, 'Carousel item cannot be empty')).optional(),
  footerHeading: z.string().optional(),
  instagramLink: z.string().url().or(z.literal('')).optional(),
  whatsappLink: z.string().url().or(z-literal('')).optional(),
  storeAddress: z.string().optional(),
  heroText1: z.string().optional(),
  heroText2: z.string().optional(),
  heroText3: z.string().optional(),
  ourStoryContent: z.string().optional(),
  brandLogoUrl: z.array(z.string()).optional(),
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
      headerCaptionType: initialData?.headerCaptionType || 'static',
      headerCaptionStatic: initialData?.headerCaptionStatic || '',
      headerCaptionCarousel: initialData?.headerCaptionCarousel || [],
      footerHeading: initialData?.footerHeading || '',
      instagramLink: initialData?.instagramLink || '',
      whatsappLink: initialData?.whatsappLink || '',
      storeAddress: initialData?.storeAddress || '',
      heroText1: initialData?.heroText1 || '',
      heroText2: initialData?.heroText2 || '',
      heroText3: initialData?.heroText3 || '',
      ourStoryContent: initialData?.ourStoryContent || '',
      brandLogoUrl: initialData?.brandLogoUrl ? [initialData.brandLogoUrl] : [],
    },
  });

  const { fields: carouselFields, append: appendCarousel, remove: removeCarousel } = useFieldArray({
    control: form.control,
    name: "headerCaptionCarousel",
  });

  const captionType = form.watch('headerCaptionType');

  const onSubmit = async (data: ConfigFormValues) => {
    try {
      const finalData = {
        ...data,
        brandLogoUrl: data.brandLogoUrl?.[0] || '',
      }
      await updateUiConfig(finalData);
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
        <Card>
            <CardHeader><CardTitle>Brand Logo</CardTitle></CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="brandLogoUrl"
                    render={({ field }) => (
                        <FormItem>
                             <FormDescription>Upload your store logo. Recommended size: 200x100 pixels.</FormDescription>
                            <FormControl>
                                <ImageUploader 
                                    value={field.value || []} 
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">General</h3>
            <FormField
              control={form.control}
              name="headerCaptionType"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Header Caption Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select caption type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="static">Static Text</SelectItem>
                            <SelectItem value="carousel">Carousel</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>Choose how the announcement in the header is displayed.</FormDescription>
                    <FormMessage />
                  </FormItem>
              )}
            />

            {captionType === 'static' && (
                 <FormField
                    control={form.control}
                    name="headerCaptionStatic"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Header Caption Text</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Pan India Free Shipping" {...field} />
                        </FormControl>
                        <FormDescription>The text displayed in the announcement bar.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {captionType === 'carousel' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <FormLabel>Carousel Items</FormLabel>
                    <FormDescription>Add points that will be displayed in a sliding carousel.</FormDescription>
                    {carouselFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name={`headerCaptionCarousel.${index}`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormControl>
                                            <Input placeholder={`Carousel item ${index + 1}`} {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                                <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => removeCarousel(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendCarousel('')}
                    >
                        Add Point
                    </Button>
                </div>
            )}
           
            <Separator />

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
