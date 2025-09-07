
'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getDeveloperConfig } from '@/lib/firestore';
import { DeveloperConfigForm } from './config-form';
import type { DeveloperConfig } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function PageSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-96 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function DeveloperConfigPage() {
    const [config, setConfig] = useState<DeveloperConfig | null>(null);
    const [isDevMode, setIsDevMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This check runs only on the client-side
        const devMode = localStorage.getItem('DevMode') === 'true';
        setIsDevMode(devMode);

        async function fetchData() {
            if (devMode) {
                const configData = await getDeveloperConfig();
                setConfig(configData);
            }
            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) {
        return <PageSkeleton />;
    }

    if (!isDevMode) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                           This page can be accessed only by the developer.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Developer Configuration</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>
                        Manage various customer, product, and developer details for the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DeveloperConfigForm initialData={config} />
                </CardContent>
            </Card>
        </div>
    )
}
