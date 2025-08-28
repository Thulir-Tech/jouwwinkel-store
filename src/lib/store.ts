
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Coupon } from './types';

interface CartState {
  items: CartItem[];
  count: number;
  total: number;
  couponCode: string | null;
  discountAmount: number;
  totalAfterDiscount: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyCoupon: (coupon: Coupon, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
}

const calculateState = (items: CartItem[], couponCode: string | null, discountAmount: number) => {
  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAfterDiscount = couponCode ? total - discountAmount : total;
  return { count, total, totalAfterDiscount };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      total: 0,
      couponCode: null,
      discountAmount: 0,
      totalAfterDiscount: 0,
      
      addToCart: (newItem) => {
        const id = newItem.isCombo ? newItem.productId : (newItem.variantId ? `${newItem.productId}-${newItem.variantId}` : newItem.productId);
        const existingItem = get().items.find(item => item.id === id);
        let updatedItems;

        if (existingItem) {
          updatedItems = get().items.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + newItem.quantity } : item
          );
        } else {
          updatedItems = [...get().items, { ...newItem, id }];
        }
        set(state => ({ items: updatedItems, ...calculateState(updatedItems, state.couponCode, state.discountAmount) }));
      },
      removeFromCart: (itemId) => {
        const updatedItems = get().items.filter(item => item.id !== itemId);
        set(state => ({ items: updatedItems, ...calculateState(updatedItems, state.couponCode, state.discountAmount) }));
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(itemId);
          return;
        }
        const updatedItems = get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set(state => ({ items: updatedItems, ...calculateState(updatedItems, state.couponCode, state.discountAmount) }));
      },
      applyCoupon: (coupon, discount) => {
        const { items } = get();
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({
            couponCode: coupon.code,
            discountAmount: discount,
            totalAfterDiscount: total - discount,
        });
      },
      removeCoupon: () => {
        set({
            couponCode: null,
            discountAmount: 0,
            totalAfterDiscount: get().total,
        });
      },
      clearCart: () => set({ 
          items: [], 
          count: 0, 
          total: 0, 
          couponCode: null, 
          discountAmount: 0, 
          totalAfterDiscount: 0 
        }),
    }),
    {
      name: 'jouwwinkel-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
