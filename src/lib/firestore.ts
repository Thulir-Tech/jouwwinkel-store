

import { db } from './firebase.client';
import { collection, getDocs, query, limit as firestoreLimit, orderBy, where, getDoc, doc } from 'firebase/firestore';
import type { Product, Category, Checkout, ShippingPartner, UiConfig, Variant, Combo, Coupon, User, Review, DeveloperConfig, Inquiry } from './types';

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

// Combos
export async function getCombos(limit?: number): Promise<Combo[]> {
    const combosRef = collection(db, 'combos');
    const q = limit
      ? query(combosRef, orderBy('createdAt', 'desc'), firestoreLimit(limit))
      : query(combosRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return getData<Combo>(snapshot);
}

export async function getActiveCombos(limit?: number): Promise<Combo[]> {
    const combosRef = collection(db, 'combos');
    const q = limit 
      ? query(combosRef, where('active', '==', true), firestoreLimit(limit))
      : query(combosRef, where('active', '==', true));
    
    const snapshot = await getDocs(q);
    const combos = getData<Combo>(snapshot);
    
    // Sort manually to avoid needing a composite index
    return combos.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getFeaturedCombos(limit?: number): Promise<Combo[]> {
    const allActiveCombos = await getActiveCombos();
    const featuredCombos = allActiveCombos.filter(c => c.isFeatured);
    return limit ? featuredCombos.slice(0, limit) : featuredCombos;
}

export async function getCombo(id: string): Promise<Combo | null> {
    const docRef = doc(db, "combos", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const combo = { id: docSnap.id, ...docSnap.data() } as Combo;
        return combo;
    } else {
        return null;
    }
}

export async function getComboBySlug(slug: string): Promise<Combo | null> {
  const q = query(collection(db, "combos"), where("slug", "==", slug), where('active', '==', true), firestoreLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  const combo = { id: doc.id, ...doc.data() } as Combo;
  return combo;
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
    const q = query(checkoutsRef, where('status', 'in', ['packed', 'shipped', 'delivered', 'pending']));
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

export async function getDeveloperConfig(): Promise<DeveloperConfig | null> {
    const docRef = doc(db, 'developerConfig', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as DeveloperConfig;
    }
    return null;
}

export async function getUser(id: string): Promise<User | null> {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { ...docSnap.data() } as User;
    }
    return null;
}

// Coupons
export async function getCoupons(): Promise<Coupon[]> {
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return getData<Coupon>(snapshot);
}

export async function getCoupon(id: string): Promise<Coupon | null> {
    const docRef = doc(db, "coupons", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Coupon;
    }
    return null;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    const q = query(collection(db, "coupons"), where("code", "==", code.toUpperCase()), firestoreLimit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Coupon;
}


export async function validateAndApplyCoupon(
    code: string, 
    cartTotal: number, 
    userId?: string, 
    paymentMethod?: 'cod' | 'upi'
): Promise<{ coupon: Coupon, discountAmount: number }> {
    const coupon = await getCouponByCode(code);
  
    if (!coupon || !coupon.active) {
      throw new Error('Invalid or expired coupon code.');
    }
  
    // Rule: Minimum order value
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      throw new Error(`Minimum order of ₹${coupon.minOrderValue} required.`);
    }
  
    // Rule: Prepaid only
    if (coupon.prepaidOnly && paymentMethod === 'cod') {
        throw new Error('This coupon is only valid for prepaid orders.');
    }

    // Rule: First order only
    if (coupon.firstOrderOnly) {
        if (!userId) {
            throw new Error('You must be logged in to use this coupon.');
        }
        const userOrders = await getCheckouts(userId);
        if (userOrders.length > 0) {
            throw new Error('This coupon is for first-time customers only.');
        }
    }
  
    let discountAmount = 0;
    if (coupon.discountType === 'flat') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      // Rule: Max discount amount for percentage
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    }
  
    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, cartTotal);
  
    return { coupon, discountAmount: Math.round(discountAmount) };
}

// Reviews
export async function getApprovedReviewsForProduct(productId: string): Promise<Review[]> {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('productId', '==', productId),
      where('approved', '==', true)
    );
    const snapshot = await getDocs(q);
    const reviews = getData<Review>(snapshot);
    // Sort by creation date descending
    return reviews.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getReviewsForUserAndProducts(userId: string, productIds: string[]): Promise<Review[]> {
    if (!productIds.length) return [];
    const reviewsRef = collection(db, 'reviews');
    // Firestore 'in' queries are limited to 10 items. If you expect more, you'd need multiple queries.
    // For this use case, fetching all user reviews and filtering locally is simpler.
    const q = query(
      reviewsRef,
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const allUserReviews = getData<Review>(snapshot);
    // Filter for the specific products in the orders
    return allUserReviews.filter(review => productIds.includes(review.productId));
}

// Inquiries
export async function getInquiries(): Promise<Inquiry[]> {
  const inquiriesRef = collection(db, 'inquiries');
  const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return getData<Inquiry>(snapshot);
}
