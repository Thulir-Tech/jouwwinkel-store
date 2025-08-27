
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getProducts } from '@/lib/firestore';
import { InventoryTable } from './inventory-table';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const products = await getProducts();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                    Update stock levels for your products and their variants.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <InventoryTable products={products} />
            </CardContent>
        </Card>
    );
}
