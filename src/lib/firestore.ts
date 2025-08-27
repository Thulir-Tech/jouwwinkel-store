import { db } from './firebase.client';
import { collection, getDocs, query, limit as firestoreLimit, orderBy, where, getDoc, doc } from 'firebase/firestore';
import type { Product, Category, Checkout, ShippingPartner } from './types';

// A helper function to safely get data from a snapshot
function getData<T>(snapshot: any): T[] {
  const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
  return data;
}

export async function getProducts(limit?: number): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const q = limit 
    ? query(productsRef, orderBy('createdAt', 'desc'), firestoreLimit(limit))
    : query(productsRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return getData<Product>(snapshot);
}

export async function getActiveProducts(limit?: number): Promise<Product[]> {
    const productsRef = collection(db, 'products');
    const q = limit 
      ? query(productsRef, where('active', '==', true), orderBy('createdAt', 'desc'), firestoreLimit(limit))
      : query(productsRef, where('active', '==', true), orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return getData<Product>(snapshot);
}

export async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const product = { id: docSnap.id, ...docSnap.data() } as Product;
        return product;
    } else {
        return null;
    }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, "products"), where("slug", "==", slug), where('active', '==', true), firestoreLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  const product = { id: doc.id, ...doc.data() } as Product;
  return product;
}


export async function getCategories(options: { activeOnly?: boolean } = {}): Promise<Category[]> {
  const { activeOnly = false } = options;
  const categoriesRef = collection(db, 'categories');
  const q = activeOnly
    ? query(categoriesRef, where('active', '==', true), orderBy('sort', 'asc'))
    : query(categoriesRef, orderBy('sort', 'asc'));
  const snapshot = await getDocs(q);
  return getData<Category>(snapshot);
}

export async function getCheckouts(userId?: string): Promise<Checkout[]> {
    const checkoutsRef = collection(db, 'checkouts');
    let q;
    if (userId) {
        q = query(checkoutsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    } else {
        q = query(checkoutsRef, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return getData<Checkout>(snapshot);
}

export async function getShippingPartners(): Promise<ShippingPartner[]> {
    const partnersRef = collection(db, 'shippingPartners');
    const q = query(partnersRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return getData<ShippingPartner>(snapshot);
}

export async function getShippingPartner(id: string): Promise<ShippingPartner | null> {
    const docRef = doc(db, 'shippingPartners', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ShippingPartner;
    }
    return null;
}
