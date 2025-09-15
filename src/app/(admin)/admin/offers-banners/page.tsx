
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getUiConfig } from '@/lib/firestore';
import { OffersForm } from './offers-form';

export default async function OffersAndBannersPage() {
    const config = await getUiConfig();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Offers & Banners</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Offers & Banners</CardTitle>
                    <CardDescription>
                        Configure site-wide offers and manage promotional pop-up banners.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OffersForm initialData={config} />
                </CardContent>
            </Card>
        </div>
    )
}
