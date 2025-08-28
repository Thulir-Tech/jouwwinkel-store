
import { db } from './firebase.client';
import { collection, getDocs, query, limit as firestoreLimit, orderBy, where, getDoc, doc } from 'firebase/firestore';
import type { Product, Category, Checkout, ShippingPartner, UiConfig, Variant } from './types';

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

export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
    // This query was causing an index error.
    // We'll fetch all active products and filter in code.
    // For larger datasets, creating the composite index in Firebase is recommended.
    const allActiveProducts = await getActiveProducts();
    const featuredProducts = allActiveProducts.filter(p => p.isFeatured);
    return limit ? featuredProducts.slice(0, limit) : featuredProducts;
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

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) {
        return [];
    }
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('__name__', 'in', ids));
    const snapshot = await getDocs(q);
    const productData = getData<Product>(snapshot);
    
    // Firestore `in` query doesn't guarantee order, so we re-order based on the original IDs array
    const orderedProducts = ids.map(id => productData.find(p => p.id === id)).filter(p => p) as Product[];
    return orderedProducts;
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

export async function getVariants(): Promise<Variant[]> {
    const variantsRef = collection(db, 'variants');
    const q = query(variantsRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return getData<Variant>(snapshot);
}

export async function getCheckout(id: string): Promise<Checkout | null> {
    const docRef = doc(db, "checkouts", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const checkout = { id: docSnap.id, ...docSnap.data() } as Checkout;
        return checkout;
    } else {
        return null;
    }
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

export async function getCompletedCheckouts(): Promise<Checkout[]> {
    const checkoutsRef = collection(db, 'checkouts');
    const q = query(checkoutsRef, where('status', 'in', ['packed', 'shipped', 'delivered']));
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

export async function getUiConfig(): Promise<UiConfig | null> {
    const docRef = doc(db, 'uiConfig', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UiConfig;
    }
    return null;
}
