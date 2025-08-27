
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getCheckout, getUiConfig } from '@/lib/firestore';
import type { Checkout, UiConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer } from 'lucide-react';
import Image from 'next/image';

function SlipSkeleton() {
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 space-y-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-8 w-1/4" />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
}


export default function ShippingSlipPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [order, setOrder] = useState<Checkout | null>(null);
    const [config, setConfig] = useState<UiConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        async function fetchData() {
            try {
                const [orderData, configData] = await Promise.all([
                    getCheckout(orderId),
                    getUiConfig()
                ]);

                if (!orderData) {
                    notFound();
                }
                
                setOrder(orderData);
                setConfig(configData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    }

    if (loading) {
        return (
            <html>
                <body>
                    <div className="bg-gray-100 min-h-screen p-8">
                        <SlipSkeleton />
                    </div>
                </body>
            </html>
        );
    }
    
    if (!order) {
        return notFound();
    }

    return (
        <html>
            <head>
                <title>Shipping Slip - {order.orderId}</title>
                 <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #slip-container, #slip-container * {
                            visibility: visible;
                        }
                        #slip-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            border: none;
                            box-shadow: none;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                `}} />
            </head>
            <body>
                 <div className="bg-gray-100 min-h-screen p-2 md:p-8 font-sans">
                    <div className="max-w-4xl mx-auto">
                        <div className="no-print mb-4 flex justify-end gap-2">
                            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Print / Save as PDF</Button>
                        </div>
                        <div id="slip-container" className="bg-white p-8 border rounded-lg shadow-sm">
                            <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                                <div>
                                    {config?.brandLogoUrl ? (
                                        <Image src={config.brandLogoUrl} alt="Brand Logo" width={150} height={75} />
                                    ) : (
                                        <h1 className="text-2xl font-bold">{config?.footerHeading || 'Jouwwinkel'}</h1>
                                    )}
                                    <p className="text-xs mt-2">{config?.storeAddress}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold uppercase">Shipping Slip</h2>
                                    <p className="text-sm">Order: <span className="font-mono">{order.orderId}</span></p>
                                    <p className="text-sm">Date: <span className="font-mono">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                                </div>
                            </header>
                            <main className="mt-8 grid grid-cols-2 gap-8">
                                <div className="border p-4 rounded-md">
                                    <h3 className="font-bold mb-2 border-b pb-1">FROM:</h3>
                                    <p className="font-semibold">{config?.footerHeading || 'Jouwwinkel'}</p>
                                    <p className="text-sm">{config?.storeAddress}</p>
                                </div>
                                <div className="border p-4 rounded-md">
                                    <h3 className="font-bold mb-2 border-b pb-1">TO:</h3>
                                    <p className="font-semibold">{order.shippingAddress.name}</p>
                                    <p className="text-sm">
                                        {order.shippingAddress.address}, {order.shippingAddress.city},<br/>
                                        {order.shippingAddress.state} - {order.shippingAddress.zip}<br/>
                                        {order.shippingAddress.country}
                                    </p>
                                    <p className="text-sm mt-2">Mobile: <span className="font-semibold">{order.mobile}</span></p>
                                </div>
                            </main>

                            <section className="mt-8">
                                <h3 className="font-bold text-lg mb-2">Order Summary</h3>
                                <table className="w-full text-sm border-collapse border">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-left">#</th>
                                            <th className="border p-2 text-left">Item</th>
                                            <th className="border p-2 text-center">Qty</th>
                                            <th className="border p-2 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, index) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="border p-2">{index + 1}</td>
                                                <td className="border p-2">
                                                    <p className="font-semibold">{item.title}</p>
                                                    {item.variantId && <p className="text-xs text-gray-600 capitalize">Variant: {item.variantId.replace(/-/g, ' / ')}</p>}
                                                </td>
                                                <td className="border p-2 text-center">{item.quantity}</td>
                                                <td className="border p-2 text-right font-mono">₹{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            <section className="mt-8 flex justify-end">
                                <div className="w-1/3 text-sm">
                                    <div className="flex justify-between py-1">
                                        <span>Subtotal</span>
                                        <span className="font-mono">₹{formatCurrency(order.total)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span>Shipping</span>
                                        <span>FREE</span>
                                    </div>
                                    <div className="flex justify-between py-2 font-bold text-base">
                                        <span>Total</span>
                                        <span className="font-mono">₹{formatCurrency(order.total)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 font-bold text-base bg-gray-100 px-2 rounded-md">
                                        <span>Payment Method</span>
                                        <span className="uppercase">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </section>

                            <footer className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
                                <p>Thank you for your order!</p>
                            </footer>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
