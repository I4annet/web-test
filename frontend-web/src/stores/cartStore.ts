import { create } from 'zustand';
import type { Product } from './productStore';
import { api } from '../services/api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  checkout: (shippingAddress: string, contactPhone: string) => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const existingItem = items[existingIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        alert(`Maaf, stok ${product.name} tidak mencukupi (Maksimal: ${product.stock})`);
        return;
      }

      const newItems = [...items];
      newItems[existingIndex] = { ...existingItem, quantity: newQuantity };
      set({ items: newItems });
    } else {
      if (quantity > product.stock) {
        alert(`Maaf, stok ${product.name} tidak mencukupi (Maksimal: ${product.stock})`);
        return;
      }
      set({ items: [...items, { product, quantity }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    const { items } = get();
    const itemIndex = items.findIndex((item) => item.product.id === productId);

    if (itemIndex > -1) {
      const item = items[itemIndex];
      if (quantity > item.product.stock) {
        alert(`Maaf, stok ${item.product.name} tidak mencukupi (Maksimal: ${item.product.stock})`);
        return;
      }
      if (quantity <= 0) {
        get().removeItem(productId);
        return;
      }
      const newItems = [...items];
      newItems[itemIndex] = { ...item, quantity };
      set({ items: newItems });
    }
  },

  clearCart: () => set({ items: [] }),

  checkout: async (shippingAddress, contactPhone) => {
    set({ loading: true, error: null });
    try {
      const orderItems = get().items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await api.post('/order', {
        shippingAddress,
        contactPhone,
        orderItems,
      });

      get().clearCart();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  clearError: () => set({ error: null }),
}));
