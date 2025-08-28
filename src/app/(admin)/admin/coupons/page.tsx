
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCoupons } from '@/lib/firestore';
import { deleteCoupon } from '@/lib/firestore.admin';
import { formatCurrency } from '@/lib/format';
import type { Coupon } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function CouponsPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
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

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    async function fetchData() {
        try {
            const data = await getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
        await deleteCoupon(couponToDelete.id);
        setCoupons(coupons.filter(c => c.id !== couponToDelete.id));
        toast({ title: 'Coupon deleted successfully' });
    } catch (error) {
        console.error(error);
        toast({ title: 'Error deleting coupon', variant: 'destructive' });
    } finally {
        setCouponToDelete(null);
    }
  }


  if (loading) {
      return <CouponsPageSkeleton />;
  }

  return (
    <>
    <AlertDialog open={!!couponToDelete} onOpenChange={(open) => !open && setCouponToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the coupon <span className="font-semibold">{couponToDelete?.code}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Coupons</CardTitle>
            <CardDescription>Manage your discount codes.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/coupons/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Coupon
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map(coupon => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium font-mono">{coupon.code}</TableCell>
                <TableCell className="capitalize">{coupon.discountType}</TableCell>
                 <TableCell className="font-sans">
                    {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%`
                        : `₹${formatCurrency(coupon.discountValue)}`
                    }
                </TableCell>
                <TableCell>
                  <Badge variant={coupon.active ? 'default' : 'outline'}>
                    {coupon.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(coupon.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/coupons/${coupon.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => setCouponToDelete(coupon)}
                       >
                         <Trash2 className="mr-2 h-4 w-4" />
                         Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {coupons.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
                No coupons found.
            </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
