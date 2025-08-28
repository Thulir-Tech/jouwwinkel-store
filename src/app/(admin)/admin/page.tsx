
'use client';

import { DollarSign, Users, CreditCard, Activity, CalendarIcon, X, ChevronsUpDown, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { getCompletedCheckouts, getProducts, getCategories } from '@/lib/firestore';
import { getUsers } from '@/lib/firestore.admin';
import type { Checkout, Product, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';


interface DashboardStats {
    totalRevenue: number;
    totalProfit: number;
    totalSales: number;
    totalCustomers: number;
}

interface SalesData {
    name: string;
    total: number;
}

function StatsCard({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-4">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                    <CardContent className="pl-2">
                        <Skeleton className="h-[350px] w-full" />
                    </CardContent>
                </Card>
                 <Card className="col-span-4 lg:col-span-3">
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export default function AdminPage() {
    const [allCheckouts, setAllCheckouts] = useState<Checkout[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [totalCustomers, setTotalCustomers] = useState(0);

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState(true);
    const [productFilterOpen, setProductFilterOpen] = useState(false);

    const [filters, setFilters] = useState({
        productId: 'all',
        categoryId: 'all',
        date: undefined as DateRange | undefined,
    });
    
    useEffect(() => {
        async function fetchInitialData() {
            const [checkouts, users, products, categories] = await Promise.all([
                getCompletedCheckouts(),
                getUsers(),
                getProducts(),
                getCategories()
            ]);
            
            setAllCheckouts(checkouts);
            setTotalCustomers(users.length);
            setAllProducts(products);
            setAllCategories(categories);
            
            setLoading(false);
        }

        fetchInitialData();
    }, []);

    const filteredCheckouts = useMemo(() => {
        return allCheckouts.filter(checkout => {
            const { productId, categoryId, date } = filters;
            
            if (date?.from && new Date(checkout.createdAt) < date.from) return false;
            // Set time to end of day for 'to' date to include all orders on that day
            if (date?.to) {
                const toDate = new Date(date.to);
                toDate.setHours(23, 59, 59, 999);
                if (new Date(checkout.createdAt) > toDate) return false;
            }

            if (productId !== 'all' && !checkout.items.some(item => item.productId === productId)) return false;
            
            if (categoryId !== 'all') {
                const productIdsInCategory = allProducts.filter(p => p.categoryId === categoryId).map(p => p.id);
                if (!checkout.items.some(item => productIdsInCategory.includes(item.productId))) return false;
            }

            return true;
        });
    }, [allCheckouts, filters, allProducts]);


    useEffect(() => {
        if (!loading) {
            // Process stats
            const totalRevenue = filteredCheckouts.reduce((acc, order) => {
                return acc + order.items.reduce((itemAcc, item) => itemAcc + (item.revenuePerUnit || 0) * item.quantity, 0);
            }, 0);
            const totalProfit = filteredCheckouts.reduce((acc, order) => {
                const orderProfit = order.items.reduce((itemAcc, item) => itemAcc + (item.profitPerUnit || 0) * item.quantity, 0);
                return acc + orderProfit;
            }, 0);

            setStats({
                totalRevenue,
                totalProfit,
                totalSales: filteredCheckouts.length,
                totalCustomers: totalCustomers
            });
            
            // Process chart data (last 7 days within the filtered range)
            const range = filters.date?.to ? (filters.date.to.getTime() - (filters.date.from?.getTime() || 0)) / (1000 * 3600 * 24) : 7;
            const daysToDisplay = range <= 31 ? range : 30; // Max 30 days for daily view

            const chartEndDate = filters.date?.to || new Date();
            
            const datePoints = Array.from({ length: daysToDisplay + 1 }, (_, i) => {
                const d = new Date(chartEndDate);
                d.setDate(d.getDate() - i);
                return d;
            }).reverse();


            const dailySales = datePoints.map(date => {
                const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const total = filteredCheckouts
                    .filter(o => new Date(o.createdAt).toDateString() === date.toDateString())
                    .reduce((acc, o) => acc + o.total, 0);
                return { name: dayStr, total };
            });
            setSalesData(dailySales);
        }

    }, [filteredCheckouts, totalCustomers, loading, filters.date]);

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const resetFilters = () => {
        setFilters({
            productId: 'all',
            categoryId: 'all',
            date: undefined,
        });
    }
    
    const getProductInfo = (productId: string) => {
        return allProducts.find(p => p.id === productId);
    }

    const handleExport = () => {
        if (filteredCheckouts.length === 0) return;

        const escapeCsvCell = (cell: any) => {
            if (cell === undefined || cell === null) return '';
            const str = String(cell);
            if (str.includes(',')) {
                return `"${str}"`;
            }
            return str;
        };

        const csvRows = [];
        
        // Report Header
        csvRows.push('Jouwwinkel Store Dashboard Report');
        csvRows.push(''); // Blank line

        // Filter Details
        csvRows.push('Filters Applied:');
        if (filters.date?.from) {
            const from = format(filters.date.from, "LLL dd, y");
            const to = filters.date.to ? format(filters.date.to, "LLL dd, y") : 'Present';
            csvRows.push(`Date Range:,${from} - ${to}`);
        }
        if (filters.categoryId !== 'all') {
            const category = allCategories.find(c => c.id === filters.categoryId);
            csvRows.push(`Category:,${category?.name || 'N/A'}`);
        }
        if (filters.productId !== 'all') {
            const product = allProducts.find(p => p.id === filters.productId);
            csvRows.push(`Product:,${product?.title || 'N/A'}`);
        }
        csvRows.push(''); // Blank line
        

        // Column Headers
        const headers = ['Sl No.', 'Order ID', 'Products SKU', 'Products', 'Customer Name', 'Customer Mobile', 'Customer Email', 'Delivery Pincode', 'Revenue', 'Profit'];
        csvRows.push(headers.join(','));

        // Data Rows
        filteredCheckouts.forEach((order, index) => {
            const productSkus = order.items.map(item => getProductInfo(item.productId)?.sku || 'N/A').join(' | ');
            const productTitles = order.items.map(item => `${item.title} (x${item.quantity})`).join(' | ');
            const orderRevenue = order.items.reduce((acc, item) => acc + (item.revenuePerUnit || 0) * item.quantity, 0);
            const orderProfit = order.items.reduce((acc, item) => acc + (item.profitPerUnit || 0) * item.quantity, 0);

            const row = [
                index + 1,
                order.orderId,
                productSkus,
                productTitles,
                order.shippingAddress.name,
                order.mobile,
                order.email,
                order.shippingAddress.zip,
                orderRevenue,
                orderProfit
            ].map(escapeCsvCell);
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    if (loading) {
        return <DashboardSkeleton />;
    }

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
                {`Showing data for: `}
                <span className="font-semibold text-foreground">
                    {filteredCheckouts.length} sales
                </span>
            </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-lg">
            <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange('categoryId', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Popover open={productFilterOpen} onOpenChange={setProductFilterOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productFilterOpen}
                        className="w-full justify-between"
                    >
                        {filters.productId !== 'all'
                        ? allProducts.find((product) => product.id === filters.productId)?.title
                        : "Filter by Product..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                    <CommandInput placeholder="Search product..." />
                    <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                        <CommandItem
                            onSelect={() => {
                                handleFilterChange('productId', 'all');
                                setProductFilterOpen(false);
                            }}
                        >
                            All Products
                        </CommandItem>
                        {allProducts.map((product) => (
                            <CommandItem
                                key={product.id}
                                value={product.title}
                                onSelect={(currentValue) => {
                                    handleFilterChange('productId', product.id);
                                    setProductFilterOpen(false);
                                }}
                            >
                                {product.title}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            
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
                Reset Filters
            </Button>
            <Button onClick={handleExport} disabled={filteredCheckouts.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
            </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
                title="Total Revenue"
                value={`₹${formatCurrency(stats?.totalRevenue || 0)}`}
                icon={DollarSign}
            />
             <StatsCard 
                title="Total Profit"
                value={`₹${formatCurrency(stats?.totalProfit || 0)}`}
                icon={DollarSign}
            />
            <StatsCard 
                title="Sales"
                value={`+${stats?.totalSales || 0}`}
                icon={CreditCard}
            />
            <StatsCard 
                title="Total Customers"
                value={`${stats?.totalCustomers || 0}`}
                icon={Users}
            />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip formatter={(value: number) => [`₹${formatCurrency(value)}`, "Sales"]}/>
                            <Legend />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sales" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                       Your most recent sales activity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                        {filteredCheckouts.slice(0, 5).map(order => (
                            <div key={order.id} className="flex items-center">
                                <div className="flex-grow">
                                    <p className="font-medium">{order.shippingAddress.name}</p>
                                    <p className="text-sm text-muted-foreground">{order.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold font-sans">₹{formatCurrency(order.total)}</p>
                                     <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                         {filteredCheckouts.length === 0 && (
                            <div className="text-center text-muted-foreground p-8">
                                No sales found for the selected filters.
                            </div>
                        )}
                   </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    