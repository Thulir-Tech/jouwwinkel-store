
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addCategory, updateCategory } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { useEffect } from 'react';

const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
    category?: Category;
    onCategoryAdded?: () => void;
    onCategoryUpdated?: () => void;
}

export function CategoryForm({ category, onCategoryAdded, onCategoryUpdated }: CategoryFormProps) {
  const { toast } = useToast();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (category) {
        form.reset({ name: category.name });
    }
  }, [category, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (category) {
        await updateCategory(category.id, data);
        toast({ title: 'Category updated successfully' });
        if (onCategoryUpdated) onCategoryUpdated();
      } else {
        await addCategory(data);
        toast({ title: 'Category added successfully' });
        form.reset();
        if (onCategoryAdded) onCategoryAdded();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the category.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-semibold">{category ? 'Edit Category' : 'Add New Category'}</h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Stickers" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{category ? 'Save Changes' : 'Add Category'}</Button>
      </form>
    </Form>
  );
}
