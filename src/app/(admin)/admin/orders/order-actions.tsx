
'use client';

import { useState } from 'react';
import { MoreHorizontal, Truck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Checkout } from '@/lib/types';
import { updateOrderStatus } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface OrderActionsProps {
  order: Checkout;
}

export function OrderActions({ order }: OrderActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [consignmentNumber, setConsignmentNumber] = useState('');

  const handleStatusUpdate = async (status: Checkout['status']) => {
    try {
      await updateOrderStatus(order.id, status);
      toast({ title: `Order marked as ${status}` });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  const handleShipOrder = async () => {
    if (!consignmentNumber) {
      toast({ title: 'Please enter a consignment number', variant: 'destructive' });
      return;
    }
    try {
      await updateOrderStatus(order.id, 'shipped', consignmentNumber);
      toast({ title: 'Order marked as shipped' });
      setIsShipDialogOpen(false);
      setConsignmentNumber('');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error shipping order', variant: 'destructive' });
    }
  };

  return (
    <>
      <Dialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship Order</DialogTitle>
            <DialogDescription>
              Enter the consignment number for order {order.orderId}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="consignment" className="text-right">
                Consignment No.
              </Label>
              <Input
                id="consignment"
                value={consignmentNumber}
                onChange={(e) => setConsignmentNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleShipOrder}>
              <Truck className="mr-2 h-4 w-4" />
              Mark as Shipped
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusUpdate('packed')}>Mark as Packed</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsShipDialogOpen(true)}>Mark as Shipped</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>Mark as Completed</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
