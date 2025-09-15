

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { HeroMediaConfig, UiConfig } from '@/lib/types';
import { updateUiConfig } from '@/lib/firestore.admin';
import { Separator } from '@/components/ui/separator';
import { Trash2, Link as LinkIcon, Upload, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaUploader } from '../media-uploader';
import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';


const heroMediaConfigSchema = z.object({
    showHero: z.boolean().optional(),
    viewType: z.enum(['default', 'static', 'carousel']).optional(),
    fileType: z.enum(['image', 'video']).optional(),
    mediaItems: z.array(z.string()).optional(),
}).optional();


const configFormSchema = z.object({
  browserTitle: z.string().optional(),
  cardColor: z.enum(['white', 'theme']).optional(),
  headerCaptionType: z.enum(['static', 'carousel']).optional(),
  headerCaptionStatic: z.string().optional(),
  headerCaptionCarousel: z.array(z.string().min(1, 'Carousel item cannot be empty')).optional(),
  footerHeading: z.string().optional(),
  footerCaption: z.string().optional(),
  instagramLink: z.string().url().or(z.literal('')).optional(),
  whatsappLink: z.string().url().or(z.literal('')).optional(),
  storeAddress: z.string().optional(),
  productShareText: z.string().optional(),
  
  heroDesktop: heroMediaConfigSchema,
  heroMobile: heroMediaConfigSchema,

  heroText1: z.string().optional(),
  heroText1Color: z.string().optional(),
  heroText2: z.string().optional(),
  heroText2Color: z.string().optional(),
  heroText3: z.string().optional(),
  heroText3Color: z.string().optional(),
  ourStoryContent: z.string().optional(),
  ourStoryImageUrl: z.array(z.string()).optional(),
  brandLogoUrl: z.array(z.string()).optional(),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

interface ConfigFormProps {
  initialData: UiConfig | null;
}

function HeroMediaManager({ control, namePrefix, isMobile }: { control: Control<ConfigFormValues>, namePrefix: 'heroDesktop' | 'heroMobile', isMobile: boolean }) {
    const { toast } = useToast();
    const [addMethod, setAddMethod] = useState<'upload' | 'link'>('upload');
    const [newMediaUrl, setNewMediaUrl] = useState('');
    const { fields: mediaFields, append, remove } = useFieldArray({
        control,
        name: `${namePrefix}.mediaItems`,
    });

    const viewType = useWatch({ control, name: `${namePrefix}.viewType` });
    const fileType = useWatch({ control, name: `${namePrefix}.fileType` });
    const mediaItems = useWatch({ control, name: `${namePrefix}.mediaItems` }) || [];

    const handleAddFromLink = () => {
        if (!newMediaUrl || !newMediaUrl.startsWith('http')) {
            toast({ title: "Invalid URL", description: "Please enter a valid media URL.", variant: "destructive" });
            return;
        }
        if (viewType === 'static' && mediaItems.length >= 1) {
            toast({ title: "Limit reached", description: "You can only add one media item for the static view.", variant: "destructive" });
            return;
        }
        append(newMediaUrl);
        setNewMediaUrl('');
    };

    const handleAddFromUploader = (urls: string[]) => {
        if (viewType === 'static' && mediaItems.length + urls.length > 1) {
            toast({ title: "Limit reached", description: "You can only add one media item for the static view.", variant: "destructive" });
            return;
        }
        urls.forEach(url => append(url));
    }

    if (viewType === 'default') return null;

    return (
        <div className="space-y-4 p-4 border rounded-md">
            <FormField
                control={control}
                name={`${namePrefix}.fileType`}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>File Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select file type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Separator />

            <div className="space-y-4">
                <FormLabel>Add Media</FormLabel>
                <FormDescription>
                    Recommended Ratio: {isMobile ? 'Portrait 9:16' : 'Landscape 16:9'}
                </FormDescription>
                <RadioGroup value={addMethod} onValueChange={(value) => setAddMethod(value as 'upload' | 'link')} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id={`${namePrefix}-upload`} />
                        <Label htmlFor={`${namePrefix}-upload`} className="flex items-center gap-2"><Upload className="h-4 w-4"/>Upload</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="link" id={`${namePrefix}-link`} />
                        <Label htmlFor={`${namePrefix}-link`} className="flex items-center gap-2"><LinkIcon className="h-4 w-4" />Link</Label>
                    </div>
                </RadioGroup>

                {addMethod === 'upload' ? (
                    <MediaUploader 
                        value={[]}
                        onChange={handleAddFromUploader}
                        fileTypes={[fileType === 'video' ? 'video' : 'image']}
                        maxFiles={viewType === 'static' ? 1 : 0}
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <Input
                            type="url"
                            placeholder="https://example.com/media.jpg"
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                        />
                        <Button type="button" onClick={handleAddFromLink}>Add Media</Button>
                    </div>
                )}
            </div>

                {mediaItems.length > 0 && (
                <div className="space-y-2">
                    <FormLabel>Current Media</FormLabel>
                    {mediaFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                            {fileType === 'video' ? (
                                <div className="h-10 w-10 bg-black rounded-md flex items-center justify-center">
                                    <Video className="h-6 w-6 text-white" />
                                </div>
                            ) : (
                                mediaItems[index] && <Image src={mediaItems[index]} alt={`Media item ${index}`} width={40} height={40} className="rounded-md object-cover" />
                            )}
                            <p className="flex-grow text-xs text-muted-foreground truncate">{mediaItems[index]}</p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export function ConfigForm({ initialData }: ConfigFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      browserTitle: initialData?.browserTitle || '',
      cardColor: initialData?.cardColor || 'white',
      headerCaptionType: initialData?.headerCaptionType || 'static',
      headerCaptionStatic: initialData?.headerCaptionStatic || '',
      headerCaptionCarousel: initialData?.headerCaptionCarousel || [],
      footerHeading: initialData?.footerHeading || '',
      footerCaption: initialData?.footerCaption || '',
      instagramLink: initialData?.instagramLink || '',
      whatsappLink: initialData?.whatsappLink || '',
      storeAddress: initialData?.storeAddress || '',
      productShareText: initialData?.productShareText || '',

      heroDesktop: {
        showHero: initialData?.heroDesktop?.showHero ?? true,
        viewType: initialData?.heroDesktop?.viewType || 'default',
        fileType: initialData?.heroDesktop?.fileType || 'image',
        mediaItems: initialData?.heroDesktop?.mediaItems || [],
      },
      heroMobile: {
        showHero: initialData?.heroMobile?.showHero ?? true,
        viewType: initialData?.heroMobile?.viewType || 'default',
        fileType: initialData?.heroMobile?.fileType || 'image',
        mediaItems: initialData?.heroMobile?.mediaItems || [],
      },

      heroText1: initialData?.heroText1 || '',
      heroText1Color: initialData?.heroText1Color || '#FFFFFF',
      heroText2: initialData?.heroText2 || '',
      heroText2Color: initialData?.heroText2Color || '#FFFFFF',
      heroText3: initialData?.heroText3 || '',
      heroText3Color: initialData?.heroText3Color || '#E5E7EB',
      ourStoryContent: initialData?.ourStoryContent || '',
      ourStoryImageUrl: initialData?.ourStoryImageUrl ? [initialData.ourStoryImageUrl] : [],
      brandLogoUrl: initialData?.brandLogoUrl ? [initialData.brandLogoUrl] : [],
    },
  });

  const { fields: carouselFields, append: appendCarousel, remove: removeCarousel } = useFieldArray({
    control: form.control,
    name: "headerCaptionCarousel",
  });
  
  const captionType = form.watch('headerCaptionType');
  const heroDesktopViewType = form.watch('heroDesktop.viewType');
  const heroMobileViewType = form.watch('heroMobile.viewType');


  const onSubmit = async (data: ConfigFormValues) => {
    try {
      const finalData: Partial<UiConfig> = {
        ...data,
        brandLogoUrl: data.brandLogoUrl?.[0] || '',
        ourStoryImageUrl: data.ourStoryImageUrl?.[0] || '',
      };
      
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
            <CardHeader><CardTitle>General</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="browserTitle"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Browser Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. My Awesome Store" {...field} />
                        </FormControl>
                        <FormDescription>The text displayed in the browser tab.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="cardColor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Storefront Card Color</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select card color" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="white">White</SelectItem>
                                    <SelectItem value="theme">Theme Background</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>The background color for product and login cards on your site.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="brandLogoUrl"
                    render={({ field }) => (
                        <FormItem>
                             <FormLabel>Brand Logo</FormLabel>
                             <FormDescription>Upload your store logo. Recommended size: 200x100 pixels.</FormDescription>
                            <FormControl>
                                <MediaUploader 
                                    value={field.value || []} 
                                    onChange={field.onChange}
                                    fileTypes={['image']}
                                    maxFiles={1}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Header &amp; Footer</h3>
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
            <FormField
            control={form.control}
            name="footerCaption"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Footer Caption Text</FormLabel>
                <FormControl>
                    <Textarea placeholder="Elevate your style with our curated collection." {...field} />
                </FormControl>
                <FormDescription>A short description displayed below the footer heading.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Separator />
        <Card>
            <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <Tabs defaultValue="desktop" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="desktop">Desktop</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="desktop" className="w-full">
                        <Card>
                            <CardContent className="space-y-4 pt-6">
                                <FormField
                                    control={form.control}
                                    name="heroDesktop.showHero"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Show Hero Section</FormLabel>
                                            <FormDescription>
                                                Toggle the visibility of the hero section on desktop.
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
                                    name="heroDesktop.viewType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>View Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select view type" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="default">Colors by Default</SelectItem>
                                                    <SelectItem value="static">Static Media</SelectItem>
                                                    <SelectItem value="carousel">Carousel</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Choose how the hero section is displayed on desktop.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {heroDesktopViewType !== 'default' && <HeroMediaManager control={form.control} namePrefix="heroDesktop" isMobile={false} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="mobile" className="w-full">
                        <Card>
                             <CardContent className="space-y-4 pt-6">
                                <FormField
                                    control={form.control}
                                    name="heroMobile.showHero"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Show Hero Section</FormLabel>
                                            <FormDescription>
                                                Toggle the visibility of the hero section on mobile.
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
                                    name="heroMobile.viewType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>View Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select view type" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="default">Colors by Default</SelectItem>
                                                    <SelectItem value="static">Static Media</SelectItem>
                                                    <SelectItem value="carousel">Carousel</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Choose how the hero section is displayed on mobile.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {heroMobileViewType !== 'default' && <HeroMediaManager control={form.control} namePrefix="heroMobile" isMobile={true} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                 </Tabs>

                 <Separator />
                <h4 className="font-medium pt-4">Hero Text Content (Shared)</h4>
                 <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_auto] items-end gap-2">
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
                            name="heroText1Color"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input type="color" {...field} className="h-10 w-16 p-1" />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-[1fr_auto] items-end gap-2">
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
                            name="heroText2Color"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input type="color" {...field} className="h-10 w-16 p-1" />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-[1fr_auto] items-end gap-2">
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
                         <FormField
                            control={form.control}
                            name="heroText3Color"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input type="color" {...field} className="h-10 w-16 p-1" />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

            </CardContent>
        </Card>
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
             <FormField
                control={form.control}
                name="productShareText"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Product Share Text</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Check out this product: {productName}" {...field} />
                    </FormControl>
                    <FormDescription>
                        This text will be used when sharing a product. Use {'{productName}'} as a placeholder for the product title.
                    </FormDescription>
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
                name="ourStoryImageUrl"
                render={({ field }) => (
                    <FormItem>
                            <FormLabel>Our Story Image</FormLabel>
                            <FormDescription>Upload a banner image for the Our Story page.</FormDescription>
                        <FormControl>
                            <MediaUploader 
                                value={field.value || []} 
                                onChange={field.onChange}
                                fileTypes={['image']}
                                maxFiles={1}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
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
