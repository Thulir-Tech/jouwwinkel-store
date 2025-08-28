
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Combo, Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { addCombo, updateCombo } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '@/components/ui/multi-select';
import { MediaUploader } from '../media-uploader';
import { Trash2 } from 'lucide-react';

const comboFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  compareAtPrice: z.coerce.number().optional(),
  revenuePerUnit: z.coerce.number().optional(),
  profitPerUnit: z.coerce.number().optional(),
  active: z.boolean(),
  onSale: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(z.string()).optional(),
  productIds: z.array(z.string()).min(2, 'A combo must have at least 2 products.'),
  hasHighlights: z.boolean(),
  highlights: z.array(z.string().min(1, 'Highlight cannot be empty')).optional(),
});

type ComboFormValues = z.infer<typeof comboFormSchema>;

interface ComboFormProps {
  combo?: Combo;
  products: Product[];
}

export function ComboForm({ combo, products }: ComboFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ComboFormValues>({
    resolver: zodResolver(comboFormSchema),
    defaultValues: {
      title: combo?.title || '',
      description: combo?.description || '',
      price: combo?.price || 0,
      compareAtPrice: combo?.compareAtPrice,
      revenuePerUnit: combo?.revenuePerUnit,
      profitPerUnit: combo?.profitPerUnit,
      active: combo?.active ?? true,
      onSale: combo?.onSale ?? false,
      isFeatured: combo?.isFeatured ?? false,
      images: combo?.images || [],
      productIds: combo?.productIds || [],
      hasHighlights: combo?.hasHighlights || false,
      highlights: combo?.highlights || [],
    },
  });
  
  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control: form.control,
    name: 'highlights',
  });

  const hasHighlights = form.watch('hasHighlights');

  const onSubmit = async (data: ComboFormValues) => {
    try {
      if (combo) {
        await updateCombo(combo.id, data);
        toast({ title: 'Combo updated successfully' });
      } else {
        await addCombo(data);
        toast({ title: 'Combo created successfully' });
      }
      router.push('/admin/combos');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the combo.',
        variant: 'destructive',
      });
    }
  };
  
  const productOptions = products.map(p => ({ value: p.id, label: p.title }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Combo Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Summer Sticker Pack" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about the combo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Images</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Combo Media</FormLabel>
                                <FormControl>
                                    <MediaUploader 
                                        value={field.value || []} 
                                        onChange={field.onChange}
                                        fileTypes={['image']}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle className="text-base">Products in this Combo</CardTitle></CardHeader>
              <CardContent>
                 <FormField
                    control={form.control}
                    name="productIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select Products</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    options={productOptions}
                                    selected={field.value || []}
                                    onChange={field.onChange}
                                    placeholder="Select at least 2 products..."
                                />
                            </FormControl>
                            <FormDescription>
                                The products that make up this combo bundle.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                      control={form.control}
                      name="hasHighlights"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Combo has highlights</FormLabel>
                            <FormDescription>
                              Enable to add key feature bullet points for the combo.
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

                    {hasHighlights && (
                        <div className="space-y-4 pt-4">
                            {highlightFields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`highlights.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormControl>
                                                    <Input placeholder={`Highlight ${index + 1}`} {...field} />
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
                                        onClick={() => removeHighlight(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                             <Button
                                type="button"
                                variant="outline"
                                onClick={() => appendHighlight('')}
                            >
                                Add Point
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="compareAtPrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Compare-at Price</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormDescription>
                            To show a sale, enter a value higher than the price.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <FormField
                  control={form.control}
                  name="onSale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show 'Sale' Tag</FormLabel>
                        <FormDescription>
                          Display a sale badge on the combo.
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Financials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="revenuePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Per Unit</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        The revenue generated from selling one unit of this combo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="profitPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit Per Unit</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        The profit generated from selling one unit of this combo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          This combo will be visible on your storefront.
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
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Combo</FormLabel>
                        <FormDescription>
                          Display this combo on the homepage.
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
              </CardContent>
            </Card>
          </div>
        </div>
        <Button type="submit">
          {combo ? 'Save Changes' : 'Create Combo'}
        </Button>
      </form>
    </Form>
  );
}
