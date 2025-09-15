
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const settingsFormSchema = z.object({
  paymentMethods: z.object({
    cod: z.boolean().optional(),
    upi: z.boolean().optional(),
  }).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  initialData: UiConfig | null;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      paymentMethods: {
        cod: initialData?.paymentMethods?.cod ?? true,
        upi: initialData?.paymentMethods?.upi ?? true,
      },
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateUiConfig({ 
        paymentMethods: data.paymentMethods,
       });
      toast({ title: 'Settings updated successfully' });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
          <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
          <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enable or disable the payment methods available at checkout.
              </p>
              <FormField
                control={form.control}
                name="paymentMethods.cod"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Cash on Delivery (COD)</FormLabel>
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
                name="paymentMethods.upi"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">UPI</FormLabel>
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
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
