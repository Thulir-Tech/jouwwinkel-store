

'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { getCheckouts } from '@/lib/firestore';
import { formatCurrency } from '@/lib/format';
import { OrderActions } from './order-actions';
import { Truck, CalendarIcon, X } from 'lucide-react';
import type { Checkout } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

function OrdersPageSkeleton() {
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
  
export default function OrdersPage() {
    const searchParams = useSearchParams();
    const customerQuery = searchParams.get('customer');

    const [checkouts, setCheckouts] = useState<Checkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        orderId: '',
        customer: customerQuery || '',
        status: 'all',
        date: undefined as DateRange | undefined,
    });

    useEffect(() => {
        async function fetchCheckouts() {
            const data = await getCheckouts();
            setCheckouts(data);
            setLoading(false);
        }
        fetchCheckouts();
    }, []);

    const filteredCheckouts = useMemo(() => {
        return checkouts.filter(checkout => {
            const { orderId, customer, status, date } = filters;
            const customerName = checkout.shippingAddress.name || checkout.email;
            if (orderId && !(checkout.orderId || checkout.id).toLowerCase().includes(orderId.toLowerCase())) return false;
            if (customer && !customerName.toLowerCase().includes(customer.toLowerCase())) return false;
            if (status !== 'all' && checkout.status !== status) return false;
            if (date?.from && new Date(checkout.createdAt) < date.from) return false;
            if (date?.to && new Date(checkout.createdAt) > date.to) return false;
            return true;
        });
    }, [checkouts, filters]);

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const resetFilters = () => {
        setFilters({
            orderId: '',
            customer: '',
            status: 'all',
            date: undefined,
        });
    }

    if (loading) {
        return <OrdersPageSkeleton />;
    }
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>View and manage customer orders.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 border rounded-lg">
                <Input
                    placeholder="Filter by Order ID..."
                    value={filters.orderId}
                    onChange={(e) => handleFilterChange('orderId', e.target.value)}
                />
                <Input
                    placeholder="Filter by Customer..."
                    value={filters.customer}
                    onChange={(e) => handleFilterChange('customer', e.target.value)}
                />
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.date?.from ? (
                                filters.date.to ? (
                                    <>{format(filters.date.from, "LLL dd, y")} - {format(filters.date.to, "LLL dd, y")}</>
                                ) : (
                                    format(filters.date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={filters.date?.from}
                            selected={filters.date}
                            onSelect={(date) => handleFilterChange('date', date)}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                 <Button variant="ghost" onClick={resetFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Reset
                 </Button>
            </div>
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
                {filteredCheckouts.map((checkout) => (
                <TableRow key={checkout.id}>
                    <TableCell className="font-mono text-xs">{checkout.orderId || checkout.id}</TableCell>
                    <TableCell>
                    <div className="font-medium">{checkout.shippingAddress.name}</div>
                    <div className="text-sm text-muted-foreground">{checkout.email}</div>
                    <div className="text-sm text-muted-foreground">{checkout.mobile}</div>
                    </TableCell>
                    <TableCell>{new Date(checkout.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Badge variant={checkout.status === 'delivered' ? 'default' : 'secondary'}>
                            {checkout.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {checkout.consignmentNumber && (
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
             {filteredCheckouts.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    No orders found.
                </div>
            )}
        </CardContent>
      </Card>
    );
}
  
