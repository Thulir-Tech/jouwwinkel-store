
'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  product: Product;
  selectedVariants: Record<string, string>;
  onVariantChange: (newVariants: Record<string, string>) => void;
}

export default function VariantSelector({ product, selectedVariants, onVariantChange }: VariantSelectorProps) {
  const { uiConfig } = useAuth();
  
  if (!product.hasVariants) {
    return null;
  }

  const handleSelection = (variantName: string, option: string) => {
    onVariantChange({
      ...selectedVariants,
      [variantName]: option,
    });
  };
  
  const cardColorClass = uiConfig?.cardColor === 'white' ? 'bg-white' : 'bg-card';

  return (
    <div className="space-y-4">
      {product.variants.map((variant) => (
        <Card key={variant.variantId} className={cn(cardColorClass, "border-primary/20")}>
            <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">Select {variant.variantName}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                 <RadioGroup
                    value={selectedVariants[variant.variantName] || ''}
                    onValueChange={(value) => handleSelection(variant.variantName, value)}
                    className="flex flex-wrap gap-2"
                >
                    {variant.options.map((option) => (
                    <div key={option}>
                        <RadioGroupItem value={option} id={`${variant.variantName}-${option}`} className="peer sr-only" />
                        <Label
                            htmlFor={`${variant.variantName}-${option}`}
                            className="cursor-pointer rounded-md border-2 border-primary/30 bg-primary/10 px-4 py-2 text-primary hover:bg-primary/20 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary"
                        >
                            {option}
                        </Label>
                    </div>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
      ))}
    </div>
  );
}
