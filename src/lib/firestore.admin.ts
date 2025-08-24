import { db } from './firebase.client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
}) {
    const productsRef = collection(db, 'products');
    await addDoc(productsRef, {
        ...product,
        slug: slugify(product.title),
        images: [], // Placeholder for images
        createdAt: Date.now(),
    });
}
