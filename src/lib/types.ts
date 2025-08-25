import type { ProductRecommendationsOutput } from "@/ai/flows/product-recommendations";

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

export type ProductRecommendation = ProductRecommendationsOutput[0];
