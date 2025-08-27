
import type { ProductRecommendationsOutput } from "@/ai/flows/product-recommendations";
import type { User } from "firebase/auth";


export type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
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
    email: string;
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
    status: 'pending' | 'completed' | 'failed';
}

export type ProductRecommendation = ProductRecommendationsOutput[0];

export type { User };
