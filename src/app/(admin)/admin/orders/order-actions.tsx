
'use client';

import { useEffect, useState } from 'react';
import { MoreHorizontal, Truck, Eye, CheckSquare, Square } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Checkout, ShippingPartner, Product } from '@/lib/types';
import { updateOrderStatus } from '@/lib/firestore.admin';
import { getShippingPartners, getProductsByIds } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/format';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

interface OrderActionsProps {
  order: Checkout;
}

function ViewOrderDialog({ order, open, onOpenChange }: { order: Checkout, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function fetchProducts() {
            if (order.items) {
                const productIds = order.items.map(item => item.id);
                const fetchedProducts = await getProductsByIds(productIds);
                setProducts(fetchedProducts);
            }
        }
        if (open) {
            fetchProducts();
            setCheckedItems({}); // Reset checks when dialog opens
        }
    }, [order.items, open]);

    const getProductById = (id: string) => products.find(p => p.id === id);

    const handleToggleCheck = (itemId: string) => {
        setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order Details (Packing Slip)</DialogTitle>
                    <DialogDescription>
                       Order ID: {order.orderId}. Use this list to pack the order.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1">
                    <div className="space-y-4">
                        {order.items.map(item => {
                             const product = getProductById(item.id);
                             const itemId = item.variantId || item.id;
                             return (
                                <div key={itemId} className="flex items-start gap-4 pr-4">
                                     <div className="flex items-center h-full pt-1">
                                        <Checkbox
                                            id={`check-${itemId}`}
                                            checked={!!checkedItems[itemId]}
                                            onCheckedChange={() => handleToggleCheck(itemId)}
                                        />
                                     </div>
                                    <Image 
                                        src={item.image || 'https://placehold.co/64x64.png'} 
                                        alt={item.title}
                                        width={64}
                                        height={64}
                                        className="rounded-md object-cover"
                                        data-ai-hint="product image"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">SKU: {product?.sku || 'N/A'}</p>
                                        {item.variantId && <p className="text-sm text-muted-foreground capitalize">Variant: {item.variantId.replace(/-/g, ' / ')}</p>}
                                        <p className="text-sm text-muted-foreground">Qty: <span className="font-bold">{item.quantity}</span></p>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function OrderActions({ order }: OrderActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [consignmentNumber, setConsignmentNumber] = useState('');
  const [shippingPartners, setShippingPartners] = useState<ShippingPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>();

  useEffect(() => {
    async function fetchPartners() {
        const partners = await getShippingPartners();
        setShippingPartners(partners);
    }
    if (isShipDialogOpen) {
        fetchPartners();
    }
  }, [isShipDialogOpen]);

  const handleStatusUpdate = async (status: Checkout['status']) => {
    try {
      await updateOrderStatus(order.id, status, order.items);
      toast({ title: `Order marked as ${status}` });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    }
  };

  const handleShipOrder = async () => {
    if (!consignmentNumber) {
      toast({ title: 'Please enter a consignment number', variant: 'destructive' });
      return;
    }
    if (!selectedPartnerId) {
        toast({ title: 'Please select a shipping partner', variant: 'destructive' });
        return;
    }
    try {
      const selectedPartner = shippingPartners.find(p => p.id === selectedPartnerId);
      await updateOrderStatus(order.id, 'shipped', order.items, { 
        consignmentNumber,
        shippingPartnerId: selectedPartnerId,
        shippingPartnerName: selectedPartner?.name,
      });
      toast({ title: 'Order marked as shipped' });
      setIsShipDialogOpen(false);
      setConsignmentNumber('');
      setSelectedPartnerId(undefined);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error shipping order', variant: 'destructive' });
    }
  };

  return (
    <>
      <ViewOrderDialog order={order} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />
      <Dialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship Order</DialogTitle>
            <DialogDescription>
              Enter the shipping details for order {order.orderId}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="partner" className="text-right">
                    Partner
                </Label>
                 <Select onValueChange={setSelectedPartnerId} defaultValue={selectedPartnerId}>
                    <SelectTrigger id="partner" className="col-span-3">
                        <SelectValue placeholder="Select a shipping partner" />
                    </SelectTrigger>
                    <SelectContent>
                        {shippingPartners.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
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
          <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
             <Eye className="mr-2 h-4 w-4" />
             View Order / Pack
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusUpdate('packed')} disabled={order.status !== 'pending'}>Mark as Packed</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsShipDialogOpen(true)} disabled={order.status === 'shipped' || order.status === 'delivered'}>Mark as Shipped</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('delivered')} disabled={order.status === 'delivered'}>Mark as Delivered</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
