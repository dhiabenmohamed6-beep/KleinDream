import { create } from 'zustand';
import { Cart } from './types';
import { fetchCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from './api';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  loadCart: () => Promise<void>;
  addItem: (variantId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  error: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  loadCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const cart = await fetchCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (variantId: number, quantity: number = 1) => {
    try {
      set({ isLoading: true, error: null });
      const updatedCart = await apiAddToCart(variantId, quantity);
      set({ cart: updatedCart, isLoading: false, isOpen: true });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    try {
      set({ isLoading: true, error: null });
      const updatedCart = await apiUpdateCartItem(itemId, quantity);
      set({ cart: updatedCart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  removeItem: async (itemId: number) => {
    try {
      set({ isLoading: true, error: null });
      const updatedCart = await apiRemoveCartItem(itemId);
      set({ cart: updatedCart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
