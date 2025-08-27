
import { db } from './firebase.client';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import type { CartItem, Checkout, ShippingPartner, UiConfig } from './types';

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
    onSale?: boolean;
    isFeatured?: boolean;
    categoryId?: string;
    active: boolean;
    sku?: string;
    stock: number;
    tags?: string[];
    relatedProductIds?: string[];
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
    onSale?: boolean;
    isFeatured?: boolean;
    categoryId?: string;
    active: boolean;
    sku?: string;
    stock: number;
    tags?: string[];
    relatedProductIds?: string[];
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
    mobile: string;
    shippingAddress: object;
    paymentMethod: 'cod' | 'upi';
    items: CartItem[];
    total: number;
    userId?: string;
}) {
    const checkoutsRef = collection(db, 'checkouts');
    
    const checkoutData: { [key: string]: any } = { ...checkout };
    Object.keys(checkoutData).forEach(key => {
        if (checkoutData[key] === undefined) {
            delete checkoutData[key];
        }
    });

    await addDoc(checkoutsRef, {
        ...checkoutData,
        orderId: generateOrderId(),
        createdAt: Date.now(),
        status: 'pending', // Initial status
    });
}

export async function updateOrderStatus(
    orderId: string, 
    status: Checkout['status'], 
    details?: { consignmentNumber?: string; shippingPartnerId?: string, shippingPartnerName?: string }
) {
    const orderRef = doc(db, 'checkouts', orderId);
    const updateData: Partial<Checkout> = { status };

    if (details?.consignmentNumber) {
        updateData.consignmentNumber = details.consignmentNumber;
    }
    if (details?.shippingPartnerId) {
        updateData.shippingPartnerId = details.shippingPartnerId;
    }
     if (details?.shippingPartnerName) {
        updateData.shippingPartnerName = details.shippingPartnerName;
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

// UI Configuration
export async function updateUiConfig(config: Partial<UiConfig>) {
    const configRef = doc(db, 'uiConfig', 'main');
    // Use set with merge: true to create the document if it doesn't exist,
    // or update it if it does.
    await setDoc(configRef, config, { merge: true });
}
