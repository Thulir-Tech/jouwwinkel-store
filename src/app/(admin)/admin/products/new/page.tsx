import { getCategories } from '@/lib/firestore';
import { ProductForm } from '../../product-form';

export default async function NewProductPage() {
  const categories = await getCategories({ activeOnly: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
