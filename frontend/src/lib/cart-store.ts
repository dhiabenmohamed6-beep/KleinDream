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
    if (quantity <= 0) {
      return get().removeItem(itemId);
    }
    const prevCart = get().cart;
    try {
      set({ isLoading: true, error: null });
      const updatedCart = await apiUpdateCartItem(itemId, quantity);
      set({ cart: updatedCart, isLoading: false });
    } catch (err: any) {
      console.error('Failed to update cart item:', err);
      try {
        const freshCart = await fetchCart();
        set({ cart: freshCart, isLoading: false });
      } catch {
        set({ cart: prevCart, error: err.message, isLoading: false });
      }
    }
  },

  removeItem: async (itemId: number) => {
    const prevCart = get().cart;
    // Optimistic removal: immediate visual update for instant responsiveness
    if (prevCart && prevCart.items) {
      const remainingItems = prevCart.items.filter((item) => item.id !== itemId);
      const subtotal = remainingItems.reduce((acc, it) => acc + (Number(it.line_total) || 0), 0);
      const total_items = remainingItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
      set({
        cart: {
          ...prevCart,
          items: remainingItems,
          subtotal: subtotal.toFixed(2),
          total_items
        }
      });
    }

    try {
      set({ isLoading: true, error: null });
      const updatedCart = await apiRemoveCartItem(itemId);
      set({ cart: updatedCart, isLoading: false });
    } catch (err: any) {
      console.error('Failed to remove cart item:', err);
      // Re-sync with server state to ensure UI matches reality
      try {
        const freshCart = await fetchCart();
        set({ cart: freshCart, isLoading: false });
      } catch {
        set({ cart: prevCart, error: err.message, isLoading: false });
      }
    }
  },
}));
