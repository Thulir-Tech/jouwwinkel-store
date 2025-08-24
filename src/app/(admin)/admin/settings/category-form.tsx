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
import { addCategory } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await addCategory(data);
      toast({ title: 'Category added successfully' });
      form.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while adding the category.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-semibold">Add New Category</h3>
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
        <Button type="submit">Add Category</Button>
      </form>
    </Form>
  );
}
