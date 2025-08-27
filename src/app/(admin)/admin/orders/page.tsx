
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
  } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { getCheckouts } from '@/lib/firestore';
  import { formatCurrency } from '@/lib/format';
import { OrderActions } from './order-actions';
import { Truck } from 'lucide-react';
  
  export default async function OrdersPage() {
    const checkouts = await getCheckouts();
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>View and manage customer orders.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {checkouts.map((checkout) => (
                <TableRow key={checkout.id}>
                    <TableCell className="font-mono text-xs">{checkout.orderId || checkout.id}</TableCell>
                    <TableCell>
                    <div className="font-medium">{checkout.shippingAddress.name}</div>
                    <div className="text-sm text-muted-foreground">{checkout.email}</div>
                    <div className="text-sm text-muted-foreground">{checkout.mobile}</div>
                    </TableCell>
                    <TableCell>{new Date(checkout.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Badge variant={checkout.status === 'completed' ? 'default' : 'secondary'}>
                            {checkout.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {checkout.status === 'shipped' && checkout.consignmentNumber && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Truck className="h-4 w-4" />
                                <div className="flex flex-col">
                                    <span>{checkout.shippingPartnerName}</span>
                                    <span className="font-mono text-xs">{checkout.consignmentNumber}</span>
                                </div>
                            </div>
                        )}
                    </TableCell>
                    <TableCell className="text-right font-sans">₹{formatCurrency(checkout.total)}</TableCell>
                    <TableCell className="text-right">
                        <OrderActions order={checkout} />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    );
  }
  
