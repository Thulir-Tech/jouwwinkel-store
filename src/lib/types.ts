

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
  productIds?: string[];
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
    paymentStatus: 'pending' | 'completed' | 'failed';
    utrNumber?: string;
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
    wishlist?: string[];
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
  showHero?: boolean;
  viewType?: 'default' | 'static' | 'carousel';
  fileType?: 'image' | 'video';
  mediaItems?: string[];
}

export type OfferBannerItem = {
  imageUrl: string;
  link: string;
};

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
    storePhoneNumber?: string;
    storeAddress?: string;
    googleMapsEmbed?: string;
    googleMapsLink?: string;
    showLocation?: boolean;
    productShareText?: string;

    heroDesktop?: HeroMediaConfig;
    heroMobile?: HeroMediaConfig;

    heroText1?: string;
    heroText1Color?: string;
    heroText2?: string;
    heroText2Color?: string;
    heroText3?: string;
    heroText3Color?: string;
    ourStoryContent?: string;
    ourStoryImageUrl?: string;
    brandLogoUrl?: string;
    brandLogoLink?: string;
    brandLogoAltText?: string;

    offerBanner?: {
      enabled?: boolean;
      banners?: OfferBannerItem[];
    };
    siteWideOffer?: {
      enabled?: boolean;
      percentage?: number;
    };
    paymentMethods?: {
        cod?: boolean;
        upi?: boolean;
        upiId?: string;
    };
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

export type Inquiry = {
    id: string;
    name: string;
    mobile: string;
    product?: string;
    createdAt: number;
}

export type DeveloperConfig = {
  customerName?: string;
  customerNumber?: string;
  customerEmail?: string;
  customerAddress?: string;
  
  productCode?: string;
  productName?: string;
  buildDate?: string;
  lastUpdatedDate?: string;
  licenseGeneratedDate?: string;
  licenseValidUpto?: string;

  developedByName?: string;
  developedByYear?: string;
  developedByLink?: string;
}
