
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
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {checkouts.map((checkout) => (
                <TableRow key={checkout.id}>
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
                    <TableCell className="text-right font-sans">₹{formatCurrency(checkout.total)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    );
  }
  
