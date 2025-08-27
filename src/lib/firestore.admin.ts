import { db } from './firebase.client';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { CartItem } from './types';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}


export async function addProduct(product: {
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    categoryId?: string;
    active: boolean;
    sku?: string;
    stock: number;
    tags?: string[];
}) {
    const productsRef = collection(db, 'products');
    
    // Firestore doesn't accept `undefined` values.
    // We need to clean the object before sending it.
    const productData: { [key: string]: any } = { ...product };
    Object.keys(productData).forEach(key => {
        if (productData[key] === undefined) {
            delete productData[key];
        }
    });

    await addDoc(productsRef, {
        ...productData,
        slug: slugify(product.title),
        images: [], // Placeholder for images
        createdAt: Date.now(),
    });
}

export async function updateProduct(id: string, product: Partial<{
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    categoryId?: string;
    active: boolean;
    sku?: string;
    stock: number;
    tags?: string[];
}>) {
    const productRef = doc(db, 'products', id);

    const productData: { [key: string]: any } = { ...product };
    if (product.title) {
        productData.slug = slugify(product.title);
    }
    Object.keys(productData).forEach(key => {
        if (productData[key] === undefined) {
            delete productData[key];
        }
    });

    await updateDoc(productRef, productData);
}


export async function addCategory(category: { name: string }) {
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    const sort = categoriesSnapshot.size;

    await addDoc(categoriesRef, {
        name: category.name,
        slug: slugify(category.name),
        active: true,
        sort: sort, 
    });
}

export async function addCheckout(checkout: {
    email: string;
    shippingAddress: object;
    items: CartItem[];
    total: number;
    userId?: string;
}) {
    const checkoutsRef = collection(db, 'checkouts');
    await addDoc(checkoutsRef, {
        ...checkout,
        createdAt: Date.now(),
        status: 'pending', // Initial status
    });
}
