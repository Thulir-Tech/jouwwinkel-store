
import { getProducts } from '@/lib/firestore';
import { ComboForm } from '../../combo-form';

export default async function NewComboPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Combo</h1>
      <ComboForm products={products} />
    </div>
  );
}
