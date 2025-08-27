
import type { ProductRecommendationsOutput } from "@/ai/flows/product-recommendations";
import type { User as FirebaseUser } from "firebase/auth";


export type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  onSale?: boolean;
  images: string[];
  rating?: number;
  reviewsCount?: number;
  badges?: string[];
  categoryId?: string;
  active: boolean;
  createdAt: number; // as timestamp
  sku?: string;
  stock: number;
  tags?: string[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort: number;
};

export type CartItem = {
  id: string;
  quantity: number;
  price: number;
  title: string;
  image?: string;
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
    status: 'pending' | 'packed' | 'shipped' | 'completed' | 'failed';
    consignmentNumber?: string;
    shippingPartnerId?: string;
    shippingPartnerName?: string;
}

export type ProductRecommendation = ProductRecommendationsOutput[0];

export interface User extends FirebaseUser {
    isAdmin: boolean;
}

export type ShippingPartner = {
    id: string;
    name: string;
    trackingUrl: string;
};
