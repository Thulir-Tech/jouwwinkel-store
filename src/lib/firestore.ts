import { db } from './firebase.client';
import { collection, getDocs, query, limit as firestoreLimit, orderBy, where, getDoc, doc } from 'firebase/firestore';
import type { Product, Category } from './types';

// A helper function to safely get data from a snapshot
function getData<T>(snapshot: any): T[] {
  const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
  console.log('Fetched data:', data);
  return data;
}

export async function getProducts(limit?: number): Promise<Product[]> {
  console.log('Fetching products...');
  const productsRef = collection(db, 'products');
  const q = limit 
    ? query(productsRef, orderBy('createdAt', 'desc'), firestoreLimit(limit))
    : query(productsRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return getData<Product>(snapshot);
}

export async function getActiveProducts(limit?: number): Promise<Product[]> {
    console.log('Fetching active products...');
    const productsRef = collection(db, 'products');
    const q = limit 
      ? query(productsRef, where('active', '==', true), orderBy('createdAt', 'desc'), firestoreLimit(limit))
      : query(productsRef, where('active', '==', true), orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return getData<Product>(snapshot);
}

export async function getProduct(id: string): Promise<Product | null> {
    console.log(`Fetching product with id: ${id}`);
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const product = { id: docSnap.id, ...docSnap.data() } as Product;
        console.log('Found product:', product);
        return product;
    } else {
        console.log('No product found with that id.');
        return null;
    }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  console.log(`Fetching product with slug: ${slug}`);
  const q = query(collection(db, "products"), where("slug", "==", slug), where('active', '==', true), firestoreLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log('No active product found with that slug.');
    return null;
  }
  const doc = snapshot.docs[0];
  const product = { id: doc.id, ...doc.data() } as Product;
  console.log('Found product by slug:', product);
  return product;
}


export async function getCategories(options: { activeOnly?: boolean } = {}): Promise<Category[]> {
  console.log(`Fetching categories with options:`, options);
  const { activeOnly = false } = options;
  const categoriesRef = collection(db, 'categories');
  const q = activeOnly
    ? query(categoriesRef, where('active', '==', true), orderBy('sort', 'asc'))
    : query(categoriesRef, orderBy('sort', 'asc'));
  const snapshot = await getDocs(q);
  return getData<Category>(snapshot);
}
