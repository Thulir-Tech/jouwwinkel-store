
import { db, storage } from './firebase.client';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { CartItem, Checkout, ShippingPartner, UiConfig, User, Variant } from './types';

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
    images?: string[];
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
        images: product.images || [],
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
    images?: string[];
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

export async function addVariant(variant: { name: string, options: string[] }) {
    await addDoc(collection(db, 'variants'), {
        name: variant.name,
        options: variant.options,
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

    // Also update the user's profile with their mobile number if available
    if (checkout.userId && checkout.mobile) {
        const userRef = doc(db, 'users', checkout.userId);
        await setDoc(userRef, { mobile: checkout.mobile }, { merge: true });
    }

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

// Get all users
export async function getUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as User));
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
