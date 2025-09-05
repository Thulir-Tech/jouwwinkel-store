
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getDeveloperConfig } from '@/lib/firestore';
import { DeveloperConfigForm } from './config-form';

export default async function DeveloperConfigPage() {
    const config = await getDeveloperConfig();

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
