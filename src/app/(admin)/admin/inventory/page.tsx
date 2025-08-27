
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getProducts, getCategories } from '@/lib/firestore';
import { InventoryTable } from './inventory-table';
import type { Product, Category } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

function InventoryPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        sku: '',
        categoryId: 'all',
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories(),
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const { name, sku, categoryId } = filters;
            if (name && !product.title.toLowerCase().includes(name.toLowerCase())) return false;
            if (sku && !(product.sku || '').toLowerCase().includes(sku.toLowerCase())) return false;
            if (categoryId !== 'all' && product.categoryId !== categoryId) return false;
            return true;
        });
    }, [products, filters]);

    if (loading) {
        return <InventoryPageSkeleton />;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                    Update stock levels for your products and their variants.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
                    <Input
                        placeholder="Filter by Product Name..."
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                    />
                     <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange('categoryId', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Filter by SKU..."
                        value={filters.sku}
                        onChange={(e) => handleFilterChange('sku', e.target.value)}
                    />
                </div>
                <InventoryTable products={filteredProducts} />
                 {filteredProducts.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        No products found matching your filters.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
