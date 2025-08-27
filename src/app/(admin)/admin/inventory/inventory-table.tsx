
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateStock } from '@/lib/firestore.admin';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Save } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface InventoryTableProps {
    products: Product[];
}

// Helper function to generate all combinations of variants
function getVariantCombinations(variants: Product['variants']): string[][] {
    if (!variants || variants.length === 0) {
        return [];
    }

    const [firstVariant, ...restVariants] = variants;
    let combinations = firstVariant.options.map(option => [option]);

    restVariants.forEach(variant => {
        const newCombinations: string[][] = [];
        combinations.forEach(combination => {
            variant.options.forEach(option => {
                newCombinations.push([...combination, option]);
            });
        });
        combinations = newCombinations;
    });

    return combinations;
}


export function InventoryTable({ products: initialProducts }: InventoryTableProps) {
    const { toast } = useToast();
    const [stockLevels, setStockLevels] = useState<{ [key: string]: number | { [key: string]: number } }>({});
    const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
    const [saving, setSaving] = useState(false);

    const products = useMemo(() => initialProducts, [initialProducts]);

    const handleStockChange = (productId: string, value: number, variantKey?: string) => {
        const parsedValue = isNaN(value) ? 0 : value;
        setStockLevels(prev => {
            const newLevels = { ...prev };
            const currentProductStock = prev[productId] || {};
            
            if (variantKey) {
                if (typeof currentProductStock === 'object') {
                    newLevels[productId] = {
                        ...currentProductStock,
                        [variantKey]: parsedValue
                    };
                }
            } else {
                newLevels[productId] = parsedValue;
            }
            return newLevels;
        });
    };

    const handleSave = async (product: Product) => {
        setSaving(true);
        try {
            let stockData = {};
            if (product.hasVariants) {
                const variantStock = { ...product.variantStock };
                const changedVariantStock = stockLevels[product.id] as { [key: string]: number } || {};
                
                Object.keys(changedVariantStock).forEach(key => {
                    variantStock[key] = changedVariantStock[key];
                });
                stockData = { variantStock };
            } else {
                const newStock = stockLevels[product.id] as number ?? product.stock ?? 0;
                stockData = { stock: newStock };
            }

            await updateStock(product.id, stockData);
            toast({ title: "Success", description: `${product.title} stock updated successfully.` });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to update stock.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="w-[150px]">Stock</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product) => {
                    const variantCombinations = product.hasVariants ? getVariantCombinations(product.variants) : [];
                    const isRowOpen = openRows[product.id] ?? false;
                    
                    return (
                        <Collapsible asChild key={product.id} open={isRowOpen} onOpenChange={(open) => setOpenRows(prev => ({...prev, [product.id]: open}))}>
                            <>
                                <TableRow>
                                    <TableCell>
                                        <Image
                                            src={product.images?.[0] || 'https://placehold.co/64x64.png'}
                                            alt={product.title}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover"
                                            data-ai-hint="product image"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{product.title}</div>
                                        {product.hasVariants && <Badge variant="outline">{variantCombinations.length} variants</Badge>}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                    <TableCell>
                                        {!product.hasVariants ? (
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={stockLevels[product.id] as number ?? product.stock ?? 0}
                                                onChange={(e) => handleStockChange(product.id, parseInt(e.target.value))}
                                            />
                                        ) : (
                                           <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-[130px] justify-start">
                                                   {isRowOpen ? 'Hide' : 'Show'} Variants
                                                   {isRowOpen ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button onClick={() => handleSave(product)} disabled={saving} size="sm">
                                            <Save className="h-4 w-4 mr-2"/>
                                            {saving ? 'Saving...' : 'Save'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                {product.hasVariants && (
                                     <CollapsibleContent asChild>
                                        <TableRow>
                                            <TableCell colSpan={5} className="p-0">
                                                <div className="p-4 bg-muted/50">
                                                    <h4 className="font-semibold mb-2">Variant Stock</h4>
                                                     <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Variant</TableHead>
                                                                <TableHead className="w-[150px]">Stock</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {variantCombinations.map(combo => {
                                                                const variantKey = combo.map(c => c.toLowerCase()).join('-');
                                                                const currentStock = (stockLevels[product.id] as { [key: string]: number })?.[variantKey] ?? product.variantStock?.[variantKey] ?? 0;
                                                                return (
                                                                    <TableRow key={variantKey}>
                                                                        <TableCell>{combo.join(' / ')}</TableCell>
                                                                        <TableCell>
                                                                            <Input
                                                                                type="number"
                                                                                className="w-24"
                                                                                value={currentStock}
                                                                                onChange={(e) => handleStockChange(product.id, parseInt(e.target.value), variantKey)}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </CollapsibleContent>
                                )}
                           </>
                        </Collapsible>
                    )
                })}
            </TableBody>
        </Table>
    );
}
