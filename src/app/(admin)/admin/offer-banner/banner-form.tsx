
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
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UiConfig } from '@/lib/types';
import { updateUiConfig } from '@/lib/firestore.admin';
import { MediaUploader } from '../media-uploader';

const bannerFormSchema = z.object({
  enabled: z.boolean().optional(),
  images: z.array(z.string()).optional(),
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
      images: initialData?.images || [],
    },
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

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Banner Images</FormLabel>
              <FormDescription>
                Upload one or more images. If multiple are uploaded, they will display in a carousel.
              </FormDescription>
              <FormControl>
                <MediaUploader 
                  value={field.value || []} 
                  onChange={field.onChange}
                  fileTypes={['image']}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
