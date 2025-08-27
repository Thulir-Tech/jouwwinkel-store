import { getCategories, getProduct } from '@/lib/firestore';
import { ProductForm } from '../../../product-form';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    getProduct(params.id),
    getCategories({ activeOnly: true }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
