import { create } from 'zustand';
import { Cart, CartItem } from './types';

// ─── localStorage key ────────────────────────────────────────────────────────
const CART_KEY = 'kleindream_cart_v2';

// ─── helpers ─────────────────────────────────────────────────────────────────
function emptyCart(): Cart {
  return { id: 0, items: [], subtotal: '0.00', total_items: 0, updated_at: new Date().toISOString() };
}

function loadFromStorage(): Cart {
  if (typeof window === 'undefined') return emptyCart();
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : emptyCart();
  } catch {
    return emptyCart();
  }
}

function saveToStorage(cart: Cart) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

function recalc(items: CartItem[]): Pick<Cart, 'subtotal' | 'total_items' | 'updated_at'> {
  const total_items = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items
    .reduce((s, i) => s + parseFloat(String(i.line_total || 0)), 0)
    .toFixed(2);
  return { total_items, subtotal, updated_at: new Date().toISOString() };
}

let _nextItemId = Date.now();
function nextId() { return ++_nextItemId; }

// ─── ProductMeta ─────────────────────────────────────────────────────────────
export interface ProductMeta {
  name: string;
  price: string | number;
  image?: string;
  size?: string;
  color?: string;
  colorHex?: string;
  sku?: string;
  productId?: number;
  slug?: string;
}

// ─── state ────────────────────────────────────────────────────────────────────
interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  loadCart: () => Promise<void>;
  addItem: (variantId: number, quantity?: number, meta?: ProductMeta) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

// ─── store ────────────────────────────────────────────────────────────────────
export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  error: null,

  openCart:  () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  loadCart: async () => {
    const cart = loadFromStorage();
    set({ cart, isLoading: false });
  },

  addItem: async (variantId, quantity = 1, meta) => {
    set({ isLoading: true, error: null });

    const cart = get().cart ?? loadFromStorage();
    const items = [...(cart.items ?? [])];

    // Try to merge with existing item for the same variant
    const existingIdx = items.findIndex((i) => i.variant === variantId);

    if (existingIdx >= 0) {
      const existing = items[existingIdx];
      const newQty = existing.quantity + quantity;
      const unitPrice = parseFloat(String(existing.unit_price || 0));
      items[existingIdx] = {
        ...existing,
        quantity: newQty,
        line_total: (unitPrice * newQty).toFixed(2),
      };
    } else {
      const unitPrice = parseFloat(String(meta?.price ?? 0));
      const newItem: CartItem = {
        id: nextId(),
        product: meta?.productId ?? variantId,
        product_name: meta?.name ?? 'Product',
        product_slug: meta?.slug ?? '',
        variant: variantId,
        variant_name: [meta?.size, meta?.color].filter(Boolean).join(' / ') || 'Default',
        size: meta?.size ?? '',
        color_name: meta?.color ?? '',
        color_hex: meta?.colorHex ?? '',
        quantity,
        unit_price: unitPrice.toFixed(2),
        line_total: (unitPrice * quantity).toFixed(2),
        stock_quantity: 999,
        image_url: meta?.image ?? '',
      };
      items.push(newItem);
    }

    const updated: Cart = { ...cart, items, ...recalc(items) };
    saveToStorage(updated);
    set({ cart: updated, isLoading: false, isOpen: true });
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) return get().removeItem(itemId);

    const cart = get().cart ?? loadFromStorage();
    const items = (cart.items ?? []).map((i) => {
      if (i.id !== itemId) return i;
      const unitPrice = parseFloat(String(i.unit_price || 0));
      return { ...i, quantity, line_total: (unitPrice * quantity).toFixed(2) };
    });

    const updated: Cart = { ...cart, items, ...recalc(items) };
    saveToStorage(updated);
    set({ cart: updated });
  },

  removeItem: async (itemId) => {
    const cart = get().cart ?? loadFromStorage();
    const items = (cart.items ?? []).filter((i) => i.id !== itemId);
    const updated: Cart = { ...cart, items, ...recalc(items) };
    saveToStorage(updated);
    set({ cart: updated });
  },
}));
