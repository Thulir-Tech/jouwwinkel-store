
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { CategoryForm } from './category-form';
  import { VariantForm } from './variant-form';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CategoryList } from './category-list';
import { VariantList } from './variant-list';
import { getCategories, getVariants } from '@/lib/firestore';
import type { Category, Variant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function PageSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}
  
  export default function CategoriesAndVariantsPage() {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
             const [catData, varData] = await Promise.all([
                getCategories({ activeOnly: false }),
                getVariants()
            ]);
            setCategories(catData);
            setVariants(varData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const onDataChange = () => {
        // Refetch data when changes are made in modals
        fetchData();
    }
    
    if (loading) {
        return <PageSkeleton />;
    }
  
    return (
      <div>
        <CategoryList 
            open={isCategoryModalOpen} 
            onOpenChange={setIsCategoryModalOpen} 
            categories={categories}
            onCategoryUpdate={onDataChange}
        />
        <VariantList
            open={isVariantModalOpen}
            onOpenChange={setIsVariantModalOpen}
            variants={variants}
            onVariantUpdate={onDataChange}
        />

        <h1 className="text-2xl font-bold mb-4">Categories & Variants</h1>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add new product categories.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div>
                <CategoryForm onCategoryAdded={onDataChange} />
              </div>
              <div className="flex flex-col items-start justify-center border-l pl-8">
                 <h3 className="font-semibold mb-2">Manage Existing</h3>
                 <p className="text-sm text-muted-foreground mb-4">Edit names or toggle the status of your existing categories.</p>
                 <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>Manage Categories ({categories.length})</Button>
              </div>
            </CardContent>
          </Card>
          
          <Separator />

          <Card>
             <CardHeader>
              <CardTitle>Manage Variants</CardTitle>
              <CardDescription>Create new product variants like Size or Color.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
               <div>
                <VariantForm onVariantAdded={onDataChange} />
              </div>
               <div className="flex flex-col items-start justify-center border-l pl-8">
                 <h3 className="font-semibold mb-2">Manage Existing</h3>
                 <p className="text-sm text-muted-foreground mb-4">Edit names, options, or delete existing variants.</p>
                 <Button variant="outline" onClick={() => setIsVariantModalOpen(true)}>Manage Variants ({variants.length})</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
