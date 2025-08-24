import { db } from './firebase.client';
import { collection, getDocs, query, limit as firestoreLimit, orderBy, where, getDoc, doc } from 'firebase/firestore';
import type { Product, Category } from './types';

// A helper function to safely get data from a snapshot
function getData<T>(snapshot: any): T[] {
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
}

export async function getProducts(limit?: number): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const q = limit 
    ? query(productsRef, where('active', '==', true), orderBy('createdAt', 'desc'), firestoreLimit(limit))
    : query(productsRef, where('active', '==', true), orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return getData<Product>(snapshot);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, "products"), where("slug", "==", slug), where('active', '==', true), firestoreLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Product;
}


export async function getCategories(): Promise<Category[]> {
  const categoriesRef = collection(db, 'categories');
  const q = query(categoriesRef, where('active', '==', true), orderBy('sort', 'asc'));
  const snapshot = await getDocs(q);
  return getData<Category>(snapshot);
}
