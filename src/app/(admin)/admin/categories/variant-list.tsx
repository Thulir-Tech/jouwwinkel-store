
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
import type { Variant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { deleteVariant } from '@/lib/firestore.admin';
import { VariantForm } from './variant-form';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"

interface VariantListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variants: Variant[];
  onVariantUpdate: () => void;
}

export function VariantList({ open, onOpenChange, variants, onVariantUpdate }: VariantListProps) {
  const { toast } = useToast();
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<Variant | null>(null);

  const handleEdit = (variant: Variant) => {
    setEditingVariant(variant);
  };

  const handleUpdate = () => {
    setEditingVariant(null);
    onVariantUpdate();
  };

  const handleDelete = async () => {
    if (!deletingVariant) return;
    try {
        await deleteVariant(deletingVariant.id);
        toast({ title: "Variant deleted successfully" });
        onVariantUpdate();
        setDeletingVariant(null);
    } catch (error) {
        console.error(error);
        toast({ title: "Error deleting variant", description: "This variant might be in use by a product.", variant: "destructive" });
    }
  }

  return (
    <>
    <AlertDialog open={!!deletingVariant} onOpenChange={(isOpen) => !isOpen && setDeletingVariant(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the variant. Make sure no products are using it.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Existing Variants</DialogTitle>
          <DialogDescription>
            Edit names, options, or delete variants.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh]">
            <div className="overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Options</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variants.map((variant) => (
                        <TableRow key={variant.id}>
                            <TableCell className="font-medium">{variant.name}</TableCell>
                             <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                    {variant.options.map(option => (
                                        <Badge key={option} variant="secondary">{option}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(variant)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingVariant(variant)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="border-l pl-8">
                {editingVariant ? (
                    <VariantForm variant={editingVariant} onVariantUpdated={handleUpdate} />
                ) : (
                    <div className="text-center text-muted-foreground pt-12">
                        <p>Select a variant to edit.</p>
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
