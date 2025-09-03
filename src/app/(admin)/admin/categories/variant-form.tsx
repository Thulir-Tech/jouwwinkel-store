
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
import { addVariant, updateVariant } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import type { Variant } from '@/lib/types';
import { useEffect } from 'react';

const variantFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Variant name is required.',
  }),
  options: z.string().min(1, {
    message: 'Please enter at least one option.',
  })
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface VariantFormProps {
    variant?: Variant;
    onVariantAdded?: () => void;
    onVariantUpdated?: () => void;
}

export function VariantForm({ variant, onVariantAdded, onVariantUpdated }: VariantFormProps) {
  const { toast } = useToast();
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: '',
      options: '',
    },
  });

  useEffect(() => {
    if (variant) {
        form.reset({
            name: variant.name,
            options: variant.options.join(', ')
        });
    }
  }, [variant, form]);

  const onSubmit = async (data: VariantFormValues) => {
    try {
      const optionsArray = data.options.split(',').map(opt => opt.trim()).filter(Boolean);
      if (optionsArray.length === 0) {
        form.setError('options', { message: 'Please enter at least one option.' });
        return;
      }
      
      const payload = { name: data.name, options: optionsArray };

      if (variant) {
        await updateVariant(variant.id, payload);
        toast({ title: 'Variant updated successfully' });
        if (onVariantUpdated) onVariantUpdated();
      } else {
        await addVariant(payload);
        toast({ title: 'Variant added successfully' });
        form.reset();
        if (onVariantAdded) onVariantAdded();
      }

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the variant.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-semibold">{variant ? 'Edit Variant' : 'Add New Variant Type'}</h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Color" {...field} />
              </FormControl>
              <FormDescription>The name of the variant type, like 'Size' or 'Color'.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="options"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Options</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Red, Green, Blue" {...field} />
              </FormControl>
               <FormDescription>Comma-separated values for the variant options.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{variant ? 'Save Changes' : 'Add Variant'}</Button>
      </form>
    </Form>
  );
}
