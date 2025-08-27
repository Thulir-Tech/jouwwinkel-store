
'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface VariantSelectorProps {
  product: Product;
  selectedVariants: Record<string, string>;
  onVariantChange: (newVariants: Record<string, string>) => void;
}

export default function VariantSelector({ product, selectedVariants, onVariantChange }: VariantSelectorProps) {
  if (!product.hasVariants) {
    return null;
  }

  const handleSelection = (variantName: string, option: string) => {
    onVariantChange({
      ...selectedVariants,
      [variantName]: option,
    });
  };

  return (
    <div className="space-y-4">
      {product.variants.map((variant) => (
        <Card key={variant.variantId}>
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
                            className="cursor-pointer rounded-md border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
