
import { getCategories, getProduct, getProducts, getVariants } from '@/lib/firestore';
import { ProductForm } from '../../../product-form';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, allProducts, allVariants] = await Promise.all([
    getProduct(params.id),
    getCategories({ activeOnly: true }),
    getProducts(),
    getVariants(),
  ]);

  if (!product) {
    notFound();
  }

  // Filter out the current product from the list of products that can be recommended
  const selectableProducts = allProducts.filter(p => p.id !== product.id);


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <ProductForm 
        product={product} 
        categories={categories} 
        selectableProducts={selectableProducts}
        allVariants={allVariants}
      />
    </div>
  );
}
