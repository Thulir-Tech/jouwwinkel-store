
'use client';

import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { getCompletedCheckouts } from '@/lib/firestore';
import { getUsers } from '@/lib/firestore.admin';
import type { Checkout } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';


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
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [checkouts, users] = await Promise.all([
                getCompletedCheckouts(),
                getUsers()
            ]);
            
            // Process stats
            const totalRevenue = checkouts.reduce((acc, order) => acc + order.total, 0);
            const totalProfit = checkouts.reduce((acc, order) => {
                const orderProfit = order.items.reduce((itemAcc, item) => itemAcc + (item.profitPerUnit || 0) * item.quantity, 0);
                return acc + orderProfit;
            }, 0);

            setStats({
                totalRevenue,
                totalProfit,
                totalSales: checkouts.length,
                totalCustomers: users.length
            });

            // Process chart data (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d;
            }).reverse();

            const dailySales = last7Days.map(date => {
                const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                const total = checkouts
                    .filter(o => new Date(o.createdAt).toDateString() === date.toDateString())
                    .reduce((acc, o) => acc + o.total, 0);
                return { name: dayStr, total };
            });
            setSalesData(dailySales);

            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                        You made {stats?.totalSales || 0} sales this month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   {/* Placeholder for recent sales list */}
                   <div className="text-center text-muted-foreground p-8">
                     Recent sales list coming soon.
                   </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
