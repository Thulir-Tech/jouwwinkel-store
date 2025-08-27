import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getUiConfig } from '@/lib/firestore';
import { ConfigForm } from './config-form';

export default async function UiConfigPage() {
    const config = await getUiConfig();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">UI Configuration</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Storefront Content</CardTitle>
                    <CardDescription>
                        Manage the text, links, and other content displayed on your customer-facing website.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ConfigForm initialData={config} />
                </CardContent>
            </Card>
        </div>
    )
}
