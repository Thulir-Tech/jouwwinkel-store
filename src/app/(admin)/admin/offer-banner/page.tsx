
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getUiConfig } from '@/lib/firestore';
import { BannerForm } from './banner-form';

export default async function OfferBannerPage() {
    const config = await getUiConfig();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Offer Banner</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Popup Banner</CardTitle>
                    <CardDescription>
                        Manage the promotional banner that appears when users first visit your homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BannerForm initialData={config?.offerBanner || null} />
                </CardContent>
            </Card>
        </div>
    )
}
