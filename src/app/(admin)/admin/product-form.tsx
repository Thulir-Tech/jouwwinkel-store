
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Category, Product, ProductVariant, Variant } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { addProduct, updateProduct } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { MultiSelect } from '@/components/ui/multi-select';
import { MediaUploader } from '../media-uploader';
import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';

const productVariantSchema = z.object({
  variantId: z.string().min(1, 'Variant type is required.'),
  variantName: z.string(),
  options: z.array(z.string()).min(1, 'Please select at least one option.'),
});

const productFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  compareAtPrice: z.coerce.number().optional(),
  revenuePerUnit: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  active: z.boolean(),
  onSale: z.boolean(),
  isFeatured: z.boolean(),
  sku: z.string().optional(),
  tags: z.string().optional(),
  relatedProductIds: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  hasVariants: z.boolean(),
  variants: z.array(productVariantSchema).optional(),
  hasHighlights: z.boolean(),
  highlights: z.array(z.string().min(1, 'Highlight cannot be empty')).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  selectableProducts: Product[];
  allVariants: Variant[];
}

export function ProductForm({ product, categories, selectableProducts, allVariants }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product?.price || 0,
      compareAtPrice: product?.compareAtPrice,
      revenuePerUnit: product?.revenuePerUnit,
      categoryId: product?.categoryId || '',
      active: product?.active ?? true,
      onSale: product?.onSale ?? false,
      isFeatured: product?.isFeatured ?? false,
      sku: product?.sku || '',
      tags: product?.tags?.join(', ') || '',
      relatedProductIds: product?.relatedProductIds || [],
      images: product?.images || [],
      hasVariants: product?.hasVariants || false,
      variants: product?.variants || [],
      hasHighlights: product?.hasHighlights || false,
      highlights: product?.highlights || [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  });
  
  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control: form.control,
    name: 'highlights',
  });

  const hasVariants = form.watch('hasVariants');
  const hasHighlights = form.watch('hasHighlights');

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const productData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };

      if (product) {
        await updateProduct(product.id, productData);
        toast({ title: 'Product updated successfully' });
      } else {
        await addProduct(productData);
        toast({ title: 'Product created successfully' });
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the product.',
        variant: 'destructive',
      });
    }
  };
  
  const productOptions = selectableProducts.map(p => ({ value: p.id, label: p.title }));

  const selectedVariantIds = useMemo(() => {
    return form.watch('variants')?.map(v => v.variantId) || [];
  }, [form.watch('variants')]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Stylish Watch" {...field} />
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
                          placeholder="Tell us a little bit about the product"
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
                                <FormLabel>Product Media</FormLabel>
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
                            <FormLabel>Product has highlights</FormLabel>
                            <FormDescription>
                              Enable to add key feature bullet points for the product.
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
                    <CardTitle className="text-base">Variants</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                      control={form.control}
                      name="hasVariants"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Product has variants</FormLabel>
                            <FormDescription>
                              Enable this if your product comes in different options like color or size.
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

                    {hasVariants && (
                        <div className="space-y-4 pt-4">
                            {variantFields.map((field, index) => {
                                const selectedVariant = allVariants.find(v => v.id === form.watch(`variants.${index}.variantId`));
                                const variantOptions = selectedVariant ? selectedVariant.options.map(o => ({ value: o, label: o })) : [];

                                return (
                                    <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                                         <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                                            onClick={() => removeVariant(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.variantId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Variant Type</FormLabel>
                                                        <Select 
                                                            onValueChange={(value) => {
                                                                const variant = allVariants.find(v => v.id === value);
                                                                field.onChange(value);
                                                                form.setValue(`variants.${index}.variantName`, variant?.name || '');
                                                                form.setValue(`variants.${index}.options`, []); // Reset options when type changes
                                                            }} 
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a variant type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {allVariants.map(v => (
                                                                    <SelectItem 
                                                                        key={v.id} 
                                                                        value={v.id}
                                                                        disabled={selectedVariantIds.includes(v.id) && v.id !== field.value}
                                                                    >
                                                                        {v.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.options`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Available Options</FormLabel>
                                                        <FormControl>
                                                             <MultiSelect
                                                                options={variantOptions}
                                                                selected={field.value || []}
                                                                onChange={field.onChange}
                                                                placeholder="Select options..."
                                                                disabled={!form.watch(`variants.${index}.variantId`)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )
                            })}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => appendVariant({ variantId: '', variantName: '', options: [] })}
                                disabled={variantFields.length >= allVariants.length}
                            >
                                Add Variant Type
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
                          Display a sale badge on the product.
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
                <CardTitle className="text-base">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
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
                        The revenue generated from selling one unit of this item. Used for analytics.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                      <FormControl>
                        <Input placeholder="STICKER-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Related Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="relatedProductIds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Suggestions</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={productOptions}
                                        selected={field.value || []}
                                        onChange={field.onChange}
                                        placeholder="Select products to recommend..."
                                    />
                                </FormControl>
                                <FormDescription>
                                    These products will be shown in the "You Might Also Like" section.
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
                <CardTitle className="text-base">Organize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. cute, planner, journal" {...field} />
                      </FormControl>
                       <FormDescription>
                        Comma-separated values.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                          This product will be visible on your storefront.
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
                        <FormLabel>Featured Product</FormLabel>
                        <FormDescription>
                          Display this product on the homepage.
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
          {product ? 'Save Changes' : 'Create Product'}
        </Button>
      </form>
    </Form>
  );
}
