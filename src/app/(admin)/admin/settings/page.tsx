
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getUiConfig } from '@/lib/firestore';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
    const config = await getUiConfig();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Store Settings</CardTitle>
                    <CardDescription>
                        Configure general settings for your storefront.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm initialData={config} />
                </CardContent>
            </Card>
        </div>
    )
}
