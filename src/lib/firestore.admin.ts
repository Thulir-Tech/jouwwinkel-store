

import { db, storage } from './firebase.client';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, query, orderBy, writeBatch, runTransaction, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { CartItem, Checkout, Product, ShippingPartner, UiConfig, User, Variant, Combo, Coupon, Category, ShippingAddress, Review, DeveloperConfig, Inquiry } from './types';
import { getProductsByIds } from './firestore';

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

function generateOrderId() {
    const prefix = 'JW';
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random alphanumeric chars
    return `${prefix}-${timestamp}-${randomPart}`;
}


export async function addProduct(product: {
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    revenuePerUnit?: number;
    profitPerUnit?: number;
    onSale?: boolean;
    isFeatured?: boolean;
    categoryId?: string;
    active: boolean;
    sku?: string;
    tags?: string[];
    images?: string[];
    relatedProductIds?: string[];
    hasVariants: boolean;
    variants?: any[];
    hasHighlights: boolean;
    highlights?: string[];
}) {
    const productsRef = collection(db, 'products');
    
    const productData: { [key: string]: any } = { ...product };
    Object.keys(productData).forEach(key => {
        if (productData[key] === undefined) {
            delete productData[key];
        }
    });

    // Initialize stock
    if (product.hasVariants) {
        productData.variantStock = {}; // Will be populated from inventory page
    } else {
        productData.stock = 0; // Default stock
    }

    await addDoc(productsRef, {
        ...productData,
        slug: slugify(product.title),
        images: product.images || [],
        createdAt: Date.now(),
    });
}

export async function updateProduct(id: string, product: Partial<{
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    revenuePerUnit?: number;
    profitPerUnit?: number;
    onSale?: boolean;
    isFeatured?: boolean;
    categoryId?: string;
    active: boolean;
    sku?: string;
    tags?: string[];
    images?: string[];
    relatedProductIds?: string[];
    hasVariants: boolean;
    variants?: any[];
    hasHighlights: boolean;
    highlights?: string[];
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


export async function addCombo(combo: Omit<Combo, 'id' | 'createdAt' | 'slug'>) {
    const combosRef = collection(db, 'combos');

    const comboData: { [key: string]: any } = { ...combo };
     Object.keys(comboData).forEach(key => {
        if (comboData[key] === undefined) {
            delete comboData[key];
        }
    });

    await addDoc(combosRef, {
        ...comboData,
        slug: slugify(combo.title),
        images: combo.images || [],
        createdAt: Date.now(),
    });
}

export async function updateCombo(id: string, combo: Partial<Omit<Combo, 'id' | 'createdAt' | 'slug'>>) {
    const comboRef = doc(db, 'combos', id);

    const comboData: { [key: string]: any } = { ...combo };
    if (combo.title) {
        comboData.slug = slugify(combo.title);
    }
    Object.keys(comboData).forEach(key => {
        if (comboData[key] === undefined) {
            delete comboData[key];
        }
    });

    await updateDoc(comboRef, comboData);
}


export async function updateStock(productId: string, stockData: { stock?: number, variantStock?: { [key: string]: number }}) {
    const productRef = doc(db, 'products', productId);
    const updateData: { [key: string]: any } = {};

    if (stockData.stock !== undefined) {
        updateData.stock = stockData.stock;
    }
    if (stockData.variantStock !== undefined) {
        updateData.variantStock = stockData.variantStock;
    }
    
    await updateDoc(productRef, updateData);
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

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'slug'>>) {
    const categoryRef = doc(db, 'categories', id);
    const updateData: Partial<Category> = { ...data };
    if (data.name) {
        updateData.slug = slugify(data.name);
    }
    await updateDoc(categoryRef, updateData);
}

export async function addVariant(variant: { name: string, options: string[] }) {
    await addDoc(collection(db, 'variants'), {
        name: variant.name,
        options: variant.options,
    });
}

export async function updateVariant(id: string, data: Partial<Omit<Variant, 'id'>>) {
    const variantRef = doc(db, 'variants', id);
    await updateDoc(variantRef, data);
}

export async function deleteVariant(id: string) {
    await deleteDoc(doc(db, 'variants', id));
}

export async function addCheckout(checkoutData: Omit<Checkout, 'id' | 'createdAt' | 'status' | 'orderId'>) {
    const checkoutsRef = collection(db, 'checkouts');
    
    // Sanitize the incoming data to remove any top-level undefined fields
    const finalCheckoutData: { [key: string]: any } = {};
    for (const key in checkoutData) {
        if ((checkoutData as any)[key] !== undefined) {
            (finalCheckoutData as any)[key] = (checkoutData as any)[key];
        }
    }

    const productIds = finalCheckoutData.items.map((item: CartItem) => item.productId);
    const productsData = await getProductsByIds(productIds);

    const itemsWithFullData = finalCheckoutData.items.map((item: CartItem) => {
        const product = productsData.find(p => p.id === item.productId);
        const fullItem: CartItem = {
            ...item,
            id: item.variantId ? `${item.productId}-${item.variantId}` : item.productId,
            revenuePerUnit: product?.revenuePerUnit || 0,
            profitPerUnit: product?.profitPerUnit || 0,
        };
        // Add productIds to combo items for later retrieval
        if(item.isCombo) {
            const comboProduct = productsData.find(p => p.id === item.productId) as unknown as Combo;
            fullItem.productIds = comboProduct?.productIds || [];
        }
        return fullItem;
    });

    finalCheckoutData.items = itemsWithFullData;
    finalCheckoutData.orderId = generateOrderId();
    finalCheckoutData.createdAt = Date.now();
    finalCheckoutData.status = 'pending';

    if (finalCheckoutData.userId && finalCheckoutData.mobile) {
        const userRef = doc(db, 'users', finalCheckoutData.userId);
        await setDoc(userRef, { mobile: finalCheckoutData.mobile }, { merge: true });
    }
    
    // Only add coupon fields if a coupon is applied
    if (!finalCheckoutData.couponCode) {
        finalCheckoutData.totalAfterDiscount = finalCheckoutData.total;
        delete finalCheckoutData.couponCode;
        delete finalCheckoutData.discountAmount;
    }

    await addDoc(checkoutsRef, finalCheckoutData);
}



export async function packOrderAndUpdateStock(orderId: string, itemsToUpdate: CartItem[]) {
    await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'checkouts', orderId);
        
        // Phase 1: All Reads
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
            throw new Error("Order not found!");
        }
        if (orderDoc.data().status !== 'pending') {
            throw new Error("Order has already been processed.");
        }

        const productReads = itemsToUpdate.map(item => {
            if (item.isCombo) return null;
            return transaction.get(doc(db, 'products', item.productId));
        }).filter(Boolean);

        const productDocs = await Promise.all(productReads as Promise<any>[]);
        
        const productUpdates: { ref: any, data: any }[] = [];
        for (let i = 0; i < itemsToUpdate.length; i++) {
            const item = itemsToUpdate[i];
            if (item.isCombo) continue;

            const productDoc = productDocs.shift();
            if (!productDoc || !productDoc.exists()) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }

            const productData = productDoc.data() as Product;
            const stockUpdate: { [key: string]: any } = {};

            if (productData.hasVariants && item.variantId) {
                const variantKey = `variantStock.${item.variantId}`;
                const currentVariantStock = productData.variantStock?.[item.variantId] ?? 0;
                if (currentVariantStock < item.quantity) {
                    throw new Error(`Not enough stock for variant ${item.variantLabel} of product ${item.title}`);
                }
                stockUpdate[variantKey] = currentVariantStock - item.quantity;
            } else {
                const currentStock = productData.stock ?? 0;
                if (currentStock < item.quantity) {
                    throw new Error(`Not enough stock for product ${item.title}`);
                }
                stockUpdate.stock = currentStock - item.quantity;
            }
            productUpdates.push({ ref: productDoc.ref, data: stockUpdate });
        }

        // Phase 2: All Writes
        for (const update of productUpdates) {
            transaction.update(update.ref, update.data);
        }

        transaction.update(orderRef, { status: 'packed' });
    });
}


export async function updateOrderStatus(
    orderId: string, 
    status: 'shipped' | 'delivered' | 'pending' | 'failed', 
    details?: { consignmentNumber?: string; shippingPartnerId?: string, shippingPartnerName?: string; paymentStatus?: 'completed' | 'failed' }
) {
    const orderRef = doc(db, 'checkouts', orderId);
    
    const updateData: { [key: string]: any } = { status };

    if (details) {
        if (details.consignmentNumber) updateData.consignmentNumber = details.consignmentNumber;
        if (details.shippingPartnerId) updateData.shippingPartnerId = details.shippingPartnerId;
        if (details.shippingPartnerName) updateData.shippingPartnerName = details.shippingPartnerName;
        if (details.paymentStatus) updateData.paymentStatus = details.paymentStatus;
    }
    
    await updateDoc(orderRef, updateData);
}

// Shipping Partners
export async function addShippingPartner(partner: Omit<ShippingPartner, 'id'>) {
    await addDoc(collection(db, 'shippingPartners'), partner);
}

export async function updateShippingPartner(id: string, partner: Partial<Omit<ShippingPartner, 'id'>>) {
    await updateDoc(doc(db, 'shippingPartners', id), partner);
}

export async function deleteShippingPartner(id: string) {
    await deleteDoc(doc(db, 'shippingPartners', id));
}

// Coupons
export async function addCoupon(coupon: Omit<Coupon, 'id' | 'createdAt'>) {
    await addDoc(collection(db, 'coupons'), {
        ...coupon,
        createdAt: Date.now(),
    });
}

export async function updateCoupon(id: string, coupon: Partial<Omit<Coupon, 'id' | 'createdAt'>>) {
    const couponRef = doc(db, 'coupons', id);
    await updateDoc(couponRef, coupon);
}

export async function deleteCoupon(id: string) {
    await deleteDoc(doc(db, 'coupons', id));
}

// UI Configuration
export async function updateUiConfig(config: Partial<UiConfig>) {
    const configRef = doc(db, 'uiConfig', 'main');
    const updateData: { [key: string]: any } = { ...config };
    
    // Remove undefined fields to prevent Firestore errors
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    await setDoc(configRef, updateData, { merge: true });
}

// Developer Configuration
export async function updateDeveloperConfig(config: Partial<DeveloperConfig>) {
    const configRef = doc(db, 'developerConfig', 'main');
    await setDoc(configRef, config, { merge: true });
}

// Users
export async function getUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as User));
}

export async function updateUserProfile(userId: string, data: { displayName?: string, mobile?: string, shippingAddress?: ShippingAddress }) {
    const userRef = doc(db, 'users', userId);
    const updateData: { [key: string]: any } = {};

    if (data.displayName) updateData.displayName = data.displayName;
    if (data.mobile) updateData.mobile = data.mobile;
    if (data.shippingAddress) updateData.shippingAddress = data.shippingAddress;
    
    await updateDoc(userRef, updateData);
}

export async function toggleWishlistProduct(userId: string, productId: string, isWishlisted: boolean): Promise<void> {
    const userRef = doc(db, 'users', userId);
    if (isWishlisted) {
      await updateDoc(userRef, {
        wishlist: arrayRemove(productId)
      });
    } else {
      await updateDoc(userRef, {
        wishlist: arrayUnion(productId)
      });
    }
}


// File Upload
export function uploadFile(
    path: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
}

// Reviews
export async function addReview(review: Omit<Review, 'id' | 'createdAt' | 'approved'>) {
    const reviewRef = collection(db, 'reviews');
    await addDoc(reviewRef, {
        ...review,
        createdAt: Date.now(),
        approved: false // Reviews are not approved by default
    });
}

export async function getReviews(): Promise<Review[]> {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
    return reviews;
}

export async function updateReview(id: string, data: Partial<Review>) {
    const reviewRef = doc(db, 'reviews', id);
    await updateDoc(reviewRef, data);
}

export async function deleteReview(id: string) {
    await deleteDoc(doc(db, 'reviews', id));
}

// Inquiries
export async function addInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>) {
  await addDoc(collection(db, 'inquiries'), {
    ...inquiry,
    createdAt: Date.now(),
  });
}

export async function deleteInquiry(id: string) {
  await deleteDoc(doc(db, 'inquiries', id));
}

    