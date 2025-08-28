
import type { User as FirebaseUser } from "firebase/auth";

export type ProductVariant = {
  variantId: string; // e.g., ID of "Color" variant
  variantName: string; // e.g., "Color"
  options: string[]; // e.g., ["Red", "Green"]
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  revenuePerUnit?: number;
  profitPerUnit?: number;
  onSale?: boolean;
  isFeatured?: boolean;
  images: string[];
  rating?: number;
  reviewsCount?: number;
  badges?: string[];
  categoryId?: string;
  active: boolean;
  createdAt: number; // as timestamp
  sku?: string;
  stock?: number; // For products without variants
  variantStock?: { [key: string]: number }; // For products with variants e.g. {"red-small": 10}
  tags?: string[];
  relatedProductIds?: string[];
  hasVariants: boolean;
  variants: ProductVariant[];
  hasHighlights: boolean;
  highlights?: string[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort: number;
};

export type Variant = {
    id: string;
    name: string; // e.g. "Color"
    options: string[]; // e.g. ["Red", "Green", "Blue"]
}

export type CartItem = {
  id: string; // This will be composite: product.id-variantId
  productId: string;
  quantity: number;
  price: number;
  title: string;
  image?: string;
  variantId?: string; // e.g. "red-small"
  variantLabel?: string;
};

export type Checkout = {
    id: string;
    orderId: string;
    email: string;
    mobile: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    paymentMethod: 'cod' | 'upi';
    items: CartItem[];
    total: number;
    userId?: string;
    createdAt: number;
    status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'failed';
    consignmentNumber?: string;
    shippingPartnerId?: string;
    shippingPartnerName?: string;
}

export interface User extends FirebaseUser {
    uid: string; // Ensure uid is not nullable
    isAdmin: boolean;
    mobile?: string; // Add mobile to user type
    createdAt: number;
}

export type ShippingPartner = {
    id: string;
    name: string;
    trackingUrl: string;
};

export type UiConfig = {
    headerCaptionType?: 'static' | 'carousel';
    headerCaptionStatic?: string;
    headerCaptionCarousel?: string[];
    footerHeading?: string;
    footerCaption?: string;
    instagramLink?: string;
    whatsappLink?: string;
    storeAddress?: string;

    heroViewType?: 'default' | 'static' | 'carousel';
    heroFileType?: 'stable' | 'motion';
    heroMediaItems?: string[];

    heroText1?: string;
    heroText2?: string;
    heroText3?: string;
    ourStoryContent?: string;
    brandLogoUrl?: string;
};
