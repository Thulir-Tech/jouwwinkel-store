
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
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Link as LinkIcon, Upload, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

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
  const [addMethod, setAddMethod] = useState<'upload' | 'link'>('upload');
  const [newImageUrl, setNewImageUrl] = useState('');

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

  const handleAddFromUploader = (urls: string[]) => {
    const currentImages = form.getValues('images') || [];
    form.setValue('images', [...currentImages, ...urls]);
  };

  const handleAddFromLink = () => {
    if (!newImageUrl || !newImageUrl.startsWith('http')) {
        toast({ title: "Invalid URL", description: "Please enter a valid image URL.", variant: "destructive" });
        return;
    }
    const currentImages = form.getValues('images') || [];
    form.setValue('images', [...currentImages, newImageUrl]);
    setNewImageUrl('');
  };

  const handleDelete = (urlToDelete: string) => {
    const currentImages = form.getValues('images') || [];
    form.setValue('images', currentImages.filter(url => url !== urlToDelete));
  };
  
  const images = form.watch('images') || [];

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
            <FormLabel className="text-base">Banner Images</FormLabel>
             <FormDescription>
                Upload one or more images. If multiple are uploaded, they will display in a carousel.
              </FormDescription>

            {images.length > 0 && (
                <div className="space-y-2">
                    {images.map((url, index) => (
                    <div
                        key={url + index}
                        className="flex items-center gap-2 p-2 border rounded-lg bg-background"
                    >
                        <Image
                            src={url}
                            alt={`Banner image ${index + 1}`}
                            width={64}
                            height={64}
                            className="rounded-md object-cover w-16 h-16"
                        />
                        <p className="flex-grow text-xs text-muted-foreground truncate">{url}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(url)}
                            type="button"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
            )}

            <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium">Add New Image</h4>
                <RadioGroup value={addMethod} onValueChange={(value) => setAddMethod(value as 'upload' | 'link')} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="upload" />
                        <Label htmlFor="upload" className="flex items-center gap-2"><Upload className="h-4 w-4"/>Upload File</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="link" id="link" />
                        <Label htmlFor="link" className="flex items-center gap-2"><LinkIcon className="h-4 w-4" />Image URL</Label>
                    </div>
                </RadioGroup>

                {addMethod === 'upload' ? (
                <MediaUploader
                    value={[]}
                    onChange={handleAddFromUploader}
                    fileTypes={['image']}
                />
                ) : (
                <div className="flex items-center gap-2">
                    <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddFromLink}>Add Image</Button>
                </div>
                )}
            </div>
        </div>
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
