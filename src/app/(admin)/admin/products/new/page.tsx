
import { getCategories, getProducts, getVariants } from '@/lib/firestore';
import { ProductForm } from '../../../product-form';

export default async function NewProductPage() {
  const [categories, products, variants] = await Promise.all([
    getCategories({ activeOnly: true }),
    getProducts(),
    getVariants()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <ProductForm 
        categories={categories} 
        selectableProducts={products} 
        allVariants={variants}
      />
    </div>
  );
}
