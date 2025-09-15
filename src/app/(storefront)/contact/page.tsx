
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { FaWhatsapp } from 'react-icons/fa';
import { getActiveProducts } from '@/lib/firestore';
import type { Product } from '@/lib/types';
import { ContactForm } from './contact-form';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);


function ContactPageSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full mt-8" />
            </div>
            <div>
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}

export default function ContactPage() {
    const { uiConfig, loading: authLoading } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const productsData = await getActiveProducts();
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const cardColorClass = uiConfig?.cardColor === 'theme' ? 'bg-card' : 'bg-white';

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <ContactPageSkeleton />
            </div>
        )
    }

    const getMapQuery = () => {
        if (uiConfig?.storeLatitude && uiConfig?.storeLongitude) {
            return `${uiConfig.storeLatitude},${uiConfig.storeLongitude}`;
        }
        if (uiConfig?.storeAddress) {
            return encodeURIComponent(uiConfig.storeAddress);
        }
        return '';
    }

    const mapQuery = getMapQuery();

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 font-headline">
                    Contact Us
                </h1>
                <p className="text-center text-muted-foreground mb-12">
                    Have questions? We're here to help. Reach out to us through any of the channels below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-6">
                        <Card className={cn(cardColorClass)}>
                            <CardHeader>
                                <CardTitle>Get in Touch Directly</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {uiConfig?.whatsappLink && (
                                    <Button asChild className="w-full" size="lg">
                                        <a href={uiConfig.whatsappLink} target="_blank" rel="noopener noreferrer">
                                            <FaWhatsapp className="mr-2 h-6 w-6" />
                                            Contact on WhatsApp
                                        </a>
                                    </Button>
                                )}
                                {uiConfig?.instagramLink && (
                                    <Button asChild variant="outline" className="w-full" size="lg">
                                        <a href={uiConfig.instagramLink} target="_blank" rel="noopener noreferrer">
                                            <InstagramIcon />
                                            Message on Instagram
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card className={cn(cardColorClass)}>
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ContactForm products={products} />
                            </CardContent>
                        </Card>
                    </div>

                    {mapQuery && (
                        <div className="space-y-6">
                            <Card className={cn(cardColorClass, "h-full")}>
                                <CardHeader>
                                    <CardTitle>Our Location</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {uiConfig.storeAddress && (
                                        <div className="flex items-start gap-4">
                                            <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                            <p className="text-muted-foreground whitespace-pre-line">
                                                {uiConfig.storeAddress}
                                            </p>
                                        </div>
                                    )}
                                    <div className="aspect-video w-full">
                                        <iframe
                                            className="w-full h-full border-0 rounded-md"
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}&q=${mapQuery}`}
                                        >
                                        </iframe>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
