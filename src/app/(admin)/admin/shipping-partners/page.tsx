import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getShippingPartners } from '@/lib/firestore';
import { ShippingPartnerForm } from './shipping-partner-form';
import { ShippingPartnerList } from './shipping-partner-list';
  
export default async function ShippingPartnersPage() {
    const partners = await getShippingPartners();
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Shipping Partners</h1>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Shipping Partners</CardTitle>
              <CardDescription>Add, edit, and manage your shipping partners.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div>
                <ShippingPartnerForm />
              </div>
              <div>
                <h3 className="font-semibold mb-4">Existing Partners</h3>
                <div className="border rounded-md">
                    <ShippingPartnerList partners={partners} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
