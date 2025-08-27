
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from './types';

interface CartState {
  items: CartItem[];
  count: number;
  total: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateState = (items: CartItem[]) => {
  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return { count, total };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      total: 0,
      addToCart: (newItem) => {
        // ID is now composite: product ID + variant ID
        const id = newItem.variantId ? `${newItem.productId}-${newItem.variantId}` : newItem.productId;
        const existingItem = get().items.find(item => item.id === id);
        let updatedItems;

        if (existingItem) {
          updatedItems = get().items.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + newItem.quantity } : item
          );
        } else {
          updatedItems = [...get().items, { ...newItem, id }];
        }
        set({ items: updatedItems, ...calculateState(updatedItems) });
      },
      removeFromCart: (itemId) => {
        const updatedItems = get().items.filter(item => item.id !== itemId);
        set({ items: updatedItems, ...calculateState(updatedItems) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(itemId);
          return;
        }
        const updatedItems = get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items: updatedItems, ...calculateState(updatedItems) });
      },
      clearCart: () => set({ items: [], count: 0, total: 0 }),
    }),
    {
      name: 'jouwwinkel-cart', // local storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
