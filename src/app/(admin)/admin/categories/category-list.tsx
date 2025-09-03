
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateCategory } from '@/lib/firestore.admin';
import { CategoryForm } from './category-form';
import { Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CategoryListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCategoryUpdate: () => void;
}

export function CategoryList({ open, onOpenChange, categories, onCategoryUpdate }: CategoryListProps) {
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleStatusChange = async (category: Category, active: boolean) => {
    try {
      await updateCategory(category.id, { active });
      toast({ title: `Category "${category.name}" ${active ? 'activated' : 'deactivated'}.` });
      onCategoryUpdate();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  }

  const handleUpdate = () => {
    setEditingCategory(null);
    onCategoryUpdate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Existing Categories</DialogTitle>
          <DialogDescription>
            Edit names or toggle activation status for your categories.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh]">
            <div className="overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((cat) => (
                        <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>
                            <Switch
                                checked={cat.active}
                                onCheckedChange={(checked) => handleStatusChange(cat, checked)}
                            />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="border-l pl-8">
                {editingCategory ? (
                    <CategoryForm category={editingCategory} onCategoryUpdated={handleUpdate} />
                ) : (
                    <div className="text-center text-muted-foreground pt-12">
                        <p>Select a category to edit.</p>
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
