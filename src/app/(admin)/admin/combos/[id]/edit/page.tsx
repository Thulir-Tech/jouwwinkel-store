
import { getCombo, getProducts } from '@/lib/firestore';
import { ComboForm } from '../../combo-form';
import { notFound } from 'next/navigation';

export default async function EditComboPage({ params }: { params: { id: string } }) {
  const [combo, allProducts] = await Promise.all([
    getCombo(params.id),
    getProducts(),
  ]);

  if (!combo) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Combo</h1>
      <ComboForm 
        combo={combo} 
        products={allProducts}
      />
    </div>
  );
}
