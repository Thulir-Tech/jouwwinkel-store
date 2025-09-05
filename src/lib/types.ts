

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

export type Combo = {
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
  active: boolean;
  createdAt: number;
  productIds: string[];
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
  id: string; // This will be composite: product.id-variantId or combo.id
  productId: string; // Can be a product or combo ID
  quantity: number;
  price: number;
  title: string;
  image?: string;
  variantId?: string; // e.g. "red-small"
  variantLabel?: string;
  revenuePerUnit?: number;
  profitPerUnit?: number;
  isCombo?: boolean;
};

export type ShippingAddress = {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
};


export type Checkout = {
    id: string;
    orderId: string;
    email: string;
    mobile: string;
    shippingAddress: ShippingAddress;
    paymentMethod: 'cod' | 'upi';
    items: CartItem[];
    total: number;
    userId?: string;
    createdAt: number;
    status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'failed';
    consignmentNumber?: string;
    shippingPartnerId?: string;
    shippingPartnerName?: string;
    couponCode?: string;
    discountAmount?: number;
    totalAfterDiscount?: number;
}

export interface User extends FirebaseUser {
    uid: string; // Ensure uid is not nullable
    isAdmin: boolean;
    mobile?: string;
    shippingAddress?: ShippingAddress;
    createdAt: number;
}

export type ShippingPartner = {
    id: string;
    name: string;
    trackingUrl: string;
};

export type Review = {
    id: string;
    userId: string;
    userName: string;
    productId: string;
    productTitle: string;
    rating: number;
    comment: string;
    createdAt: number;
    approved: boolean;
};

export type HeroMediaConfig = {
  viewType?: 'default' | 'static' | 'carousel';
  fileType?: 'image' | 'video';
  mediaItems?: string[];
}

export type UiConfig = {
    browserTitle?: string;
    cardColor?: 'white' | 'theme';
    headerCaptionType?: 'static' | 'carousel';
    headerCaptionStatic?: string;
    headerCaptionCarousel?: string[];
    footerHeading?: string;
    footerCaption?: string;
    instagramLink?: string;
    whatsappLink?: string;
    storeAddress?: string;

    heroDesktop?: HeroMediaConfig;
    heroMobile?: HeroMediaConfig;

    heroText1?: string;
    heroText2?: string;
    heroText3?: string;
    ourStoryContent?: string;
    brandLogoUrl?: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  active: boolean;
  createdAt: number;
  
  // Rules
  minOrderValue?: number;
  maxDiscountAmount?: number; // For percentage discounts
  firstOrderOnly?: boolean;
  prepaidOnly?: boolean;
};
